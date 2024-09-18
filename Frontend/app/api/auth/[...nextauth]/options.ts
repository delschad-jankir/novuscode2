// options.ts
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase';  // Import db for Firestore
import { doc, getDoc } from 'firebase/firestore';

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
          const user = userCredential.user;

          // Fetch company information from Firestore
          const userDoc = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userDoc);

          if (!userSnapshot.exists()) {
            throw new Error('User document does not exist');
          }

          const userData = userSnapshot.data();
          const company = userData?.company || 'Unknown'; // Default to 'Unknown' if company is not set

          return {
            id: user.uid,
            email: user.email,
            name: user.displayName || '',
            company, // Include company field
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.company = user.company; // Add company to token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.company = token.company as string; // Add company to session
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
