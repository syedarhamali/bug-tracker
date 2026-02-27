"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
      {status === "loading" && <p className="text-slate-600">Connecting to Trello…</p>}
      {status === "ok" && (
        <div className="rounded-lg bg-green-50 p-6 text-center text-green-800 dark:bg-green-900/30 dark:text-green-200">
          <p className="font-medium">✓ {message}</p>
          <p className="mt-2 text-sm">Redirecting to widget settings…</p>
        </div>
      )}
      {status === "err" && (
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-800 dark:bg-red-900/30 dark:text-red-200">
          <p className="font-medium">{message}</p>
          <a href={`/dashboard/widget/${id}`} className="mt-4 inline-block text-sm underline">
            Back to widget settings
          </a>
        </div>
      )}
    </div>
  );
}
