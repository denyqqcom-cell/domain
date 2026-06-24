#!/usr/bin/env node
/**
 * v6.5-R1-hotfix 文案回归 — 仅验证 3 处 expertJudgment 文案
 * Run: node test/r1_hotfix_verify.js
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

const fn = html.match(/function expertJudgment\(sld, patternInfo, has4(?:, subtypeDetail)?\) \{[\s\S]*?^\}/m);
if (!fn) { console.error('ERROR: expertJudgment not found'); process.exit(1); }

const detectFn = html.match(/function detectPattern\(sld\) \{[\s\S]*?^\}/m);
eval(detectFn[0]);
eval(fn[0]);

const FORBIDDEN = [/30-60%/, /30%.*60%/, /含4正确抵扣/, /正确抵扣/];
const EXPECT = {
  has4_generic: '系统折价假设已计入三档价格',
  full_seq_bias: '若含4则强信号与风险并存，系统仅在评分预览中做规则抵扣，不代表真实成交折价',
  ordinary_leading4: '4开头+普通结构在中文市场接受度较弱，系统折价假设已计入',
};

let pass = 0, fail = 0;

function check(label, ok, detail) {
  const mark = ok ? '✅' : '🔴';
  console.log(`${mark} ${label}${detail ? ' — ' + detail : ''}`);
  if (ok) pass++; else fail++;
}

// Global forbidden scan in expertJudgment block only
for (const re of FORBIDDEN) {
  check(`forbidden ${re}`, !re.test(fn[0]), re.test(fn[0]) ? 'FOUND in expertJudgment' : 'absent');
}

// Case: 41235 — has4 + ordinary + leading4
{
  const pi = detectPattern('41235');
  const j = expertJudgment('41235', pi, true);
  check('41235 has4_annotation', j.has4_annotation && j.has4_annotation.includes(EXPECT.has4_generic));
  check('41235 ordinary leading4', j.relative_position.includes(EXPECT.ordinary_leading4));
}

// Case: 12345 — full_sequence, no has4
{
  const pi = detectPattern('12345');
  const j = expertJudgment('12345', pi, false);
  check('12345 no has4_annotation', j.has4_annotation === null);
  check('12345 full_sequence bias', j.cn_market_bias.includes(EXPECT.full_seq_bias));
}

// Case: hypothetical 41234 would be full_sequence+has4 — bias text is in template
{
  const j = expertJudgment('41234', { pattern: 'full_sequence' }, true);
  check('full_sequence+has4 bias', j.cn_market_bias.includes(EXPECT.full_seq_bias));
  check('full_sequence+has4 annotation', j.has4_annotation && j.has4_annotation.includes(EXPECT.has4_generic));
}

console.log(`\n--- ${pass} pass, ${fail} fail ---`);
process.exit(fail > 0 ? 1 : 0);