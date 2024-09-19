// app/projects/update/page.tsx
'use client';

import { useProjectData } from '@/context/ProjectDataContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProjectForm } from '@/components/forms/project-form'; // Import your ProjectForm component
import PageContainer from '@/components/layout/page-container'; // Import PageContainer

const ProjectUpdatePage = () => {
  const { projectData, setProjectData } = useProjectData(); // Get the project data and setter
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      // Reset projectData when navigating away from the update project page
      setProjectData(null);
    };

    // Listen for route change events
    router.events?.on('routeChangeStart', handleRouteChange);

    // Cleanup the listener when the component unmounts
    return () => {
      router.events?.off('routeChangeStart', handleRouteChange);
    };
  }, [router, setProjectData]);

  if (!projectData) {
    return <p>Loading...</p>; // Handle the loading state
  }

  return (
    <PageContainer>
      <ProjectForm initialData={projectData} isUpdate={true} />
    </PageContainer>
  );
};

export default ProjectUpdatePage;
