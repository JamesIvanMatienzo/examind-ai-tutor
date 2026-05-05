# ExaMind: Google OAuth, Fix Add Subject, Refactor Score Tracker

Three tasks: integrate Google OAuth properly, fix the "Add Subject" bug, and refactor the Score Tracker to use real data.

## User Review Required

> [!IMPORTANT]
> **Google OAuth Strategy Decision**: The current codebase uses `@lovable.dev/cloud-auth-js` (a Lovable platform-specific library) for Google OAuth. This library proxies OAuth through Lovable's servers and **only works when the app is deployed on Lovable's platform**. It will not work in local development or any other hosting.
>
> **My recommendation:** Replace the `lovable` auth integration entirely and use **Supabase's built-in OAuth** (`supabase.auth.signInWithOAuth({ provider: 'google' })`). This is the standard, portable approach and works everywhere — local dev, Vercel, self-hosted, etc. It also means:
> - No backend changes needed for Google auth (Supabase handles user creation, session, and JWT)
> - The `handle_new_user` DB trigger already auto-creates a profile row on signup
> - We can remove the `@lovable.dev/cloud-auth-js` dependency
>
> **Prerequisite**: You need to enable Google OAuth in your Supabase dashboard:
> 1. Go to Supabase → Authentication → Providers → Google
> 2. Add your Google Client ID and Client Secret (from Google Cloud Console)
> 3. Set the redirect URL Supabase gives you in your Google OAuth consent screen
>
> **Is this approach acceptable?** Or do you want to keep the Lovable integration?

> [!WARNING]
> **Debug logging cleanup**: There are `#region agent log` blocks scattered throughout `LoginScreen.tsx`, `useAuth.tsx`, and `ProtectedRoute.tsx` that send telemetry to `127.0.0.1:7908`. These appear to be from a previous debug session and should be removed. I'll clean them up as part of this work. Let me know if you want to keep them.

## Open Questions

> [!IMPORTANT]
> **Add Subject Bug — Root Cause**: The bug is caused by the **mock dev session**. When logged in via `admin@examind.com / password123`, the user ID is `"dev-1"` — a fake, non-existent UUID in Supabase. The `subjects` table has `user_id UUID NOT NULL REFERENCES auth.users(id)`, so any insert with `user_id = "dev-1"` will fail with a foreign key violation. Additionally, `"dev-1"` isn't even a valid UUID format.
>
> **Two options:**
> 1. **Remove the hardcoded dev login entirely** and only use real Supabase auth (recommended since we're fixing Google OAuth)
> 2. **Keep the dev login** but make it clear it's a read-only demo mode with limited functionality
>
> Which do you prefer?

> [!IMPORTANT]
> **Score Tracker Data Source**: The Score Tracker currently uses hardcoded mock data (12 fake entries). The task says to "wire it to accept dynamic data." However, there's **no `scores` or `exam_results` table** in the Supabase schema — only `profiles`, `subjects`, and `subject_files`.
>
> **Options:**
> 1. **Create a new `exam_scores` table** in Supabase to persist scores, then wire the component to fetch from it. (This adds a migration + backend API.)
> 2. **Wire it to `localStorage`** for now — users log scores locally, and the data persists per-device. (Simpler, no migration needed, matches the current `examind-score-tracker` key the settings page already references.)
> 3. **Wire it to quiz results data** from the existing practice exam flow (`QuizResultsPage`), since those scores are already generated. Connect the two features.
>
> Which approach do you want?

---

## Proposed Changes

### Task 1: Google OAuth (Replace Lovable → Supabase OAuth)

#### [MODIFY] [LoginScreen.tsx](file:///c:/Users/Matienzo/Desktop/examind-loveable/src/pages/LoginScreen.tsx)
- Remove `lovable` import
- Replace `handleGoogle` to call `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/home' } })`
- Remove all `#region agent log` debug blocks
- Conditionally keep or remove the hardcoded dev login (pending your answer above)
- Add a proper Google SVG icon instead of the favicon.ico fallback

#### [MODIFY] [SignUpScreen.tsx](file:///c:/Users/Matienzo/Desktop/examind-loveable/src/pages/SignUpScreen.tsx)
- Same changes: replace `lovable` OAuth with `supabase.auth.signInWithOAuth`
- Add the same Google SVG icon

#### [MODIFY] [useAuth.tsx](file:///c:/Users/Matienzo/Desktop/examind-loveable/src/hooks/useAuth.tsx)
- Remove all `#region agent log` debug blocks
- Simplify mock session handling (or remove entirely, pending your decision)

#### [MODIFY] [ProtectedRoute.tsx](file:///c:/Users/Matienzo/Desktop/examind-loveable/src/components/ProtectedRoute.tsx)
- Remove `#region agent log` debug blocks

#### [MODIFY] [ProfilePage.tsx](file:///c:/Users/Matienzo/Desktop/examind-loveable/src/pages/ProfilePage.tsx)
- Simplify sign-out to just use `supabase.auth.signOut()` (remove mock session cleanup if we drop dev login)

#### No backend changes needed
- Supabase handles Google OAuth entirely (user creation, JWT session)
- The existing `handle_new_user` trigger auto-creates a `profiles` row using `raw_user_meta_data` (which Google populates with `full_name`/`name`)

---

### Task 2: Fix "Add Subject" Error

#### [MODIFY] [useSubjects.tsx](file:///c:/Users/Matienzo/Desktop/examind-loveable/src/hooks/useSubjects.tsx)
- Add `console.error` logging in `useCreateSubject` mutation error handler
- The actual fix depends on Task 1 decision: if we remove the mock dev login, subjects will work correctly with real Supabase auth (real UUID user IDs). If we keep dev login, we'll need to handle the "not authenticated with a real user" case gracefully.

#### [MODIFY] [AddSubjectScreen.tsx](file:///c:/Users/Matienzo/Desktop/examind-loveable/src/pages/AddSubjectScreen.tsx)
- Add better error messaging to surface the exact Supabase error
- Add `console.error` in the catch block for debugging

---

### Task 3: Refactor Score Tracker

#### [MODIFY] [ScoreTrackerPage.tsx](file:///c:/Users/Matienzo/Desktop/examind-loveable/src/pages/ScoreTrackerPage.tsx)
- **Remove all hardcoded mock data** (the `subjects` array, `examTypes` array, and `initialScores` array)
- **Wire subject list** to the real `useSubjects()` hook (already fetches from Supabase)
- **Wire scores** to the chosen data source (localStorage or Supabase table — pending your answer)
- **Add empty state**: When no scores exist, show a modern card with an illustration and message: "No exams taken yet. Start practicing to see your stats!"
- **Persist logged scores** to the chosen data source (currently only lives in React state — lost on page refresh)
- Keep the existing chart, stats cards, and log form — they work well with dynamic data once wired

---

## Verification Plan

### Automated Tests
- Run `npm run dev` for the frontend and verify no console errors
- Test Google OAuth login flow in the browser (requires Supabase Google provider to be configured)
- Test creating a subject after logging in with a real account
- Verify Score Tracker shows empty state when no data exists
- Verify Score Tracker shows data after logging a score

### Manual Verification
- Navigate to Login → click "Continue with Google" → verify redirect to Google → verify redirect back to `/home`
- Navigate to Add Subject → fill form → submit → verify success toast and redirect to `/subjects`
- Navigate to Score Tracker → verify empty state → log a score → verify it appears in the chart and log
- Refresh page → verify logged scores persist
