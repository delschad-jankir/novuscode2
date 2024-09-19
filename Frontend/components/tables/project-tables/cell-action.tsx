'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/constants/data';
import { Edit, MoreHorizontal, Trash, Loader2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import { useRouter } from 'next/navigation'; // Import the router
import { useProjectData } from '@/context/ProjectDataContext';

interface CellActionProps {
  data: User;
  onDelete: () => void;
  isLoading: boolean;
  isDeleted: boolean;
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
  onDelete,
  isLoading,
  isDeleted,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter(); // Get the router
  const { setProjectData } = useProjectData(); // Use your ProjectData context

  const handleDeleteConfirm = async () => {
    setIsModalOpen(false);
    onDelete();
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the default click behavior
  };

  const handleUpdateClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click behavior
    setProjectData(data); // Store the project data in the context
    router.push('/projects/update'); // Navigate to the update page
  };

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" onClick={handleClick}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleUpdateClick}>
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeleteClick}>
            {isLoading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : isDeleted ? (
              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
            ) : (
              <>
                <Trash className="mr-2 h-4 w-4" /> Delete
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
