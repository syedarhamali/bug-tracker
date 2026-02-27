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
    trelloBoardId: "",
  });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [trelloBoards, setTrelloBoards] = useState<{ id: string; name: string }[]>([]);
  const [trelloLists, setTrelloLists] = useState<{ id: string; name: string }[]>([]);
  const [trelloConnecting, setTrelloConnecting] = useState(false);
  const [slackTesting, setSlackTesting] = useState(false);

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
          trelloBoardId: (c as { trelloBoardId?: string }).trelloBoardId || "",
        });
        const { data } = await widgetConfigApi.reports(id);
        setReports(data);
        if (c.trelloToken) {
          try {
            const b = await widgetConfigApi.trelloBoards(id);
            setTrelloBoards(b.data || []);
            if ((c as { trelloBoardId?: string }).trelloBoardId) {
              const l = await widgetConfigApi.trelloLists(id, (c as { trelloBoardId?: string }).trelloBoardId!);
              setTrelloLists(l.data || []);
            }
          } catch {
            /* ignore */
          }
        }
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
        trelloBoardId: form.trelloBoardId || null,
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
          {/* Slack */}
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
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
              <a
                href="https://api.slack.com/messaging/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Get webhook in 3 steps →
              </a>
            </div>
            {form.sendToSlack && (
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  type="url"
                  placeholder="Paste your Slack webhook URL here"
                  value={form.slackWebhookUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slackWebhookUrl: e.target.value }))
                  }
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  disabled={!form.slackWebhookUrl || slackTesting}
                  onClick={async () => {
                    if (!form.slackWebhookUrl) return;
                    setSlackTesting(true);
                    try {
                      await widgetConfigApi.testSlack(id);
                      setMsg({ type: "ok", text: "Test message sent to Slack." });
                    } catch (e) {
                      setMsg({ type: "err", text: e instanceof Error ? e.message : "Test failed" });
                    } finally {
                      setSlackTesting(false);
                    }
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-700"
                >
                  {slackTesting ? "Sending…" : "Send test"}
                </button>
              </div>
            )}
          </div>

          {/* Trello */}
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <span className="font-medium text-slate-900 dark:text-slate-100">
              Send to Trello
            </span>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Each widget can use a different Trello account. Connect this widget to the account (and board) you want.
            </p>
            {!config.trelloToken ? (
              <div className="mt-3">
                <button
                  type="button"
                  disabled={trelloConnecting}
                  onClick={async () => {
                    setTrelloConnecting(true);
                    try {
                      const { redirectUrl } = await widgetConfigApi.trelloConnect(id);
                      window.location.href = redirectUrl;
                    } catch (e) {
                      setMsg({ type: "err", text: e instanceof Error ? e.message : "Failed to start" });
                      setTrelloConnecting(false);
                    }
                  }}
                  className="rounded-lg bg-[#0079bf] px-4 py-2 text-sm font-medium text-white hover:bg-[#026aa7] disabled:opacity-60"
                >
                  {trelloConnecting ? "Opening Trello…" : "Connect Trello (one click)"}
                </button>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  You’ll sign in to Trello; then pick a board and list for this widget.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-green-600 dark:text-green-400">✓ Connected to Trello (this widget only)</p>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await widgetConfigApi.update(config._id, {
                          trelloToken: null,
                          trelloListId: null,
                          trelloBoardId: null,
                          sendToTrello: false,
                        });
                        const c = await widgetConfigApi.get(id);
                        setConfig(c);
                        setForm((f) => ({
                          ...f,
                          trelloToken: "",
                          trelloListId: "",
                          trelloBoardId: "",
                          sendToTrello: false,
                        }));
                        setTrelloBoards([]);
                        setTrelloLists([]);
                        setMsg({ type: "ok", text: "Disconnected. Connect again to use a different Trello account." });
                      } catch (e) {
                        setMsg({ type: "err", text: e instanceof Error ? e.message : "Failed to disconnect" });
                      }
                    }}
                    className="text-xs text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    Use a different Trello account
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Board</label>
                    <select
                      value={form.trelloBoardId}
                      onChange={async (e) => {
                        const boardId = e.target.value;
                        setForm((f) => ({ ...f, trelloBoardId: boardId, trelloListId: "" }));
                        setTrelloLists([]);
                        if (boardId) {
                          try {
                            const l = await widgetConfigApi.trelloLists(id, boardId);
                            setTrelloLists(l.data || []);
                          } catch {
                            setTrelloLists([]);
                          }
                        }
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select a board</option>
                      {trelloBoards.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">List (where bugs go)</label>
                    <select
                      value={form.trelloListId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, trelloListId: e.target.value }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select a list</option>
                      {trelloLists.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.sendToTrello}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sendToTrello: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm">Send new bug reports to Trello</span>
                </label>
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
