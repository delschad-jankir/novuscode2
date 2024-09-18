'use client';

import { Dialog } from '@headlessui/react';
import { Button } from './button';

interface Document {
  id: string;
  title: string;
  type: string;
  content: string;
}

interface DocumentModalProps {
  isOpen: boolean;
  document: Document | null;
  onClose: () => void;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, document, onClose }) => {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title as="h2" className="text-lg font-bold">
            {document.title || 'Untitled Document'}
          </Dialog.Title>
          <div className="mt-4 text-gray-600">
            <p>Type: {document.type || 'Unknown Type'}</p>
            <p className="mt-4">{document.content || 'No content available.'}</p>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-xs md:text-sm"
            >
              Close
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DocumentModal;
