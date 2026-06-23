/**
 * content/identity.js — typed content for the Departure synthesis (E6). The
 * closing movement maps the three flagship systems back onto the identity's
 * three threads (Visible · Grounded · Verified) and offers a considered exit.
 * Content is DATA: the Departure overlay renders from this record. Thread order
 * aligns with cluster/destination order: MiniFlyWire, Noetica, Velith.
 *
 * @typedef {{ system:string, thread:string, color:string, line:string }} Thread
 * @typedef {{ label:string, value:string, href:string }} Contact
 */
export const IDENTITY = {
  eyebrow: 'Departure · Synthesis',
  name: 'Manish Kumar',
  role: 'Systems Builder',
  synthesis: 'Three systems, one conviction: intelligence is the cooperation of many parts you can watch, ground, and check. Each wing is the same thesis under a different light.',
  threads: [
    { system: 'MiniFlyWire', thread: 'Visible',  color: '#22D3EE', line: 'I make cognition watchable — a single thought chosen in the open.' },
    { system: 'Noetica',     thread: 'Grounded',  color: '#34E0A0', line: 'I keep knowledge in the system, not the model — engineered and tested.' },
    { system: 'Velith',      thread: 'Verified',  color: '#9B6DFF', line: 'I let competence be earned from an external verifier, never asserted.' },
  ],
  close: 'What cannot be measured should not be claimed.',
  contacts: [
    { label: 'GitHub',  value: 'manish0360-coder',              href: 'https://github.com/manish0360-coder' },
    { label: 'Résumé',  value: 'PDF',                            href: '../assets/Manish-Kumar-Resume.pdf' },
    { label: 'Email',   value: 'manishyaduvansh0360@gmail.com',  href: 'mailto:manishyaduvansh0360@gmail.com' },
  ],
};
