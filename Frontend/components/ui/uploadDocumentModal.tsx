'use client';

import { useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { useDropzone } from 'react-dropzone';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [webUrl, setWebUrl] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      setError('Only PDF, HTML, and TXT files are allowed');
    } else {
      setError(null);
      setUploadedFiles(acceptedFiles);
      setWebUrl('');
    }
  }, []);

  const clearFiles = () => {
    setUploadedFiles([]);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/html': ['.html'],
      'text/plain': ['.txt']
    },
    multiple: false,
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleWebUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebUrl(e.target.value);
    if (e.target.value) {
      setUploadedFiles([]);
      setError(null);
    }
  };

  const handleUpload = () => {
    if (webUrl && uploadedFiles.length > 0) {
      setError('Please choose either a web URL or a file, not both.');
      return;
    }
    if (uploadedFiles.length === 0 && !webUrl) {
      setError('Please provide either a web URL or upload a file.');
      return;
    }
    onUpload();
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg">
          <Dialog.Title as="h2" className="text-2xl font-bold">
            Upload Document
          </Dialog.Title>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              You can either upload a file (PDF, HTML, or TXT) or provide a web URL. Please choose only one option.
            </p>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <Input
              placeholder="Enter document title"
              value={title}
              onChange={handleTitleChange}
              className="mt-2"
            />
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Upload File</label>
              <div
                {...getRootProps()}
                className={`mt-2 flex items-center justify-center rounded-lg border-2 border-dashed p-6 ${
                  isDragActive ? 'border-blue-400' : 'border-gray-300'
                } ${webUrl ? 'pointer-events-none opacity-50' : ''} h-48`}
              >
                <input {...getInputProps()} disabled={!!webUrl} />
                {isDragActive ? (
                  <p>Drop the file here...</p>
                ) : (
                  <p>Drag and drop a file (PDF, HTML, or TXT) here, or click to select a file</p>
                )}
              </div>

            <p className="mt-2 text-xs text-gray-500">Allowed file types: PDF, HTML, TXT</p>
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
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Web URL</label>
            <Input
              type="url"
              placeholder="https://example.com/document"
              value={webUrl}
              onChange={handleWebUrlChange}
              disabled={uploadedFiles.length > 0}
            />
            {error && <p className="mt-2 text-red-500">{error}</p>}
          </div>
          <div className="mt-6 flex space-x-4">
            <Button variant="outline" onClick={onClose} className="text-xs md:text-sm">
              Cancel
            </Button>
            <Button onClick={handleUpload} className="bg-primary text-primary-foreground shadow hover:bg-primary/90 text-xs md:text-sm">
              Upload
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UploadDocumentModal;
