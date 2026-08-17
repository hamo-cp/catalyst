# Catalyst — Foundation Verification & Gate

> F5 — Verification, Testability & v2 Gate. Documentation and repository assessment only. No production-code changes.

## 1. Purpose

F5 converts the Foundation Sprint from a set of architectural documents into a **verifiable baseline**.

The gate answers two separate questions:

1. Can the current contracts be checked against the repository and runtime behavior?
2. Is the project sufficiently protected by tests/checks to permit architectural implementation?

A contract being logically documented is not the same as proving the current implementation satisfies it.

## 2. Current repository evidence

The current repository is a static/module-based PWA rather than a package-managed application. No `package.json` was found at repository root, and the recursive repository tree does not expose a `.github/workflows` test workflow or a conventional test suite. The repository does contain an empty `.edge_dom_test.html` and empty `.route_test.err.log` artifact, but these are not evidence of an executable test harness.

The application entry point is `index.html` → `assets/js/main.js`, which imports ES modules and creates the application/router state. The manifest and service worker establish the PWA runtime. The service worker currently caches the application shell and datasets under a versioned cache name.

**Current conclusion:** the repository has runtime code and some historical test artifacts, but does not currently provide a sufficiently explicit automated verification layer for the Foundation contracts.

## 3. Verification levels

### V0 — Static repository checks

Must be possible without installing new dependencies:

- repository tree inspection;
- contract-to-code traceability;
- search for forbidden architectural patterns;
- syntax checks for changed JavaScript when a JS runtime is available;
- JSON parse validation for critical datasets;
- HTML/manifest structural checks;
- service-worker cache/reference consistency review.

### V1 — Pure module/contract checks

The minimum future automated suite should cover deterministic modules without requiring a browser:

- `QuestionPlayer` session transitions;
- `MockEngine` selection constraints;
- question normalization and grading eligibility;
- analytics projection calculations;
- progress persistence semantics;
- adaptive state classification and deterministic helpers where practical.

These tests should not require a new framework if the existing environment can execute them directly. Introducing a test framework is a later engineering decision, not an F5 requirement.

### V2 — Browser smoke checks

A minimal browser smoke suite should verify:

- application boot;
- hash routing;
- Home → unit → section;
- Organic navigation;
- Periodic search/open;
- Quiz answer flow;
- Flashcard rating flow;
- Laws navigation;
- blocked Exam Center behavior;
- PWA registration/offline fallback.

### V3 — Contract characterization checks

Before any LearnerStore/refactor implementation, characterize current persistence behavior:

- progress survives reload;
- confidence survives reload;
- quiz performance survives reload;
- flash scheduling survives reload;
- daily plan/completion behavior survives reload;
- exam analytics survives reload;
- malformed localStorage does not crash the application.

These tests establish the **current behavior baseline**. They do not approve the current architecture as the target architecture.

## 4. Contract verification matrix

| Contract | Current evidence | Minimum verification | Status |
|---|---|---|---|
| UI state is not learner truth | `state.js` owns navigation/session state | static ownership check + characterization smoke test | PARTIAL |
| Progress facts are persistent | `Progress` writes `cmp_progress_v1` and `cmp_fc_conf_v1` | reload persistence test | PARTIAL |
| Derived progress is rebuildable | `getPct`, `totalSeen` are calculated | pure behavior test | PARTIAL |
| Adaptive state is distinct from learner facts | four separate adaptive keys | storage/ownership audit | PASS (design) |
| Exam session is transient | `QuestionPlayer` + `S.exam.session` | session transition tests | PARTIAL |
| Auto-grade is gated by question quality | `canAutoGrade` / `needsManualReview` | normalization + grading tests | PASS (design), runtime unverified |
| `isCorrect: null` is not incorrect | non-auto-gradeable questions produce null | grading edge-case test | PARTIAL |
| Mock selection excludes unsafe questions | `MockEngine` requests safe/verified questions | filter/property tests | PARTIAL |
| Analytics is a projection, not canonical truth | current analytics mixes aggregates and bounded history | characterization + future projection test | PARTIAL |
| Exam Center remains blocked | public flag is false | smoke test | PASS by static inspection |
| IndexedDB is absent | no IndexedDB layer is present | forbidden-pattern scan | PASS |
| Service worker is delivery/cache only | `sw.js` contains caching/fetch logic | static boundary review | PASS (scope) |
| LearnerStore is not implemented | no `LearnerStore` file exists | repository search | PASS |

## 5. Minimum acceptance suite before architectural implementation

The following is the **minimum gate**, not a full quality program.

### A. Syntax / integrity

1. Parse every active JavaScript module.
2. Parse every active JSON dataset used by the application.
3. Validate `manifest.webmanifest` as JSON.
4. Validate that every service-worker app-shell path exists.
5. Detect missing ES-module import targets.

### B. State characterization

6. `Progress.markSeen()` persists and reloads.
7. `Progress.setConf()` persists and reloads.
8. `Adaptive.recordQuizResult()` updates the expected counters.
9. Flash scheduling persists expected review state.
10. Daily-plan completion behavior remains stable.
11. Exam analytics records an answer and produces the expected summary.
12. Invalid/corrupt localStorage falls back safely.

### C. Exam contract

13. `QuestionPlayer.createSession()` creates a valid initial session.
14. `selectChoice()` cannot alter a confirmed session.
15. `confirmChoice()` auto-grades only when `canAutoGrade` is true.
16. Non-auto-gradeable questions never become `isCorrect: false` merely because they cannot be graded.
17. `moveNext()` resets question-local session fields correctly.
18. Mock generation never returns questions rejected by `safeOnly/verifiedOnly/hideManualReview`.
19. An accepted answer creates exactly one analytics outcome under the current behavior.

### D. Routing / runtime smoke

20. Hash routes resolve to the intended application action.
21. Blocked Exam Center remains blocked.
22. Home and core learning flows boot without console/runtime errors.
23. PWA service-worker registration and offline fallback work.

### E. Architectural guard checks

24. No `LearnerStore` implementation exists before the gate is explicitly opened.
25. No IndexedDB usage is introduced before its gate is explicitly opened.
26. No feature module writes another feature's persistence directly as part of the migration.
27. No UI/session state is promoted to canonical learner state without a contract decision.
28. No analytics aggregate is promoted to canonical truth without a rebuildability decision.

## 6. Verification priority

If engineering capacity is limited, the order is:

```text
1. JS/JSON integrity
2. Question quality + grading safety
3. Progress/adaptive persistence characterization
4. Exam session/analytics characterization
5. Routing smoke
6. PWA/offline smoke
7. Architectural guard checks
```

The first four are the highest-value protection against corrupting learner data or exam results during future refactoring.

## 7. What is verified now vs what is not

### Verified by repository inspection

- `LearnerStore` is not implemented.
- IndexedDB is not part of the current persistence model.
- Exam Center public enable flag is false.
- `QuestionPlayer` distinguishes non-auto-gradeable questions from incorrect answers.
- `MockEngine` requests safe/verified/non-manual-review questions.
- Current learner/exam persistence is distributed across localStorage stores.
- Service worker has a versioned cache and explicit app-shell list.
- No root `package.json` was found.
- No GitHub Actions workflow was exposed in the repository tree.
- The latest inspected commit has no registered combined status checks.

### Not verified by execution in this environment

- JavaScript syntax execution.
- JSON parsing by a runtime.
- Browser smoke flows.
- actual service-worker lifecycle.
- reload persistence behavior.
- runtime console errors.
- `git diff --check` on a local working tree.

Do not report these as passing until an executable environment actually runs them.

## 8. Foundation Gate decision

**Status: NOT READY TO OPEN ARCHITECTURAL IMPLEMENTATION.**

The architecture contracts are sufficiently defined to specify the test plan, but the repository does not yet have enough executable verification to establish a safety net for migration.

This is a **testability gap, not a reason to redesign the application**.

## 9. Required next engineering step

The next implementation sprint should be a **Characterization & Verification Sprint**, not a LearnerStore sprint.

Its first deliverable should be a minimal dependency-free or existing-runtime test harness covering the minimum acceptance suite above. Only after those tests are green should we consider:

```text
LearnerStore implementation
        ↓
Persistence adapter
        ↓
Incremental migration
        ↓
Analytics projection migration
```

The migration must be incremental and reversible.

## 10. v2 gate

Catalyst may be considered **Foundation-ready for v2 implementation** only when:

- F1 baseline is accepted;
- F2 learner-state contract is accepted;
- F3 exam-state contract is accepted;
- F4 persistence/content-quality decision is accepted;
- minimum characterization suite is executable and green;
- critical exam/grading invariants are green;
- no unexplained production behavior changes exist;
- migration strategy for current localStorage state is documented;
- IndexedDB remains an explicit decision rather than an accidental dependency.

Until all conditions are met:

**NO LearnerStore implementation.**

**NO state migration.**

**NO architectural refactor.**

**NO feature expansion justified by the Foundation Sprint.**
