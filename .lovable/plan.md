## Goal

Make every page browsable without signing in, without deleting any of the auth work — so re-enabling it later is a one-line change.

## Approach

Add a single flag, `AUTH_DISABLED = true`, in a new `src/lib/auth-flags.ts`. Everything else reads from it.

### 1. Open the protected layout
`src/routes/_authenticated.tsx` currently redirects to `/auth` when there's no user and shows a spinner while loading. When the flag is on:
- Skip the redirect and the spinner-blocking check — render the layout immediately.
- Replace the sign-out button with a role switcher (Student / NSS Reviewer / Manager) so all three sidebars and dashboards can be reviewed. The chosen role is kept in local storage.
- Show a placeholder email/avatar instead of the session's.

### 2. Role selection without a session
The sidebar and dashboards branch on `isManager` / `isNss` from the auth context. Extend `src/lib/auth-context.tsx` so that when the flag is on, those flags come from the local-storage role instead of the `user_roles` table. Nothing else in the app changes.

### 3. Landing page and header
`/` keeps its Login button but it can point to `/dashboard` while auth is off (the `/auth` and `/reset-password` pages stay in the codebase and still work if visited directly).

### 4. Re-enabling later
Flip `AUTH_DISABLED` to `false`. No files are deleted; login, registration, password reset, roles, and the database all stay exactly as built.

## Important limitation

Database access rules (RLS) are scoped to the signed-in user. With no session, "my booking", "my profile", documents, notifications, and the manager/NSS application queues will return nothing — pages will render their empty states rather than real data. I'll leave the security rules untouched, since loosening them is risky and would have to be undone when auth comes back. If you'd rather see populated dashboards while auth is off, say so and I'll add local demo data to the hooks behind the same flag.

## Technical notes

- New: `src/lib/auth-flags.ts` (flag + local-storage role helpers).
- Edited: `src/lib/auth-context.tsx` (bypass branch), `src/routes/_authenticated.tsx` (no redirect, role switcher), `src/routes/index.tsx` (CTA target).
- Untouched: `auth.tsx`, `reset-password.tsx`, Supabase clients, middleware, migrations, RLS policies.
