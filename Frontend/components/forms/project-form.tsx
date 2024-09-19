// components/forms/project-form.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { useUserData } from '@/context/UserDataContext';

interface ProjectFormProps {
  initialData: {
    id: string; // New: project ID for updating
    name?: string;
    description?: string;
  } | null;
  isUpdate?: boolean; // Flag to differentiate between creating and updating
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, isUpdate = false }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const { user } = useUserData();

  // Initialize form fields with initialData
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      setError('Only ZIP files are allowed');
    } else {
      setError(null);
      setUploadedFiles(acceptedFiles);
      setGithubUrl('');
    }
  }, []);

  const clearFiles = () => {
    setUploadedFiles([]);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/zip': ['.zip'] },
    multiple: false,
  });

  const handleGithubUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubUrl(e.target.value);
    if (e.target.value) {
      setUploadedFiles([]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    const apiUrl = 'https://novuscode-backend1-83223007958.us-central1.run.app';
  
    try {
      let response;
  
      if (isUpdate && initialData) {
        if (githubUrl || uploadedFiles.length > 0) {
          // Case 1: New file or GitHub URL is provided, delete and recreate the project
  
          const formData = new FormData();
          formData.append('name', name);
          formData.append('description', description);
          formData.append('company', user?.company || "unknown");
  
          if (uploadedFiles.length > 0) {
            formData.append('file', uploadedFiles[0]);
          } else if (githubUrl) {
            formData.append('githubUrl', githubUrl);
          }
  
          response = await fetch(`${apiUrl}/recreateProject/${initialData.id}`, {
            method: 'POST', // Using POST because we're recreating the project
            body: formData,
          });
  
        } else {
          // Case 2: No file or GitHub URL is provided, only update metadata
          const formData = new FormData();
          formData.append('name', name);
          formData.append('description', description);
          formData.append('company', user?.company || "unknown");
  
          response = await fetch(`${apiUrl}/updateMetadata/${initialData.id}`, {
            method: 'PUT',
            body: formData,
          });
        }
      } else {
        // Creating a new project logic stays the same as before
        if (githubUrl) {
          response = await fetch(`${apiUrl}/uploadGithub`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ githubUrl, name, description }),
          });
        } else if (uploadedFiles.length > 0) {
          const formData = new FormData();
          formData.append('file', uploadedFiles[0]);
          formData.append('name', name);
          formData.append('description', description);
          formData.append('company', user?.company || "unknown");
  
          response = await fetch(`${apiUrl}/uploadLocal`, {
            method: 'POST',
            body: formData,
          });
        } else {
          setError('Please either enter a GitHub URL or upload a file');
          setLoading(false);
          return;
        }
      }
  
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
      }
  
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error('Error uploading:', error);
      setError(`Failed to upload: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };
  

  const handleCloseSuccessMessage = () => {
    setSuccess(false);
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Loader2 className="animate-spin h-12 w-12 text-white" />
        </div>
      )}

      {!loading && success && (
        <div className="fixed top-5 right-5 p-4 bg-white border-2 border-black text-black rounded-lg shadow-lg flex items-center z-50">
          <CheckCircle className="h-6 w-6 text-black mr-2" />
          <p>{isUpdate ? 'Project successfully updated!' : 'Codebase successfully uploaded!'}</p>
          <button
            className="ml-auto text-black hover:text-gray-700"
            onClick={handleCloseSuccessMessage}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      <div className={`${loading ? 'blur-sm' : ''}`}>
        <div className="flex items-center justify-between">
          <Heading
            title={initialData ? 'Update project' : 'Create project'}
            description={
              initialData
                ? 'Update project details or upload a new codebase.'
                : 'Upload either a ZIP folder or enter a GitHub repo, but not both.'
            }
          />
        </div>
        <Separator />
        <form className="w-full space-y-8" onSubmit={handleSubmit}>
          {/* Upload ZIP Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Project ZIP Folder</label>
            <div
              {...getRootProps()}
              className={`mt-2 flex items-center justify-center rounded-lg border-2 border-dashed p-4 ${
                isDragActive ? 'border-blue-400' : 'border-gray-300'
              } ${githubUrl ? 'pointer-events-none opacity-50' : ''}`}
            >
              <input {...getInputProps()} disabled={!!githubUrl} />
              {isDragActive ? <p>Drop the ZIP file here...</p> : <p>Drag and drop a ZIP folder, or click to select files</p>}
            </div>
            {error && <p className="mt-2 text-red-500">{error}</p>}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium">Uploaded Files:</h3>
                <ul className="mt-2">
                  {uploadedFiles.map((file) => (
                    <li key={file.name} className="text-sm">
                      {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
                <Button variant="destructive" onClick={clearFiles} className="mt-4">
                  Clear Files
                </Button>
              </div>
            )}
          </div>

          {/* GitHub URL Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
            <Input
              type="url"
              placeholder="https://github.com/your-repository"
              value={githubUrl}
              onChange={handleGithubUrlChange}
              disabled={uploadedFiles.length > 0}
            />
          </div>

          {/* Name and Description Section */}
          <div className="gap-8 md:grid md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <Input
                placeholder="Project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button className="ml-auto" type="submit" disabled={loading}>
            {initialData ? 'Update' : 'Create'}
          </Button>
        </form>
      </div>
    </>
  );
};
