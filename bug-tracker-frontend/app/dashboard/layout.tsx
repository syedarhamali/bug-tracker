"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Widgets",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem("bug_tracker_token");
    if (!token && pathname?.startsWith("/dashboard")) {
      router.replace("/login");
      return;
    }
    try {
      const raw = localStorage.getItem("bug_tracker_user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserEmail(u?.email ?? null);
      }
    } catch {
      setUserEmail(null);
    }
  }, [mounted, pathname, router]);

  function logout() {
    localStorage.removeItem("bug_tracker_token");
    localStorage.removeItem("bug_tracker_user");
    setSidebarOpen(false);
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname?.startsWith("/dashboard/widget");
    return pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
  };

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/95">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-5 dark:border-slate-800">
        <Link
          href="/dashboard"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 text-slate-900 dark:text-slate-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100">
            <svg className="h-4 w-4 text-white dark:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight">Bug Tracker</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User & logout */}
      <div className="shrink-0 border-t border-slate-100 p-3 dark:border-slate-800">
        {userEmail && (
          <p className="mb-2 truncate px-3 text-xs text-slate-500 dark:text-slate-400" title={userEmail}>
            {userEmail}
          </p>
        )}
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-64 lg:flex-col">
        {sidebar}
      </div>

      {/* Mobile: menu button + overlay sidebar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
            <svg className="h-4 w-4 text-white dark:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
          <span className="font-bold tracking-tight">Bug Tracker</span>
        </Link>
        <div className="w-10" />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            {sidebar}
          </div>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 lg:pl-64">
        <div className="min-h-screen pt-16 lg:pt-0">
          <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
