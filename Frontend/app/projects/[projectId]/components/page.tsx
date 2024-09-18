'use client';

import React, { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { TailSpin } from 'react-loader-spinner'; // Import TailSpin loader
import { useProjectData } from '@/context/ProjectDataContext';

const ComponentsAndModulesPage = () => {
  const { projectData } = useProjectData();
  const [serializedContent, setSerializedContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFileContent = async () => {
      if (projectData) {
        const projectId = projectData.id;
        const filename = 'components_and_modules.md';

        try {
          const response = await fetch(
            `https://novuscode-backend1-83223007958.us-central1.run.app/file/${projectId}/${filename}`
          );
          if (response.ok) {
            const content = await response.text();
            const serialized = await serialize(content);
            setSerializedContent(serialized);
          } else {
            setError('Failed to fetch file content.');
          }
        } catch (err) {
          console.error('Error fetching file content:', err);
          setError('Failed to fetch file content.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchFileContent();
  }, [projectData]);

  // Loading state
  if (loading || !projectData) {
    return (
      <PageContainer scrollable>
        <div className="flex justify-center items-center h-screen">
          <TailSpin
            visible={true}
            height="50" // Smaller size
            width="50"  // Smaller size
            color="#000000" // Black color
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      </PageContainer>
    );
  }

  // Error state with the 'Hold tight' message and pulse animation
  if (error) {
    return (
      <PageContainer scrollable>
        <div className="flex flex-col justify-center items-center h-screen text-center">
          <h1 className="text-3xl font-bold mb-4">Hold tight</h1>
          <p className="text-lg mb-4">
            We are currently creating the file for you. This can take up to 5 minutes.
          </p>
          <div className="text-2xl animate-pulse">...</div>
        </div>
      </PageContainer>
    );
  }

  // Render serialized content
  return (
    <PageContainer scrollable>
      {serializedContent && (
        <div
          className="prose prose-sm 
                      dark:prose-invert 
                      prose-headings:dark:text-gray-200
                      prose-p:dark:text-gray-300
                      prose-a:dark:text-blue-400
                      prose-strong:dark:text-gray-200
                      prose-code:dark:text-gray-200
                      prose-pre:dark:bg-gray-800
                      prose-blockquote:dark:text-gray-300
                      prose-li:dark:text-gray-300
                      max-w-none"
        >
          <MDXRemote {...serializedContent} />
        </div>
      )}
    </PageContainer>
  );
};

export default ComponentsAndModulesPage;
