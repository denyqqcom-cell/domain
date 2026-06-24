#!/usr/bin/env node
/**
 * v6.5-R0f: Top Numeric Price Lens regression
 * Run: node test/r0f_top_numeric.js
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

function extract(name) {
  const m = html.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?^\\}`, 'm'));
  if (!m) throw new Error(`could not extract ${name}`);
  return m[0];
}

// Pull constants + helpers used by classifyAsset top-numeric branch
const detailConst = html.match(/const TOP_NUMERIC_SUBTYPE_DETAIL = \{[\s\S]*?\};/m);
const ratioConst = html.match(/const TOP_NUMERIC_MAX_RATIO = \d+;/m);
const clampFn = html.match(/function clampRangeWidth\(rangeStr, maxRatio\) \{[\s\S]*?^\}/m);
if (!detailConst || !ratioConst || !clampFn) { console.error('ERROR: missing R0f constants'); process.exit(1); }

const toVar = s => s.replace(/^const /gm, 'var ');
var TOP_NUMERIC_SUBTYPE_DETAIL, TOP_NUMERIC_MAX_RATIO, clampRangeWidth, detectTopNumericSubtypeDetail, detectNumericSubtype;
eval(toVar(detailConst[0]));
eval(toVar(ratioConst[0]));
eval(toVar(clampFn[0]));
eval(extract('detectTopNumericSubtypeDetail'));
eval(extract('detectNumericSubtype'));

const cases = [
  { sld: '88888', expect_detail: 'all_8_repeat',       expect_sub: 'premium_pattern', p1_low: 180000, p1_high: 450000 },
  { sld: '66666', expect_detail: 'all_lucky_repeat',   expect_sub: 'premium_pattern', p1_low: 80000,  p1_high: 240000 },
  { sld: '99999', expect_detail: 'all_lucky_repeat',   expect_sub: 'premium_pattern' },
  { sld: '08888', expect_detail: 'lead0_lucky_repeat', expect_sub: 'premium_pattern', p1_low: 40000,  p1_high: 120000 },
  { sld: '12345', expect_detail: null,                 expect_sub: 'premium_pattern' },
  { sld: '85111', expect_detail: null,                 expect_sub: 'premium_pattern' },
  { sld: '68888', expect_detail: null,                 expect_sub: 'premium_pattern' },
];

console.log('=== v6.5-R0f Top Numeric Price Lens ===\n');

let pass = 0, fail = 0;

for (const tc of cases) {
  const detail = detectTopNumericSubtypeDetail(tc.sld);
  const sub = detectNumericSubtype(tc.sld);
  const detailOk = detail === tc.expect_detail;
  const subOk = sub === tc.expect_sub;

  let priceOk = true;
  if (tc.expect_detail) {
    const lens = TOP_NUMERIC_SUBTYPE_DETAIL[tc.expect_detail];
    const p1 = clampRangeWidth(lens.p1, TOP_NUMERIC_MAX_RATIO);
    const m = p1.match(/\$?([\d,]+)\s*[–-]\s*\$?([\d,]+)/);
    if (!m) { priceOk = false; }
    else {
      const low = parseInt(m[1].replace(/,/g, ''), 10);
      const high = parseInt(m[2].replace(/,/g, ''), 10);
      if (tc.p1_low) priceOk = low === tc.p1_low && high === tc.p1_high;
      else priceOk = high / low <= TOP_NUMERIC_MAX_RATIO;
    }
  }

  const ok = detailOk && subOk && priceOk;
  const mark = ok ? '✅' : '🔴';
  console.log(`${mark} ${tc.sld.padEnd(6)} detail=${String(detail).padEnd(20)} sub=${sub.padEnd(17)} price=${priceOk ? 'ok' : 'FAIL'}`);
  if (ok) pass++; else fail++;
}

// 88888 vs ordinary 5N magnitude gap
const ordinaryP1 = '$5,000 – $25,000';
const topP1 = TOP_NUMERIC_SUBTYPE_DETAIL.all_8_repeat.p1;
const parseLow = s => parseInt(s.match(/\$?([\d,]+)/)[1].replace(/,/g, ''), 10);
const gap = parseLow(topP1) / parseLow(ordinaryP1);
console.log(`\n88888 P1 low / ordinary 5N P1 low = ${gap.toFixed(0)}× (expect ≥30×)`);
if (gap < 30) { console.log('🔴 Gap too small'); fail++; } else { pass++; }

console.log(`\n--- Summary: ${pass} pass, ${fail} fail ---`);
process.exit(fail > 0 ? 1 : 0);