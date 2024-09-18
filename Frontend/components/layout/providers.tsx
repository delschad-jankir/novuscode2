'use client'; // Ensures this is a client-side component

import React from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import { ProjectDataProvider } from '@/context/ProjectDataContext';
import { UserDataProvider } from '@/context/UserDataContext';
import { ChatProvider } from '@/context/ChatContext';

interface ProvidersProps {
  session: SessionProviderProps['session'];
  children: React.ReactNode;
}

export default function Providers({ session, children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider session={session}>
        <ProjectDataProvider>
          <UserDataProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </UserDataProvider>
        </ProjectDataProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
