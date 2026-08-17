# Catalyst — Learner State Lineage Audit

> Foundation Sprint F2 audit. Documentation only. No LearnerStore implementation and no production-code changes.

## 1. Executive decision

Catalyst should **not implement `LearnerStore` yet**.

The repository currently contains several persisted and transient state families that are related to learning, but they do not have the same semantics. Treating all of them as one store would create a new god-object and hide important boundaries.

The working architectural rule is:

```text
Canonical learner facts
        ↓
Domain/adaptive/exam computations
        ↓
Derived state / analytics / view models
```

`LearnerStore` must represent canonical learner facts, not every object associated with the learner.

## 2. Classification model

Every state/data item is classified into one of seven categories:

1. **Canonical Fact** — a persisted fact about learner activity or judgment that cannot be safely reconstructed from UI state alone.
2. **Derived State** — a value computed from canonical facts and/or content.
3. **UI-Transient** — navigation, selection, rendering, loading, and interaction state.
4. **Session State** — state belonging to an active learning/exam session.
5. **Generated Plan** — an algorithmically generated plan/schedule that can potentially be regenerated.
6. **Analytics / Index** — aggregates, rankings, convenience indexes, or summaries.
7. **Content / Data** — curriculum, questions, cards, laws, examples, or source metadata; not learner state.

## 3. State lineage matrix

| State / data | Current owner | Current storage | Lifetime | Classification | Main readers | Main writers | Recomputable? | LearnerStore? | Migration risk |
|---|---|---|---|---|---|---|---|---|---|
| `S.tab`, `S.path` | `state.js` / router | memory | app session | UI-Transient | router/render | navigation actions | yes | NO | Low |
| `S.quiz.*` | `state.js` / router | memory | quiz session | UI-Transient / Session | quiz renderer/router | quiz actions | yes | NO | Low |
| `S.flash.*` | `state.js` / router | memory | flashcard session | UI-Transient / Session | flash renderer/router | flash actions | yes | NO | Low |
| `S.exam.*` | `state.js` / router | memory | exam/app session | UI-Transient / Session | router/exam views | exam actions | yes | NO, except resulting attempts | High |
| progress seen nodes | `Progress` | `localStorage` (`cmp_progress_v1`) | persistent | Canonical Fact candidate | `Progress`, `Adaptive`, learning UI | `Progress.markSeen` | no, not from UI | YES, conceptually | Medium |
| confidence judgments | `Progress` | `localStorage` (`cmp_progress_v1`) | persistent | Canonical Fact candidate | `Progress`, `Adaptive` | `Progress.setConf` | no | YES, conceptually | Medium |
| completion percentage | `Progress` | derived | runtime | Derived State | UI/adaptive | `Progress.getPct` | yes | NO | Low |
| quiz attempts/correct by question | `Adaptive` | `localStorage` (`cmp_quiz_perf_v1`) | persistent | Historical Fact candidate | `Adaptive` | `recordQuizResult` | only if raw attempts retained elsewhere | YES, conceptually | High |
| quiz topic aggregates | `Adaptive` | same | persistent | Analytics / Index | `Adaptive` | `recordQuizResult` | yes, from attempt history | NO as canonical | Medium |
| recent wrong questions | `Adaptive` | same | persistent | Analytics / Index | adaptive retry/home | `recordQuizResult` | yes, from history | NO as canonical | Medium |
| flash review history | `Adaptive` | `localStorage` (`cmp_flash_schedule_v1`) | persistent | Canonical Fact candidate | `Adaptive` | `scheduleFlashReview` | partially | YES, conceptually | High |
| `nextDueAt` / streak | `Adaptive` | same | persistent | Derived / scheduling state | flash/adaptive | `scheduleFlashReview` | potentially, depending on algorithm contract | NOT automatically | High |
| daily plan | `Adaptive` | `localStorage` (`cmp_daily_plan_v1`) | daily | Generated Plan | home/adaptive | `getOrCreateDailyPlan` | yes | NO | Medium |
| completed daily-plan task IDs | `Adaptive` | same | daily | Fact candidate / Plan State | home/adaptive | `setPlanTaskStatus` | not necessarily | TBD | Medium |
| generic adaptive state | `Adaptive` | `localStorage` (`cmp_adaptive_state_v1`) | persistent | Undefined until contract | adaptive | `setAdaptiveState` | unknown | TBD | High |
| exam question session | `QuestionPlayer` + `S.exam.session` | memory | active session | Session State | router/question UI | question actions | yes during session | NO | High |
| exam answer attempt | `ExamAnalytics` record | `localStorage` (`cmp_exam_analytics_v1`) | persistent history | Historical Fact candidate | analytics/mistakes | `recordAnswer` | no if history is required | YES, conceptually | High |
| exam aggregate accuracy | `ExamAnalytics` | same | persistent | Analytics / Index | analytics UI | `recordAnswer` | yes | NO | Medium |
| exam topic/chapter aggregates | `ExamAnalytics` | same | persistent | Analytics / Index | analytics/UI/adaptive candidates | `recordAnswer` | yes | NO | Medium |
| exam mistakes index | `ExamAnalytics` | same | persistent | Analytics / Index | mistakes/retry UI | `upsertMistake` | yes from attempt history | NO | Medium |
| weakest chapter | `ExamAnalytics.getSummary()` | derived | runtime | Derived State | analytics UI | none | yes | NO | Low |
| most common trap | `ExamAnalytics.getSummary()` | derived | runtime | Derived State | analytics UI | none | yes | NO | Low |
| question/session route IDs | `QuestionPlayer` / router | memory | active session | Session State | question UI | router | yes | NO | Low |
| question quality metadata | `ExamDB` | JSON content | content lifetime | Content / Data | exam engine | dataset pipeline | no | NO | Medium |
| `canAutoGrade` / review gates | `ExamDB` normalization | JSON-derived/content | content lifetime | Content / Data / Derived validation | question player/mock engine | normalization | yes from source metadata | NO | High |

## 4. Detailed ownership decisions

### 4.1 UI/Application state

`state.js` is the application state container. It includes navigation, quiz position, flashcard position, exam view/session fields, search, laws, and periodic-table interaction state. This state is not learner truth.

**Decision:** keep outside `LearnerStore`.

### 4.2 Progress

`Progress` contains persistent learner-facing facts: seen nodes and confidence judgments. Its percentages and totals are derived.

**Decision:** these facts are strong candidates for the canonical learner-state contract; their current localStorage schema is not automatically the future schema.

### 4.3 Adaptive state

`adaptive.js` currently persists four separate keys: quiz performance, flash schedule, daily plan, and generic adaptive state. The module also computes weak-topic scores by combining quiz error rate, content incompletion, and flash urgency.

This proves that adaptive outputs are not equivalent to canonical facts.

**Decision:** preserve the distinction between learner facts and adaptive outputs. Do not copy the existing four-key structure into a future store unchanged.

### 4.4 Exam state

The active question session is transient/session state. The completed answer/attempt is the potentially persistent learner fact. Analytics aggregates are derived/indexed representations.

**Decision:** future contracts should distinguish `ExamSession`, `Attempt/Outcome`, and `Analytics` rather than storing one monolithic exam object.

### 4.5 Content quality

Exam source metadata, verification flags, corruption detection, and `canAutoGrade` are properties of content/data quality, not learner state.

**Decision:** never place question source trust or grading eligibility inside `LearnerStore` merely because it affects the learner experience.

## 5. Proposed canonical learner-state contract — conceptual only

The future canonical state should be organized around facts, approximately:

```text
LearnerFacts
├── learning
│   ├── content exposure/completion facts
│   └── learner judgments/confidence
├── practice
│   └── practice outcomes/history needed for adaptation
├── review
│   └── review outcomes needed to reproduce scheduling state
└── assessment
    └── exam attempt/outcome history required for learner history
```

This is intentionally a **contract shape, not an implementation schema**.

The following should remain outside the canonical store:

```text
UI state
Navigation state
Active exam session
Rendered view models
Daily plan object
Weak-topic scores
Analytics aggregates
Question source metadata
Question grading metadata
```

Some boundaries, especially review scheduling and daily-task completion, remain **TBD** until their persistence semantics are explicitly decided.

## 6. Critical unresolved decisions before LearnerStore

### D1 — Attempt history granularity

Determine whether the canonical learner model stores every practice/exam outcome, a bounded history, or a normalized event/fact representation.

### D2 — Flash scheduling source of truth

Determine whether `nextDueAt` and streak are canonical persisted facts or derived scheduling outputs from review events plus an algorithm version.

### D3 — Daily task completion

Determine whether completing a generated task is a learner fact worth retaining independently from the generated plan.

### D4 — Generic adaptive state

`cmp_adaptive_state_v1` is currently an open-ended patch object. Its fields must be inventoried before any migration or store design.

### D5 — Analytics rebuildability

Determine which analytics must be reproducible from learner history and which are allowed to remain materialized indexes.

### D6 — Versioning

Define learner-state schema/version semantics independently from app version, content version, and service-worker cache version.

## 7. Architectural rules established by this audit

1. `LearnerStore` stores canonical learner facts; it is not a container for all learner-related state.
2. UI and navigation state never become canonical learner state.
3. Active exam/quiz sessions are session state, not learner history.
4. Analytics aggregates must not be mistaken for canonical facts when they can be rebuilt.
5. Generated adaptive plans must not become canonical merely because they are persisted today.
6. Content trust, source provenance, and grading eligibility belong to content/data contracts.
7. Existing localStorage keys are implementation details of the current architecture, not the target LearnerStore schema.
8. IndexedDB remains deferred until the canonical state contract and persistence requirements are proven.
9. No migration should begin until read/write ownership and rebuildability are documented.
10. No refactor should be performed solely to make current code visually resemble the target architecture.

## 8. Foundation Sprint gate

F2 is **not complete** until D1–D6 are resolved or explicitly accepted as bounded design decisions.

F2 is complete when:

- every learner-related persisted state has a classification;
- canonical facts are separated from derived/indexed values;
- session/UI state is explicitly excluded;
- exam attempt semantics are defined;
- adaptive scheduling semantics are defined;
- the future store contract is storage-engine agnostic;
- migration ownership for existing localStorage keys is known;
- no production code changes are required to accept the contract.

Until then:

**NO `LearnerStore` implementation.**

**NO IndexedDB adoption.**

**NO state migration.**

**NO architectural refactor justified solely by F2.**
