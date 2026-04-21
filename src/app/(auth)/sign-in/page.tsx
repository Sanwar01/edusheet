'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth';
import { useForm } from 'react-hook-form';

type FormData = {
  email: string;
  password: string;
};

export default function SignInPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await signIn(data.email, data.password);
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Form Section */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          <Link href="/" className="flex items-center gap-2 mb-12 w-fit">
            <div className="bg-primary p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">EduSheet AI</span>
          </Link>

          <h1 className="text-3xl font-bold font-display tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground mb-8">
            Enter your details to access your dashboard.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@school.edu"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/sign-up"
              className="font-semibold text-primary hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Visual Section */}
      <div className="hidden md:block relative bg-muted overflow-hidden">
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_URL}/images/hero-bg.png`}
          alt="Abstract background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm mix-blend-multiply" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="bg-background/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-md border border-white/20">
            <h3 className="text-2xl font-bold font-display mb-4">
              "EduSheet AI saves me 5 hours a week."
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              The quality of the AI generated questions is incredible. I can
              prep for a whole week of math classes in 20 minutes.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xl">
                S
              </div>
              <div>
                <p className="font-bold">Sarah Jenkins</p>
                <p className="text-sm text-muted-foreground">
                  Middle School Math Teacher
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
