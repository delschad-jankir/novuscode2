// components/forms/user-register-form.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth, firestore } from '../../firebaseConfig';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useUserData } from '@/context/UserDataContext';
import { Eye, EyeOff } from 'lucide-react'; // Import icons for password visibility toggle

const formSchema = z.object({
  fullName: z.string().min(1, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password should be at least 6 characters long' })
});

type RegisterFormValue = z.infer<typeof formSchema>;

const personalEmailDomains = [
  'gmail', 'yahoo', 'hotmail', 'aol', 'outlook', 'gmx', 'web.de', 't-online', 'mail.de', 'freenet', 'arcor', 't-online', 'bluewin', 'vodafone', 'alice', 'mailbox', 'inbox'
];

export default function UserRegisterForm({ onSwitchToLogin, onShowVerification }: { onSwitchToLogin: () => void; onShowVerification: (email: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const form = useForm<RegisterFormValue>({ resolver: zodResolver(formSchema) });
  const { setUser } = useUserData();

  const extractCompany = (email: string): string => {
    const domain = email.split('@')[1]?.split('.')[0];
    if (personalEmailDomains.includes(domain)) {
      return email.toLowerCase(); // Use the email in lowercase as the company name for personal emails
    }
    return domain || 'unknown';
  };

  const onSubmit = async (data: RegisterFormValue) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.fullName });

      const company = extractCompany(data.email);
      const finalCompanyName = personalEmailDomains.includes(company) ? userCredential.user.uid : company;

      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        fullName: data.fullName,
        email: data.email,
        company: finalCompanyName,
        createdAt: Timestamp.now()
      });

      await sendEmailVerification(userCredential.user);

      setUser(userCredential.user);
      onShowVerification(data.email); // Pass email to parent component

    } catch (error: any) {
      console.error('Error registering user:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {form && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        disabled={loading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={loading} className="ml-auto w-full" type="submit">
              Register
            </Button>
          </form>
          {error && <p className="text-red-500">{error}</p>}
        </Form>
      )}
    </>
  );
}
