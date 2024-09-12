import zipfile
import os
import json

def zip_to_tree(zip_path):
    tree = {}
    
    # Open the zip file
    with zipfile.ZipFile(zip_path, 'r') as zip_file:
        # Get the list of file paths in the zip
        zip_file_paths = zip_file.namelist()
        
        for file_path in zip_file_paths:
            # Split the file path into components
            parts = file_path.split('/')
            
            # Use a pointer to traverse/create the tree
            pointer = tree
            for part in parts:
                # If it's a directory or file, create a dict or list entry
                if part == parts[-1]:
                    pointer.setdefault('files', []).append(part)
                else:
                    pointer = pointer.setdefault('directories', {}).setdefault(part, {})
    
    return tree

def save_tree_as_json(tree, output_file):
    """ Save the tree structure as a JSON file """
    with open(output_file, 'w') as json_file:
        json.dump(tree, json_file, indent=4)

# Example usage
zip_file_path = 'repo.zip'  # Replace with your zip file path
output_json_file = 'tree_structure.json'  # Replace with your output file path

# Generate tree structure from ZIP and save as JSON
tree_structure = zip_to_tree(zip_file_path)
save_tree_as_json(tree_structure, output_json_file)

print(f"Tree structure saved as {output_json_file}")
