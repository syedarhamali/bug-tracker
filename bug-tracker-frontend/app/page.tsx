import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <main className="max-w-lg text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Bug Tracker Widget
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Embed a bug report popup on any site. Connect to Slack or Trello and
          receive reports where you work.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Sign up
          </Link>
        </div>
      </main>
    </div>
  );
}
