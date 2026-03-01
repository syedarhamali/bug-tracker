"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { billingApi } from "@/lib/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bug_tracker_token");
}

function UpgradeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams?.get("plan");
  const plan = planParam === "team" ? "team" : "pro";
  const [status, setStatus] = useState<"loading" | "redirect" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!getToken()) {
      const returnTo = `/dashboard/upgrade?plan=${plan}`;
      router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    (async () => {
      try {
        const { url } = await billingApi.createCheckout(plan);
        setStatus("redirect");
        window.location.href = url;
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Checkout failed");
      }
    })();
  }, [plan, router]);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      {status === "loading" && (
        <div className="flex flex-col items-center py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100" />
          <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
            Preparing checkout…
          </p>
        </div>
      )}
      {status === "redirect" && (
        <div className="flex flex-col items-center py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100" />
          <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
            Redirecting to payment…
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="py-4">
          <p className="font-medium text-red-600 dark:text-red-400">{error}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            You can still upgrade via Payoneer, Wise, or bank wire from the pricing page.
          </p>
          <Link href="/pricing" className="btn-primary mt-6 inline-block">
            View pricing
          </Link>
        </div>
      )}
    </div>
  );
}

export default function UpgradePage() {
  return (
    <div className="min-h-[60vh]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Upgrade plan
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Subscribe with card — secure recurring billing via Lemon Squeezy.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-col items-center py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100" />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading…</p>
            </div>
          </div>
        }
      >
        <UpgradeForm />
      </Suspense>
    </div>
  );
}
