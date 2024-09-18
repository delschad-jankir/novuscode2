'use client';

import { firestore } from '@/firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import PageContainer from '@/components/layout/page-container';
import { useState, useEffect } from 'react';
import documentsBackground from '../../public/documentsBackground.png';
import { useRouter } from 'next/navigation';
import DocumentModal from '@/components/ui/documentModal';
import UploadDocumentModal from '@/components/ui/uploadDocumentModal';

interface Document {
  id: string;
  title: string;
  type: string;
  content: string;
}

async function fetchDocuments(): Promise<Document[]> {
  try {
    const querySnapshot = await getDocs(collection(firestore, 'documents'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Document, 'id'>)
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

async function fetchDocumentContent(id: string): Promise<Document | null> {
  try {
    const documentRef = doc(firestore, 'documents', id);
    const documentSnapshot = await getDoc(documentRef);
    if (documentSnapshot.exists()) {
      return {
        id: documentSnapshot.id,
        ...(documentSnapshot.data() as Omit<Document, 'id'>)
      };
    } else {
      console.error('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching document content:', error);
    return null;
  }
}

export default function Page() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const docs = await fetchDocuments();
      setDocuments(docs);
    };

    fetchData();
  }, []);

  const handleCardClick = async (id: string) => {
    const document = await fetchDocumentContent(id);
    if (document) {
      setSelectedDocument(document);
      setIsModalOpen(true);
    } else {
      console.error('Document not found');
    }
  };

  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const startChatting = () => {
    router.push('/documents/chat');
  };

  return (
    <PageContainer scrollable={true}>
      {/* Welcome Banner Section */}
      <div
        className="relative mb-8 overflow-hidden rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${documentsBackground.src})` }}
      >
        <div className="flex h-[400px] flex-col items-center justify-center rounded-lg bg-black/40 p-6 backdrop-blur-sm">
          <div className="max-w-4xl text-center text-white">
            <h1 className="mb-4 text-4xl font-semibold">Documents</h1>
            <p className="mb-4 text-lg">
              Connect your custom data sources and start chatting with your own
              business-related data.
            </p>
            <button
              onClick={startChatting}
              className="rounded-lg bg-white px-4 py-2 text-black transition duration-300 hover:bg-black hover:text-white"
            >
              Start Chatting
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">Explore</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              className="block max-w-sm cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {item.title || 'Untitled'}
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                {item.type || 'Unknown Type'}
              </p>
            </div>
          ))}
          <div
            onClick={openUploadModal}
            className="block max-w-sm cursor-pointer rounded-lg border border-dashed border-gray-400 bg-white p-6 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Add Document
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              Upload new documents
            </p>
          </div>
        </div>
      </div>

      <DocumentModal
        isOpen={isModalOpen}
        document={selectedDocument}
        onClose={closeModal}
      />
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
      />

      {/* Dialogflow Chat Widget */}
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <link rel="stylesheet" href="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css">
            <script src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js"></script>
            <df-messenger
              project-id="novacode-432817"
              agent-id="94caaf31-830b-4407-b08b-358d916c6f06"
              language-code="en"
              max-query-length="-1">
              <df-messenger-chat-bubble chat-title="testMedium1"></df-messenger-chat-bubble>
            </df-messenger>
            <style>
              df-messenger {
                z-index: 999;
                position: fixed;
                --df-messenger-font-color: #000;
                --df-messenger-font-family: Google Sans;
                --df-messenger-chat-background: #f3f6fc;
                --df-messenger-message-user-background: #d3e3fd;
                --df-messenger-message-bot-background: #fff;
                bottom: 16px;
                right: 16px;
              }
            </style>
          `,
        }}
      />
    </PageContainer>
  );
}
