'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FormData = {
  fullName: string;
  email: string;
  password: string;
};
export default function SignUpPage() {
  const { signUp } = useAuth();
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
      await signUp(data.email, data.password, data.fullName);
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hidden md:block relative bg-muted overflow-hidden">
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_URL}/images/hero-bg.png`}
          alt="Abstract background"
          className="absolute inset-0 w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-accent/20 backdrop-blur-[2px] mix-blend-color-burn" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_URL}/images/logo-mark.png`}
            className="w-12 h-12 mb-6 drop-shadow-lg filter invert brightness-0"
            alt="Logo"
          />
          <h2 className="text-4xl font-display font-bold mb-4 drop-shadow-md">
            Create smarter worksheets.
          </h2>
          <p className="text-xl text-white/90 font-medium drop-shadow">
            Join thousands of educators saving time with AI.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          <div className="md:hidden flex items-center gap-2 mb-12 w-fit">
            <div className="bg-primary p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">EduSheet AI</span>
          </div>

          <h1 className="text-3xl font-bold font-display tracking-tight mb-2">
            Create an account
          </h1>
          <p className="text-muted-foreground mb-8">
            Start generating free worksheets today.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Jane Doe"
                {...register('fullName', {
                  required: 'Full name is required',
                  setValueAs: (value) => value.trim(),
                })}
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@school.edu"
                {...register('email', {
                  required: 'Email is required',
                  setValueAs: (value) => value.trim(),
                })}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                })}
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
              className="w-full h-11 text-base font-semibold mt-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Sign up'
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
