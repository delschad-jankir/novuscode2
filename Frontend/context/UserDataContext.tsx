'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface UserDataContextType {
  user: any;
  setUser: (user: any) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      console.log('Attempting to retrieve user from localStorage...');
      const savedUser = localStorage.getItem('user');
      const userData = savedUser ? JSON.parse(savedUser) : null;
      console.log('Retrieved user:', userData);
      return userData;
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user !== null) {
        console.log('Saving user to localStorage:', user);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        console.log('Removing user from localStorage');
        localStorage.removeItem('user');
      }
    }
  }, [user]);

  return (
    <UserDataContext.Provider value={{ user, setUser }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
