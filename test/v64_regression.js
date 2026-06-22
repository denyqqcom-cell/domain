#!/usr/bin/env node
/**
 * v6.4 static regression checks (no browser required)
 * Run: node test/v64_regression.js
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const rules = fs.readFileSync(path.join(__dirname, '../CORE_RULES_v2.md'), 'utf8');

const checks = [
  ['index v6.4 title', /域名估值物料包生成器 v6\.4/.test(html)],
  ['CORE_RULES v6.4 header', /Domain AI Judge v6\.4/.test(rules)],
  ['CLASS_P2_FLOOR', /CLASS_P2_FLOOR/.test(html)],
  ['CLASS_P3_FLOOR', /CLASS_P3_FLOOR/.test(html)],
  ['fxl.com fixture', /'fxl\.com'/.test(html)],
  ['fxm.com fixture', /'fxm\.com'/.test(html)],
  ['batchAnalyze()', /function batchAnalyze/.test(html)],
  ['key_reasons_v2 template', /key_reasons_v2/.test(html)],
  ['culture_weight null', /culture_weight: null/.test(html)],
  ['_culture_weight_note', /_culture_weight_note/.test(html)],
  ['version_manifest', /version_manifest/.test(html)],
  ['P2/P3 guard in applyAnchorFloorGuard', /p2low = Math\.max\(anchorP2Low, p2Floor\)/.test(html)],
  ['CORE_RULES fxl regression row', /fxl\.com/.test(rules)],
  ['CORE_RULES culture_weight section', /culture_weight 预埋约束/.test(rules)],
];

let pass = 0, fail = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  ok ? pass++ : fail++;
}
console.log(`\n${pass}/${pass + fail} PASS`);
process.exit(fail ? 1 : 0);