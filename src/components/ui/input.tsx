import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-md border border-slate-300 px-3 py-2 text-sm',
        props.className,
      )}
      {...props}
    />
  );
}
