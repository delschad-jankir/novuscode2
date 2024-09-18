import { signOut } from 'next-auth/react';
import { auth } from '../firebase'; // Adjust the import path as needed

export const logout = async () => {
  try {
    // Sign out from Firebase
    await auth.signOut();
    
    // Sign out from NextAuth
    await signOut({ callbackUrl: '/' });
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};