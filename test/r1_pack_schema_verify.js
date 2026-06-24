#!/usr/bin/env node
/**
 * v6.5-R1-pack-schema: pricing_evidence 结构化字段回归
 * Run: node test/r1_pack_schema_verify.js
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

function extract(name) {
  const m = html.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?^\\}`, 'm'));
  if (!m) throw new Error(`missing ${name}`);
  return m[0];
}

const switches = html.match(/const V65_ENABLE_[A-Z_]+ = (true|false);/g) || [];
var V65_ENABLE_HAS4_PENALTY, V65_ENABLE_EXPERT_SCORE_MODIFIERS;
switches.forEach(s => eval(s));

eval(extract('detectPattern'));
eval(extract('expertJudgment'));
eval(extract('buildPackPricingEvidence'));

const cases = [
  {
    sld: '41235',
    expect: { has4_discount_evidence: 'insufficient', verified_comparable_used: false, leading_four: true, auto_pricing_allowed: false }
  },
  {
    sld: '56789',
    expect: { has4_discount_evidence: 'not_applicable', verified_comparable_used: false, leading_four: false, pattern_ui: 'full_sequence' }
  },
  {
    sld: '12345',
    expect: { has4_discount_evidence: 'insufficient', has4_present: true, pattern_ui: 'full_sequence' }
  },
  {
    sld: '88888',
    expect: { has4_discount_evidence: 'not_applicable', verified_comparable_used: false, pattern_ui: 'repeat' }
  },
];

console.log('=== v6.5-R1-pack-schema pricing_evidence ===\n');
let pass = 0, fail = 0;

for (const tc of cases) {
  const pi = detectPattern(tc.sld);
  const has4 = pi.hasFour;
  const asset = { pricingMethod: tc.sld === '88888' ? 'top_numeric_price_lens' : 'static_class', anchorMeta: null };
  const ev = buildPackPricingEvidence(tc.sld, pi, has4, asset);
  const pj = expertJudgment(tc.sld, pi, has4);

  let ok = true;
  for (const [k, v] of Object.entries(tc.expect)) {
    if (ev[k] !== v) { ok = false; console.log(`  ${tc.sld} ${k}: got ${ev[k]}, want ${v}`); }
  }
  if ('pricing_effect' in pj || 'auto_pricing_allowed' in pj) {
    ok = false;
    console.log(`  ${tc.sld} pattern_judgment must not contain machine fields`);
  }
  if (ev.source_url_v3_coverage !== 0 || ev.pricing_effect !== 'manual_review_only') ok = false;

  console.log(`${ok ? '✅' : '🔴'} ${tc.sld.padEnd(6)} evidence=${JSON.stringify(ev)}`);
  if (ok) pass++; else fail++;
}

console.log(`\n--- ${pass} pass, ${fail} fail ---`);
process.exit(fail > 0 ? 1 : 0);