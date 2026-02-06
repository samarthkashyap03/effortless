import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

// Validation schemas
const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });
const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters" });
const nameSchema = z.string().trim().min(2, { message: "Name must be at least 2 characters" });

type AuthMode = 'signin' | 'signup' | 'forgot-password';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Initialize mode from URL param
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Error state
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  const validateField = (field: string, value: string) => {
    try {
      if (field === 'email') {
        emailSchema.parse(value);
      } else if (field === 'password') {
        passwordSchema.parse(value);
      } else if (field === 'name') {
        nameSchema.parse(value);
      }
      return '';
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0].message;
      }
      return 'Invalid input';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: string, value: string) => {
    if (value) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Forgot Password Flow
    if (mode === 'forgot-password') {
      const emailError = validateField('email', formData.email);
      if (emailError) {
        setErrors(prev => ({ ...prev, email: emailError }));
        return;
      }

      setIsLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: window.location.origin + '/update-password',
        });

        if (error) throw error;

        toast({
          title: "Check your inbox",
          description: "We've sent you a password reset link.",
        });

        // Return to sign in after a delay
        setTimeout(() => setMode('signin'), 2000);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to send reset email.",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. Sign In / Sign Up Flow
    const newErrors = {
      name: mode === 'signup' ? validateField('name', formData.name) : '',
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created successfully!",
          description: "Please sign in with your new account.",
        });

        setTimeout(() => {
          setMode('signin');
          setFormData(prev => ({ ...prev, password: '' }));
        }, 1000);

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast({
          title: "Sign in successful!",
          description: "Welcome back to Effortless.",
        });

        setTimeout(() => {
          navigate('/sessions');
        }, 1000);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "An error occurred during authentication",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    if (mode === 'forgot-password') {
      setMode('signin');
    } else {
      setMode(mode === 'signin' ? 'signup' : 'signin');
    }
    setErrors({ name: '', email: '', password: '' });
    setFormData(prev => ({ ...prev, password: '' }));
  };

  const getTitle = () => {
    if (mode === 'forgot-password') return 'Reset Password';
    if (mode === 'signin') return 'Welcome Back';
    return 'Create Account';
  }

  const getDescription = () => {
    if (mode === 'forgot-password') return 'Enter your email to receive a reset link';
    if (mode === 'signin') return 'Sign in to access your Dashboard';
    return 'Start Verifying Your Work';
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back</span>
      </motion.button>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-10 glow-border backdrop-blur-2xl bg-black/40 border-white/10 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
                <span className="text-white font-bold text-2xl">E</span>
              </div>
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Effortless</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              {getTitle()}
            </h1>
            <p className="text-zinc-400 text-sm">
              {getDescription()}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field - only for signup */}
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={(e) => handleBlur('name', e.target.value)}
                    className={`h-11 pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all ${errors.name ? 'border-red-500/50 focus:border-red-500/50' : ''
                      }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-400 text-xs pl-1">{errors.name}</p>
                )}
              </motion.div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={(e) => handleBlur('email', e.target.value)}
                  className={`h-11 pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all ${errors.email ? 'border-red-500/50 focus:border-red-500/50' : ''
                    }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs pl-1">{errors.email}</p>
              )}
            </div>

            {/* Password field - hide for forgot-password */}
            {mode !== 'forgot-password' && (
              <div className="space-y-2">
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={(e) => handleBlur('password', e.target.value)}
                    className={`h-11 pl-10 pr-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all ${errors.password ? 'border-red-500/50 focus:border-red-500/50' : ''
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs pl-1">{errors.password}</p>
                )}
              </div>
            )}

            {/* Forgot password link - only for signin */}
            {mode === 'signin' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-900/20 transition-all duration-300 transform active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Processing...</span>
                </div>
              ) : (
                mode === 'forgot-password' ? 'Send Reset Link' : (mode === 'signin' ? 'Sign In' : 'Create Account')
              )}
            </Button>
          </form>

          {/* Divider and Toggle */}
          {mode !== 'forgot-password' && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="px-4 bg-[#0a0a0a]/80 text-zinc-500">or continue with</span>
                </div>
              </div>

              <p className="text-center text-zinc-400 text-sm">
                {mode === 'signin' ? "New here?" : "Already member?"}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="ml-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors hover:underline underline-offset-4"
                >
                  {mode === 'signin' ? 'Create an account' : 'Sign in'}
                </button>
              </p>
            </>
          )}

          {/* Back to sign in for forgot password mode */}
          {mode === 'forgot-password' && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Remembered your password? <span className="text-cyan-400 hover:underline">Sign in</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
