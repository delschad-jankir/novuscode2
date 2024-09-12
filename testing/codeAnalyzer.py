import argparse
import os
import zipfile
import json
import ast
import logging
from pathlib import Path
from typing import List, Dict, Any
import re

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s: %(message)s')

# Define a file size limit (in characters)
FILE_SIZE_LIMIT = 10000  # Example limit, set this to your desired size

def analyze_directory_structure(base_path: Path) -> Dict[str, Any]:
    structure = {
        "directories": {},
        "files": {}
    }
    
    for root, dirs, files in os.walk(base_path):
        structure["directories"][root] = {
            "directories": [os.path.join(root, d) for d in dirs],
            "files": [os.path.join(root, f) for f in files]
        }
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                    content = f.read()
                    if len(content) > FILE_SIZE_LIMIT:
                        structure["files"][file_path] = "file too long"
                    else:
                        structure["files"][file_path] = content
            except Exception as e:
                logging.warning(f"Failed to read file {file_path}: {e}")
    
    return structure

def parse_code_files(files: List[Path]) -> Dict[str, Any]:
    code_structure = {}
    
    for file in files:
        try:
            content = file.read_text(encoding='utf-8', errors='replace')
            
            if file.suffix == '.py':
                tree = ast.parse(content, filename=str(file))
                classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
                functions = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
                imports = [ast.unparse(node) for node in ast.walk(tree) if isinstance(node, (ast.Import, ast.ImportFrom))]
                
            elif file.suffix in ['.js', '.ts', ".jsx", ".tsx"]:
                classes = re.findall(r'class\s+(\w+)', content)
                functions = re.findall(r'(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>))', content)
                functions = [f[0] or f[1] for f in functions if f[0] or f[1]]
                imports = re.findall(r'^(import\s+.*?;)$', content, re.MULTILINE)
            
            elif file.suffix == '.java':
                classes = re.findall(r'class\s+(\w+)', content)
                functions = re.findall(r'(?:public|private|protected|static|\s) +[\w\<\>\[\]]+\s+(\w+) *\([^\)]*\) *\{', content)
                imports = re.findall(r'^(import\s+.*;)$', content, re.MULTILINE)
            
            else:
                continue
            
            if classes or functions or imports:
                code_structure[str(file)] = {
                    "classes": classes,
                    "functions": functions,
                    "imports": imports
                }
        
        except Exception as e:
            logging.warning(f"Failed to parse file {file}: {e}")
    
    return code_structure

def read_documentation(files: List[Path]) -> Dict[str, str]:
    documentation = {}
    
    for file in files:
        if 'readme' in file.name.lower():
            try:
                with open(file, 'r', encoding='utf-8', errors='replace') as f:
                    documentation[str(file)] = f.read()
            except Exception as e:
                logging.warning(f"Failed to read documentation file {file}: {e}")
    
    return documentation

def save_to_json(data: Dict[str, Any], output_file: str) -> None:
    try:
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=4)
        logging.info(f"Successfully saved results to {output_file}")
    except Exception as e:
        logging.error(f"Failed to save results to {output_file}: {e}")

def analyze_codebase(base_path: Path, output_file: str) -> None:
    logging.info(f"Starting codebase analysis for {base_path}")
    structure = analyze_directory_structure(base_path)
    files = [Path(file) for file in structure["files"]]

    code_info = parse_code_files(files)
    documentation = read_documentation(files)
    
    result = {
        "Directory and File Structure": structure,
        "Classes, Functions, and Imports": code_info,
        "Documentation and Comments": documentation,
    }
    
    save_to_json(result, output_file)
    logging.info("Codebase analysis completed")

def unzip_file(zip_file_path: str, extract_dir: str) -> None:
    logging.info(f"Unzipping {zip_file_path} to {extract_dir}")

    try:
        os.makedirs(extract_dir, exist_ok=True)

        with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        logging.info(f"ZIP file extracted to {extract_dir}")

        analysis_file = os.path.join(extract_dir, 'codebase_analysis.json')
        analyze_codebase(Path(extract_dir), analysis_file)
        
        if os.path.exists(analysis_file):
            file_size = os.path.getsize(analysis_file)
            logging.info(f"Analysis file created. Size: {file_size} bytes")
        else:
            logging.error("Analysis file was not created")
    
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        raise

    logging.info("Unzipping completed")

def main():
    # Argument parser for the main function
    parser = argparse.ArgumentParser(description="Analyze a codebase and output the structure as a JSON file")
    parser.add_argument('path', type=str, help="The path to the codebase directory")
    parser.add_argument('output', type=str, help="The output JSON file for the analysis results")
    args = parser.parse_args()

    base_path = Path(args.path)
    output_file = args.output

    if base_path.is_file() and base_path.suffix == '.zip':
        # If a ZIP file is provided, unzip and analyze
        extract_dir = os.path.join("/tmp", base_path.stem)
        unzip_file(base_path, extract_dir)
    else:
        # Directly analyze the provided directory
        analyze_codebase(base_path, output_file)

if __name__ == "__main__":
    main()
