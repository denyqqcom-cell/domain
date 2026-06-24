#!/usr/bin/env node
/**
 * v6.6-R0d gates: 2N/4N judgment + paste JSON polish
 */
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

let pass = 0, fail = 0;
function check(label, ok, detail) {
  console.log(`${ok ? '✅' : '🔴'} ${label}${detail ? ' — ' + detail : ''}`);
  if (ok) pass++; else fail++;
}

function extractFn(name) {
  const m = html.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?^\\}`, 'm'));
  if (!m) throw new Error('missing ' + name);
  return m[0];
}

function sliceBetween(a, b) {
  const s = html.indexOf(a), e = html.indexOf(b, s);
  return html.slice(s, e);
}

const boot = [
  sliceBetween('const NUMERIC_SUBTYPE_JUDGMENTS = {', 'function expertJudgment'),
  html.match(/const NUMERIC_LEN_SUFFIX = \{[\s\S]*?^};/m)[0],
  extractFn('detectNumericSubtypeDetail'),
  extractFn('detectPattern'),
  extractFn('expertJudgment'),
].join('\n').replace(/^const /gm, 'var ');

eval(boot);

const REQUIRED_KEYS = [
  'all_7_repeat_nn', 'all_lucky_repeat_nn', 'all_7_repeat_nnnn',
  'all_lucky_repeat_nnnn', 'full_sequence_nnnn'
];

check('index: v6.6-R0d', /v6\.6-R0d/.test(html));
check('index: stripJsonFences', /function stripJsonFences/.test(html));
check('index: validateAuditorJson', /function validateAuditorJson/.test(html));
check('index: forbidden suggested_price', /suggested_price/.test(html));

REQUIRED_KEYS.forEach(k => {
  check('judgment key ' + k, NUMERIC_SUBTYPE_JUDGMENTS[k] !== undefined);
});

function pjOrdinary(sld) {
  const sd = detectNumericSubtypeDetail(sld);
  const pi = detectPattern(sld);
  const pj = expertJudgment(sld, pi, /4/.test(sld), sd);
  return /普通品相/.test(pj.pattern_quality);
}

check('77 not ordinary', !pjOrdinary('77'));
check('77 subtype', detectNumericSubtypeDetail('77') === 'all_7_repeat_nn');
check('1234 not ordinary', !pjOrdinary('1234'));
check('1234 subtype', detectNumericSubtypeDetail('1234') === 'full_sequence_nnnn');
check('8888 not ordinary', !pjOrdinary('8888'));
check('8888 subtype', detectNumericSubtypeDetail('8888') === 'all_8_repeat_nnnn');

// stripJsonFences smoke
eval(extractFn('stripJsonFences'));
const fenced = '```json\n{"audit_score":1}\n```';
check('fence strip', JSON.parse(stripJsonFences(fenced)).audit_score === 1);

console.log(`\n--- ${pass} pass, ${fail} fail ---`);
process.exit(fail > 0 ? 1 : 0);