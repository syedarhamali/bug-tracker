"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  widgetConfigApi,
  getEmbedScript,
  type WidgetConfig,
  type BugReport,
} from "@/lib/api";

export default function WidgetConfigPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    sendToSlack: false,
    slackWebhookUrl: "",
    sendToTrello: false,
    trelloApiKey: "",
    trelloToken: "",
    trelloListId: "",
  });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const c = await widgetConfigApi.get(id);
        setConfig(c);
        setForm({
          sendToSlack: c.sendToSlack,
          slackWebhookUrl: c.slackWebhookUrl || "",
          sendToTrello: c.sendToTrello,
          trelloApiKey: c.trelloApiKey || "",
          trelloToken: c.trelloToken || "",
          trelloListId: c.trelloListId || "",
        });
        const { data } = await widgetConfigApi.reports(id);
        setReports(data);
      } catch {
        setConfig(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function save() {
    if (!config) return;
    setSaving(true);
    setMsg(null);
    try {
      await widgetConfigApi.update(config._id, {
        sendToSlack: form.sendToSlack,
        slackWebhookUrl: form.slackWebhookUrl || null,
        sendToTrello: form.sendToTrello,
        trelloApiKey: form.trelloApiKey || null,
        trelloToken: form.trelloToken || null,
        trelloListId: form.trelloListId || null,
      });
      setMsg({ type: "ok", text: "Settings saved." });
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  function copyEmbed() {
    if (!config) return;
    const script = getEmbedScript(config.widgetId);
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading || !config) {
    return (
      <div className="py-8">
        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : (
          <p className="text-slate-500">Widget not found.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          ← Widgets
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {config.name}
      </h1>

      {/* Embed code */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">
          Embed code
        </h2>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Add this script to your site to show the bug report popup.
        </p>
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
            <code>{getEmbedScript(config.widgetId)}</code>
          </pre>
          <button
            type="button"
            onClick={copyEmbed}
            className="absolute right-2 top-2 rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </section>

      {/* Integrations */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-slate-100">
          Integrations
        </h2>
        {msg && (
          <div
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${msg.type === "ok" ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}
          >
            {msg.text}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.sendToSlack}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sendToSlack: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Send to Slack
              </span>
            </label>
            {form.sendToSlack && (
              <input
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={form.slackWebhookUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slackWebhookUrl: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            )}
          </div>

          <div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.sendToTrello}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sendToTrello: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Send to Trello
              </span>
            </label>
            {form.sendToTrello && (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  placeholder="Trello API Key"
                  value={form.trelloApiKey}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, trelloApiKey: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Trello Token"
                  value={form.trelloToken}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, trelloToken: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Trello List ID (e.g. 64a1b2c3d4e5f6789..."
                  value={form.trelloListId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, trelloListId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Use a <strong>list</strong> ID, not the board ID. Board ID from your link is 69a0ec28… — that goes in the URL below. Get list IDs:{" "}
                  <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">GET https://api.trello.com/1/boards/69a0ec284e379fd86c2d8ed3/lists?key=YOUR_KEY&token=YOUR_TOKEN</code>
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </section>

      {/* Recent reports */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-medium text-slate-900 dark:text-slate-100">
          Recent reports
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No reports yet. Submit one via the widget on your site.
          </p>
        ) : (
          <ul className="space-y-3">
            {reports.slice(0, 10).map((r) => (
              <li
                key={r._id}
                className="rounded-lg border border-slate-100 p-3 dark:border-slate-800"
              >
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {r.title}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  {r.description}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {r.pageUrl} · {new Date(r.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
