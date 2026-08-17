# Catalyst — Exam State Contract

> Foundation Sprint F3. Documentation-only baseline. No production-code changes.

## 1. Executive decision

The current Exam subsystem is architecturally viable, but its state boundaries are implicit. The immediate goal is to document those boundaries before any migration, refactor, or LearnerStore implementation.

The target lifecycle is:

```text
Content Question
    ↓
Exam Session
    ↓
Attempt / Outcome
    ↓
Grading Decision
    ↓
Learner Fact
    ↓
Analytics / Adaptive Projections
```

These are related but distinct concepts.

## 2. Current implementation evidence

### 2.1 Content Question

`ExamDB` loads official models, archive questions, worked examples, micro-lessons, source maps, and manual-review data. `normalizeQuestion()` derives quality flags including `needsManualReview`, `answerKeyVerified`, `canAutoGrade`, and `gradingMode`.

**Ownership:** `db.js` / content datasets.

**Classification:** Content/Data + derived validation metadata.

**Rule:** question provenance and grading eligibility are not learner state.

### 2.2 Exam Session

`QuestionPlayer.createSession()` creates an in-memory session containing route, index, selected answer, confirmation state, correctness, reviewed-law reference, start time, and current question ID. `router.js` places this object under `S.exam.session`.

**Ownership:** `QuestionPlayer` + application router/state.

**Classification:** Session State.

**Rule:** active session state is not canonical learner state.

### 2.3 Attempt / Outcome

When an answer is confirmed and the question is auto-gradeable, `router.js` calls `ExamAnalytics.recordAnswer()` with question ID, selected answer, answer key, correctness, chapter, topic, traps, source type, time spent, confidence, and timestamp.

This is the strongest current representation of a learner assessment outcome, but it is persisted inside the analytics structure rather than a dedicated canonical attempt store.

**Classification:** Canonical Fact candidate.

### 2.4 Grading Decision

`QuestionPlayer.confirmChoice()` refuses to produce an automatic correctness result when `question.canAutoGrade` is false. In that case the session becomes confirmed with `isCorrect: null`.

**Ownership:** `QuestionPlayer` consuming content quality metadata.

**Classification:** Domain decision, not learner fact.

**Rule:** a grading decision must carry the distinction between auto-graded, manual-review, and ungraded outcomes.

### 2.5 Analytics

`ExamAnalytics` currently persists total attempted/correct counts, topic/chapter/trap aggregates, mistakes, recent records, timing, and last-updated timestamp. It also derives weakest chapter and most common trap.

**Classification:** Analytics / Index / bounded history.

**Rule:** aggregates are projections, not canonical learner facts when they can be rebuilt.

### 2.6 Mock Engine

`MockEngine` selects questions from `ExamDB` and returns question IDs. It deliberately requests safe/verified questions and hides manual-review items.

**Classification:** Exam orchestration / generated route.

**Rule:** a mock route is not learner state. Completing a mock may produce learner outcomes, but the generated route itself is not canonical.

## 3. Canonical entity boundaries

### Question

Represents educational content and its provenance/quality metadata.

```text
Question
├── content
├── curriculum metadata
├── source/provenance
├── verification status
└── grading eligibility
```

It does not contain learner performance.

### Exam Session

Represents an active interaction with one ordered route of questions.

```text
ExamSession
├── session identity
├── route
├── current position
├── current selection
├── confirmation state
└── timing/session metadata
```

It is transient unless a future product requirement explicitly introduces resume/recovery semantics.

### Attempt / Outcome

Represents the learner's result for a question interaction.

Conceptually:

```text
AttemptOutcome
├── questionId
├── assessment context
├── selected answer / response
├── grading status
├── correctness (nullable)
├── time spent (optional)
├── confidence (optional)
└── timestamp
```

This is a strong candidate for canonical learner history.

### Analytics Projection

Derived from learner outcomes.

```text
ExamAnalytics
├── accuracy
├── by topic
├── by chapter
├── by trap
├── mistakes index
├── recent attempts
└── timing summaries
```

The current implementation materializes these values in localStorage. That is an implementation detail, not the target domain model.

## 4. Grading contract

The grading boundary must distinguish at least three outcomes:

1. **Auto-graded** — the question is safe to grade automatically and correctness is known.
2. **Manual-review** — the question/session can be completed, but automatic correctness is not trustworthy.
3. **Ungraded/unknown** — no reliable correctness value exists.

`isCorrect: null` must not be interpreted as incorrect.

The current code already preserves this distinction at question/session level: a non-auto-gradeable question is confirmed with `isCorrect: null`.

## 5. Current Exam data lineage

```text
JSON source datasets
       ↓
ExamDB normalization
       ↓
Question + quality metadata
       ↓
Mock/Training route generation
       ↓
QuestionPlayer session
       ↓
Answer selection
       ↓
Grading decision
       ↓
ExamAnalytics.recordAnswer()
       ↓
Current persisted analytics + bounded recent history
```

The important architectural gap is between the final two stages:

```text
Outcome → Analytics
```

There is currently no dedicated canonical `AttemptStore` / learner assessment history layer.

## 6. Implications for LearnerStore

Do **not** make `LearnerStore` own the active `ExamSession`.

Do **not** make `LearnerStore` own analytics aggregates.

Do **not** make `LearnerStore` own question provenance or grading eligibility.

The likely future relationship is:

```text
LearnerStore
└── assessment outcomes / learner facts
          ↓
ExamAnalytics projection
          ↓
Exam views
```

The exact persistence representation remains implementation work for a later sprint.

## 7. Mock exam semantics

The mock engine generates routes from verified/safe questions. A mock is therefore an orchestration artifact, not a durable learner entity by default.

A future product contract may introduce an `AssessmentSession` aggregate if the product needs:

- resume after closing the app;
- official exam attempt identity;
- section-level timing;
- complete submission history;
- comparison of mock attempts.

None of these should be implemented merely to complete F3.

## 8. Current blockers

### B1 — Canonical attempt identity

There is no explicit durable attempt ID in the current analytics record. The future contract must decide whether each answer is an independent outcome or belongs to an assessment attempt/session identity.

### B2 — Full history vs bounded recent history

The current `recent` list is bounded to 300 records. This is not equivalent to complete canonical history.

### B3 — Manual-review persistence semantics

A manually reviewed question currently does not become an auto-graded learner outcome. The product must later decide how human/manual evaluation is represented if such a workflow is introduced.

### B4 — Timing semantics

Current time is measured from `session.startedAt` to confirmation. The future contract must specify whether timing is per-question, per-attempt, or both.

### B5 — Mock identity

Generated mock routes currently do not have a durable assessment identity. This is acceptable for the current feature set but blocks a stronger historical exam model.

## 9. F3 acceptance criteria

F3 is complete when:

- Question, Session, Attempt/Outcome, Grading, and Analytics have explicit boundaries.
- Active session state is explicitly excluded from canonical learner state.
- Question quality/provenance is explicitly excluded from learner state.
- Auto-grade, manual-review, and unknown outcomes are distinguishable.
- Analytics is defined as a projection/index rather than the canonical source.
- The gap between current analytics persistence and future canonical attempt history is documented.
- No production implementation is required to satisfy the contract.

## 10. Decision

**F3 contract: conditionally accepted as a baseline.**

The current Exam architecture is strong enough to preserve and evolve, but canonical assessment history is not yet implemented. That is intentional.

Therefore:

- No Exam refactor now.
- No AttemptStore implementation now.
- No LearnerStore implementation now.
- No IndexedDB now.
- No activation of Exam Center as part of F3.

The next implementation phase, when approved, should begin with testable contracts around outcome recording and replay/rebuildability rather than a broad rewrite.
