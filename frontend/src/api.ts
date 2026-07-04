// Central API client for the HustleCoin Matchday Events prototype.
const BACKEND = process.env.EXPO_PUBLIC_BACKEND_URL;

async function req<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BACKEND}/api${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${path}`);
  return (await res.json()) as T;
}

export const api = {
  dashboard: () => req("/dashboard"),
  events: (status?: string) => req(`/events${status ? `?status=${status}` : ""}`),
  event: (id: string) => req(`/events/${id}`),
  createEvent: (body: any) => req("/events", { method: "POST", body: JSON.stringify(body) }),
  updateEvent: (id: string, body: any) => req(`/events/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  joinEvent: (id: string) => req(`/events/${id}/join`, { method: "POST" }),

  missions: (eventId: string) => req(`/missions/${eventId}`),
  submitQuiz: (mission_id: string, selected_index: number) =>
    req("/quiz/submit", { method: "POST", body: JSON.stringify({ mission_id, selected_index }) }),

  leaderboard: (eventId: string) => req(`/leaderboard/${eventId}`),
  rewards: () => req("/rewards"),
  rewardAction: (reward_id: string, action: string, audit_note?: string, reduced_amount?: number) =>
    req("/reward-review/action", {
      method: "POST",
      body: JSON.stringify({ reward_id, action, audit_note, reduced_amount }),
    }),

  calendar: () => req("/calendar"),
  updateCalendar: (id: string, status: string) =>
    req(`/calendar/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  safelock: () => req("/safelock"),
  recomputeSafelock: () => req("/safelock/recompute", { method: "POST" }),
  auditLog: () => req("/audit-log"),
  verdict: () => req("/verdict"),
};
