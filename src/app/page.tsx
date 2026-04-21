'use client';

import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  ChevronRight,
  BrainCircuit,
  PenTool,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-linear-to-b from-background/40 via-background/80 to-background" />
          </div>

          <div className="container mx-auto px-4 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4" />
                The Future of Teaching is Here
              </span>
              <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-foreground mb-8 leading-[1.1]">
                Generate tailored{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
                  worksheets
                </span>{' '}
                in seconds, not hours.
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                EduSheet AI uses advanced AI to create high-quality,
                grade-appropriate educational materials. Customize them
                visually, export to PDF, and get back to what matters: teaching.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 text-lg flex items-center justify-center gap-2"
                >
                  Start for free <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#demo"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 text-lg"
                >
                  See how it works
                </Link>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required for free plan.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-card border-y">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
                Everything you need to create amazing materials
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We've built the perfect workflow for educators to go from idea
                to printable worksheet in under a minute.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: BrainCircuit,
                  title: 'AI Generation',
                  desc: 'Just type a topic, grade level, and question types. Our AI crafts perfect, age-appropriate content instantly.',
                },
                {
                  icon: PenTool,
                  title: 'Visual Editor',
                  desc: "Don't like a question? Change it. Drag and drop sections, tweak the formatting, and make it yours.",
                },
                {
                  icon: Printer,
                  title: '1-Click PDF Export',
                  desc: 'Export beautiful, print-ready PDFs instantly without fighting with margins or word processors.',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-12">
              Simple, transparent pricing
            </h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              {/* Free Plan */}
              <div className="p-8 rounded-3xl border bg-card">
                <h3 className="text-2xl font-bold mb-2">Basic</h3>
                <div className="text-4xl font-bold mb-6 font-display">
                  $0
                  <span className="text-lg text-muted-foreground font-normal">
                    /mo
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    '10 AI generations per month',
                    '5 PDF exports per month',
                    'Standard templates',
                    'Community support',
                  ].map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary" /> {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block w-full py-3 px-4 bg-secondary text-center font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="p-8 rounded-3xl border-2 border-primary bg-primary/5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold mb-2 text-primary">
                  Pro Educator
                </h3>
                <div className="text-4xl font-bold mb-6 font-display">
                  $12
                  <span className="text-lg text-muted-foreground font-normal">
                    /mo
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    'Unlimited AI generations',
                    'Unlimited PDF exports',
                    'Premium design themes',
                    'Priority support',
                    'Save custom templates',
                  ].map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-foreground font-medium"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary" /> {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block w-full py-3 px-4 bg-primary text-primary-foreground text-center font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-display font-semibold">EduSheet AI</span>
          </div>
          <p>
            &copy; {new Date().getFullYear()} EduSheet AI. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
