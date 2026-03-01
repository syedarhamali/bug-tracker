"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const token = params.get("token");
    if (!token) {
      setStatus("err");
      setMessage("Missing token. Please try signing in again.");
      return;
    }
    (async () => {
      try {
        const user = await authApi.me(token);
        localStorage.setItem("bug_tracker_token", token);
        localStorage.setItem("bug_tracker_user", JSON.stringify(user));
        setStatus("ok");
        router.replace("/dashboard");
        router.refresh();
      } catch {
        setStatus("err");
        setMessage("Could not load your account. Please try again.");
      }
    })();
  }, [router]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100" />
            <p className="mt-4 font-medium text-slate-900 dark:text-slate-100">Signing you in…</p>
          </>
        )}
        {status === "err" && (
          <>
            <p className="font-medium text-red-600 dark:text-red-400">{message}</p>
            <a
              href="/login"
              className="btn-primary mt-6 inline-block"
            >
              Back to sign in
            </a>
          </>
        )}
      </div>
    </div>
  );
}
