'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState(['', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 5 digits entered
    if (index === 4 && value) {
      const fullCode = newCode.join('');
      if (fullCode.length === 5) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 5);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('');
    while (newCode.length < 5) newCode.push('');
    setCode(newCode);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 4);
    inputRefs.current[nextIndex]?.focus();

    // Auto-verify if complete
    if (pastedData.length === 5) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 5) {
      toast.error('Please enter all 5 digits');
      return;
    }

    setIsVerifying(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: codeToVerify }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsVerified(true);
        toast.success('Email verified successfully!');
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        toast.error(data.error || 'Invalid verification code');
        // Clear code on error
        setCode(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
      setCode(['', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsResending(true);

    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('New verification code sent!');
        setCountdown(60); // 60 second cooldown
        setCode(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(data.error || 'Failed to resend code');
      }
    } catch (error) {
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4 bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Request</h1>
            <p className="text-gray-600 mb-6">Email address not provided.</p>
            <Link href="/auth/register">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Back to Register
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-md mx-auto px-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Register
          </Link>

          <Card className="p-8 shadow-xl">
            {isVerified ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Verified!</h1>
                <p className="text-gray-600 mb-6">
                  Your account has been successfully verified. Redirecting to home...
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                  <p className="text-gray-600">
                    We sent a 5-digit code to
                  </p>
                  <p className="font-semibold text-gray-900">{email}</p>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                    Enter Verification Code
                  </label>
                  <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                        disabled={isVerifying}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Code expires in 15 minutes
                  </p>
                </div>

                <Button
                  onClick={() => handleVerify()}
                  disabled={isVerifying || code.some((d) => !d)}
                  fullWidth
                  className="bg-green-600 hover:bg-green-700 text-white mb-4"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                  <button
                    onClick={handleResend}
                    disabled={isResending || countdown > 0}
                    className="text-green-600 hover:text-green-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {isResending ? (
                      'Sending...'
                    ) : countdown > 0 ? (
                      `Resend in ${countdown}s`
                    ) : (
                      'Resend Code'
                    )}
                  </button>
                </div>
              </>
            )}
          </Card>

          <div className="text-center mt-6 text-sm text-gray-600">
            <p>
              Need help?{' '}
              <Link href="/contact" className="text-green-600 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
        <Footer />
      </>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
