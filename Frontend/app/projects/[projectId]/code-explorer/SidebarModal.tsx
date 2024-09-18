// components/SidebarModal.tsx
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Import highlight.js CSS for styling

interface SidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
}

const SidebarModal: React.FC<SidebarModalProps> = ({ isOpen, onClose, code }) => {
  const highlightCode = (code: string, language: string) => {
    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
    return hljs.highlight(code, { language: validLanguage }).value;
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-end bg-black/50">
        <Transition.Child
          as={Fragment}
          enter="transition-transform duration-300 ease-in-out"
          enterFrom="transform translate-x-full"
          enterTo="transform translate-x-0"
          leave="transition-transform duration-300 ease-in-out"
          leaveFrom="transform translate-x-0"
          leaveTo="transform translate-x-full"
        >
          <Dialog.Panel className="relative w-full max-w-lg bg-white h-full p-6 overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Code</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              <code
                dangerouslySetInnerHTML={{ __html: highlightCode(code, 'plaintext') }}
              />
            </pre>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default SidebarModal;
