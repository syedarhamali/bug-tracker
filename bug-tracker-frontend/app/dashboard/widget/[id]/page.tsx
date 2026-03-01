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

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  if (loading || !config) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center py-12">
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          {loading ? (
            <>
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100" />
              <p className="mt-6 font-medium text-slate-900 dark:text-slate-100">Loading widget…</p>
            </>
          ) : (
            <>
              <span className="flex mx-auto h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <svg className="h-7 w-7 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <p className="mt-6 font-medium text-slate-900 dark:text-slate-100">Widget not found</p>
              <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                ← Back to widgets
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Breadcrumb & title */}
      <nav className="mb-6 flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          Widgets
        </Link>
        <span className="text-slate-400 dark:text-slate-500">/</span>
        <span className="font-medium text-slate-900 dark:text-slate-100">{config.name}</span>
      </nav>
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        {config.name}
      </h1>

      {msg && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm ${msg.type === "ok" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200" : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"}`}
        >
          {msg.text}
        </div>
      )}

      {/* Embed code card */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
              <svg className="h-4 w-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </span>
            Embed code
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add this script to your site to show the bug report button.
          </p>
        </div>
        <div className="relative p-6">
          <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50 py-4 pl-4 pr-24 text-sm leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200">
            <code>{getEmbedScript(config.widgetId)}</code>
          </pre>
          <button
            type="button"
            onClick={copyEmbed}
            className="btn-primary absolute right-6 top-1/2 -translate-y-1/2 px-4 py-2.5 text-sm"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </section>

      {/* Integrations – grid of cards */}
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
        Integrations
      </h2>
      <div className="mb-8 grid gap-6 sm:grid-cols-2">
        {/* Slack card */}
        <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="border-b border-slate-100 bg-[#4A154B]/5 px-6 py-4 dark:border-slate-800 dark:bg-[#4A154B]/10">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4A154B] text-white">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" /></svg>
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Slack</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Post bug reports to a channel</p>
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.sendToSlack}
                onChange={(e) => setForm((f) => ({ ...f, sendToSlack: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-[#4A154B] focus:ring-[#4A154B]"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Send reports to Slack</span>
            </label>
            {form.sendToSlack && (
              <div className="mt-4 space-y-3">
                <input
                  type="url"
                  placeholder="Paste webhook URL (hooks.slack.com/...)"
                  value={form.slackWebhookUrl}
                  onChange={(e) => setForm((f) => ({ ...f, slackWebhookUrl: e.target.value }))}
                  className={inputClass}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://api.slack.com/messaging/webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#4A154B] hover:underline dark:text-[#E01E5A]"
                  >
                    Get webhook →
                  </a>
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
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    {slackTesting ? "Sending…" : "Send test"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Trello card */}
        <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="border-b border-slate-100 bg-[#0079bf]/5 px-6 py-4 dark:border-slate-800 dark:bg-[#0079bf]/10">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0079bf] text-white">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.657 1.343 3 3 3h18c1.657 0 3-1.343 3-3V3c0-1.657-1.343-3-3-3zM11 17H6a1 1 0 01-1-1V8a1 1 0 011-1h5a1 1 0 011 1v8a1 1 0 01-1 1zm9-5h-5a1 1 0 01-1-1V8a1 1 0 011-1h5a1 1 0 011 1v3a1 1 0 01-1 1z" /></svg>
              </span>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Trello</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Create cards in a board list</p>
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              Each widget can use a different Trello account.
            </p>
            {!config.trelloToken ? (
              <div className="mt-auto">
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
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0079bf] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0079bf]/25 transition hover:bg-[#026aa7] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {trelloConnecting ? "Opening Trello…" : "Connect Trello"}
                </button>
                <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                  Sign in once, then pick board & list
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50 py-2 px-3 dark:bg-emerald-900/20">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Connected</span>
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
                        setForm((f) => ({ ...f, trelloToken: "", trelloListId: "", trelloBoardId: "", sendToTrello: false }));
                        setTrelloBoards([]);
                        setTrelloLists([]);
                        setMsg({ type: "ok", text: "Disconnected. Connect again to use a different account." });
                      } catch (e) {
                        setMsg({ type: "err", text: e instanceof Error ? e.message : "Failed to disconnect" });
                      }
                    }}
                    className="text-xs text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  >
                    Use different account
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Board</label>
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
                      className={inputClass}
                    >
                      <option value="">Select board</option>
                      {trelloBoards.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">List</label>
                    <select
                      value={form.trelloListId}
                      onChange={(e) => setForm((f) => ({ ...f, trelloListId: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">Select list</option>
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
                    onChange={(e) => setForm((f) => ({ ...f, sendToTrello: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 text-[#0079bf] focus:ring-[#0079bf]"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Send new reports to Trello</span>
                </label>
              </div>
            )}
          </div>
        </article>
      </div>

      <div className="mb-8 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>

      {/* Recent reports card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Recent reports</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Latest bug reports from this widget
          </p>
        </div>
        <div className="p-6">
          {reports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">No reports yet</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Submit one via the widget on your site</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {reports.slice(0, 10).map((r) => (
                <li
                  key={r._id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30"
                >
                  <p className="font-medium text-slate-900 dark:text-slate-100">{r.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{r.description}</p>
                  {r.mediaUrl && (
                    <p className="mt-2">
                      <a
                        href={r.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                      >
                        View screenshot/video
                      </a>
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                    {r.pageUrl} · {new Date(r.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
