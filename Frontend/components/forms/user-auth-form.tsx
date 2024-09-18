// components/pages/AuthPage.tsx
'use client';

import { useState } from 'react';
import UserLoginForm from '@/components/forms/user-login-form';
import UserRegisterForm from '@/components/forms/user-register-form';
import EmailVerification from './email-verification';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const [isVerify, setIsVerify] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string>('');

  const switchToRegister = () => {
    setIsLogin(false);
    setIsRegister(true);
    setIsVerify(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setIsRegister(false);
    setIsVerify(false);
  };

  const showVerificationMessage = (email: string) => {
    setVerificationEmail(email);
    setIsVerify(true);
    setIsLogin(false);
    setIsRegister(false);
  };

  return (
    <div className="flex flex-col justify-center space-y-6 sm:w-[350px] mx-auto">
      {/* Conditional rendering based on the state */}
      {isVerify ? (
        <EmailVerification email={verificationEmail} />
      ) : (
        <>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isLogin ? 'Login' : 'Register'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? 'Enter your credentials to log in to your account'
                : 'Create an account to get started'}
            </p>
          </div>
          
          {isLogin && <UserLoginForm onSwitchToRegister={switchToRegister} />}
          {isRegister && <UserRegisterForm onSwitchToLogin={switchToLogin} onShowVerification={showVerificationMessage} />}
          
          {/* Conditional text and button for switching between login and register */}
          <p className="text-sm text-center text-muted-foreground">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button onClick={switchToRegister} className="text-blue-500 hover:underline">
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={switchToLogin} className="text-blue-500 hover:underline">
                  Login
                </button>
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
