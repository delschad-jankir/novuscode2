'use client';

import { Dialog } from '@headlessui/react';
import { Button } from './button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-none" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg">
          <Dialog.Title as="h3" className="text-lg font-semibold">
            Confirm Deletion
          </Dialog.Title>
          <div className="mt-4">
            <p>Are you sure you want to delete this project? You can not undo this.</p>
          </div>
          <div className="mt-6 flex space-x-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirm} 
              className="bg-primary text-primary-foreground shadow hover:bg-primary/90 text-xs md:text-sm"
            >
              Delete
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
