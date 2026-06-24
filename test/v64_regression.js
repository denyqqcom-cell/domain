#!/usr/bin/env node
/**
 * @legacy v6.4 — superseded by test/v66_r0_gate.js (v6.6 primary gate)
 * Run: node test/v64_regression.js
 * Informational only; always exits 0. Do not use for R0b+ release sign-off.
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const rules = fs.readFileSync(path.join(__dirname, '../CORE_RULES_v2.md'), 'utf8');

const checks = [
  ['index v6.4 title (legacy)', /域名估值物料包生成器 v6\.4/.test(html)],
  ['CORE_RULES v6.4 header (legacy)', /Domain AI Judge v6\.4/.test(html)],
  ['CLASS_P2_FLOOR', /CLASS_P2_FLOOR/.test(html)],
  ['CLASS_P3_FLOOR', /CLASS_P3_FLOOR/.test(html)],
  ['fxl.com fixture', /'fxl\.com'/.test(html)],
  ['fxm.com fixture', /'fxm\.com'/.test(html)],
  ['batchAnalyze()', /function batchAnalyze/.test(html)],
  ['key_reasons_v2 template (legacy)', /key_reasons_v2/.test(html)],
  ['regional_modifiers null', /regional_modifiers: null/.test(html)],
  ['_regional_modifiers_note', /_regional_modifiers_note/.test(html)],
  ['version_manifest (legacy)', /version_manifest/.test(html)],
  ['P2/P3 guard in applyAnchorFloorGuard', /p2low = Math\.max\(anchorP2Low, p2Floor\)/.test(html)],
  ['CORE_RULES fxl regression row', /fxl\.com/.test(rules)],
  ['CORE_RULES regional_modifiers section', /regional_modifiers 预埋约束/.test(rules)],
  ['C2 cn_numeric_samples.jsonl', fs.existsSync(path.join(__dirname, '../data/cn_numeric_samples.jsonl'))],
  ['C2 CN_SAMPLE_TRACKER.md', fs.existsSync(path.join(__dirname, '../data/CN_SAMPLE_TRACKER.md'))],
];

let pass = 0, fail = 0, skip = 0;
console.log('=== v64_regression.js (@legacy v6.4 — informational) ===');
console.log('Primary gate: node test/v66_r0_gate.js\n');

for (const [name, ok] of checks) {
  const legacyOnly = /legacy/.test(name);
  if (legacyOnly && !ok) {
    console.log(`SKIP ${name} (expected drift under v6.6)`);
    skip++;
  } else {
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
    ok ? pass++ : fail++;
  }
}

console.log(`\n${pass} pass, ${fail} fail, ${skip} skip (legacy)`);
console.log('→ Release sign-off: use v66_r0_gate.js, not this file.\n');
process.exit(0);