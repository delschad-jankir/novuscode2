import os
import zipfile
import json
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.WARNING, format='%(asctime)s - %(levelname)s - %(message)s')

def process_zip(zip_path: str) -> dict:
    result = {}

    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_file:
            for file_info in zip_file.infolist():
                if file_info.filename.endswith('/'):
                    continue

                path_parts = file_info.filename.split('/')
                current_level = result

                # Traverse the directory structure and build the tree
                for part in path_parts[:-1]:
                    if part not in current_level:
                        current_level[part] = {"directories": {}, "files": []}
                    current_level = current_level[part]["directories"]

                # Add file to the parent directory (one level up)
                parent_dir = path_parts[-2] if len(path_parts) > 1 else ''
                current_level = result

                for part in path_parts[:-2]:
                    if part not in current_level:
                        current_level[part] = {"directories": {}, "files": []}
                    current_level = current_level[part]["directories"]

                # Add the file to the files list of the correct directory level
                if "files" not in current_level:
                    current_level["files"] = []
                current_level["files"].append(path_parts[-1])

    except Exception as e:
        logging.error(f"Error processing ZIP file {zip_path}: {str(e)}")
    
    return result

def save_json(data: dict, output_path: str):
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logging.warning(f"Successfully saved results to {output_path}")
    except Exception as e:
        logging.error(f"Failed to save results to {output_path}: {str(e)}")

def process_local_zip(zip_file_path: str):
    extract_dir = f'./{os.path.splitext(os.path.basename(zip_file_path))[0]}'

    try:
        # Ensure the directory exists
        os.makedirs(extract_dir, exist_ok=True)
        logging.warning(f"Created directory: {extract_dir}")

        # Extract ZIP file
        with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        logging.warning(f"ZIP file extracted to {extract_dir}")

        # Process the ZIP file and analyze its content
        analysis_data = process_zip(zip_file_path)
        analysis_file = './codebaseFileExplorer.json'
        save_json(analysis_data, analysis_file)

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")

    # Clean up extracted files
    try:
        for root, dirs, files in os.walk(extract_dir, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
                logging.warning(f"Removed file: {os.path.join(root, name)}")
            for name in dirs:
                os.rmdir(os.path.join(root, name))
                logging.warning(f"Removed directory: {os.path.join(root, name)}")
        
        os.rmdir(extract_dir)
        logging.warning(f"Removed extraction directory: {extract_dir}")

    except Exception as e:
        logging.error(f"Error during cleanup: {str(e)}")

if __name__ == "__main__":
    # Replace this with the path to your local ZIP file
    zip_file_path = "repo.zip"

    process_local_zip(zip_file_path)
