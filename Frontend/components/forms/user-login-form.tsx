import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useUserData } from '@/context/UserDataContext';  // Adjust the import path as needed

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password should be at least 6 characters long' }),
});

type LoginFormValue = z.infer<typeof formSchema>;

export default function UserLoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginFormValue>({ resolver: zodResolver(formSchema) });
  const router = useRouter();
  const { setUser } = useUserData();  // Use the context here

  const onSubmit = async (data: LoginFormValue) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      console.log('SignIn Result:', result);

      if (result?.error) {
        setError(result.error);
      } else {
        // Assuming result.user contains the user data
        if (result.user) {
          setUser(result.user);  // Save user data to context
        }
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="text"
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
          Login
        </Button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </Form>
  );
}
