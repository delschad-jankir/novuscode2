import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
  company?: string; // Adjust field name
}

interface UserDataContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session } = useSession(); // Fetch session data from NextAuth.js
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session) {
      // Assume session.user contains the user data
      console.log('Session data:', session);
      
      // Map session user object to your User type if necessary
      const userData: User = {
        id: session.user?.id || '',
        email: session.user?.email || '',
        name: session.user?.name || '',
        company: session.user?.company || '', // Adjust according to your session structure
      };

      console.log('User data:', userData);
      setUser(userData);
    } else {
      setUser(null); // Clear user data if no session
    }
  }, [session]);

  return (
    <UserDataContext.Provider value={{ user, setUser }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
