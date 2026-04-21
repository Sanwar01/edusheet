import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Check } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { faqs, features, plans, steps, testimonials } from '@/constants';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.12),transparent_22%),linear-gradient(to_bottom,#ffffff,#f6f8fc)]" />
        <div className="relative mx-auto max-w-[1440px] px-8 pb-20 pt-16 lg:pb-24 lg:pt-20">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            {/* Hero content */}
            <div className="max-w-[620px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-2 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-primary">
                  Built for teachers, tutors, schools, and institutions
                </span>
              </div>

              <h1 className="mt-7 text-[60px] font-semibold leading-[0.98] tracking-[-0.05em] text-slate-950">
                Create polished worksheets in minutes, not hours.
              </h1>

              <p className="mt-6 max-w-[560px] text-lg leading-8 text-slate-600">
                Generate a first draft instantly, make quick changes, and export
                a classroom-ready worksheet without wasting time formatting from
                scratch.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="default">Create your first worksheet</Button>
                <Button variant="outline" asChild>
                  <Link href="/sign-up">View live demo</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  'No complicated setup',
                  'Edit anything easily',
                  'Download as PDF',
                ].map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Live preview */}
            <div className="relative">
              <div className="absolute -left-10 top-16 hidden h-36 w-36 rounded-full bg-indigo-200/40 blur-3xl lg:block" />
              <div className="absolute -right-6 bottom-8 hidden h-40 w-40 rounded-full bg-violet-200/50 blur-3xl lg:block" />

              <div className="relative rounded-[36px] border border-white/80 bg-white/80 p-5 shadow-[0_36px_100px_rgba(91,91,214,0.16)] backdrop-blur-xl">
                <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Generate
                    </div>
                    <div className="mt-3 text-lg font-semibold tracking-tight">
                      Fractions worksheet
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        ['Subject', 'Maths'],
                        ['Grade', 'Year 5'],
                        ['Type', 'Practice'],
                        ['Questions', '10'],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-3"
                        >
                          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                            {label}
                          </div>
                          <div className="mt-1 text-sm font-medium text-slate-100">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">
                      Generate draft
                    </button>
                  </div>

                  <div className="rounded-[30px] border border-slate-200 bg-[#F8FAFF] p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          Live product preview
                        </div>
                        <div className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                          Fractions Practice
                        </div>
                      </div>
                      <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Ready to print
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500">
                            Worksheet title
                          </div>
                          <div className="mt-2 text-[28px] font-semibold tracking-tight text-slate-950">
                            Fractions Practice
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
                          Grade 5
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-3">
                          <div className="mb-3 text-sm font-semibold text-slate-900">
                            Sections
                          </div>
                          <div className="space-y-2">
                            {[
                              'Instructions',
                              'Multiple choice',
                              'Short answers',
                            ].map((item, index) => (
                              <div
                                key={item}
                                className={`rounded-2xl px-3 py-3 text-sm font-medium ${
                                  index === 1
                                    ? 'border border-indigo-100 bg-indigo-50 text-indigo-700'
                                    : 'bg-white text-slate-600'
                                }`}
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {[1, 2].map((q) => (
                            <div
                              key={q}
                              className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-700">
                                    Multiple choice
                                  </div>
                                  <div className="mt-3 text-base font-semibold leading-7 text-slate-900">
                                    {q}.{' '}
                                    {q === 1
                                      ? 'What is 1/2 + 1/4?'
                                      : 'Which fraction is equal to 2/4?'}
                                  </div>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                                  Edit
                                </div>
                              </div>
                              <div className="mt-4 grid grid-cols-2 gap-2.5">
                                {(q === 1
                                  ? ['1/4', '3/4', '2/4', '1']
                                  : ['1/2', '1/3', '3/4', '2/3']
                                ).map((option) => (
                                  <div
                                    key={option}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-600"
                                  >
                                    {option}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 hidden rounded-[24px] border border-white/80 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)] lg:block">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Time saved
                  </div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                    45 mins
                  </div>
                  <div className="text-sm text-slate-500">
                    Average per worksheet
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-y border-slate-200 bg-white/70">
        <div className="mx-auto max-w-[1440px] px-8 py-8">
          <div className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Trusted by teachers, tutors, and learning teams
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              'Oakwood School',
              'BrightPath Tutors',
              'Northfield Academy',
              'The Learning Hub',
              'Future Classrooms',
            ].map((logo) => (
              <div
                key={logo}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-sm font-semibold text-slate-500 shadow-sm"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-[1440px] px-8 py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {features.map((card) => (
            <div
              key={card.title}
              className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-lg font-semibold text-indigo-700">
                ✦
              </div>
              <div className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                {card.title}
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-[1440px] px-8 pb-20">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              The problem
            </div>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              Making worksheets takes too long.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
              After a full day of teaching or tutoring, the last thing you want
              is another hour spent typing, formatting, and fixing a worksheet.
            </p>
            <div className="mt-8 space-y-3">
              {[
                'You spend too long formatting everything by hand',
                'You keep reusing and editing old worksheets',
                'Creating something new for each lesson takes too much effort',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 text-sm leading-6 text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              The solution
            </div>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Just tell us what you need. We’ll build the first draft for you.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Then you can change wording, adjust questions, and download
              something ready for class without wrestling with complicated
              software.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                ['Simple to use', 'If you can type, you can use it.'],
                ['Easy to change', 'Every question can be edited.'],
                ['Ready to print', 'Download worksheets as PDFs.'],
                ['Made for teaching', 'Built around real classroom tasks.'],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="text-lg font-semibold tracking-tight text-primary">
                    {title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1440px] px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                How it works
              </div>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                From idea to worksheet in three simple steps
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              Clear, simple, and built for busy educators who want a faster
              workflow.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.05)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-white">
                  {step.number}
                </div>
                <div className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                  {step.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*Testimonials */}
      <section className="mx-auto max-w-[1440px] px-8 py-20">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 ">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                  What people say
                </div>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                  Built for real classroom and tutoring workflows
                </h2>
              </div>
              <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500 md:block">
                4.9/5 early feedback
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {testimonials.map((item) => (
                <div
                  key={item.quote}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="text-base font-semibold leading-7 text-slate-900">
                    “{item.quote}”
                  </div>
                  <div className="mt-3 text-sm text-slate-500">{item.role}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-primary p-8 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-foreground">
              For schools and institutions
            </div>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              Give every teacher a faster way to prepare materials.
            </h2>
            <p className="mt-4 text-base leading-8 text-primary-foreground">
              Start with one classroom, then expand into shared templates,
              department-wide consistency, and central billing.
            </p>
            <div className="mt-8 space-y-3">
              {[
                'Shared worksheet templates',
                'School branding and consistency',
                'Simple multi-user setup',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-sm font-medium text-primary-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
            <Button variant="secondary" className="mt-8">
              Talk to us about schools
            </Button>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-[#F8FAFF] py-20">
        <div className="mx-auto max-w-[1440px] px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-500">
                Common questions
              </div>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                Everything you might be wondering
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
                Clear answers for busy teachers, tutors, school leaders, and
                institutions.
              </p>
            </div>
            <div className="space-y-4">
              {faqs.map((item) => (
                <div
                  key={item.q}
                  className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="text-lg font-semibold tracking-tight text-slate-900">
                    {item.q}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1280px] px-8 py-20">
        <div className="rounded-[40px] border border-slate-200 bg-primary p-10 text-center text-white shadow-[0_30px_90px_rgba(15,23,42,0.2)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            Start free
          </div>
          <h2 className="mt-3 text-5xl font-semibold tracking-tight">
            Create your first worksheet today.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            See how much time you can save with a modern worksheet creator built
            for teachers, tutors, schools, and institutions.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              variant="secondary"
              className="rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950"
            >
              Create your first worksheet
            </Button>
            <Button
              variant="secondary"
              className="rounded-2xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white"
            >
              Talk to sales
            </Button>
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
          <p>© {new Date().getFullYear()} EduSheet AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
