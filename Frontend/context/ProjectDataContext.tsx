// app/components/ProjectDataProvider.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ProjectDataContextType {
  projectData: any;
  setProjectData: (data: any) => void;
}

const ProjectDataContext = createContext<ProjectDataContextType | undefined>(undefined);

export function ProjectDataProvider({ children }: { children: ReactNode }) {
  const [projectData, setProjectData] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      console.log('Attempting to retrieve projectData from localStorage...');
      const savedData = localStorage.getItem('projectData');
      const data = savedData ? JSON.parse(savedData) : null;
      console.log('Retrieved projectData:', data);
      return data;
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (projectData !== null) {
        console.log('Saving projectData to localStorage:', projectData);
        localStorage.setItem('projectData', JSON.stringify(projectData));
      } else {
        console.log('Removing projectData from localStorage');
        localStorage.removeItem('projectData');
      }
    }
  }, [projectData]);

  return (
    <ProjectDataContext.Provider value={{ projectData, setProjectData }}>
      {children}
    </ProjectDataContext.Provider>
  );
}

export function useProjectData() {
  const context = useContext(ProjectDataContext);
  if (context === undefined) {
    throw new Error('useProjectData must be used within a ProjectDataProvider');
  }
  return context;
}
