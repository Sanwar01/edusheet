import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '../ui/button';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-bold text-foreground"
        >
          <BookOpen className="h-6 w-6 text-primary" />
          EduSheet AI
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
