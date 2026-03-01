const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bug_tracker_token");
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token = getToken(), ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || "Request failed");
  return data as T;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface WidgetConfig {
  _id: string;
  name: string;
  domain: string;
  widgetId: string;
  apiKey: string;
  userId: string;
  sendToSlack: boolean;
  slackWebhookUrl: string | null;
  sendToTrello: boolean;
  trelloApiKey: string | null;
  trelloToken: string | null;
  trelloListId: string | null;
  trelloBoardId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrelloBoard {
  id: string;
  name: string;
}
export interface TrelloList {
  id: string;
  name: string;
}

export interface BugReport {
  _id: string;
  widgetId: string;
  title: string;
  description: string;
  email: string | null;
  pageUrl: string | null;
  status: string;
  createdAt: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      token: null,
    }),
  signup: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api<{ token: string; user: User }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
      token: null,
    }),
  me: (token: string) =>
    api<User>("/auth/me", { token }),

  /** Redirect to backend Google OAuth; returnTo is "login" or "signup". */
  getGoogleAuthUrl: (returnTo: "login" | "signup") => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${base}/auth/google?returnTo=${returnTo}`;
  },
};

export const widgetConfigApi = {
  list: () => api<{ data: WidgetConfig[] }>("/widget-config"),
  get: (id: string) => api<WidgetConfig>(`/widget-config/${id}`),
  create: (name: string, domain: string) =>
    api<WidgetConfig>("/widget-config", {
      method: "POST",
      body: JSON.stringify({ name, domain }),
    }),
  update: (id: string, data: Partial<WidgetConfig>) =>
    api<WidgetConfig>(`/widget-config/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    api<{ message: string }>(`/widget-config/${id}`, { method: "DELETE" }),
  reports: (id: string, page = 1, limit = 20) =>
    api<{ data: BugReport[]; meta: { total: number; page: number; totalPages: number } }>(
      `/widget-config/${id}/reports?page=${page}&limit=${limit}`
    ),
  trelloConnect: (widgetId: string) =>
    api<{ redirectUrl: string }>("/integrations/trello/connect", {
      method: "POST",
      body: JSON.stringify({ widgetId }),
    }),
  trelloCallback: (state: string, token: string) =>
    api<{ success: boolean; widgetId: string }>("/integrations/trello/callback", {
      method: "POST",
      body: JSON.stringify({ state, token }),
      token: null,
    }),
  trelloBoards: (id: string) =>
    api<{ data: TrelloBoard[] }>(`/widget-config/${id}/trello/boards`),
  trelloLists: (id: string, boardId: string) =>
    api<{ data: TrelloList[] }>(`/widget-config/${id}/trello/lists?boardId=${encodeURIComponent(boardId)}`),
  testSlack: (id: string) =>
    api<{ success: boolean }>(`/widget-config/${id}/test-slack`, { method: "POST" }),
};

export function getEmbedScript(widgetId: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return `<script src="${apiUrl}/widget/script.js" data-widget-id="${widgetId}" data-api-url="${apiUrl}"></script>`;
}
