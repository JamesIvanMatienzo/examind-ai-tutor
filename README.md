# ExaMind

> **Study smarter. Not harder. Not blindly.**

ExaMind is a mobile-first study companion for students. Organize subjects, track upcoming exams, generate AI-powered practice exams from your own notes, chat with an AI tutor, and follow personalized study plans — all in one place.

Built with React + Vite + TypeScript on top of **Lovable Cloud** (managed Supabase backend).

---

## ✨ Features

### Authentication
- **Email & password** sign up / sign in
- **Google sign-in** via Lovable Cloud Managed OAuth
- Auto-confirmed email signups (users land on onboarding immediately)
- Leaked-password protection (HIBP check) enabled
- Session-aware splash screen — routes signed-in users straight to Home
- `ProtectedRoute` guards all authenticated pages

### Profile
- Auto-created profile on signup via Postgres trigger (`handle_new_user`)
- Pulls real name from Google `user_metadata` (`full_name` / `name`) or email fallback
- Editable profile (name, school, year level)
- Sign out from the Profile page

### Subjects
- Per-user `subjects` table with full RLS
- Create subjects with custom name, course code, folder color, and exam date
- Live countdown badges (red ≤3 days, yellow ≤7 days, green otherwise)
- Search subjects on the Subjects page
- Empty states with prompts to add the first subject

### Home Dashboard
- Personalized greeting using the signed-in user's real name
- "AI Nudge" banner for any exam ≤3 days away
- Upcoming Exams horizontal carousel (sorted by date)
- Quick Actions (Upload, Practice, Schedule)
- Subject grid with color accents and countdown badges

### Practice
- "By Subject" generator wired to your real subjects
- Tabs: Generated · Saved · History
- Empty states for users with no subjects or no practice attempts yet
- Practice setup → Active quiz → Results flow (UI scaffolded)

### Schedule
- Monthly calendar with exam-day dots colored by subject
- Selected-day view shows exams scheduled that day
- Upcoming exams list pulled from real subjects' `exam_date`
- Add Exam Date entry point
- AI Study Plan entry point (placeholder — generation not yet wired)

### Other Screens
- **Onboarding** — first-run flow after signup
- **Add Subject** — create new subjects with color picker
- **Subject Folder** — per-subject file/notes view (UI scaffolded)
- **AI Chat** — per-subject AI tutor screen (UI scaffolded)
- **Score Tracker** — performance history (UI scaffolded)
- **App Settings**, **Edit Profile**, **Help & Feedback**

### Design System
- Mobile-first layout, capped at `max-w-[430px]` for app-like feel
- Custom HSL semantic tokens: `primary`, `surface`, `success`, `warning`, `destructive`, etc.
- shadcn/ui component library
- framer-motion for entrance animations and tap feedback
- Bottom navigation for the four core sections

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript 5 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Animation | framer-motion |
| Routing | react-router-dom |
| Data | @tanstack/react-query |
| Backend | **Lovable Cloud** (managed Supabase) |
| Auth | Supabase Auth + Lovable Cloud Managed OAuth (Google) |
| AI | Lovable AI Gateway (planned) |

---

## 🗄 Database Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (pk) | |
| `user_id` | uuid (unique) | FK → `auth.users(id)` ON DELETE CASCADE |
| `full_name` | text | |
| `school_name` | text | |
| `year_level` | text | |
| `avatar_url` | text | |
| `created_at` / `updated_at` | timestamptz | auto-managed |

**RLS:** Owner can SELECT / INSERT / UPDATE their own row.
**Trigger:** `handle_new_user` auto-creates a profile when a new auth user is inserted, populating `full_name` from `raw_user_meta_data`.

### `subjects`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (pk) | |
| `user_id` | uuid | FK → `auth.users(id)` ON DELETE CASCADE |
| `name` | text | required |
| `code` | text | optional course code |
| `color` | text | hex color, default `#534AB7` |
| `exam_date` | date | nullable |
| `created_at` / `updated_at` | timestamptz | auto-managed |

**RLS:** Owner can SELECT / INSERT / UPDATE / DELETE their own rows.
**Index:** `idx_subjects_user_id` for fast per-user lookups.

---

## 📜 Project History

### 1. Initial scaffold
- Generated all UI screens with hardcoded mock data: subjects, exams, study plans, recent attempts, profile name ("Ivan Dela Cruz").
- Bottom-navigation app shell, splash screen, welcome / login / signup screens.

### 2. Lovable Cloud enabled
- Provisioned managed backend (database, auth, file storage, edge functions).
- `.env`, Supabase client, generated types, and `supabase/config.toml` added.

### 3. Real authentication
- Created `profiles` table with RLS and `handle_new_user` trigger.
- Built `useAuth` provider using `onAuthStateChange` (subscribed *before* `getSession()` to avoid the missed-event race).
- Added `ProtectedRoute` for all authenticated routes.
- `SignUpScreen` / `LoginScreen` wired to `supabase.auth.signUp` / `signInWithPassword`.
- Google sign-in wired through `lovable.auth.signInWithOAuth("google")`.
- `SplashScreen` now routes by session state.
- `ProfilePage` Sign Out wired to `supabase.auth.signOut()`.

### 4. Auto-confirm signups
- Enabled `auto_confirm_email: true` so new users skip email verification and land on `/onboarding` immediately.
- Enabled `password_hibp_enabled: true` for leaked-password protection.

### 5. Real user data + subjects table
- Created `subjects` table with full RLS, owner-only policies, updated_at trigger, and per-user index.
- Added `useSubjects` (list) and `useCreateSubject` (mutation) React Query hooks, gated on `user && !loading`.
- Added `useProfile` + `useDisplayName` to surface the real signed-in name across the app.
- **HomeDashboard:** removed mock subjects/exams; now shows real subjects, real urgent-exam nudge, real greeting name and avatar initial. Empty state for new users.
- **SubjectsPage:** removed mock list; live search over real subjects; loading skeletons; empty state.
- **AddSubjectScreen:** form is now a real controlled form persisting to the `subjects` table with toast feedback.
- **ProfilePage:** real name + initial + email/school subtitle; subject count from live data; placeholder zeros for files/questions/study hours until those features land.

### 6. Practice + Schedule cleanup
- **PracticePage:** removed mock subjects and mock recent attempts. "By Subject" list now reads from real subjects with skeleton + empty states. History tab shows an empty state until real attempts exist.
- **SchedulePage:** removed mock exams and mock study tasks. Calendar dots, selected-day exams, and Upcoming Exams now derive from each subject's `exam_date`. Empty state when no exams are scheduled.

### 7. AI Study Plan placeholder
- **AIStudyPlanPage:** removed the hardcoded 7-day Mathematics plan. Now shows an empty-state encouraging users to add subjects + exam dates before plan generation is wired up.

---


## 🚀 Getting Started

```bash
bun install
bun run dev
```

The app runs on `http://localhost:8080`. Lovable Cloud is auto-configured via `.env`.

### Useful scripts
- `bun run dev` — start dev server
- `bun run build` — production build
- `bunx tsc --noEmit` — type-check
- `bunx vitest run` — run tests

