import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Sparkles,
  GripVertical,
  FileDown,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description:
      'Enter your topic, grade level, and preferences. Get a complete worksheet in seconds.',
  },
  {
    icon: GripVertical,
    title: 'Drag & Drop Editor',
    description:
      'Rearrange sections, edit questions, and customize everything with full control.',
  },
  {
    icon: FileDown,
    title: 'Export to PDF',
    description:
      'Print-ready worksheets with clean formatting. Download and distribute instantly.',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: [
      '10 AI generations/month',
      '5 PDF exports/month',
      'Basic templates',
      'Drag & drop editor',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    features: [
      'Unlimited AI generations',
      'Unlimited exports',
      'Premium templates',
      'Priority support',
      'Version history',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <main>
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <Navbar />
        {/* Hero */}
        <section className="container py-20 text-center md:py-32">
          <div className="mx-auto max-w-3xl animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-powered
              worksheet creation
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Create worksheets in <span className="text-primary">seconds</span>
              , customize for <span className="text-primary">hours</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Let AI generate the first draft, then take full control. Edit,
              rearrange, and export beautiful worksheets — your way.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="gap-2 text-base" asChild>
                <Link href="/sign-up">
                  Start Creating <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-secondary/50 py-20">
          <div className="container">
            <h2 className="text-center font-display text-3xl font-bold text-foreground">
              Everything you need to create great worksheets
            </h2>
            <p className="mt-3 text-center text-muted-foreground">
              From generation to export — streamlined for educators.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-card-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="container">
            <h2 className="text-center font-display text-3xl font-bold text-foreground">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-center text-muted-foreground">
              Start free. Upgrade when you need more.
            </p>
            <div className="mt-12 mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl border p-6 ${plan.highlighted ? 'border-primary bg-primary/5 shadow-lg' : 'bg-card shadow-sm'}`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {plan.name}
                  </h3>
                  <div className="mt-3">
                    <span className="text-4xl font-extrabold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <Check className="h-4 w-4 text-success" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-6 w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/sign-up">{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="container flex flex-col items-center gap-4 text-sm text-muted-foreground md:flex-row md:justify-between">
            <div className="flex items-center gap-2 font-display font-semibold text-foreground">
              <BookOpen className="h-4 w-4 text-primary" /> EduSheet AI
            </div>
            <p>
              © {new Date().getFullYear()} EduSheet AI. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
