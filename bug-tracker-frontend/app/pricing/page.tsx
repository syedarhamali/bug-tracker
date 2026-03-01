import Link from "next/link";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@example.com";

const plans = [
  {
    name: "Free",
    description: "Try it out on a single site",
    price: "$0",
    period: "forever",
    widgets: 1,
    reportsPerMonth: 100,
    features: ["1 widget", "100 reports/month", "Slack & Trello", "Embed on 1 site"],
    cta: "Get started free",
    href: "/signup",
    ctaType: "link" as const,
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For growing sites and US traffic",
    price: "$19",
    period: "/month",
    widgets: 10,
    reportsPerMonth: 2000,
    features: ["10 widgets", "2,000 reports/month", "Slack & Trello", "Priority support", "All Free features"],
    cta: "Subscribe with card",
    ctaType: "subscribe" as const,
    plan: "pro" as const,
    planRequest: "Pro ($19/mo)",
    highlighted: true,
  },
  {
    name: "Team",
    description: "Agencies and multiple clients",
    price: "$49",
    period: "/month",
    widgets: 50,
    reportsPerMonth: 20000,
    features: ["50 widgets", "20,000 reports/month", "Slack & Trello", "Priority support", "All Pro features"],
    cta: "Subscribe with card",
    ctaType: "subscribe" as const,
    plan: "team" as const,
    planRequest: "Team ($49/mo)",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-40 dark:opacity-20" />
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
            <Link href="/pricing" className="btn-ghost shrink-0 py-2.5">
              Pricing
            </Link>
            <Link href="/login" className="btn-ghost shrink-0 py-2.5">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary shrink-0 py-2.5">
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              Simple pricing for every scale
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Start free. Upgrade when you need more widgets or report volume — ideal for US traffic and client sites.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900/50 ${
                  plan.highlighted
                    ? "border-slate-900 ring-2 ring-slate-900 dark:border-slate-100 dark:ring-slate-100"
                    : "border-slate-200/80 dark:border-slate-800"
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                    Best for high traffic
                  </div>
                )}
                <div className="flex flex-1 flex-col p-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{plan.name}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {plan.price}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">{plan.period}</span>
                  </div>
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.ctaType === "link" && plan.href ? (
                    <Link
                      href={plan.href}
                      className={`mt-10 block w-full rounded-xl py-3.5 text-center text-sm font-semibold transition ${
                        plan.highlighted
                          ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                          : "border-2 border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  ) : plan.ctaType === "subscribe" && "plan" in plan ? (
                    <Link
                      href={`/dashboard/upgrade?plan=${plan.plan}`}
                      className={`mt-10 block w-full rounded-xl py-3.5 text-center text-sm font-semibold transition ${
                        plan.highlighted
                          ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                          : "border-2 border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  ) : null}
                  {plan.ctaType === "subscribe" && "planRequest" in plan && (
                    <a
                      href={`mailto:${CONTACT_EMAIL}?subject=Upgrade to ${plan.planRequest}&body=Hi, I'd like to pay via Payoneer, Wise, or wire for ${plan.planRequest}.%0A%0AMy account email: `}
                      className="mt-3 block w-full rounded-xl py-2.5 text-center text-sm font-medium text-slate-600 underline hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Pay by Payoneer, Wise or wire
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paying from the US / International */}
          <div className="mt-16 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Paying from the US or internationally?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              We accept <strong>Payoneer</strong>, <strong>Wise</strong>, and <strong>bank wire (USD)</strong>. 
              Click &quot;Get payment link&quot; on Pro or Team — we&apos;ll send you a secure payment option. 
              No US bank or credit card required on your side.
            </p>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              After payment, your account is upgraded within 24 hours.
            </p>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            All plans include Slack & Trello. Custom plan?{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-slate-900 underline dark:text-slate-100">
              Contact us
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
