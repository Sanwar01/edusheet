import * as React from 'react';
import { cn } from '@/lib/utils';

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
        props.className,
      )}
      {...props}
    />
  );
}
