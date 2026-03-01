"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { widgetConfigApi } from "@/lib/api";

export default function TrelloCallbackPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const match = hash.match(/token=([^&]+)/);
    const token = match ? decodeURIComponent(match[1]) : "";
    const state = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("state");
    if (!token || !state) {
      setStatus("err");
      setMessage("Missing token from Trello. Please try connecting again.");
      return;
    }
    (async () => {
      try {
        await widgetConfigApi.trelloCallback(state, token);
        setStatus("ok");
        setMessage("Trello connected! Choose a list below.");
        setTimeout(() => router.replace(`/dashboard/widget/${id}`), 2000);
      } catch (e) {
        setStatus("err");
        setMessage(e instanceof Error ? e.message : "Connection failed");
      }
    })();
  }, [id, router]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {status === "loading" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100" />
            <p className="mt-6 font-medium text-slate-900 dark:text-slate-100">Connecting to Trello…</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Please wait</p>
          </div>
        )}
        {status === "ok" && (
          <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-emerald-50 p-10 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
            <span className="flex mx-auto h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <p className="mt-6 text-lg font-semibold text-emerald-900 dark:text-emerald-100">{message}</p>
            <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">Redirecting to widget settings…</p>
          </div>
        )}
        {status === "err" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="border-b border-slate-100 bg-red-50/80 px-6 py-6 text-center dark:border-slate-800 dark:bg-red-900/10">
              <span className="flex mx-auto h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <p className="mt-4 font-semibold text-red-900 dark:text-red-100">{message}</p>
            </div>
            <div className="p-6">
              <Link
                href={`/dashboard/widget/${id}`}
                className="btn-primary block w-full py-3"
              >
                Back to widget settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
