// Temporary switch: while true, the app is browsable without signing in.
// Flip to false to restore the full login / role-based gate.
export const AUTH_DISABLED = true;

export type DevRole = "student" | "nss" | "manager";

const KEY = "lodgemaster.devRole";

export function getDevRole(): DevRole {
  if (typeof window === "undefined") return "student";
  const v = window.localStorage.getItem(KEY);
  return v === "nss" || v === "manager" ? v : "student";
}

export function setDevRole(role: DevRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, role);
}
