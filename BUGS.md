# Bug Audit — Atrack (Academic Tracker)

Full repo bug sweep performed 2026-07-15, against `development` after merging in
`origin/main` (commit range up to `f7f8e69`). This is a Create React App SPA with no
traditional backend — Firebase (Auth/Firestore/Storage) is used as backend-as-a-service.
There is no separate "backend" codebase to audit; Firebase rules/config and the client's
Firestore access code are the closest equivalent.

Status legend: `[ ]` open, `[x]` fixed. Each phase below corresponds to a commit.

---

## Phase 2 — Critical (data loss / security / exploit) — DONE (`d0bc68a`)

- [x] **Account deletion destroys data with no recovery path.**
  `src/components/dashboard/ModalManager.jsx:103-116` (`confirmDeleteAccount`) calls
  `firestoreService.resetAllData(user.uid, user)` **before** `authService.deleteCurrentUser()`.
  Firebase's `deleteUser()` frequently throws `auth/requires-recent-login` unless the user
  signed in very recently. When that happens, `src/components/modals/ReauthModal.jsx` only
  offers "Sign Out" (wired to `onSignOut` in `ModalManager.jsx:194-198`) — it never retries
  the deletion after re-auth. Net effect: all Firestore data (courses, schedule, deadlines,
  tasks, contacts, expenditures, exam scenarios, profile) is permanently wiped, but the auth
  account survives with no way to finish or recover.

- [x] **Public profile leaks personal contact info with no consent.**
  `src/pages/ProfilePage.jsx` (`handleShareProfile`, ~line 59-77) copies
  `profileData.personal` (which always contains `email`/`phone`) wholesale into the public,
  unauthenticated `artifacts/${appId}/publicProfiles/{shareId}` Firestore document.
  `src/pages/PublicProfilePage.jsx:145,204-205` renders `personal.email`/`personal.phone` to
  any visitor with the link. Fix: add per-field opt-in toggles ("include email", "include
  phone") to the share flow; only include what the user explicitly opts into.

- [x] **Coin-reward exploit — unlimited farming on any list-type profile field.**
  `src/services/firebaseService.jsx:51` (`saveProfileFieldWithReward`):
  `profileData[field]` looks up a **dotted path** (e.g. `'academic.projects'`,
  `'academic.certificates'`, `'academic.internships'`, `'academic.resumes'`,
  `'personal.achievements'`, `'social.links'`) directly on the nested JS object, which is
  always `undefined`. So `oldListLength` is always `0`, meaning `itemsAdded = value.length`
  on **every** save — a user can add one item, delete it, re-add it, repeat, and farm coins
  indefinitely. Fix: resolve the dotted path against the nested object before comparing
  lengths.

- [x] **Historical leaked Firebase project config in git history, on a public repo.**
  A real `apiKey`/`projectId`/etc. was committed in `8298fa4` and replaced with env vars in
  `4482e58`, but is still recoverable via `git log`/`git show` — and this repo
  (`github.com/mahendhar2004/Academic-tracker`) is **public**. **Decision: not scrubbing
  history.** Because `development` was fast-forwarded from `origin/main` earlier in this
  pass, the leaked commit exists on *both* branches — a real fix means rewriting and
  force-pushing both `development` and `main`, which the user explicitly declined (asked to
  stop the rewrite entirely). **Action still needed, outside of what code changes can fix:
  rotate/restrict the Firebase API key via the Firebase console.** A public leak can't be
  un-leaked by a history purge anyway (GitHub caches, forks, and archive services may already
  have it) — key rotation is the actual mitigation regardless of whether history is rewritten.

---

## Phase 3 — Crashes — DONE

- [x] **`PomodoroModal.jsx:73`** — `toast.info('Press ESC to cancel focus mode')`. `toast` is
  the Zustand **state object** (`{ show, message, type }`), not a function — only
  `showToast(message, type)` exists on `uiSlice.js`. Clicking "Start" throws
  `TypeError: toast.info is not a function` synchronously in the click handler. Fixed by
  destructuring `showToast` and calling it correctly.

- [x] **`src/components/common/GlobalSearch.jsx:56,60,64`** — `c.name.toLowerCase()`,
  `t.title.toLowerCase()` etc. with no null guard. Any course/task/contact document missing
  `name`/`title` throws on every keystroke in the Cmd+K search box. Fixed with `(x || '')`
  guards.

- [x] **`src/pages/HomePage.jsx`** — `.getTime()` called on a `null` date when a deadline has
  no `date` field. **Verified not reachable**: `useDashboardSummary.jsx`'s `upcomingDeadlines`
  filter already excludes any deadline whose `normalizeDate(d.date)` is null/invalid before it
  reaches `AtAGlance`, so `HomePage.jsx` never receives a deadline with an unparseable date.
  No code change needed here.

- [x] **`src/hooks/useDashboardSummary.jsx:42`** — `expenditures.reduce(...)` with no
  optional-chaining (unlike every sibling input: `schedule?.`, `deadlines?.`, `tasks?.`) —
  crashes if `expenditures` is `undefined`/`null` before the Firestore listener resolves.
  Fixed with `(expenditures || [])`, plus a `Number(item.amount) || 0` guard.

- [x] **`src/pages/PerformancePage.jsx` (~line 53)** — `Math.max(...courses.map(c =>
  c.semester))` with no guard → `NaN` if any course document lacks a `semester` field,
  silently blanking the whole Academic Journey timeline. Fixed via the shared
  `getMaxSemester` helper (see next item).

- [x] **`src/hooks/useAttendanceData.jsx` vs `PerformancePage.jsx`** — two independent,
  diverging implementations of "compute max semester". Unified into
  `src/utils/courses.js`'s `getMaxSemester`, also adopted by `ModalManager.jsx`'s third
  independent copy of the same logic.

- [x] **`src/pages/CalendarPage.jsx` (~line 46)** — `.localeCompare` on `startTime` crashes if
  a deadline has no `time` value. Fixed with `(a.startTime || '').localeCompare(b.startTime || '')`.
  While in this file: also fixed `selectedDate` never being wired to the mini calendar (day
  clicks now actually highlight, via a new `selectedDay` state distinct from the month-nav
  state), and `eventsByDate` being limited to a 7-day window regardless of viewed month (now
  computed per-viewed-month so "has events" dots are correct after navigating months).

- [x] **`src/pages/ExpenditurePage.jsx:46`** and **`useDashboardSummary.jsx:42`** — no guard
  against a document missing `amount`; one bad/legacy doc poisons the running total to `NaN`.
  Fixed with `Number(item.amount) || 0` guards, plus a new `toDateSafe` helper
  (`src/utils/date.js`) replacing unguarded `item.date.toDate()`/`.toMillis()` calls.

- [x] **`src/services/firebaseService.jsx` `resetExpenditures`/`resetAllData`** — single
  `writeBatch` deleting an entire collection could exceed Firestore's 500-op cap. Fixed with a
  `deleteAllDocs` helper that chunks deletes across as many batches as needed.

- [x] **Google Sign-In users never got a Firestore profile document created** — `App.jsx`'s
  `handleLogin('google')` now calls a new `ensureProfileDocument` after sign-in, creating the
  default profile doc if one doesn't already exist (mirroring what email sign-up already did).

---

## Phase 4 — Timezone off-by-one (one root cause, multiple sites) — DONE

Plain `"YYYY-MM-DD"` date-input strings are parsed via `new Date("YYYY-MM-DD")`, which the
spec defines as **UTC midnight**, then re-displayed/compared using **local-time** getters
(`getFullYear`/`getMonth`/`getDate`, `toLocaleDateString`). For any user west of UTC, this
shows/compares dates one day earlier than what was actually saved. Fixed by adding
`parseLocalDateString`/`getLocalDateString` to `src/utils/date.js` and anchoring storage to
local midnight (matching how the rest of the app already reads dates back) instead of trying
to make every read site UTC-aware.

- [x] `src/services/firebaseService.jsx` `saveDeadline` — root cause; now anchors via
  `parseLocalDateString` before wrapping in a `Timestamp`, so `.toDate()` + local getters
  everywhere else (`AddEditDeadlineModal.jsx`, `HomePage.jsx`, `CalendarPage.jsx`) read back
  the same calendar day the user picked, in any timezone.
- [x] `src/components/modals/AddEditTaskModal.jsx` — "today" default now uses
  `getLocalDateString()` instead of `new Date().toISOString().split('T')[0]` (which computed
  the UTC calendar date).
- [x] `src/components/planner/TaskCard.jsx` — due-date display now parses via
  `parseLocalDateString` instead of `new Date(task.dueDate)` before formatting.
- [x] `src/components/modals/AddEditExpenditureModal.jsx` — the date `<input>`'s prefill and
  onChange now both anchor to local midnight (`getLocalDateString`/`parseLocalDateString`)
  instead of mixing a UTC-anchored write with a local-anchored read.
- [x] **Verified not reachable / no behavior change needed**: `src/components/modals/AddEditClassModal.jsx`'s
  `new Date().toISOString().split('T')[0]` "today" scratch value — it's only used to attach a
  throwaway date onto a `DateTimePicker` so a `HH:MM` time-of-day can be extracted back out via
  `toTimeString()` (local); the date portion is discarded before saving, so the UTC-vs-local
  choice here has no observable effect.
- Left alone (dead code, not reachable): `src/components/calendar/DeadlineCard.jsx` has the
  same bug pattern but is never imported anywhere — flagged for deletion in Phase 7 instead of
  fixing dead code.

---

## Phase 5 — State-mutation / React anti-patterns — DONE

- [x] **`src/hooks/usePerformanceGraphs.jsx:11`** — `semesters.sort((a, b) => a.semester -
  b.semester)` mutates the array in place. `semesters` is the same reference as
  `Dashboard.jsx`'s memoized `performanceData.semesters` (deliberately sorted **descending**
  there); this hook silently flips it to ascending as a side effect, without the source memo
  re-running. Fixed with `[...semesters].sort(...)`.
- [x] **`src/components/common/DateTimePicker.jsx`** — `currentMonth.setMonth(...)` mutated
  the state `Date` object directly before wrapping in `new Date(...)`. Fixed by deriving the
  new month via `new Date(prev.getFullYear(), prev.getMonth() ± 1, 1)` without touching `prev`.
- [x] **`src/components/common/DateTimePicker.jsx`** — selected-day highlight compared
  month/day but never checked the year. Fixed by adding a `getFullYear()` comparison.
- [x] **`src/App.jsx`** — `onAuthStateChanged` effect listed `user` in its own dependency
  array while also calling `setUser(user)` inside the callback, causing the listener to tear
  down and resubscribe on every auth transition. Fixed by tracking the initialized uid in a
  `useRef` instead of depending on `user` state.
- [x] **`src/App.jsx` (~lines 87-97)** — dead/half-finished commented-out code deciding
  whether to early-return for `/public/:id` routes. Resolved: the auth listener always
  subscribes (kept, since it's needed to keep a logged-in user's session alive even while
  viewing a public profile link); the early `setLoading(false)` for `/public/*` routes was
  split out into its own small effect; the indecisive comments were replaced with a plain
  statement of the actual, intended behavior.

---

## Phase 6 — Validation gaps — DONE

- [x] **`src/components/modals/AddCourseModal.jsx`** — no non-negative check on
  attended/total classes; negative attendance counts could be saved. Fixed with an explicit
  `attendedNum < 0 || totalNum < 0` check.
- [x] **`src/components/modals/AddGradeModal.jsx` / `AddCourseModal.jsx` / `PredictorPage.jsx`**
  — `credits > 0` was the only guard, no upper bound. Added a `<= 30` credit ceiling (HTML
  `max` + JS check) everywhere a credits field is entered. `PredictorPage.jsx`'s `targetCGPA`
  now rejects non-`(0, 10]` values instead of silently computing nonsense, and `futureCredits`
  is clamped to non-negative. (`WhatIfModal.jsx` has the same gap but is dead code — see
  Phase 7, deleting it rather than fixing validation in unreachable code.)
- [x] **`src/components/modals/AddEditTaskModal.jsx`** — title wasn't `.trim()`'d; fixed to
  validate and save the trimmed title.
- [x] **`src/components/modals/AddEditClassModal.jsx`** — no check that `endTime` is after
  `startTime`; fixed with an explicit check + error message on submit. Also fixed: nudging
  `startTime` silently reset the class duration to a fixed 1 hour — it now preserves whatever
  duration was already set.
- [x] **`src/components/profile/EditableResumeList.jsx`** — no `<form>` wrapper, so native
  `type="url"` HTML5 validation never fired; wrapped the add-item inputs in a real `<form>`
  with `required` attributes. (`EditProfileModal.jsx` has the same gap but is dead/unreachable
  code — see Phase 7, deleting it rather than fixing validation in unreachable code.)
- [x] **`src/components/modals/PomodoroModal.jsx`** — **verified already fixed by the
  `main` merge**: the free-text duration input that could go `NaN` no longer exists; duration
  is now chosen via fixed preset buttons (15/25/45/60 min), which can't produce an invalid
  value.
- [x] **`src/pages/LandingPage.jsx` + `src/components/modals/BugReportModal.jsx`** — both
  POST to Google Forms with `fetch(..., { mode: 'no-cors' })`, which always resolves as an
  opaque response — the code cannot detect a rejected/misconfigured submission. Standing up a
  server-side relay to get a real response is out of scope for a client-only app without
  discussing hosting for it, so fixed the honest way: softened the success copy ("is on its
  way" instead of "has been sent"/"has been submitted") and documented the `no-cors` limitation
  inline so it isn't mistaken for a solved problem later.

---

## Phase 7 — Dead code & duplication — DONE

- [x] **`GRADE_POINTS`/`GRADES` duplicated in 5 files** instead of importing the canonical
  copy from `src/constants.js`. Consolidated in `AddGradeModal.jsx`, `AddCourseModal.jsx`,
  `usePerformanceGraphs.jsx`, `PredictorPage.jsx`; the 5th copy (`WhatIfModal.jsx`) was deleted
  outright (see below). Value unchanged — `F` stays at 2 grade points.
- [x] **`src/components/modals/WhatIfModal.jsx`** — deleted (390-line unreachable modal,
  superseded by `PredictorPage.jsx`); removed its wiring, and the now-dead
  `handleSaveScenario`, from `ModalManager.jsx`. Also found and removed a second dead copy of
  `handleSaveScenario` in `Dashboard.jsx` that was put into outlet context but never read by
  any page.
- [x] **`src/components/modals/EditProfileModal.jsx`** — deleted (unreachable, no-op `onSave`
  stub); removed its wiring from `ModalManager.jsx`, which also dropped `profileData` from
  that component's store selector since nothing else there used it.
- [x] **`src/components/modals/ResetExpendituresModal.jsx`** — deleted (confirmed unused).
- [x] **`src/pages/LoginPage.jsx`** — "Back to Home" now uses `useNavigate()` for a real SPA
  transition instead of `<a href="/">`'s full page reload; removed the unused
  `onNavigateToLanding` prop plumbing from `App.jsx`.
- [x] **`normalizeDate`** duplicated byte-for-byte between `useDashboardSummary.jsx` and
  `HomePage.jsx`'s `AtAGlance` — both now import the shared `toDateSafe` from
  `src/utils/date.js` (added in Phase 3); `useDashboardSummary.jsx`'s separate manual
  "today as YYYY-MM-DD" computation was also folded into the shared `getLocalDateString`.
- [x] **`src/hooks/usePlannerTasks.jsx`** — now sorts by `dueDate` first (when present) and
  falls back to `dueTime`, fixing ordering for multi-day long-term tasks while leaving
  short-term (no `dueDate`) ordering unchanged.
- [x] **`src/components/pomodoro/PomodoroTimer.jsx`** — now creates one `setInterval` for the
  whole session instead of tearing it down and recreating it every tick.
- [x] **`src/components/modals/TimetableModal.jsx`** — `schedule` now defaults to `[]`
  (guards every direct `.filter`/`.length` use, not just the memo); `timeToMinutes` now
  returns `null` (not `0`) for a malformed time, and malformed entries are filtered out of
  the min/max-hour calculation and rendering instead of anchoring the whole grid to midnight.
- [x] **`src/components/calendar/DeadlineCard.jsx`** — deleted (confirmed dead during the
  Phase 4 timezone-bug pass; had the same UTC/local bug but was never imported anywhere).
- [x] **Firestore path centralization gap** — `App.jsx`, `ProfilePage.jsx`,
  `PublicProfilePage.jsx` no longer hardcode `artifacts/${appId}/...` strings; added
  `getPublicProfilesCollectionPath`/`getPublicProfilePath` to `src/constants/dbPaths.js` and
  switched all three files (plus reused the existing `getProfilePath`) to the shared helpers.
  Paths are byte-for-byte identical to before, so no data migration is involved.
- [x] **`src/firebase/config.js`** — `appId` hardcoded to `'default-app-id'`. **Deliberately
  left as-is**: this string is the namespace prefix for every single Firestore path in the
  app (`artifacts/{appId}/...`). Making it env-configurable without also setting a matching
  env var in the existing production deployment would silently point the live app at a
  different (empty) path prefix for every user — effectively hiding all existing data. Not
  worth that risk as an autonomous drive-by fix; flagging here for a deliberate, coordinated
  change if it's ever needed (e.g. separating dev/staging/prod data), not fixing it now.

---

## Phase 8 — Infra / config / repo hygiene — DONE

- [x] **Broken icon references.** Removed the dangling `apple-touch-icon` → `logo192.png`
  link from `public/index.html` and the `maskable_icon_x512.png` entry from
  `public/manifest.json` (neither file existed in `public/`). Both now only reference the
  real `file.svg`. (Adding real PNG icon assets instead was an option, but there's no source
  artwork to generate them from here — removing the dangling references is the honest fix;
  add real icons later if you want a proper PWA install icon.)
- [x] **`public/index.html` meta description** rewritten to describe the actual app instead
  of the CRA boilerplate string.
- [x] **`cors.json`** now allow-lists `http://localhost:3000` and the real production origin
  (`https://academictracker.vercel.app`, provided by the user), dropping the irrelevant Vite
  port. **Note**: editing this file doesn't change the live Storage bucket's CORS policy by
  itself — it still needs to be applied via `gsutil cors set cors.json gs://<bucket>` (now
  documented in the README).
- [x] **Dead dependencies removed from `package.json`**: `@reduxjs/toolkit`, `react-redux`,
  `three` — confirmed unused via grep, `package-lock.json` resynced (`npm install`, 18
  packages removed).
- [x] **Tailwind version mismatch** — removed the unused `@tailwindcss/postcss@^4` dev
  dependency; the project stays on `tailwindcss@^3.4.13` with its existing v3-style
  `postcss.config.js` (no actual v4 migration attempted — this only removes the confusing,
  unused leftover package).
- [x] **`src/App.test.js`** — deleted the untouched CRA boilerplate test
  (`getByText(/learn react/i)`, which no longer matches anything in this app) rather than
  patch it into rendering the full Firebase-dependent app tree (fragile without mocking
  Firebase). Replaced with real unit tests for two of the pure utilities introduced by this
  bug-fix pass: `src/utils/date.test.js` (the local-date parse/format round-trip from Phase 4)
  and `src/utils/courses.test.js` (the `getMaxSemester` NaN-guard from Phase 3). `npm test`
  now passes.
- [x] **`README.md`** rewritten with the actual tech stack, Firebase env-var setup via
  `.env.example`, and the `cors.json`/`gsutil` step; the UTF-16 mojibake corruption at the end
  is gone (full rewrite).
- [x] **Added `.env.example`** listing the 6 `REACT_APP_FIREBASE_*` vars
  `src/firebase/config.js` requires.
- [x] **`.gitignore`** now also covers `.DS_Store`, `.vscode/`, `.idea/`, `/coverage`, and a
  generic `*.log` rule.
- [x] **A 4.9 MB screen recording (`Recording 2025-08-14 163900.mp4`)** removed from the
  working tree/tracking. **Decision: left in git history** (user declined the history
  rewrite for the leaked secret below, and separately declined bundling the video purge into
  it) — it's harmless repo bloat in old commits, not a live concern.
- [x] **`eslint.json` (124 KB, UTF-16)** — an accidentally committed raw ESLint JSON report
  containing absolute Windows filesystem paths from the author's machine. Deleted.
- [x] **`package.json`** — renamed `"semester-tracker"` → `"atrack"` to match the actual
  product name used everywhere else; added an `engines.node >= 18` constraint.

---

## Phase 9 — Git history scrub for leaked secret — DECIDED: SKIPPED

Scrubbing the leaked Firebase config from history would have required rewriting and
force-pushing **both** `development` and `main` (since `development` was fast-forwarded from
`origin/main` earlier in this pass, the leaked commit is on both). The user declined the
rewrite entirely rather than do a partial (development-only) scrub. No history was rewritten;
no force-push occurred.

**Outstanding action for the user, outside of what a code change can fix:** rotate/restrict
the Firebase API key via the Firebase console. This is the actual mitigation for a public
leak regardless of the history-rewrite decision — GitHub, forks, and archive services may
already have cached the old commit.

---

## Already fixed by the `main` merge (verified, no action needed)

- `logo192.png`/`logo512.png`/CRA placeholder branding in `manifest.json` — rebranded to
  "Atrack - Academic Performance Tracker" (icon file references still broken, see Phase 8).
- `src/components/modals/AddExpenditureModal.jsx`, `SetBalanceModal.jsx`,
  `src/components/performance/WhatIfCalculator.jsx`, `src/components/profile/PersonalDetails.jsx`
  — all deleted as dead code in the merge.
