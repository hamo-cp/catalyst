# Catalyst — Learner State Contract Decision

## Status

**Design baseline only — not an implementation specification.**

This document resolves the F2 design questions identified by the learner-state lineage audit. It does not authorize `LearnerStore`, IndexedDB, state migration, or production refactoring.

## 1. Core decision

The future canonical learner state is a **fact-oriented model**. It must not mirror the current localStorage keys and must not become a container for UI, session, analytics, or generated-plan state.

Conceptually:

```text
Canonical Learner Facts
        ↓
Domain computations
        ↓
Derived views / analytics / adaptive decisions
```

## 2. D1 — Attempt history granularity

### Current reality

The repository does not currently maintain a complete immutable attempt/event history.

Quiz performance stores per-question counters and a bounded `recentWrong` list. Exam analytics stores a bounded `recent` list of 300 answer records, plus aggregates and a mistake index. Therefore the current analytics structures cannot be treated as a complete event source from which every aggregate can always be reconstructed.

### Decision

For the target architecture, an **attempt/outcome fact** is the canonical unit for learner assessment history.

The exact retention policy remains implementation-level work, but the contract must distinguish:

```text
Attempt/Outcome Fact
    ├── activity domain (practice / exam)
    ├── question/content identity
    ├── outcome
    ├── timestamp
    └── context required for future analysis
```

Materialized aggregates may coexist later, but they are not the canonical source of truth.

### Consequence

A future migration cannot simply rename `cmp_quiz_perf_v1` or `cmp_exam_analytics_v1` into a `LearnerStore`. Existing aggregates require an explicit migration/reconstruction policy.

## 3. D2 — Flash scheduling source of truth

### Current reality

Flash review persistence stores `lastReviewedAt`, `nextDueAt`, `streak`, and `lastLevel` per card.

### Decision

For the current target contract, the **review outcome** is the learner fact. Scheduling fields are **adaptive state**, not universal learner facts.

`nextDueAt` and `streak` may remain persisted as materialized scheduling state because the current system does not retain a complete review-event history. They must therefore be treated as replaceable outputs of the adaptive subsystem rather than permanent domain truth.

The future adaptive contract must include an algorithm/version identifier if schedule state becomes dependent on a versioned algorithm.

## 4. D3 — Daily task completion

### Current reality

A daily plan is generated from adaptive signals. Its task IDs and completion IDs are persisted for the day.

### Decision

The generated `dailyPlan` object is **not canonical learner state**.

A completed task may become a learner fact only if the product decides that completion itself has durable learning meaning independent of that particular generated plan. Until that decision is made, `completedTaskIds` remains **plan/session-adjacent state**.

No migration into LearnerStore is authorized from the current structure.

## 5. D4 — Generic adaptive state

### Current reality

`cmp_adaptive_state_v1` is written through `setAdaptiveState()` and currently contains adaptive-mode context such as selected mode, topic, and count.

### Decision

This key is **not canonical learner state**.

It is classified as adaptive/application context. Its fields must be explicitly inventoried before any future migration. No generic object spreading into LearnerStore is allowed.

## 6. D5 — Analytics rebuildability

### Current reality

Exam analytics contains both bounded answer records and materialized aggregates. Quiz analytics contains counters and a bounded wrong-question list. Because the historical source is incomplete/bounded, current aggregates are not guaranteed to be reproducible from persisted records.

### Decision

Target architecture distinguishes:

```text
Canonical facts
        ↓
Analytics projection/index
        ↓
UI summary
```

Future analytics should be designed as a projection of canonical facts wherever practical.

Current materialized analytics must be treated as legacy persisted state during any future migration, not as authoritative domain truth by default.

## 7. D6 — Versioning

The target learner state must have its own schema/version identity.

At minimum, the architecture must distinguish:

```text
App version
Content/data version
Learner-state schema version
Adaptive algorithm version
Service-worker/cache version
```

These versions must not be inferred from one another.

A future migration must be explicit about:

- source schema;
- target schema;
- migration direction;
- idempotence or one-time behavior;
- failure handling;
- preservation/loss policy;
- rollback behavior.

No migration implementation is authorized by this document.

## 8. Target state boundaries

### Canonical candidates

```text
Learning
├── content exposure/completion facts
└── learner confidence/judgment facts

Practice
└── attempt/outcome facts

Review
└── review outcome facts

Assessment
└── exam attempt/outcome facts
```

### Explicitly outside canonical LearnerStore

```text
UI/navigation state
Active quiz/exam session
Rendered view models
Generated daily plan
Adaptive scores
Weak-topic rankings
Analytics aggregates
Mistake indexes
Question source/provenance metadata
Question auto-grading eligibility
Service-worker/cache state
```

## 9. Required contracts before implementation

Before `LearnerStore` exists, the following contracts must be specified:

1. `LearningFact` / progress semantics.
2. `PracticeAttempt` semantics.
3. `ReviewOutcome` semantics.
4. `ExamAttempt` / `ExamOutcome` semantics.
5. Identity strategy for learner-owned records.
6. Timestamp semantics.
7. Schema/version strategy.
8. Retention policy.
9. Reset/export/clear semantics.
10. Migration policy from current localStorage keys.
11. Projection/rebuild policy for analytics.
12. Offline conflict/consistency assumptions.

## 10. IndexedDB gate

IndexedDB remains **deferred**.

It can be reconsidered only after the contracts above are stable and requirements demonstrate a concrete need for a stronger storage model. The existence of multiple current localStorage keys is not itself sufficient justification.

## 11. LearnerStore implementation gate

Implementation is blocked until:

- the canonical fact model is reviewed;
- attempt and review semantics are approved;
- current-state migration policy is known;
- versioning is defined;
- analytics projection strategy is defined;
- reset/export semantics are defined;
- persistence requirements are measured rather than assumed.

## 12. No-refactor rule

This contract is intentionally compatible with the current code without requiring immediate restructuring.

The next engineering task, when authorized, should first create characterization tests around existing persistence behavior. Only after those tests establish a safety net should production code be considered for incremental migration.
