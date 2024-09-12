import os
import zipfile
import json
import logging
from google.cloud import storage

# Configure logging
logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')

def process_zip(zip_path: str) -> dict:
    tree = {}

    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_file:
            zip_file_paths = zip_file.namelist()
            logging.error(f"Files in ZIP: {zip_file_paths}")  # Log ZIP contents
            
            for file_path in zip_file_paths:
                parts = file_path.split('/')
                pointer = tree

                for part in parts:
                    if part == parts[-1]:
                        pointer.setdefault('files', []).append(part)
                    else:
                        pointer = pointer.setdefault('directories', {}).setdefault(part, {})

        logging.error(f"Processed tree structure: {json.dumps(tree, indent=2)}")  # Log the resulting tree

    except Exception as e:
        logging.error(f"Error processing ZIP file {zip_path}: {str(e)}")
    
    return tree

def save_json(data: dict, output_path: str):
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logging.error(f"Failed to save results to {output_path}: {str(e)}")

def unzip_file(data, context):
    bucket_name = data['bucket']
    file_name = data['name']  # This is the file path within the bucket

    # Initialize Google Cloud Storage client
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)

    # Path for temporary files
    zip_file_path = f'/tmp/{os.path.basename(file_name)}'  # Path for ZIP file
    extract_dir = f'/tmp/{os.path.splitext(os.path.basename(file_name))[0]}'
    analysis_file = '/tmp/codebaseFileExplorer.json'

    try:
        # Check if analysis file already exists in the bucket
        result_blob_name = os.path.join(os.path.dirname(file_name), 'codebaseFileExplorer.json')
        result_blob = bucket.blob(result_blob_name)
        if result_blob.exists():
            logging.error(f"Analysis file already exists: {result_blob_name}")
            return  # Exit early if the file already exists

        # Ensure the directory exists
        os.makedirs(extract_dir, exist_ok=True)

        # Download the ZIP file
        blob.download_to_filename(zip_file_path)
        logging.error(f"ZIP file downloaded to {zip_file_path}")

        # Process the ZIP file and analyze its content
        analysis_data = process_zip(zip_file_path)
        save_json(analysis_data, analysis_file)

        # Upload the analysis result back to the bucket in the same folder as the zip file
        result_blob.upload_from_filename(analysis_file)
        logging.error(f"Analysis file uploaded successfully to {result_blob_name}")

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        raise

    # Clean up temporary files
    try:
        os.remove(zip_file_path)
        
        for root, dirs, files in os.walk(extract_dir, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        
        os.rmdir(extract_dir)

    except Exception as e:
        logging.error(f"Error during cleanup: {str(e)}")