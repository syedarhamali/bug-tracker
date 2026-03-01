import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-40 dark:opacity-20" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-900/10" />
      <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-900/10" />
      <div className="absolute -bottom-40 right-1/4 h-72 w-72 rounded-full bg-slate-200/50 blur-3xl dark:bg-slate-700/20" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100">
              <svg className="h-4 w-4 text-white dark:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight">Bug Tracker</span>
          </Link>
          <nav className="flex items-center gap-3" aria-label="Main">
            <Link
              href="/login"
              className="btn-ghost shrink-0 py-2.5"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="btn-primary shrink-0 py-2.5"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-4 pt-20 pb-28 sm:pt-28 sm:pb-36">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            One script. Any site. Zero hassle.
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl md:text-6xl">
            Catch bugs where they happen.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 sm:text-xl">
            Add a bug report widget to your app in 30 seconds. Reports go straight to Slack or Trello—no new tools, no extra inbox.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="btn-primary min-h-[48px] px-7 py-3.5 text-base font-semibold"
            >
              Get started free
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="#how-it-works"
              className="btn-secondary min-h-[48px] shrink-0 border-slate-300 bg-white px-7 py-3.5 text-base font-semibold shadow-sm dark:border-slate-500 dark:bg-slate-900 dark:shadow-slate-900/20"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="relative z-10 border-y border-slate-200/80 bg-white/50 py-6 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            Works with the tools you already use
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" /></svg>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Slack</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.657 1.343 3 3 3h18c1.657 0 3-1.343 3-3V3c0-1.657-1.343-3-3-3zM11 17H6a1 1 0 01-1-1V8a1 1 0 011-1h5a1 1 0 011 1v8a1 1 0 01-1 1zm9-5h-5a1 1 0 01-1-1V8a1 1 0 011-1h5a1 1 0 011 1v3a1 1 0 01-1 1z" /></svg>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Trello</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Any website</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Built for how you work
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-slate-600 dark:text-slate-400">
              One embed, one dashboard. Route reports to the right place—no new workflows.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Drop-in widget",
                description: "Add a single script tag to any site. A floating button appears; users click, describe the bug, and submit. No backend code on your side.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                ),
              },
              {
                title: "Slack in one click",
                description: "Paste your incoming webhook URL. Every new report posts to your channel with title, description, page URL, and browser info.",
                icon: (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" /></svg>
                ),
              },
              {
                title: "Trello cards, no API keys",
                description: "Connect with Trello OAuth. Pick a board and list from the dashboard—new reports become cards automatically. Different widget, different board? No problem.",
                icon: (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.657 1.343 3 3 3h18c1.657 0 3-1.343 3-3V3c0-1.657-1.343-3-3-3zM11 17H6a1 1 0 01-1-1V8a1 1 0 011-1h5a1 1 0 011 1v8a1 1 0 01-1 1zm9-5h-5a1 1 0 01-1-1V8a1 1 0 011-1h5a1 1 0 011 1v3a1 1 0 01-1 1z" /></svg>
                ),
              },
              {
                title: "One widget per project",
                description: "Create a widget for each site or app. Each has its own embed code and can point to different Slack channels or Trello boards.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                ),
              },
              {
                title: "Context included",
                description: "Reports capture the page URL, user agent, and viewport so you can reproduce issues without asking for more info.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                ),
              },
              {
                title: "Your data, your control",
                description: "Reports are stored on your configured backend. Use our hosted API or self-host. You own the data.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                ),
              },
            ].map((f, i) => (
              <article
                key={i}
                className="group rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-slate-100 dark:group-hover:text-slate-900 transition">
                  {f.icon}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-slate-100">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 border-t border-slate-200/80 bg-white/60 px-4 py-20 dark:border-slate-800 dark:bg-slate-900/30 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Three steps from signup to first report.
            </p>
          </div>
          <div className="mt-16 space-y-12 sm:space-y-16">
            {[
              { step: 1, title: "Create a widget", body: "Sign up, add a widget (name + domain), and copy the embed code from the dashboard." },
              { step: 2, title: "Add the script to your site", body: "Paste the single script tag before </body>. A bug report button appears on your page. No build step, no npm install." },
              { step: 3, title: "Connect Slack or Trello", body: "In the widget settings, add a Slack webhook or connect Trello and pick a list. New reports show up there automatically." },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-6 sm:gap-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                  {step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 px-8 py-16 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-800 sm:px-12 sm:py-20">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start collecting bug reports today
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              Free to get started. No credit card required.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="cta-block-primary inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold shadow-lg transition active:scale-[0.98]"
              >
                <span>Create account</span>
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="cta-block-secondary inline-flex items-center justify-center rounded-xl border-2 px-7 py-3.5 text-base font-semibold transition active:scale-[0.98]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/50 py-10 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
              <svg className="h-4 w-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <span className="font-semibold">Bug Tracker</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-slate-100">Sign in</Link>
            <Link href="/signup" className="hover:text-slate-900 dark:hover:text-slate-100">Create account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
