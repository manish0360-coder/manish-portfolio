/**
 * content/projects.js — typed content for the three flagship systems. Content is
 * DATA, not markup: the Codex and future wings render from these records, so the
 * world grows by editing data, not scenes. Order aligns with cluster/destination
 * order: [0] MiniFlyWire, [1] Noetica, [2] Velith.
 *
 * @typedef {{ label:string, value:string }} Fact
 * @typedef {{ value:string, label:string, note?:string }} Metric
 * @typedef {{ label:string, detail?:string, href:string }} Artifact
 * @typedef {{ id:string, name:string, color:string, eyebrow:string,
 *             essence:string, facts:Fact[], deeper:string }} Project
 * @type {Project[]}
 */
export const PROJECTS = [
  {
    id: 'miniflywire', name: 'MiniFlyWire', color: '#22D3EE',
    eyebrow: 'Flagship I · Visual',
    essence: 'A brain-inspired cognitive architecture rendered as a live observatory — watch an agent learn, remember, reason, and decide in real time.',
    facts: [
      { label: 'Neurons', value: '20' },
      { label: 'Clusters', value: '5' },
      { label: 'Cognitive layers', value: '8' },
      { label: 'Modules', value: '40+' },
    ],
    deeper: 'See how a single thought is chosen',
    understanding: {
      title: 'How a single thought is chosen',
      intro: 'Every reachable neighbour is scored, then one is selected. Adjust the drives and watch the decision shift.',
      factors: [
        { label: 'Reward', weight: 0.35, value: 80 },
        { label: 'Novelty', weight: 0.25, value: 45 },
        { label: 'Energy', weight: 0.20, value: 70 },
        { label: 'Trust', weight: 0.20, value: 90 },
      ],
      thresholds: [
        { min: 0, label: 'Rest', tone: '#566276' },
        { min: 40, label: 'Exploit', tone: '#22D3EE' },
        { min: 70, label: 'Explore', tone: '#E255D0' },
      ],
      caption: '60% learned linear score · 40% competitive arbitration → softmax selection.',
    },
    evidenceLabel: 'Examine the evidence',
    evidence: {
      eyebrow: 'Evidence ledger',
      intro: 'A live, brain-inspired observatory you can run yourself — not a description of one. Every count below is visible on screen the moment the repo boots.',
      repo: { label: 'manish0360-coder/Mini-FlyWire', lang: 'JavaScript · WebGL', status: 'public', href: 'https://github.com/manish0360-coder/AI-intereactive-Brain-inspired-from-Mini-Flywire-' },
      metrics: [
        { value: '20', label: 'Neurons', note: 'across 5 clusters' },
        { value: '39', label: 'Edges', note: 'live signal paths' },
        { value: '8', label: 'Cognitive layers', note: 'rendering → decision' },
        { value: '40+', label: 'Modules', note: 'one responsibility each' },
      ],
      artifacts: [
        { label: 'Source repository', detail: 'full architecture + history', href: 'https://github.com/manish0360-coder/AI-intereactive-Brain-inspired-from-Mini-Flywire-' },
        { label: 'The Cognitive Observatory', detail: 'watch a single thought get chosen', href: 'https://github.com/manish0360-coder/AI-intereactive-Brain-inspired-from-Mini-Flywire-' },
      ],
      claim: 'Run it and the numbers render in front of you — nothing here is taken on trust.',
    },
  },
  {
    id: 'noetica', name: 'Noetica', color: '#34E0A0',
    eyebrow: 'Flagship II · Engineering',
    essence: 'An evidence-based learning-intelligence engine. The language model is a stateless judge; what is known about the learner lives in the system.',
    facts: [
      { label: 'Tests passing', value: '58' },
      { label: 'LLM calls on path', value: '1' },
      { label: 'Contracts', value: 'typed' },
      { label: 'Frameworks', value: 'none' },
    ],
    deeper: 'Inspect the typed Verdict contract',
    understanding: {
      title: 'Reaching a verdict',
      intro: 'One LLM call judges; the system records a typed Verdict. Weigh the evidence and watch it resolve.',
      factors: [
        { label: 'Answer match', weight: 0.40, value: 70 },
        { label: 'Method shown', weight: 0.25, value: 60 },
        { label: 'Confidence', weight: 0.20, value: 65 },
        { label: 'Prior mastery', weight: 0.15, value: 50 },
      ],
      thresholds: [
        { min: 0, label: 'Incorrect', tone: '#FB6A6A' },
        { min: 45, label: 'Partial', tone: '#FB923C' },
        { min: 72, label: 'Correct', tone: '#34E0A0' },
      ],
      caption: 'The model is a stateless judge; mastery & recall live in the system, not the model.',
    },
    evidenceLabel: 'Examine the evidence',
    evidence: {
      eyebrow: 'Evidence ledger',
      intro: 'Engineering discipline you can re-run: deterministic tests gate every subsystem before integration. The figures below come straight from the last full pytest run.',
      repo: { label: 'manish0360-coder/Noetica-agent-lab', lang: 'Python · pytest', status: 'public', href: 'https://github.com/manish0360-coder/Noetica-agent-lab' },
      metrics: [
        { value: '58', label: 'Tests passing', note: '0 failed · 5 skipped · ~17.5s' },
        { value: '53', label: 'Deterministic tests', note: 'forgetting · state · concepts · verdict' },
        { value: '1', label: 'LLM call on path', note: 'a stateless judge' },
        { value: '0', label: 'Frameworks', note: 'built primitive by primitive' },
      ],
      artifacts: [
        { label: 'Source repository', detail: 'typed Verdict contract + memory agent', href: 'https://github.com/manish0360-coder/Noetica-agent-lab' },
        { label: 'ARCHITECTURE.md', detail: 'reverse-engineered from real code', href: 'https://github.com/manish0360-coder/Noetica-agent-lab' },
        { label: 'Test suite', detail: 'pytest -v · 58 passed', href: 'https://github.com/manish0360-coder/Noetica-agent-lab' },
      ],
      claim: 'The mastery state is engineered and tested; the model only judges. Both are inspectable at the repo.',
    },
  },
  {
    id: 'velith', name: 'Velith', color: '#9B6DFF',
    eyebrow: 'Flagship III · Research',
    essence: 'A verification-first engineering intelligence. Truth is exogenous — competence is earned from an external verifier, never asserted.',
    facts: [
      { label: 'Experiment arms', value: '5' },
      { label: 'Model-gap', value: 'zero → mfg' },
      { label: 'Verifier', value: 'deterministic' },
      { label: 'Status', value: 'V0.1' },
    ],
    deeper: 'Walk the falsifiable experiment',
    understanding: {
      title: 'The falsifiable experiment',
      intro: 'Only verified experience is kept. Raise the verifier and watch held-out performance separate from retrieval.',
      factors: [
        { label: 'Grounding', weight: 0.30, value: 60 },
        { label: 'Verification filter', weight: 0.40, value: 55 },
        { label: 'Retention', weight: 0.15, value: 50 },
        { label: 'Held-out signal', weight: 0.15, value: 45 },
      ],
      thresholds: [
        { min: 0, label: 'A1 — retrieval only', tone: '#566276' },
        { min: 50, label: 'A2 ≈ A1', tone: '#FB923C' },
        { min: 70, label: 'A2 ⟩ A1 — grounding wins', tone: '#9B6DFF' },
      ],
      caption: 'Truth is exogenous — competence is earned from an external verifier, never asserted.',
    },
    evidenceLabel: 'Examine the evidence',
    evidence: {
      eyebrow: 'Evidence ledger',
      intro: 'A research design built to be falsified. Five experiment arms isolate whether grounding beats retrieval, judged by a deterministic verifier and an external held-out benchmark.',
      repo: { label: 'manish0360-coder/Velith', lang: 'Python · research', status: 'V0.1', href: 'https://github.com/manish0360-coder/Velith' },
      metrics: [
        { value: '5', label: 'Experiment arms', note: 'A0 cold → A4 ablation' },
        { value: 'A2 ⟩ A1', label: 'Decisive test', note: 'verified must beat unfiltered' },
        { value: '0', label: 'Model-gap', note: 'same model every arm' },
        { value: 'ext.', label: 'Verifier', note: 'deterministic · held-out' },
      ],
      artifacts: [
        { label: 'Source repository', detail: 'experiment harness + state substrate', href: 'https://github.com/manish0360-coder/Velith' },
        { label: 'The falsifiable experiment', detail: 'A0–A4 arms, pre-registered criterion', href: 'https://github.com/manish0360-coder/Velith' },
      ],
      claim: 'The hypothesis can lose. If A2 fails to beat A1, grounding added nothing — and the design says so out loud.',
    },
  },
];
