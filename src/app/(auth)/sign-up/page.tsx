'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Account created. Check your email to verify your account.');
  }

  return (
    <main className='mx-auto max-w-md px-6 py-16'>
      <h1 className='text-3xl font-bold'>Create account</h1>
      <form onSubmit={handleSignUp} className='mt-6 space-y-3'>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder='Full name' required />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' type='email' required />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' type='password' required />
        <Button type='submit'>Sign up</Button>
        {message && <p className='text-sm text-slate-600'>{message}</p>}
      </form>
    </main>
  );
}
