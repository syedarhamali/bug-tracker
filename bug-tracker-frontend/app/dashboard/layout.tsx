"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem("bug_tracker_token");
    if (!token && pathname?.startsWith("/dashboard")) {
      router.replace("/login");
    }
  }, [mounted, pathname, router]);

  function logout() {
    localStorage.removeItem("bug_tracker_token");
    localStorage.removeItem("bug_tracker_user");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100">
              <svg className="h-4 w-4 text-white dark:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight">Bug Tracker</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${pathname === "/dashboard" ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100" : "btn-ghost"}`}
            >
              Widgets
            </Link>
            <button type="button" onClick={logout} className="btn-ghost">
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
