import { TFiles } from './types';

interface ApiResponse {
  directories: {
    [key: string]: {
      files: string[];
      directories?: ApiResponse['directories'];
    };
  };
}

function convertJsonToTFiles(json: ApiResponse): TFiles[] {
  // Function to convert a directory object to TFiles
  const convertDirectory = (
    content: ApiResponse['directories'][string]
  ): TFiles => {
    const children: TFiles[] = [];

    // Add files
    for (const file of content.files) {
      if (file) {  // Skip empty string entries
        children.push({
          name: file,
          type: 'file',
        });
      }
    }

    // Recursively add directories
    if (content.directories) {
      for (const [dirName, dirContent] of Object.entries(content.directories)) {
        children.push({
          name: dirName,
          type: 'directory',
          children: convertDirectory(dirContent).children,
        });
      }
    }

    return {
      name: '',  // Name is not used for the root folder
      type: 'directory',
      children: children.sort((a, b) => {
        if (a.type === 'directory' && b.type !== 'directory') return -1;
        if (a.type !== 'directory' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name);
      }),
    };
  };

  const result: TFiles[] = [];

  // Process the root directory's contents and skip the root folder itself
  if (Object.keys(json.directories).length > 0) {
    const rootContent = json.directories[Object.keys(json.directories)[0]];
    result.push(...convertDirectory(rootContent).children);
  }

  return result;
}

export default convertJsonToTFiles;
