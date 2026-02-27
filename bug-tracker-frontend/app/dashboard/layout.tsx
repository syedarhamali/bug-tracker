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
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            Bug Tracker
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className={`text-sm ${pathname === "/dashboard" ? "font-medium text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}`}
            >
              Widgets
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
