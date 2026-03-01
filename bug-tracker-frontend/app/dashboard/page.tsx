"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { widgetConfigApi, authApi, type WidgetConfig, type User } from "@/lib/api";

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDomain, setAddDomain] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [upgradedBanner, setUpgradedBanner] = useState(false);

  async function load() {
    try {
      const [listRes, meRes] = await Promise.all([widgetConfigApi.list(), authApi.me()]);
      setWidgets(listRes.data);
      setUser(meRes);
    } catch {
      setWidgets([]);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "1") {
      setUpgradedBanner(true);
      load();
    }
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      await widgetConfigApi.create(addName.trim(), addDomain.trim());
      setAddName("");
      setAddDomain("");
      setModalOpen(false);
      load();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add widget");
    } finally {
      setAddLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="min-h-[60vh]">
      {upgradedBanner && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          Your plan has been upgraded. You now have access to your new limits.
        </div>
      )}
      {/* Usage & plan card */}
      {user?.usage && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-6 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center gap-6">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {user.plan || "Free"} plan
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Widgets: <strong>{user.usage.widgets}</strong> / {user.usage.widgetsLimit}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Reports this month: <strong>{user.usage.reportsThisMonth}</strong> / {user.usage.reportsPerMonthLimit}
            </span>
          </div>
          {(user.plan === "free" || !user.plan) && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Upgrade
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l8 8m0 0l-8 8m8-8H3" />
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Widgets
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Add a widget per site, copy the embed code, and connect Slack or Trello.
        </p>
      </div>

      {/* Add widget CTA card */}
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Add a new widget
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              One widget per site or project — get your embed code in seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-primary shrink-0"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add widget
          </button>
        </div>
      </div>

      {/* Widget list or states */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white py-24 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100" />
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Loading widgets…</p>
        </div>
      ) : widgets.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center sm:py-24">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <svg className="h-10 w-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </span>
            <h2 className="mt-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
              No widgets yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Add your first widget to get an embed code and connect Slack or Trello for bug reports.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-primary mt-8"
            >
              Add your first widget
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Your widgets ({widgets.length})
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {widgets.map((w) => (
              <li key={w._id}>
                <Link
                  href={`/dashboard/widget/${w._id}`}
                  className="group flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      <svg className="h-6 w-6 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {w.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {w.domain}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition group-hover:border-slate-300 group-hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:group-hover:bg-slate-800">
                    Configure →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add widget modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() => !addLoading && setModalOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5 dark:border-slate-800 dark:bg-slate-800/30">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Add widget
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                One widget per site or project
              </p>
            </div>
            <form onSubmit={handleAdd} className="p-6">
              {addError && (
                <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
                  {addError}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Name
                  </label>
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="My website"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={addDomain}
                    onChange={(e) => setAddDomain(e.target.value)}
                    placeholder="example.com"
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={addLoading}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="btn-primary flex-1"
                >
                  {addLoading ? "Adding…" : "Add widget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
