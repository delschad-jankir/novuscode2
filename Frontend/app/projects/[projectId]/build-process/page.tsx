'use client';

import React, { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { TailSpin } from 'react-loader-spinner';
import { useProjectData } from '@/context/ProjectDataContext';

const BuildPage = () => {
  const { projectData } = useProjectData();
  const [serializedContent, setSerializedContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFileContent = async () => {
      if (projectData) {
        const projectId = projectData.id;
        const filename = 'build_and_deployment.md';

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
      } else {
        setLoading(true);
      }
    };

    fetchFileContent();
  }, [projectData]);

  if (loading || !projectData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <TailSpin
          visible={true}
          height="50"
          width="50"
          color="#000000"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 dark:text-red-400">{error}</p>;
  }

  return (
    <PageContainer scrollable>
      {serializedContent ? (
        <div className="prose prose-sm 
                        dark:prose-invert 
                        prose-headings:dark:text-gray-200
                        prose-p:dark:text-gray-300
                        prose-a:dark:text-blue-400
                        prose-strong:dark:text-gray-200
                        prose-code:dark:text-gray-200
                        prose-pre:dark:bg-gray-800
                        prose-blockquote:dark:text-gray-300
                        prose-li:dark:text-gray-300
                        max-w-none">
          <MDXRemote {...serializedContent} />
        </div>
      ) : (
        <p>No content available</p> // Ensure consistent fallback content
      )}
    </PageContainer>
  );
};

export default BuildPage;
