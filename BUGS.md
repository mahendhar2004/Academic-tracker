# Bug Audit — Atrack (Academic Tracker)

Full repo bug sweep performed 2026-07-15, against `development` after merging in
`origin/main` (commit range up to `f7f8e69`). This is a Create React App SPA with no
traditional backend — Firebase (Auth/Firestore/Storage) is used as backend-as-a-service.
There is no separate "backend" codebase to audit; Firebase rules/config and the client's
Firestore access code are the closest equivalent.

Status legend: `[ ]` open, `[x]` fixed. Each phase below corresponds to a commit.

---

## Phase 2 — Critical (data loss / security / exploit)

- [ ] **Account deletion destroys data with no recovery path.**
  `src/components/dashboard/ModalManager.jsx:103-116` (`confirmDeleteAccount`) calls
  `firestoreService.resetAllData(user.uid, user)` **before** `authService.deleteCurrentUser()`.
  Firebase's `deleteUser()` frequently throws `auth/requires-recent-login` unless the user
  signed in very recently. When that happens, `src/components/modals/ReauthModal.jsx` only
  offers "Sign Out" (wired to `onSignOut` in `ModalManager.jsx:194-198`) — it never retries
  the deletion after re-auth. Net effect: all Firestore data (courses, schedule, deadlines,
  tasks, contacts, expenditures, exam scenarios, profile) is permanently wiped, but the auth
  account survives with no way to finish or recover.

- [ ] **Public profile leaks personal contact info with no consent.**
  `src/pages/ProfilePage.jsx` (`handleShareProfile`, ~line 59-77) copies
  `profileData.personal` (which always contains `email`/`phone`) wholesale into the public,
  unauthenticated `artifacts/${appId}/publicProfiles/{shareId}` Firestore document.
  `src/pages/PublicProfilePage.jsx:145,204-205` renders `personal.email`/`personal.phone` to
  any visitor with the link. Fix: add per-field opt-in toggles ("include email", "include
  phone") to the share flow; only include what the user explicitly opts into.

- [ ] **Coin-reward exploit — unlimited farming on any list-type profile field.**
  `src/services/firebaseService.jsx:51` (`saveProfileFieldWithReward`):
  `profileData[field]` looks up a **dotted path** (e.g. `'academic.projects'`,
  `'academic.certificates'`, `'academic.internships'`, `'academic.resumes'`,
  `'personal.achievements'`, `'social.links'`) directly on the nested JS object, which is
  always `undefined`. So `oldListLength` is always `0`, meaning `itemsAdded = value.length`
  on **every** save — a user can add one item, delete it, re-add it, repeat, and farm coins
  indefinitely. Fix: resolve the dotted path against the nested object before comparing
  lengths.

- [ ] **Historical leaked Firebase project config in git history, on a public repo.**
  A real `apiKey`/`projectId`/etc. was committed in `8298fa4` and replaced with env vars in
  `4482e58`, but is still recoverable via `git log`/`git show` — and this repo
  (`github.com/mahendhar2004/Academic-tracker`) is **public**. Fix: scrub with
  `git-filter-repo` (destructive — rewrites every commit hash, requires a force-push;
  re-confirm immediately before doing this), and rotate/restrict the Firebase API key via
  the console regardless, since a public leak can't be un-leaked by a later history purge.

---

## Phase 3 — Crashes

- [ ] **`PomodoroModal.jsx:73`** — `toast.info('Press ESC to cancel focus mode')`. `toast` is
  the Zustand **state object** (`{ show, message, type }`), not a function — only
  `showToast(message, type)` exists on `uiSlice.js`. Clicking "Start" throws
  `TypeError: toast.info is not a function` synchronously in the click handler.

- [ ] **`src/components/common/GlobalSearch.jsx:56,60,64`** — `c.name.toLowerCase()`,
  `t.title.toLowerCase()` etc. with no null guard. Any course/task/contact document missing
  `name`/`title` throws on every keystroke in the Cmd+K search box.

- [ ] **`src/pages/HomePage.jsx`** — `.getTime()` called on a `null` date when a deadline has
  no `date` field, crashing the "Upcoming Deadlines"/"Today's Focus" card.

- [ ] **`src/hooks/useDashboardSummary.jsx:42`** — `expenditures.reduce(...)` with no
  optional-chaining (unlike every sibling input: `schedule?.`, `deadlines?.`, `tasks?.`) —
  crashes if `expenditures` is `undefined`/`null` before the Firestore listener resolves.

- [ ] **`src/pages/PerformancePage.jsx` (~line 53)** — `Math.max(...courses.map(c =>
  c.semester))` with no guard → `NaN` if any course document lacks a `semester` field,
  silently blanking the whole Academic Journey timeline.

- [ ] **`src/hooks/useAttendanceData.jsx` vs `PerformancePage.jsx`** — two independent,
  diverging implementations of "compute max semester": one filters out semester `0`/falsy via
  `.filter(Boolean)`, the other doesn't. Unify into one shared, null-safe helper.

- [ ] **`src/pages/CalendarPage.jsx` (~line 46)** — `.localeCompare` on `startTime` crashes if
  a deadline has no `time` value.

- [ ] **`src/pages/ExpenditurePage.jsx:46`** and **`useDashboardSummary.jsx:42`** — no guard
  against a document missing `amount`; one bad/legacy doc poisons the running total to `NaN`.

- [ ] **`src/pages/ExpenditurePage.jsx` (`TransactionItem`)** and similar list items — direct
  `.toDate()` calls on a Firestore field with no defensive fallback (contrast with
  `HomePage.jsx`'s careful `normalizeDate` helper); a malformed/legacy doc without a proper
  Timestamp crashes the page.

- [ ] **`src/services/firebaseService.jsx` `resetExpenditures`/`resetAllData`** — build a
  single `writeBatch` deleting every doc in a collection before one `commit()`. Firestore caps
  batches at 500 ops; any user with 500+ expenditures/courses/etc. throws at `commit()`
  uncaught (no try/catch here or in any caller).

- [ ] **Google Sign-In users never get a Firestore profile document created.**
  `src/App.jsx` (`handleSignUpWithEmail`) explicitly creates a profile doc on email signup,
  but `handleLogin('google')` never does. `useStore.jsx`'s `getProfileListener` synthesizes a
  local-only fallback when the doc is missing but never persists it — so the first
  `updateCoins()`/`saveProfileFieldWithReward()` call (plain `updateDoc`, no existence check)
  throws for Google-only users, silently failing every coin award and profile-field save.

---

## Phase 4 — Timezone off-by-one (one root cause, multiple sites)

Plain `"YYYY-MM-DD"` date-input strings are parsed via `new Date("YYYY-MM-DD")`, which the
spec defines as **UTC midnight**, then re-displayed/compared using **local-time** getters
(`getFullYear`/`getMonth`/`getDate`, `toLocaleDateString`). For any user west of UTC, this
shows/compares dates one day earlier than what was actually saved.

- [ ] `src/services/firebaseService.jsx` `saveDeadline` — `Timestamp.fromDate(new
  Date(deadlineData.date))` on a plain date string (root cause; read side in
  `AddEditDeadlineModal.jsx` already uses local getters correctly, which is what surfaces the
  mismatch).
- [ ] `src/pages/HomePage.jsx` (`AtAGlance`) — `deadlineDate.toLocaleDateString('en-GB')`.
- [ ] `src/pages/CalendarPage.jsx` — `isSameDay(deadlineDate, date)` comparison.
- [ ] `src/components/planner/TaskCard.jsx` — `new Date(task.dueDate).toLocaleDateString('en-GB')`.
- [ ] `src/components/modals/AddEditTaskModal.jsx` (~line 12) — `new
  Date().toISOString().split('T')[0]` computes "today" in UTC instead of local time; for
  users ahead of UTC (e.g. IST) between local midnight and the UTC offset boundary, this
  yields yesterday's date as the default.
- [ ] `src/pages/ExpenditurePage.jsx` (`TransactionItem`) — `item.date.toDate()
  .toLocaleDateString('en-GB')` displayed in local time, while `AddEditExpenditureModal.jsx`
  writes/reads the date consistently in UTC — the display layer is the mismatched piece.

Fix: introduce one shared date utility (`src/utils/date.js` — parse local, format local) and
replace all ad-hoc call sites with it.

---

## Phase 5 — State-mutation / React anti-patterns

- [ ] **`src/hooks/usePerformanceGraphs.jsx:11`** — `semesters.sort((a, b) => a.semester -
  b.semester)` mutates the array in place. `semesters` is the same reference as
  `Dashboard.jsx`'s memoized `performanceData.semesters` (deliberately sorted **descending**
  there); this hook silently flips it to ascending as a side effect, without the source memo
  re-running. Fix: `[...semesters].sort(...)`.
- [ ] **`src/components/common/DateTimePicker.jsx`** — `currentMonth.setMonth(...)` mutates
  the state `Date` object directly before wrapping in `new Date(...)`.
- [ ] **`src/components/common/DateTimePicker.jsx`** — selected-day highlight compares
  month/day but never checks the year.
- [ ] **`src/App.jsx`** — `onAuthStateChanged` effect lists `user` in its own dependency
  array while also calling `setUser(user)` inside the callback, causing the listener to tear
  down and resubscribe on every auth transition.
- [ ] **`src/App.jsx` (~lines 87-97)** — dead/half-finished commented-out code deciding
  whether to early-return for `/public/:id` routes; the actual `return` is commented out,
  leaving the decision unresolved in the shipped code.

---

## Phase 6 — Validation gaps

- [ ] **`src/components/modals/AddCourseModal.jsx`** — no non-negative check on
  attended/total classes; negative attendance counts can be saved.
- [ ] **`src/components/modals/AddGradeModal.jsx` / `AddCourseModal.jsx` / `WhatIfModal.jsx` /
  `PredictorPage.jsx`** — `credits > 0` is the only guard; no upper bound, and
  `PredictorPage.jsx`'s `targetCGPA`/`futureCredits` accept negative or out-of-range values
  with only a cosmetic post-hoc warning.
- [ ] **`src/components/modals/AddEditTaskModal.jsx`** — title isn't `.trim()`'d; whitespace-
  only titles are accepted.
- [ ] **`src/components/modals/AddEditClassModal.jsx`** — no check that `endTime` is after
  `startTime` (negative-duration classes break `TimetableModal`'s height calc); also silently
  resets duration to a fixed 1 hour whenever `startTime` is nudged, discarding a custom
  duration.
- [ ] **`src/components/modals/EditProfileModal.jsx`, `EditableResumeList.jsx`** — no
  `<form>` wrapper, so native `type="email"`/`type="url"` HTML5 validation never fires.
- [ ] **`src/components/modals/PomodoroModal.jsx`** — clearing the duration input produces
  `NaN`, and "Begin Focus" silently no-ops with no user-facing feedback.
- [ ] **`src/pages/LandingPage.jsx` + `src/components/modals/BugReportModal.jsx`** — both
  POST to Google Forms with `fetch(..., { mode: 'no-cors' })`, which always resolves as an
  opaque response — the code cannot detect a rejected/misconfigured submission and always
  shows "success." Decide on an approach (honest copy vs. a small relay that can observe a
  real response) before fixing.

---

## Phase 7 — Dead code & duplication

- [ ] **`GRADE_POINTS`/`GRADES` duplicated in 5 files** instead of importing the canonical
  copy from `src/constants.js`: `AddGradeModal.jsx`, `WhatIfModal.jsx`, `AddCourseModal.jsx`,
  `usePerformanceGraphs.jsx`, `PredictorPage.jsx`. (Value confirmed intentional — `F` stays at
  2 grade points — only consolidate the imports, don't change the value.)
- [ ] **`src/components/modals/WhatIfModal.jsx`** — entire 390-line modal is unreachable dead
  code; superseded by `PredictorPage.jsx` but still wired into `ModalManager.jsx` behind a
  `modal === 'whatIf'` case that nothing ever triggers.
- [ ] **`src/components/modals/EditProfileModal.jsx`** — unreachable (nothing opens it) *and*
  its `onSave` is a no-op `console.log` stub in `ModalManager.jsx`.
- [ ] **`src/components/modals/ResetExpendituresModal.jsx`** — still unused; `Dashboard.jsx`
  uses a generic confirmation modal instead.
- [ ] **`src/pages/LoginPage.jsx`** — `onNavigateToLanding` prop passed but unused; a hard
  `<a href="/">` causes a full page reload instead of an SPA view switch.
- [ ] **`normalizeDate`** duplicated byte-for-byte between `useDashboardSummary.jsx` and
  `AtAGlance.jsx` — fold into the shared date utility from Phase 4.
- [ ] **`src/hooks/usePlannerTasks.jsx`** — sorts tasks only by time-of-day, ignoring
  `dueDate`; wrong ordering for multi-day long-term tasks.
- [ ] **`src/components/pomodoro/PomodoroTimer.jsx`** — recreates `setInterval` every tick
  instead of once per session.
- [ ] **`src/components/modals/TimetableModal.jsx`** — no guard for `schedule` being
  `undefined`/`null`; `timeToMinutes` silently returns `0` for malformed times, distorting the
  whole grid instead of skipping the bad entry.
- [ ] **`src/firebase/config.js`** — `appId` hardcoded to `'default-app-id'` despite a comment
  saying it should be env/config-driven.
- [ ] **Firestore path centralization gap** — `App.jsx`, `ProfilePage.jsx`,
  `PublicProfilePage.jsx` still hardcode `artifacts/${appId}/...` paths directly instead of
  using the new `src/constants/dbPaths.js`; that file doesn't even define a public-profile
  path helper yet.

---

## Phase 8 — Infra / config / repo hygiene

- [ ] **Broken icon references.** `public/index.html` still links `apple-touch-icon` to
  `logo192.png`, which doesn't exist in `public/`. `public/manifest.json` references
  `maskable_icon_x512.png`, which also doesn't exist (only `file.svg`, `index.html`,
  `manifest.json`, `robots.txt` are present in `public/`). Either add the real icon assets or
  remove the dangling references.
- [ ] **`public/index.html` meta description** is still literally `"Web site created using
  create-react-app"` (manifest.json branding was already fixed in the merge — this one
  wasn't).
- [ ] **`cors.json`** only allow-lists `http://localhost:3000` and `http://localhost:5173`
  (the latter a Vite port this CRA project doesn't use) — no production origin at all. Needs
  the actual deployed domain to fix.
- [ ] **Dead dependencies in `package.json`**: `@reduxjs/toolkit`, `react-redux`, `three` —
  confirmed via grep, never imported anywhere in `src/` even after the store's slice refactor
  (which uses Zustand, not Redux).
- [ ] **Tailwind version mismatch** — `@tailwindcss/postcss@^4.1.11` is installed as a
  devDependency but `postcss.config.js` uses the v3-style plain `tailwindcss: {}` plugin, and
  the project is actually on `tailwindcss@^3.4.13`. Leftover from an abandoned v4 migration.
- [ ] **`src/App.test.js`** is untouched CRA boilerplate (`getByText(/learn react/i)`) —
  `npm test` fails immediately.
- [ ] **`README.md`** is 100% CRA boilerplate — no Firebase/env setup instructions at all (a
  new dev can't get the app running without knowing about the 6 required
  `REACT_APP_FIREBASE_*` vars), and has UTF-16 mojibake corruption appended at the end
  (`#   A t r a c k` — garbled from a bad shell redirect).
- [ ] **No `.env.example`** despite `src/firebase/config.js` requiring 6 env vars.
- [ ] **`.gitignore`** still missing `.DS_Store`, `.vscode/`/`.idea/`, `/coverage`, and a
  generic `*.log` rule.
- [ ] **A 4.9 MB screen recording (`Recording 2025-08-14 163900.mp4`) is committed at repo
  root** and still tracked post-merge — remove from the working tree; consider bundling into
  the same history-rewrite as the leaked secret if it should also be purged from history.
- [ ] **`eslint.json` (124 KB, UTF-16, newly added in this merge)** is an accidentally
  committed raw ESLint JSON report (`eslint --format json -o eslint.json`), containing
  absolute Windows filesystem paths from the author's machine. Pure accidental commit with no
  value to the repo — delete it.
- [ ] **`package.json` `"name": "semester-tracker"`** vs. the actual product name "Atrack"
  used everywhere else; no `engines` field constraining Node version.

---

## Already fixed by the `main` merge (verified, no action needed)

- `logo192.png`/`logo512.png`/CRA placeholder branding in `manifest.json` — rebranded to
  "Atrack - Academic Performance Tracker" (icon file references still broken, see Phase 8).
- `src/components/modals/AddExpenditureModal.jsx`, `SetBalanceModal.jsx`,
  `src/components/performance/WhatIfCalculator.jsx`, `src/components/profile/PersonalDetails.jsx`
  — all deleted as dead code in the merge.
