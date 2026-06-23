# Noetica — 20-Day Agent Engineering Roadmap
### From "no agent knowledge" → "a working multi-agent cognitive system"

> Mentor's note: This is a build log, not a syllabus. Every day ships running code and a deliverable. You will hand-roll the primitives for the first 12 days because the whole point is to understand agents, not to glue a framework together. Frameworks come at the very end, as a "here's how the industry packages what you already built."

---

## 0. Read this before Day 1 — CTO decisions I'm making for you

I'm going to overrule a few likely instincts. Each of these is a decision I'd defend in a design review.

**1. You will write this in Python, not JavaScript.**
You know JS well, and your instinct is to reach for it. Don't. The entire agent / embeddings / RAG / numerics ecosystem is Python-first (`sentence-transformers`, `chromadb`, `numpy`/`scipy` for the forgetting model, `networkx` for the knowledge graph). AI-engineering recruiters expect Python. With 8–10 hrs/day and strong JS fundamentals, you'll be productive in Python within 2 days. We *reintroduce* your JS strength on Day 20 for the demo UI. Cost of ignoring this: you fight the ecosystem for 20 days.

**2. No LangChain / LangGraph / CrewAI until after Day 16.**
If you start on a framework you'll learn *that framework's abstractions*, not what an agent is. You'll be the person who can't debug an agent loop because you've never written one. We build the loop, the tool dispatcher, the memory layer, and the orchestrator by hand. On Day 20 you may *look at* LangGraph to see how it compresses what you built — that's it.

**3. Local-first infra. No Docker, no Kubernetes, no cloud, no Postgres, no Pinecone.**
For a 20-day learning spike these are pure yak-shaving. SQLite for persistence, ChromaDB (local) for vectors, a `.env` for keys. If you find yourself writing a Dockerfile, stop.

**4. You will NOT invent a forgetting algorithm.**
Noetica's vision tempts you to research memory decay. Don't. Use a known model — SM-2 (the SuperMemo/Anki algorithm) or a simple Ebbinghaus exponential decay / half-life regression. Inventing one is a research project, not a 20-day deliverable.

**5. You will earn your second agent.**
The #1 mistake in this space is going multi-agent when one agent with tools would do. Multi-agent = more LLM calls = more cost, more latency, more failure modes. We don't split into 4 agents until Day 17, and only because the *roles are genuinely distinct* (grounding vs. error analysis vs. memory vs. planning). Until then, one agent.

**6. The Planner will not be a black box.**
When you build the Learning Planner Agent (Day 19), do **not** make "recommend next action" a single opaque LLM call. Encode the decision policy partly in explicit code (review vs. advance vs. remediate, driven by mastery + recall + mistake type). A recommendation you can explain is a recommendation a recruiter — and a teacher — will trust.

**7. Every day's "working code" includes "how do you know it works."**
Several days end in a small eval. An agent with no eval is a demo, not engineering.

Keep these pinned. I'll reference them by number throughout.

---

## 1. What an agent actually is (first principles)

Strip the marketing away.

**An LLM is a stateless function: `text -> text`.** It has no memory, takes no actions, and runs once per call. A chatbot is this function called in a loop where you resend the conversation each turn. That's *not* an agent.

**An agent is a control loop around that function that lets it decide and take actions until a goal is met.** The minimal anatomy:

```
state = initial_goal
loop (until done or step budget exhausted):
    thought  = LLM(state)             # reason about what to do next
    action   = parse(thought)         # a structured decision (which tool, what args)
    result   = execute(action)        # actually do it (tool call, computation, output)
    state    = state + result         # observe; fold result back into context
return final_answer
```

That's the whole idea. Everything else is an augmentation of one of three primitives:

| Primitive | What it is | Augmented by |
|---|---|---|
| **The model call** | `text -> text` | system prompts, structured output |
| **The loop / control** | decides + repeats | planning, step budgets, orchestration |
| **The environment** | what the agent can affect/observe | tools, memory, retrieval |

- **Memory** = managing the `state` so it survives the context window and survives restarts.
- **RAG** = injecting *retrieved* information into `state` before the model call.
- **Tools** = expanding the set of `action`s beyond "emit text."
- **Multi-agent** = several of these loops, each specialized, passing messages.

If you internalize this table, every "advanced" topic becomes a variation, not a new mystery. That's why we build bottom-up.

### Minimum concepts (the whole list — nothing else needed for 20 days)
Messages & system prompts · stateless model calls · the perceive→reason→act→observe loop · structured output (JSON) & validation · step budgets / stop conditions · context windows & token budgeting · short-term vs. long-term memory · persistence · a forgetting model · embeddings & cosine similarity · chunking · retrieval & grounding · function/tool calling · tool registries & arg validation · message passing · orchestration patterns (supervisor / pipeline) · typed contracts between agents · end-to-end tracing · simple evaluation.

### Explicitly NOT learning (cut to protect velocity)
Model training / fine-tuning · transformer internals · distributed systems · Docker/K8s/cloud · vector-DB sharding/tuning · auth/billing · streaming-token plumbing · async concurrency theory · building a real frontend framework app.

---

## Phase & day map

| Phase | Days | Output |
|---|---|---|
| **1 — Single Agent** | 1–3 | Robust agent loop + structured output + eval |
| **2 — Memory Agent** | 4–6 | Persistent learner memory + forgetting model |
| **3 — RAG Agent** | 7–9 | Evaluated RAG over a concept corpus |
| **4 — Tool-Using Agent** | 10–12 | Integrated single agent (memory + RAG + tools) |
| **5 — Multi-Agent System** | 13–16 | Generic supervised/pipelined multi-agent system |
| **6 — Mini Noetica** | 17–20 | 4 cognitive agents → recommend next learning action |

Folder convention: each phase gets its own directory; shared primitives live in `core/`; the final system lives in `noetica/`. Full repo tree is in §"Repository structure" at the bottom.

---

# PHASE 1 — SINGLE AGENT (Days 1–3)

## Day 1 — The raw model call and the simplest loop

**Goal.** Remove all magic. Make a direct API call, see the exact request/response shape, and build a session-memory REPL. By end of day you can explain why an LLM "forgets."

**Concepts.** LLM as a stateless `text->text` function · the messages array (`system` / `user` / `assistant`) · why a conversation is just resending history · `temperature`, `max_tokens` · context window · keeping secrets in `.env`.

**Project.** A terminal REPL chat that maintains an in-memory `messages` list and talks to one provider.

**Files.**
- `core/config.py` — loads env, exposes settings.
- `core/llm.py` — `class LLM: def complete(self, messages, system=None, temperature=0) -> str`. This wrapper is the single seam through which *every* future agent calls a model. Keep it provider-agnostic.
- `phase1_single_agent/day1_chat.py` — the REPL.
- `.env` (git-ignored), `.env.example`, `.gitignore`, `requirements.txt`.

**Folder.**
```
noetica/
├── core/{config.py, llm.py}
├── phase1_single_agent/day1_chat.py
└── .env, .env.example, .gitignore, requirements.txt
```

**Tech.** Python 3.11+, the Anthropic or OpenAI SDK (pick one; abstract it behind `core/llm.py` so it's swappable), `python-dotenv`. (Optional cost saver: point `core/llm.py` at a local model via Ollama. Verify current model names/limits in the provider docs — don't trust any hardcoded string.)

**Expected output.** A REPL where you chat, the model remembers earlier turns *in the session*, and you can watch the `messages` list grow.

**Common mistakes.** Not resending history (model "forgets" mid-chat) · hardcoding the API key · assuming the model is stateful · no try/except around the call.

**Noetica link.** `core/llm.py` is the foundation every one of the four cognitive agents will call. Get the seam right now.

---

## Day 2 — Structured output and the perceive/reason/act loop

**Goal.** Make the model emit machine-parseable decisions and act on them. Your first *real* agent loop (ReAct-style).

**Concepts.** Structured output (prompt the model to return strict JSON) · validation with `pydantic` · the ReAct pattern (Thought → Action → Observation) · the control loop with a stop condition and a step budget (CTO note #5/#7 in miniature).

**Project.** A "reasoning agent" that, given a goal, loops: reasons → emits a structured action → you execute it → feed the result back → repeat until it emits a `final_answer`. Keep tools trivial (a safe math evaluator, a fake lookup) — today is about the *loop*, not the tools.

**Files.**
- `core/schemas.py` — pydantic models: `AgentStep { thought: str, action: Literal["tool","final"], tool_name, tool_args, final_answer }`.
- `core/agent.py` — first cut of the loop.
- `phase1_single_agent/day2_react.py`.

**The loop you must be able to write from memory:**
```python
def run(self, goal: str, max_steps: int = 8) -> str:
    messages = [{"role": "user", "content": goal}]
    for _ in range(max_steps):
        raw = self.llm.complete(messages, system=self.system)
        step = AgentStep.model_validate_json(self._extract_json(raw))
        if step.action == "final":
            return step.final_answer
        result = self.execute(step.tool_name, step.tool_args)
        messages.append({"role": "assistant", "content": raw})
        messages.append({"role": "user", "content": f"Observation: {result}"})
    raise StepBudgetExceeded(goal)
```

**Tech.** `pydantic`.

**Expected output.** Agent solves a multi-step word problem, printing Thought/Action/Observation at each step and terminating on a final answer.

**Common mistakes.** Model returns prose instead of JSON → add a strict format instruction *and* a one-shot repair retry · infinite loops → always a `max_steps` · executing unvalidated output · using raw `eval()` (use a safe evaluator).

**Noetica link.** The Reasoning Agent (Day 18) is exactly this loop pointed at a student's answer.

---

## Day 3 — Harden into a reusable `Agent` and prove it with an eval

**Goal.** Turn the script into a clean, observable, reusable `Agent` class. Measure it.

**Concepts.** Separation of concerns (model / loop / tools are three different things) · retry-with-repair on bad JSON · system-prompt design · tracing every step · a tiny eval harness.

**Project.** Finalize `Agent`. Add a tracer that records each (thought, action, observation). Build a 5-problem eval set and measure pass rate.

**Files.**
- `core/agent.py` (finalized: `Agent(llm, tools, system).run(goal)`).
- `core/tracing.py` — append-only step log; pretty-print + JSON dump.
- `tests/test_agent.py` (pytest).
- `data/eval_problems.json` — 5 problems with expected answers.
- `phase1_single_agent/day3_agent.py`.

**Tech.** `pytest`, stdlib `logging`.

**Expected output.** `Agent.run(...)` works reliably; a readable trace prints; eval reports e.g. `4/5 passed` with the failing case shown.

**Common mistakes.** A god-class that does model + loop + tools + memory · no tracing (you literally cannot debug agents without it) · over-abstracting before you have three concrete agents to generalize from.

**Noetica link.** Every cognitive agent reuses this base and this tracer. Cross-agent tracing on Day 15 is this, scaled.

> ✅ **Phase 1 deliverable:** a robust single agent — clean loop, structured output, retry/repair, tracing, and a passing eval. This is already a portfolio-worthy mini-project.

---

# PHASE 2 — MEMORY AGENT (Days 4–6)

## Day 4 — Short-term vs. long-term memory and why context windows force it

**Goal.** Treat memory as *state management*. Handle conversations longer than the context window.

**Concepts.** Context-window limits · token budgeting · short-term (recent turns) vs. long-term (persisted facts) · summarization/compaction · sliding window.

**Project.** A `Memory` class + `MemoryAgent` that keeps a running summary of old turns plus a recent-turns window, compacting when the token budget is exceeded.

**Files.**
- `phase2_memory/memory.py` — `Memory.add(turn)`, `Memory.context()`, `Memory.compact()`.
- `phase2_memory/day4_memory_agent.py`.

**Tech.** `tiktoken` (or a simple word-count proxy) for token estimation.

**Expected output.** A long conversation that never blows the context window; the agent still recalls a fact you stated 30 turns ago (via the summary).

**Common mistakes.** Keeping everything forever · summarizing so aggressively you lose facts · no token accounting (you discover the limit by crashing).

**Noetica link.** A study session is long. Noetica's Memory Agent manages both the live session *and* the persistent learner state (next two days).

---

## Day 5 — Persistence with SQLite

**Goal.** Memory survives restarts. Start modeling a *learner*, not just a chat.

**Concepts.** Persistence · simple schema design · SQL basics · episodic memory (events that happened) vs. semantic memory (facts you've extracted).

**Project.** Persist conversations and extracted "facts about the user" to SQLite; reload on startup.

**Files.**
- `phase2_memory/store.py` — thin SQLite data layer (parameterized queries only).
- `phase2_memory/schema.sql`.
- `phase2_memory/day5_persistent_memory.py`.
- `data/noetica.db` (git-ignored).

**Tech.** `sqlite3` (stdlib).

**Expected output.** Quit the program, relaunch, and the agent greets you by name / recalls last session's facts.

**Common mistakes.** No thought about schema/evolution · storing un-queryable JSON blobs for things you'll need to query · string-interpolating SQL (injection) — always use parameters.

**Noetica link.** This *is* the learner store. "What the student knows / doesn't know" persists here.

---

## Day 6 — Structured knowledge state + the forgetting model (Noetica's core)

**Goal.** Move from "remember the chat" to "model the learner's knowledge state over time." Introduce forgetting (CTO note #4 — use a known algorithm).

**Concepts.** Knowledge as items with `(strength, last_reviewed)` · spaced-repetition decay (SM-2, or Ebbinghaus exponential / half-life regression) · "what the learner knows *now*" as a function of elapsed time · update rules on correct/incorrect review.

**Project.** A `KnowledgeState` store where each concept has a mastery strength and a timestamp; a `forgetting.py` that computes current recall probability via decay; an update rule that bumps strength on correct answers and resets on wrong ones.

**Files.**
- `phase2_memory/knowledge_state.py` — `get(concept)`, `update(concept, correct: bool)`.
- `phase2_memory/forgetting.py` — the decay function.
- `tests/test_forgetting.py`.
- `phase2_memory/day6_forgetting.py` — simulate reviews over simulated days.

**The core function (don't overthink it):**
```python
import math
def recall_probability(strength: float, days_since_review: float) -> float:
    # Ebbinghaus-style: higher strength => slower decay (longer half-life)
    half_life = max(0.5, strength)              # days
    return math.exp(-math.log(2) * days_since_review / half_life)
```

**Tech.** `numpy` (optional), `datetime`.

**Expected output.** A printed/plotted simulation: recall probability decaying between reviews and jumping after each correct review — the classic spaced-repetition sawtooth.

**Common mistakes.** Inventing a formula instead of using SM-2 / half-life · not storing timestamps · conflating "recently seen" with "mastered."

**Noetica link.** This is the heart of the whole vision — "track what the student knows," "model forgetting." The Memory Agent (Day 18) wraps exactly this.

> ✅ **Phase 2 deliverable:** a persistent, structured learner-memory module with a real forgetting model and correct/incorrect update rules.

---

# PHASE 3 — RAG AGENT (Days 7–9)

## Day 7 — Embeddings and similarity, by hand

**Goal.** De-mystify retrieval. Compute cosine similarity yourself *before* touching a vector DB.

**Concepts.** Embeddings (text → vector) · semantic similarity vs. keyword match · cosine distance · vector normalization.

**Project.** Embed ~10 short docs, implement cosine similarity in `numpy`, return top-k for a query.

**Files.**
- `phase3_rag/embeddings.py` — `embed(texts) -> np.ndarray`, `cosine_topk(query_vec, matrix, k)`.
- `phase3_rag/day7_similarity.py`.
- `data/docs/*.txt`.

**Tech.** `sentence-transformers` (local, free, e.g. an `all-MiniLM`-class model) or a provider embeddings endpoint; `numpy`.

**Expected output.** Query "how do plants make food" retrieves the photosynthesis doc — a doc that shares *zero* keywords with the query.

**Common mistakes.** Forgetting to normalize vectors · mixing two embedding models in the same index · treating embeddings as magic instead of "points in space."

**Noetica link.** The Knowledge Agent retrieves the right concept material; if you understand raw retrieval, RAG is never a black box.

---

## Day 8 — Chunking, a real vector store, and the RAG agent

**Goal.** Build the full retrieve → augment → generate pipeline with grounding.

**Concepts.** Chunking (size + overlap) · indexing · the RAG loop (retrieve → stuff context → generate) · grounding & citations · hallucination reduction by constraining to retrieved context.

**Project.** Ingest docs → chunk → embed → store in Chroma → a `RAGAgent` that answers questions and cites the chunk it used.

**Files.**
- `phase3_rag/chunker.py` (size/overlap, sentence-aware if easy).
- `phase3_rag/vector_store.py` (thin Chroma wrapper: `add`, `query`).
- `phase3_rag/ingest.py`.
- `phase3_rag/rag_agent.py`.
- `phase3_rag/day8_rag.py`.

**Tech.** `chromadb`, `sentence-transformers`.

**Expected output.** Ask a question about your corpus → grounded answer + the source chunk id(s) shown.

**Common mistakes.** Chunks too big (noise) or too small (no context) · no overlap (facts split across boundaries) · retrieving context but not instructing the model to *use only* it · stuffing far too much context.

**Noetica link.** The Knowledge Agent is a RAG agent over a concept/curriculum corpus.

---

## Day 9 — Retrieval quality and evaluation

**Goal.** Make retrieval *good and measurable*. Never ship retrieval you haven't measured.

**Concepts.** Retrieval evaluation (does the correct chunk get retrieved?) · top-k tuning · light hybrid (keyword + vector) · metadata filtering · query rewriting.

**Project.** A small eval set (`question → expected source`); measure retrieval hit-rate; add metadata filtering (e.g., by subject/topic) and re-measure.

**Files.**
- `phase3_rag/eval_retrieval.py`.
- `data/rag_eval.json`.
- improvements to `vector_store.py` (metadata filter support).

**Tech.** same as Day 8.

**Expected output.** A hit-rate number (e.g. `retrieval@3 = 0.8`) and a measured before/after improvement from one change.

**Common mistakes.** Tuning the *generation* prompt while *retrieval* is silently broken · no eval set · overfitting to a single query.

**Noetica link.** A learning engine must surface the *right* concept; metadata filtering becomes subject/topic scoping in Noetica.

> ✅ **Phase 3 deliverable:** an evaluated RAG agent over a concept corpus, with metadata filtering and a documented retrieval hit-rate.

---

# PHASE 4 — TOOL-USING AGENT (Days 10–12)

## Day 10 — Function calling fundamentals

**Goal.** Let the agent affect the world. Implement real tool calling.

**Concepts.** Tools as typed functions exposed to the model · tool schemas · native function-calling vs. prompt-based · the tool-use loop (model requests a call → you execute → return result → model continues).

**Project.** Give the agent 2–3 *real* tools: `calculator`, `current_date`, and `lookup_concept` (which calls your Day-8 RAG). The agent decides when to call which.

**Files.**
- `phase4_tools/tools.py` — tool functions + JSON schemas.
- `phase4_tools/tool_agent.py`.
- `phase4_tools/day10_tools.py`.

**Tech.** Your provider's native tool-use / function-calling (cleaner than prompt-parsing). Check current API shape in the docs.

**Expected output.** The agent answers a question that *requires* a tool, and the trace shows the tool call + the returned result feeding back in.

**Common mistakes.** Not validating tool args · letting the model *hallucinate* a tool's output instead of actually running it · forgetting to feed the result back into the loop · unsafe `eval()` for the calculator.

**Noetica link.** Agents collaborate partly via tool calls (`get_learner_state`, `retrieve_concept`).

---

## Day 11 — Tool registry, multi-step tool use, and safety

**Goal.** Scale to many tools and multi-step chains, safely.

**Concepts.** Registry/dispatch pattern · multi-tool selection · guardrails (allowlist, arg validation, timeouts, a tool-call budget) · read tools vs. write tools (write tools get a dry-run mode).

**Project.** A `ToolRegistry`; the agent chains ≥2 tool calls to finish a task; pydantic-validated args; a dry-run flag for any state-mutating tool.

**Files.**
- `phase4_tools/registry.py`.
- refactor `tool_agent.py` to use the registry.
- `phase4_tools/day11_multistep.py`.

**Tech.** `pydantic` for per-tool arg schemas.

**Expected output.** The agent completes a task needing sequential calls, e.g. *retrieve concept → compute recall → suggest a review*.

**Common mistakes.** One giant tool function · no arg validation · the agent loops re-calling the same tool · no max tool-call budget.

**Noetica link.** The Planner Agent orchestrates tools (query memory, query knowledge) to form a recommendation.

---

## Day 12 — The integrated single agent (memory + RAG + tools) + eval

**Goal.** Combine everything into one capable single agent. This is the apex of "one agent," and it's the proof you *don't* need multi-agent yet (CTO note #5).

**Concepts.** Integrating subsystems behind clean interfaces · planning vs. acting · step budgets · self-correction · end-to-end agentic evaluation.

**Project.** A "study assistant" single agent: given a student question, it retrieves the concept (RAG tool), checks the learner's memory/recall (state tool), answers, and logs the interaction to memory. Eval on 5 scenarios.

**Files.**
- `phase4_tools/study_agent.py`.
- `phase4_tools/day12_capstone.py`.
- `tests/test_study_agent.py`.

**Tech.** Everything from Phases 1–4.

**Expected output.** A coherent end-to-end single agent using memory + RAG + tools; eval passes; full trace available.

**Common mistakes.** Jumping to multi-agent already · no integration test · tight coupling between subsystems (keep the seams clean — you split them apart in Phase 6).

**Noetica link.** Proves each capability works *before* you split responsibilities across specialized agents. Forces the clean interfaces the multi-agent system will depend on.

> ✅ **Phase 4 deliverable:** one integrated single agent (memory + RAG + tools), evaluated end-to-end. A genuinely strong standalone portfolio piece.

---

# PHASE 5 — MULTI-AGENT SYSTEM (Days 13–16)

## Day 13 — Why multiple agents, and the message-passing substrate

**Goal.** Understand *when* to split (and when not to — CTO note #5), then build the communication layer.

**Concepts.** Single vs. multi-agent tradeoffs · agents as specialized roles · message passing · shared state vs. message bus · the orchestrator concept.

**Project.** An `Agent` interface (`handle(message) -> message`), a simple in-process orchestrator/bus, and two trivial agents that talk.

**Files.**
- `phase5_multiagent/protocol.py` — `Message { sender, recipient, type, payload }` (pydantic).
- `phase5_multiagent/base_agent.py`.
- `phase5_multiagent/orchestrator.py`.
- `phase5_multiagent/day13_two_agents.py`.

**Tech.** `pydantic`; pure Python — **no framework** (note #2).

**Expected output.** The orchestrator routes a message A→B→A; the trace shows the full flow.

**Common mistakes.** Using multi-agent for what one agent does (the cardinal sin) · agents mutating shared global state chaotically · no message schema (agents guessing each other's shapes).

**Noetica link.** The four cognitive agents communicate over exactly this substrate.

---

## Day 14 — Orchestration patterns (supervisor / pipeline)

**Goal.** Implement a real orchestration pattern.

**Concepts.** Supervisor pattern (a router agent delegates to specialists) · sequential pipeline · blackboard/shared-state pattern · **code-driven vs. LLM-driven routing** — prefer deterministic code routing for plumbing (CTO note: don't make the LLM do work that an `if` can do — it's slower, costlier, flakier).

**Project.** A supervisor that routes different task types to the right specialist and aggregates results; build 3 toy specialists.

**Files.**
- `phase5_multiagent/supervisor.py`.
- `phase5_multiagent/agents/*.py`.
- `phase5_multiagent/day14_supervisor.py`.

**Expected output.** Different task types reliably reach the correct specialist; an aggregated final answer.

**Common mistakes.** Letting the LLM orchestrate *everything* · circular agent calls · no guaranteed termination.

**Noetica link.** Noetica's orchestrator routes a student answer through Knowledge → Reasoning → Memory → Planner.

---

## Day 15 — Shared state, contracts, and cross-agent tracing

**Goal.** Make agents collaborate over shared state with explicit contracts and full observability.

**Concepts.** Typed input/output contracts between agents · a shared `Context`/`Session` object passed down the pipeline · end-to-end tracing across agents · failure isolation (one agent fails → graceful degradation, not a crash).

**Project.** Define a `Session` object with named fields; agents read/write only their declared fields; instrument the orchestrator so a single run produces a complete cross-agent trace.

**Files.**
- `phase5_multiagent/context.py` (`Session` schema).
- orchestrator instrumented with `core/tracing.py`.
- `phase5_multiagent/day15_collaboration.py`.

**Expected output.** One trace showing each agent's input and output as a task flows through the system.

**Common mistakes.** Implicit contracts (agents guessing shapes) · no tracing (undebuggable) · one agent's exception killing the whole pipeline.

**Noetica link.** The `Session` object *is* the student-interaction context the four agents collaborate on.

---

## Day 16 — A generic, evaluated multi-agent system

**Goal.** Ship a generic multi-agent system (not yet Noetica) to prove the architecture is sound and cost-aware.

**Concepts.** End-to-end multi-agent eval · latency/cost awareness (each agent = an LLM call = time + money; use a cheaper/faster model for routing and a stronger one for reasoning) · knowing where to *collapse* agents.

**Project.** A "research assistant" system: `planner → retriever → writer → critic`. Clean, generic, with a `critic` step (verification matters). Eval on a few tasks.

**Files.**
- `phase5_multiagent/research_system/` (the agents + orchestrator).
- `phase5_multiagent/day16_capstone.py`.
- `tests/test_research_system.py`.

**Expected output.** A working multi-agent system you can point to; trace + eval results.

**Common mistakes.** Too many agents · ignoring cost/latency · skipping the critic/verification step.

**Noetica link.** Same skeleton — on Day 17 you swap in the four cognitive agents.

> ✅ **Phase 5 deliverable:** a generic, evaluated, fully-traced multi-agent system with supervisor + pipeline orchestration. A major portfolio piece.

---

# PHASE 6 — MINI NOETICA (Days 17–20)

> You now have every primitive. Phase 6 is *domain work*: point the architecture at learning. Scope ruthlessly — **one small subject, ~10 concepts** (e.g., fractions, or photosynthesis). CTO note #6.

## Day 17 — Domain model + Agent 1: Knowledge Agent

**Goal.** Pivot the generic system to the learning domain; build the grounding agent.

**Concepts.** Domain modeling (`Concept`, `Answer`, `Session`, `Mastery`) · the Knowledge Agent's job: identify which concept(s) an answer concerns, state the correct understanding, retrieve reference material (RAG from Phase 3).

**Project.** `KnowledgeAgent`: input `(question, student_answer)` → output `{target_concepts, correct_reasoning, reference_material}`.

**Files.**
- `noetica/domain.py` (the schemas).
- `noetica/agents/knowledge_agent.py`.
- `noetica/data/concepts/` — your ~10-concept corpus for ONE subject.

**Tech.** Phase 3 RAG stack.

**Expected output.** Feed a student answer → get the concept(s) it targets + the correct reference understanding.

**Common mistakes.** Trying to cover every subject (pick one) · a vague `Concept` schema · skipping the corpus and faking it.

**Noetica link.** Agent 1 — curriculum grounding.

---

## Day 18 — Agent 3: Reasoning Agent + Agent 2: Memory Agent

**Goal.** Build error analysis (Reasoning) and wire in the persistent learner state + forgetting (Memory, from Phase 2).

**Concepts.** Error analysis: compare student reasoning to correct reasoning → classify the mistake against a **fixed taxonomy** (don't allow free-text labels) · recurring-mistake detection by reading history from memory · the Memory Agent exposing + updating `KnowledgeState`.

**Project.**
- `ReasoningAgent`: input `(student_answer, correct_reasoning)` → `{is_correct, mistake_type, misconception, evidence}`.
- `MemoryAgent`: wraps the Day-6 `KnowledgeState` + forgetting; updates mastery; flags if this `mistake_type` has recurred.

**Files.**
- `noetica/agents/reasoning_agent.py`.
- `noetica/agents/memory_agent.py`.
- extend `noetica/domain.py` with a `MistakeType` enum.

**Tech.** Phase 2 store + forgetting model.

**Expected output.** Given a wrong answer, the system names the misconception and flags whether it's a repeat offense.

**Common mistakes.** Free-text mistake labels (un-aggregatable) · not passing the correct reasoning into the comparison · ignoring history when detecting "recurring."

**Noetica link.** Agents 2 & 3 — "detect recurring reasoning mistakes" + "track knowledge / model forgetting."

---

## Day 19 — Agent 4: Learning Planner + full orchestration

**Goal.** Build the planner and wire all four agents into one collaborative flow.

**Concepts.** A decision policy for "next best learning action" (review / advance / remediate), driven by mastery + recall probability + mistake type · aggregating agent outputs into a recommendation · the full pipeline. **Make the policy partly explicit code, not one opaque LLM call** (CTO note #6) — the LLM phrases the recommendation; the *decision* is defensible logic.

**Project.** `PlannerAgent`: input `(target_concepts, recall, mastery, mistake_analysis)` → `{next_action, rationale, specific_recommendation}`. Orchestrator runs **Knowledge → Reasoning → Memory(update) → Planner** over a `Session`.

**Files.**
- `noetica/policy.py` — the explicit decision rules.
- `noetica/agents/planner_agent.py`.
- `noetica/orchestrator.py` (Noetica-specific pipeline).
- `noetica/main.py`.

**Tech.** Phase 5 orchestrator + all four agents.

**Expected output.** Submit a student answer → system returns: concept, correctness, misconception (if any), recurring? , updated mastery, **and a concrete next learning action with a rationale**.

**Common mistakes.** Black-box planner · forgetting to update memory · no rationale (a recommendation no one can question is a recommendation no one trusts).

**Noetica link.** This is the entire thesis: four agents collaborating to recommend the next learning action.

---

## Day 20 — Evaluation, thin interface, demo, writeup

**Goal.** Make it demonstrable and credible.

**Concepts.** End-to-end evaluation on realistic scenarios · a *thin* interface · telling the story (architecture diagram) · honest limitations (signals maturity).

**Project.**
- 8–10 realistic student-answer scenarios as an eval (correct, partially-correct, a recurring misconception, a forgotten-but-previously-mastered concept).
- A minimal interface: CLI is acceptable; or — *now* use your JS strength — a tiny HTML/JS frontend calling a small FastAPI endpoint, showing the four agents collaborating live (with the trace).
- A short recorded demo (2–3 min).
- `README.md` + `ARCHITECTURE.md` with a diagram and your design decisions.

**Files.**
- `noetica/eval/scenarios.json`, `noetica/eval/run_eval.py`.
- `noetica/cli.py` and/or `noetica/app.py` (+ `web/` for the JS UI).
- `README.md`, `ARCHITECTURE.md`, `docs/architecture.png`.

**Tech.** Optional `FastAPI` + small HTML/JS UI (plays to your strength), or `Streamlit` for speed.

**Expected output.** A runnable demo: input a student answer → watch the four agents collaborate (traced) → receive a recommendation. Documented eval results.

**Common mistakes.** Burning the day on UI polish · no eval · no writeup (recruiters buy the *story* and your *understanding*, not the pixels) · claiming production-readiness.

**Noetica link.** This is Mini Noetica — a credible, honest spike of the full vision.

> ✅ **Phase 6 deliverable:** Mini Noetica — four collaborating cognitive agents that analyze a student answer and recommend the next learning action, with eval, demo, and writeup.

---

# Closing reference

## 1. Recommended tech stack
- **Language:** Python 3.11+ (note #1). Env: `uv` or `venv` + `pip`; lint with `ruff`.
- **LLM access:** one provider (Anthropic Claude *or* OpenAI), abstracted behind `core/llm.py`. Use a stronger model for reasoning and a cheaper/faster one for routing. Optional local/free path via **Ollama**. *Verify current model names, limits, and pricing in the provider's docs — don't trust hardcoded strings, including any in this document.*
- **Validation/contracts:** `pydantic`.
- **Embeddings:** `sentence-transformers` (local, free) or provider embeddings.
- **Vector store:** `chromadb` (local).
- **Persistence:** `sqlite3` (stdlib).
- **Numerics:** `numpy` (forgetting model).
- **Testing:** `pytest`. **Tracing:** stdlib `logging` + your `core/tracing.py` (optionally peek at Langfuse/LangSmith later).
- **Day-20 interface:** `FastAPI` + small HTML/JS, or `Streamlit`.
- **Stretch (knowledge graph):** `networkx`.
- **Deliberately excluded** (note #3): Docker, Kubernetes, cloud, Postgres/pgvector, Pinecone, fine-tuning, heavy agent frameworks (until a Day-20 *look*, not a dependency).

## 2. Repository structure (final)
```
noetica/
├── README.md
├── ARCHITECTURE.md
├── requirements.txt        # or pyproject.toml
├── .env.example
├── .gitignore
├── core/
│   ├── config.py
│   ├── llm.py              # the one model seam
│   ├── agent.py            # base loop
│   ├── schemas.py
│   └── tracing.py
├── phase1_single_agent/
├── phase2_memory/
│   ├── memory.py
│   ├── store.py
│   ├── knowledge_state.py
│   └── forgetting.py
├── phase3_rag/
│   ├── embeddings.py
│   ├── chunker.py
│   ├── vector_store.py
│   └── rag_agent.py
├── phase4_tools/
│   ├── tools.py
│   ├── registry.py
│   └── study_agent.py
├── phase5_multiagent/
│   ├── protocol.py
│   ├── base_agent.py
│   ├── orchestrator.py
│   ├── supervisor.py
│   ├── context.py
│   └── research_system/
├── noetica/                # Phase 6 — the product spike
│   ├── domain.py
│   ├── policy.py
│   ├── orchestrator.py
│   ├── main.py
│   ├── cli.py / app.py
│   ├── agents/
│   │   ├── knowledge_agent.py
│   │   ├── memory_agent.py
│   │   ├── reasoning_agent.py
│   │   └── planner_agent.py
│   ├── data/concepts/
│   └── eval/{scenarios.json, run_eval.py}
├── data/                   # db, docs, eval sets (git-ignored where appropriate)
├── tests/
└── docs/architecture.png
```

## 3. Milestones
- **M1 — Day 3:** robust single agent + eval.
- **M2 — Day 6:** persistent learner memory + forgetting model.
- **M3 — Day 9:** evaluated RAG agent.
- **M4 — Day 12:** integrated single agent (memory + RAG + tools).
- **M5 — Day 16:** generic multi-agent system.
- **M6 — Day 20:** Mini Noetica shipped, evaluated, demoed.

## 4. Weekly checkpoints (self-test — answer without notes)
- **End of Week 1 (≈Day 7):** Single agent + memory done. *Can you write the agent loop from memory and explain why an LLM "forgets"?*
- **End of Week 2 (≈Day 14):** RAG + tools + multi-agent substrate done. *Can you argue when NOT to use multi-agent, and explain code-driven vs. LLM-driven routing?*
- **End of Week 3 (Day 20):** Mini Noetica shipped. *Can you whiteboard the full four-agent flow and defend the Planner's policy?*
If you can't answer a checkpoint, you've been gluing, not building — slow down and re-derive it.

## 5. Portfolio-ready deliverables
1. **Integrated single agent** (Day 12) — README + eval + trace.
2. **Generic multi-agent system** (Day 16) — README + eval + architecture note.
3. **Mini Noetica** (Day 20) — README + `ARCHITECTURE.md` + eval results + 2–3 min demo.
Each: clean repo, a diagram, an eval number, and an honest "limitations" section.

## 6. What to show recruiters after 20 days
- **Lead with Mini Noetica and the story:** an ambitious vision (an AI learning-intelligence engine) → a disciplined 20-day spike that proves the core. Ambition + scoping discipline is exactly the signal hiring managers want.
- **The from-scratch angle is your edge:** "I built the agent loop, memory, RAG, tool-calling, and orchestration by hand — I can debug an agent, not just configure a framework." Be ready to whiteboard the loop and the orchestration.
- **A short writeup / blog post:** *"Building a multi-agent learning engine from scratch in 20 days — architecture and lessons."* Include the diagram, the forgetting model, and the design tradeoffs (especially single-vs-multi-agent and the explicit Planner policy).
- **A 2–3 minute recorded demo** of the four agents collaborating on a real student answer.
- **The honest limitations section** — it reads as senior, not junior.

---

*Velocity over perfection. Ship every day. If a day's build threatens the schedule, cut scope, not the deliverable — a smaller thing that runs beats a bigger thing that doesn't.*
