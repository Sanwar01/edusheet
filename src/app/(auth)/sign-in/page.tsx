'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  async function handleMagicLink() {
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);
    if (magicError) setError(magicError.message);
  }

  return (
    <main className='mx-auto max-w-md px-6 py-16'>
      <h1 className='text-3xl font-bold'>Sign in</h1>
      <form onSubmit={handleSignIn} className='mt-6 space-y-3'>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' type='email' required />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' type='password' required />
        {error && <p className='text-sm text-red-600'>{error}</p>}
        <Button type='submit' disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
        <Button type='button' variant='outline' disabled={loading || !email} onClick={handleMagicLink}>Send magic link</Button>
      </form>
    </main>
  );
}
