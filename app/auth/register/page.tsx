'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Alert } from '@/components/ui';
import { Mail, Lock, User, Phone, Loader2, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const router = useRouter();

  // Password validation rules
  const passwordRules = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const allPasswordRulesMet = Object.values(passwordRules).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Redirect to verification page
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80" 
          alt="Agriculture background"
          className="w-full h-full object-cover"
        />
      </div>
      <Card variant="glass-elevated" className="w-full max-w-md p-8 relative z-10 bg-white border border-gray-200 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Join AgriConnect</h1>
          <p className="text-muted">Create your account to start buying and selling</p>
        </div>

        {error && <Alert variant="error" className="mb-6">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="text"
            label="Full Name"
            placeholder="Enter your full name"
            icon={<User className="w-5 h-5" />}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            icon={<Mail className="w-5 h-5" />}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            type="tel"
            label="Phone Number"
            placeholder="Enter your phone number"
            icon={<Phone className="w-5 h-5" />}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <div>
            <Input
              type="password"
              label="Password"
              placeholder="Create a strong password"
              icon={<Lock className="w-5 h-5" />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onFocus={() => setShowPasswordRules(true)}
              required
              minLength={8}
            />
            
            {/* Password Rules Indicator */}
            {showPasswordRules && (
              <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-2">Password must contain:</p>
                <div className="space-y-1.5">
                  <PasswordRule met={passwordRules.minLength} text="At least 8 characters" />
                  <PasswordRule met={passwordRules.hasUpperCase} text="One uppercase letter (A-Z)" />
                  <PasswordRule met={passwordRules.hasLowerCase} text="One lowercase letter (a-z)" />
                  <PasswordRule met={passwordRules.hasNumber} text="One number (0-9)" />
                  <PasswordRule met={passwordRules.hasSpecial} text="One special character (!@#$%^&*)" />
                </div>
                {allPasswordRulesMet && (
                  <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center gap-2 text-emerald-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Strong password!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button type="submit" variant="neural" fullWidth disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary-neural hover:underline font-medium">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  );
}

// Password Rule Component
function PasswordRule({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm transition-colors ${
      met ? 'text-emerald-600' : 'text-slate-500'
    }`}>
      {met ? (
        <Check className="w-4 h-4 flex-shrink-0" />
      ) : (
        <X className="w-4 h-4 flex-shrink-0" />
      )}
      <span>{text}</span>
    </div>
  );
}
