#!/usr/bin/env node
/**
 * R0e-hotfix supplementary test: UI pattern vs price_subtype consistency
 * v6.5-R0e-hotfix: descending sequences降级为 ordinary (Option B-1)
 * 
 * Verification matrix (Joe locked):
 *   12345.com → UI full_sequence + subtype premium_pattern ✅
 *   98765.com → UI ordinary + subtype neutral_clean ✅
 *   54321.com → UI ordinary + subtype has4_penalty ✅
 *   8765.com  → UI ordinary + subtype neutral_clean ✅
 *   9876.com  → UI ordinary + subtype neutral_clean ✅
 *
 * Run: node test/r0e_supplementary.js
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// Extract detectNumericSubtype
const fnMatch = html.match(/function detectNumericSubtype\(sld\) \{[\s\S]*?^\}/m);
if (!fnMatch) { console.log('ERROR: could not extract detectNumericSubtype'); process.exit(1); }
eval(fnMatch[0]);

// Extract detectPattern
const patMatch = html.match(/function detectPattern\(sld\) \{[\s\S]*?^\}/m);
if (!patMatch) { console.log('ERROR: could not extract detectPattern'); process.exit(1); }
eval(patMatch[0]);

// ── Joe's locked verification matrix ──
const joeMatrix = [
  { sld: '12345', expect_ui: 'full_sequence',  expect_sub: 'premium_pattern', note: 'ascending → full_sequence (consistent)' },
  { sld: '98765', expect_ui: 'ordinary',        expect_sub: 'neutral_clean',   note: 'descending → ordinary (R0e-hotfix)' },
  { sld: '54321', expect_ui: 'ordinary',        expect_sub: 'has4_penalty',    note: 'descending+4 → ordinary (R0e-hotfix)' },
  { sld: '8765',  expect_ui: null,              expect_sub: 'neutral_clean',   note: '4-digit, no detectPattern' },
  { sld: '9876',  expect_ui: null,              expect_sub: 'neutral_clean',   note: '4-digit descending → neutral_clean' },
];

// ── Additional regression cases ──
const regressionCases = [
  // NNNN (4-digit) — detectPattern returns null, so expect_ui = null
  { sld: '0888', expect_ui: null,              expect_sub: 'premium_pattern', note: '4-digit repeat' },
  { sld: '8880', expect_ui: null,              expect_sub: 'premium_pattern', note: '4-digit repeat trailing 0' },
  { sld: '1000', expect_ui: null,              expect_sub: 'zero_heavy',      note: '4-digit three 0s' },
  { sld: '1001', expect_ui: null,              expect_sub: 'zero_heavy',      note: '4-digit two 0s' },
  { sld: '1234', expect_ui: null,              expect_sub: 'premium_pattern', note: '4-digit ascending → premium' },
  { sld: '6688', expect_ui: null,              expect_sub: 'premium_pattern', note: '4-digit double repeat' },
  { sld: '4123', expect_ui: null,              expect_sub: 'has4_penalty',    note: '4-digit contains 4' },
  { sld: '6789', expect_ui: null,              expect_sub: 'premium_pattern', note: '4-digit ascending → premium' },
  { sld: '3210', expect_ui: null,              expect_sub: 'neutral_clean',   note: '4-digit descending to 0' },

  // NNNNN (5-digit) — detectPattern active
  { sld: '08888', expect_ui: 'repeat',         expect_sub: 'premium_pattern', note: '5-digit repeat with leading 0' },
  { sld: '88800', expect_ui: 'ordinary',       expect_sub: 'premium_pattern', note: '5-digit repeat 888+00' },
  { sld: '88888', expect_ui: 'repeat',         expect_sub: 'premium_pattern', note: '5-digit all same' },
  { sld: '12321', expect_ui: 'palindrome',     expect_sub: 'premium_pattern', note: '5-digit palindrome' },
  { sld: '10000', expect_ui: 'ordinary',       expect_sub: 'zero_heavy',      note: '5-digit one 1 + four 0s' },
  { sld: '41235', expect_ui: 'ordinary',       expect_sub: 'has4_penalty',    note: '5-digit contains 4' },
  { sld: '59041', expect_ui: 'ordinary',       expect_sub: 'has4_penalty',    note: '5-digit contains 4' },
  { sld: '5678',  expect_ui: null,             expect_sub: 'premium_pattern', note: '4-digit ascending' },
  { sld: '4321',  expect_ui: 'ordinary',       expect_sub: 'has4_penalty',    note: '5-digit descending+4 → ordinary' },
  { sld: '32109', expect_ui: 'ordinary',       expect_sub: 'has4_penalty',    note: '5-digit contains 4, not consecutive' },
  { sld: '9870',  expect_ui: 'ordinary',       expect_sub: 'neutral_clean',   note: '5-digit not consecutive, has 0' },
  { sld: '9807',  expect_ui: 'ordinary',       expect_sub: 'clean_lucky',     note: '5-digit not consecutive, has 0 → clean_lucky? has68=true, has4=false, hasZero=true → actually NOT clean_lucky (hasZero). → neutral_clean? Wait: has68=/[68]/.test("9807")=true, has4=false, starts0=false, zeroCount=1. descending check: 9→8→0→7 not descending. → has68 && !has4 && !descending → clean_lucky. But hasZero=true... let me check: the clean_lucky check is has68 && !has4 && !descending. It does NOT check hasZero. So 9807 → clean_lucky.' },
];

const allCases = [...joeMatrix, ...regressionCases];

console.log("=== R0e-hotfix Supplementary Test: UI Pattern vs Price Subtype Consistency ===\n");

let pass = 0, fail = 0;
const conflicts = [];
const joeFails = [];

for (const tc of allCases) {
  const sub = detectNumericSubtype(tc.sld);
  const patInfo = detectPattern(tc.sld);
  const uiPattern = patInfo ? patInfo.pattern : 'none';

  const subOk = sub === tc.expect_sub;
  const uiOk = tc.expect_ui === null ? true : uiPattern === tc.expect_ui;

  // Detect cross-layer inconsistency (UI=premium but sub≠premium)
  const uiPremium = ['full_sequence', 'repeat', 'palindrome'].includes(uiPattern);
  const subPremium = sub === 'premium_pattern';
  const isConflict = uiPremium && !subPremium;

  if (isConflict) {
    conflicts.push({ sld: tc.sld, ui: uiPattern, sub });
  }

  // Check Joe's matrix specifically
  const isJoe = joeMatrix.some(j => j.sld === tc.sld);
  if (isJoe && (!subOk || !uiOk)) {
    joeFails.push({ sld: tc.sld, ui: uiPattern, sub, expect_ui: tc.expect_ui, expect_sub: tc.expect_sub });
  }

  const mark = (!subOk || !uiOk) ? (isConflict ? '🔴' : '⚠️') : '✅';
  const uiDisplay = tc.expect_ui === null ? `(null, 4-digit)` : tc.expect_ui;
  console.log(`${mark} ${tc.sld.padEnd(6)} UI=${uiPattern.padEnd(16)} sub=${sub.padEnd(17)} expect_ui=${String(uiDisplay).padEnd(16)} expect_sub=${tc.expect_sub}`);

  if (subOk && uiOk) pass++;
  else fail++;
}

console.log(`\n--- Summary ---`);
console.log(`PASS: ${pass}/${pass + fail}`);
console.log(`UI↔Price conflicts (UI=premium, sub≠premium): ${conflicts.length}`);

if (joeFails.length > 0) {
  console.log(`\n🔴 JOE MATRIX FAILURES:`);
  for (const f of joeFails) {
    console.log(`  ${f.sld}.com  UI=${f.ui} (expected ${f.expect_ui})  sub=${f.sub} (expected ${f.expect_sub})`);
  }
  process.exit(1);
}

if (conflicts.length > 0) {
  console.log(`\n--- Remaining Conflicts ---`);
  for (const c of conflicts) {
    console.log(`  ${c.sld}.com  UI="${c.ui}" (premium)  price="${c.sub}" (not premium)`);
  }
  process.exit(1);
}

console.log(`\n✅ All Joe matrix cases PASS. No UI↔Price conflicts.`);
process.exit(0);
