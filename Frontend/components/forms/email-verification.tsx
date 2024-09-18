// components/ui/email-verification.tsx
'use client';

import { Button } from '@/components/ui/button';

interface EmailVerificationProps {
  email: string;
}

export default function EmailVerification({ email }: EmailVerificationProps) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold">Verify Your Email</h1>
      <p className="text-sm text-muted-foreground">
        A verification email has been sent to {email}. Please check your inbox and follow the instructions to verify your email address.
      </p>
      <Button className="mt-4" onClick={() => window.location.reload()}>
        Back to login
      </Button>
    </div>
  );
}
