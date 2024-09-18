"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import PageContainer from '@/components/layout/page-container';
import { ProjectClient } from '@/components/tables/project-tables/client';
import { firestore } from '@/firebaseConfig';
import { Project } from '@/constants/data';
import { useUserData } from '@/context/UserDataContext'; // Adjust the import path as needed
import { TailSpin } from 'react-loader-spinner';

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoading: userLoading } = useUserData(); // Assuming userLoading is provided in context

  useEffect(() => {
    const fetchProjects = async () => {
      if (userLoading || !user || !user.company) {
        setLoading(false);
        return;
      }

      try {
        const projectsRef = collection(firestore, 'projects');
        const q = query(projectsRef, where('company', '==', user.company));
        const querySnapshot = await getDocs(q);

        const projectsData: Project[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];

        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, userLoading]);

  useEffect(() => {
    console.log('User data:', user);
  }, [user]);

  if (loading || userLoading) {
    return (
      <PageContainer scrollable>
        <div className="flex justify-center items-center h-screen">
          <TailSpin
            visible={true}
            height="50"
            width="50"
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

  if (!user || !user.company) {
    return (
      <PageContainer scrollable>
        <div className="flex flex-col justify-center items-center h-screen text-center">
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-2">
        <ProjectClient data={projects} />
      </div>
    </PageContainer>
  );
}
