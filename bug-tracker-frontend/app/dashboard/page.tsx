"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { widgetConfigApi, type WidgetConfig } from "@/lib/api";

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addDomain, setAddDomain] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  async function load() {
    try {
      const { data } = await widgetConfigApi.list();
      setWidgets(data);
    } catch {
      setWidgets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
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
      {/* Hero */}
      <div className="mb-10 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Your widgets
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Add a widget per site, copy the embed code, and connect Slack or Trello.
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-primary mt-6"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add widget
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading widgets…</p>
        </div>
      ) : widgets.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <svg className="h-8 w-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <h2 className="mt-6 text-lg font-semibold text-slate-900 dark:text-slate-100">
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
        <ul className="grid gap-4 sm:grid-cols-2">
          {widgets.map((w) => (
            <li key={w._id}>
              <Link
                href={`/dashboard/widget/${w._id}`}
                className="group flex items-center justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
              >
                <div className="flex min-w-0 items-center gap-4">
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
                <span className="ml-4 shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition group-hover:border-slate-300 group-hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:group-hover:bg-slate-800">
                  Configure →
                </span>
              </Link>
            </li>
          ))}
        </ul>
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
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
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
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
