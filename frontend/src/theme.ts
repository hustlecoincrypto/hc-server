// HustleCoin Matchday Events — theme tokens (dark obsidian + gold)
export const colors = {
  bgBase: "#0A0B10",
  bgSurface: "#151821",
  bgSurfaceAlt: "#1B1F2C",
  glassBorder: "rgba(255,255,255,0.10)",
  glassBg: "rgba(255,255,255,0.05)",
  divider: "rgba(255,255,255,0.06)",

  gold: "#E3A336",
  goldHover: "#F0B654",
  goldSoft: "rgba(227,163,54,0.14)",

  green: "#2E7D32",
  greenSoft: "rgba(46,125,50,0.18)",
  red: "#D32F2F",
  redSoft: "rgba(211,47,47,0.18)",
  amber: "#E0A82E",
  amberSoft: "rgba(224,168,46,0.18)",
  blue: "#3B82F6",
  blueSoft: "rgba(59,130,246,0.18)",

  textPrimary: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textTertiary: "#71717A",
  textGold: "#E3A336",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const fonts = {
  heading: "System",
  body: "System",
};

export type SafeLockStatus =
  | "APPROVED"
  | "REDUCED_POOL"
  | "WAITING_FOR_ACTIVITY"
  | "BLOCKED_LOW_RESERVE"
  | "BLOCKED_WEEKLY_CAP"
  | "BLOCKED_ABUSE_RISK"
  | "ADMIN_REVIEW_REQUIRED";

export const statusColor: Record<string, { bg: string; fg: string; label: string }> = {
  APPROVED: { bg: colors.greenSoft, fg: "#8AE58F", label: "APPROVED" },
  REDUCED_POOL: { bg: colors.amberSoft, fg: colors.gold, label: "REDUCED POOL" },
  WAITING_FOR_ACTIVITY: { bg: colors.blueSoft, fg: "#93C5FD", label: "WAITING ACTIVITY" },
  BLOCKED_LOW_RESERVE: { bg: colors.redSoft, fg: "#FCA5A5", label: "LOW RESERVE" },
  BLOCKED_WEEKLY_CAP: { bg: colors.redSoft, fg: "#FCA5A5", label: "WEEKLY CAP" },
  BLOCKED_ABUSE_RISK: { bg: colors.redSoft, fg: "#FCA5A5", label: "ABUSE RISK" },
  ADMIN_REVIEW_REQUIRED: { bg: colors.amberSoft, fg: colors.gold, label: "ADMIN REVIEW" },
  DRAFT: { bg: "rgba(120,120,120,0.2)", fg: "#D4D4D8", label: "DRAFT" },
  PUBLISHED: { bg: colors.blueSoft, fg: "#93C5FD", label: "PUBLISHED" },
  LIVE: { bg: colors.redSoft, fg: "#FCA5A5", label: "AO VIVO" },
  COMPLETED: { bg: colors.greenSoft, fg: "#8AE58F", label: "COMPLETED" },
  REWARDS_REVIEW: { bg: colors.amberSoft, fg: colors.gold, label: "REWARDS REVIEW" },
  RETIRED: { bg: "rgba(120,120,120,0.2)", fg: "#A1A1AA", label: "RETIRED" },
  PENDING_REVIEW: { bg: colors.amberSoft, fg: colors.gold, label: "EM REVISÃO" },
  REDUCED: { bg: colors.amberSoft, fg: colors.gold, label: "REDUZIDO" },
  FROZEN: { bg: colors.blueSoft, fg: "#93C5FD", label: "CONGELADO" },
  BLOCKED: { bg: colors.redSoft, fg: "#FCA5A5", label: "BLOQUEADO" },
};
