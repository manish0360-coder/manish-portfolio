# Noetica — Project State

> **Document purpose:** Single source of truth for the project's engineering state. If you are a new engineer, read this before contributing. Where the implementation contradicts any assumption, **the implementation wins**. Statements below are scoped to what has been *verified by passing tests* versus *written but not yet verified* — the distinction is load-bearing and called out explicitly.

> **Last verified test run:** `58 passed, 5 skipped` (full `pytest -v`). Components added *after* that run (`judge.py`) are marked **UNVERIFIED** until a green run exists.

---

## 1. Project Overview

**Noetica** is an AI Learning Intelligence Engine. It models what a student knows, what they have forgotten over time, and (eventually) what they should learn next. **MiniNoetica** is the foundational spike currently under construction.

- **Primary objective (current):** a persistent, forgetting-aware learner-memory subsystem that consumes a correctness judgment and maintains an accurate, time-decayed knowledge state per concept.
- **Current development phase:** Phase 2 (Memory Agent), near completion — gated on final judge verification + end-to-end capstone.
- **Maturity level:** **Prototype.** Core components are individually test-proven; the system has **not** yet run end-to-end against a real model through the current (verdict-based) pipeline.
- **Overall engineering health:** **Strong for its stage.** High test discipline, clean separation of concerns, honest debt tracking. The main gap is *integration verification*, not component quality.

---

## 2. Current Status Summary

| Dimension | State |
|---|---|
| **Overall progress (Phase 2)** | ~85% — components banked; judge + capstone pending |
| **Major systems complete** | LLM seam, agent loop, KnowledgeState, forgetting model, concept normalization, Verdict contract, verdict-based Memory Agent |
| **In progress** | `judge.py` (written, **unverified**); Day-2 capstone (**not yet re-run** on verdict pipeline) |
| **Blocked** | Nothing hard-blocked; capstone depends on judge verification |
| **Stable components** | KnowledgeState, forgetting, concepts, Verdict, Memory Agent (all green) |
| **Experimental / bridge** | `judge.py` (explicitly temporary bridge code) |

---

## 3. Working Features

> "Production-ready" below means *within the prototype's scope* (single user, single subject, local CPU), not deployment-grade.

- **Capability-aware LLM seam** (`core/llm.py`). Single chokepoint to local Ollama; auto-disables `think=True` for non-reasoning models; strips leaked reasoning markup; returns a normalized dict. **Verified.** Limitation: hardcoded `THINKING_MODELS` allowlist. Depends on `ollama`.
- **Generic agent loop** (`core/agent.py`). Iterate-until-done with step budget, JSON extraction, one-shot repair, JSONL logging. **Verified** (Day-1 eval). Not on the Memory path; reserved for future LLM agents.
- **Persistent learner store** (`KnowledgeState`). SQLite; owns mastery update rule + counters + timestamps. **Verified** (16 tests). Limitation: single-student, single-connection.
- **Forgetting model** (`forgetting.py`). Mastery-scaled half-life decay; recall computed never stored; never-reviewed and clock-skew handled. **Verified** (12 tests). Limitation: constants are placeholders; single-exponential model.
- **Concept normalization** (`concepts.py`). Curriculum-based mapping with prefix-overlap matching and ambiguity → `unknown`. **Verified** (12 tests). Limitation: ~10 hardcoded fraction concepts; crude stemmer.
- **Verdict contract** (`verdict.py`). Self-validating typed judgment carrier. **Verified** (8 tests). No limitations within scope.
- **Verdict-based Memory Agent** (`memory_agent.py::update_from_verdict`). Pure coordinator: normalize → guard → store → recall → enriched record. **Verified** (5 tests). Limitation: legacy `analyze()` still present (dead path).
- **Correctness judge** (`judge.py`). qwen3:4b correctness boolean. **WRITTEN, UNVERIFIED** — no green test run on record yet. Explicitly bridge code.

---

## 4. System Components

| Component | Status | Stability | Notes |
|---|---|---|---|
| `core/llm.py` | Complete | Stable | Capability guard + sanitizer verified |
| `core/agent.py` | Complete | Stable | Not currently on Memory path |
| `core/logger.py` | Complete | Stable | Append-only JSONL |
| `core/config.py` | Minimal | Unknown | **Verify on disk** — scaffolded Day 1, lightly used |
| `knowledge_state.py` | Complete | Stable | Owns mastery math |
| `forgetting.py` | Complete | Stable | Pure functions |
| `concepts.py` | Complete | Stable | Curriculum-based |
| `verdict.py` | Complete | Stable | Contract boundary |
| `memory_agent.py` | Complete (verdict path) | Stable | Legacy `analyze()` quarantined |
| `judge.py` | Written | **Unverified** | Bridge; needs green run |
| `capstone.py` | Exists (old version) | **Stale** | Must be rewritten for verdict pipeline |

---

## 5. Repository Health

- **Documentation:** Strong — `ARCHITECTURE.md` exists and is reverse-engineered from real code with explicit `[PLANNED]` markers. This document adds state tracking.
- **Test coverage:** High on banked components (pure logic + contracts + integration wiring all covered). Gap: `judge.py` and end-to-end capstone unverified.
- **Code organization:** Clean. Strict `phase2_memory → core` dependency direction; one responsibility per module.
- **Architecture quality:** High for stage. Typed contract (`Verdict`) between layers; deterministic core; isolated nondeterminism.
- **Maintainability:** Good. Model quirks absorbed at one seam.
- **Technical debt:** Tracked, not hidden (see §9).

---

## 6. Testing Status

Last full run: **58 passed, 5 skipped, 0 failed (~21s).**

- **Unit (pure, deterministic):** `test_forgetting.py` (12), `test_knowledge_state.py` (16), `test_concepts.py` (12), `test_verdict.py` (8). Assert math and contracts.
- **Integration (real store/normalizer/forgetting, typed input):** `test_memory_agent_verdict.py` (5). Asserts wiring + guards.
- **Live (real model, `@pytest.mark.live`):** `test_memory_agent.py::test_live_extraction…` (passing). Judge live test **exists in design but unverified**.
- **Skipped:** 5 legacy `analyze()` integration tests, intentionally quarantined.

**Key tests worth knowing:**
- `test_concepts` split-key + ambiguity tests — guard against store key fragmentation.
- `test_verdict::test_correct_must_be_bool` — closes the Day-2 store-corruption class at the contract boundary.
- `test_memory_agent_verdict::test_noncanonical_concept_updates_single_row` — proves the split-key bug dead end-to-end.

**Pending verification:** `tests/test_judge.py` (deterministic 6 + live 6-case). **No green run on record.**

---

## 7. Recently Completed Work

Reverse-engineered from the most recent milestones:

1. **Architectural pivot to Option D** — correctness judgment moved *out* of the Memory Agent. Driven by measured evidence (qwen2.5:3b cannot judge fraction correctness; qwen3:4b does, at ~20–53s). This restored the planned agent separation and made Memory pure.
2. **`Verdict` contract** — a typed, self-validating message between the (future) Reasoning Agent and Memory. Validated at construction.
3. **Memory Agent migration** — `analyze()` (LLM-coupled) replaced by `update_from_verdict()` (pure). 5/5 new tests green; legacy tests quarantined, not deleted.

**Why it matters:** these collapse Memory's responsibility to *state management only*, establish the Phase-5 inter-agent contract early, and remove a 20–53s LLM call from the state path — turning Memory deterministic and instantly testable.

---

## 8. Current Known Limitations

- **`judge.py` unverified** — no passing test run on record.
- **No end-to-end run on the verdict pipeline** — the capstone is stale and must be rewritten.
- **CPU-only inference** — ~9 tok/s; reasoning judgment 20–53s/call. Batch-acceptable, interactive-impossible on this hardware.
- **Placeholder learning/forgetting constants** — uncalibrated; tested for *shape* not *correctness*.
- **Single subject, ~10 concepts** — curriculum is hardcoded fractions.
- **Single-student, single-process SQLite** — no concurrency story.
- **No service/API/router/timeout layer** — library + scripts only.
- **Free-text `misconception`** — no fixed mistake taxonomy yet.
- **Legacy `analyze()` + extraction helpers** still physically present.

---

## 9. Technical Debt

| Item | Why it exists | Risk | Recommended fix | Priority |
|---|---|---|---|---|
| `judge.py` unverified | Built right before a doc detour | Could fail live; blocks capstone | Run `test_judge.py` (det + live) | **Critical** |
| Stale capstone | Predates verdict pipeline | Phase 2 unprovable end-to-end | Rewrite for verdict path | **Critical** |
| Placeholder constants | No real learner data | Misleading mastery/recall values | Calibrate against real data later | High |
| Legacy `analyze()`/extraction | Kept during migration | Confusion; dead code | Delete when Knowledge Agent owns extraction | Medium |
| `THINKING_MODELS` allowlist | Simplicity | Goes stale on new models | Dynamic capability query | Low |
| Untyped Memory output dict | Input typed, output not | Mild inconsistency | `MemoryRecord` type when Planner consumes it | Low |
| `config.py` underspecified | Scaffolded, lightly used | Unknown contents | Verify/clean on disk | Low |

---

## 10. Immediate Next Steps

**Critical**
1. Verify `judge.py` — run `test_judge.py -m "not live"` then `-m live`; confirm the 6-case fraction judgment.
2. Rewrite + run the Day-2 capstone on the verdict pipeline (real answer → judge → Verdict → Memory → enriched record). This **closes Phase 2**.

**High**
3. Calibrate or explicitly document the placeholder constants as a known measurement gap.
4. Delete legacy `analyze()` once it has zero callers (bundle with extraction-helper decision).

**Medium**
5. Begin Phase 3 (RAG) / Knowledge Agent — concept identification via retrieval.

**Future**
6. Reasoning Agent (replaces `judge.py`, adds mistake taxonomy), Planner Agent + policy, orchestrator, service layer.

---

## 11. Long-Term Vision

A four-agent system — **Knowledge → Reasoning → Memory → Planner** — collaborating to analyze a student answer and recommend the next learning action. The current implementation supports this directly: the `Verdict` is the Reasoning→Memory contract already built; Memory is already pure and orchestration-ready; the seam already supports per-agent model selection. Each future agent is an *additive* change producing or consuming an existing typed contract, not a modification of proven code.

---

## 12. Engineering Metrics

| Metric | Assessment |
|---|---|
| Architecture maturity | High (for prototype) — typed contracts, clean dependencies |
| Code quality | High — single-responsibility modules, deterministic core |
| Documentation completeness | Strong — ARCHITECTURE.md + this doc, honest gap-marking |
| Testing maturity | High on banked components; one unverified module |
| Maintainability | Strong — quirks absorbed at the seam |
| Scalability | Low — single-user/process by design (intentional for spike) |
| Contributor readiness | Good — clear structure, strict TDD workflow |

---

## 13. Contributor Notes

**Understand first:** an LLM is stateless; "memory" is engineered by deciding what context to resend. The learner state lives in the system, not the model. Mastery (stored) and recall (computed) are strictly separate.

**Important files (reading order):**
1. `ARCHITECTURE.md` — the map.
2. `core/llm.py` — the seam everything calls.
3. `phase2_memory/verdict.py` — the contract.
4. `phase2_memory/memory_agent.py` — the coordinator.
5. `knowledge_state.py` + `forgetting.py` — the state + decay math.
6. `concepts.py` — normalization.
7. `judge.py` — the (bridge) judge.

**Development workflow:** strict TDD — tests first, deterministic before live, smallest milestone at a time, paste real test output before proceeding. Never delete superseded code until it has zero callers; quarantine with `pytest.mark.skip` instead.

**Common pitfalls:** run modules with `python -m package.module` from repo root (not `python path/file.py`). Don't pass `think=True` to non-reasoning models directly — go through the seam. Don't let an LLM set mastery; it only judges correctness.

---

## 14. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| `judge.py` fails live verification | **High** | Verify before building on it; it's isolated bridge code, swappable |
| Placeholder constants treated as validated science | Medium | Documented as placeholders; calibrate before any real deployment |
| CPU latency makes interactive use infeasible | Medium | Seam allows one-line backend swap (GPU/cloud) for demo |
| Legacy dead code causes confusion | Low | Quarantined + documented; delete on zero callers |
| Single-subject curriculum overfits the design | Low | Normalizer is curriculum-parameterized; extensible |

---

## 15. Current Confidence Assessment

**Can be trusted (test-verified):** the LLM seam, the agent loop, KnowledgeState, the forgetting model, concept normalization, the Verdict contract, and the verdict-based Memory Agent. All green in the last full run.

**Still needs validation:** `judge.py` (no green run), and the end-to-end verdict pipeline (capstone not yet re-run). Until both pass, **Phase 2 is "components proven, system unproven."**

**Should not yet be considered stable:** the learning/forgetting *constants* (placeholders), anything implying multi-user or interactive-latency use, and `judge.py` until verified.

**Confidence level:** **High** in the banked components (rigorous, deterministic, well-tested). **Provisional** in the system as a whole until the judge is verified and the capstone runs end-to-end.

---

## Current Snapshot

- **Current phase:** Phase 2 (Memory Agent) — ~85%, gated on judge verification + capstone.
- **Overall health:** Strong engineering discipline; integration verification is the open gap.
- **Biggest achievement so far:** a pure, deterministic, fully-tested learner-memory subsystem with a typed inter-agent contract and an evidence-driven architecture (Option D) — built bug-by-bug from real measurement, not assumption.
- **Biggest remaining challenge:** closing Phase 2 end-to-end on CPU-bound hardware, and eventually calibrating the placeholder learning-science constants.
- **Recommended next milestone:** verify `judge.py` (deterministic + live), then rewrite and run the Day-2 capstone — the run that banks Phase 2.
