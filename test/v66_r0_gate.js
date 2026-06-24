#!/usr/bin/env node
/**
 * v6.6-R0 product contract gates (source + runtime builders)
 * Run: node test/v66_r0_gate.js
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
  if (!m) throw new Error(`missing ${name}`);
  return m[0];
}

function sliceBetween(startMarker, endMarker) {
  const s = html.indexOf(startMarker);
  const e = html.indexOf(endMarker, s);
  if (s < 0 || e < 0) throw new Error(`slice failed: ${startMarker}`);
  return html.slice(s, e);
}

function toVar(code) {
  return code.replace(/^const /gm, 'var ');
}

// ── Source contract gates ──
const gp = html.match(/function generatePack\([\s\S]*?^}/m)[0];
const auditorBriefBlock = html.match(/function buildAiAuditorBrief\([\s\S]*?^}/m)[0];
check('generatePack: no 估值顾问', !/你是专业域名估值顾问/.test(gp));
check('generatePack: deny-list only investor_floor_usd', !/(?<!禁止字段：price_range, )investor_floor_usd/.test(gp));
check('generatePack: AI Auditor Brief present', /AI Auditor Brief/.test(gp));
check('buildAiAuditorBrief: 复核员 not 估值员', /不是重新估值员/.test(auditorBriefBlock));

check('index: buildSystemValuation exists', /function buildSystemValuation/.test(html));
check('index: buildExpertMemo exists', /function buildExpertMemo/.test(html));
check('index: buildAiAuditorBrief exists', /function buildAiAuditorBrief/.test(html));
check('index: dual-panel UI', /id="dualPanel"/.test(html));
check('index: TOP_NUMERIC_STRATEGIC_P3', /TOP_NUMERIC_STRATEGIC_P3/.test(html));
check('index: CLASS_STRATEGIC_P3', /CLASS_STRATEGIC_P3/.test(html));
check('index: v6.6-R0 version', /v6\.6-R0/.test(html));
check('classifyAsset: top numeric P3 numeric', /TOP_NUMERIC_STRATEGIC_P3\[subDetail\]/.test(html));
check('make(): no bare 需人工复核 override', !/finalP3 = p3ManualReview/.test(html));
check('clampRangeWidth: no 需人工复核 output', !/需人工复核/.test(extractFn('clampRangeWidth')));

// ── Bootstrap runtime ──
const bootstrap = [
  ...(html.match(/const V65_ENABLE_[^;]+;/g) || []),
  sliceBetween('const EXPERTRULES = {', 'function matchRules'),
  sliceBetween('const ACTIVE_BRAND_BLACKLIST = {', 'function resolveDomainStatus'),
  sliceBetween('const ANCHORS = {', 'function classifyAsset'),
  extractFn('buildAnchorDisplayNote'),
  extractFn('formatAnchorDisplayPrice'),
  extractFn('buildAnchorDealsTable'),
  extractFn('parseDomain'),
  extractFn('detectTopNumericSubtypeDetail'),
  extractFn('detectNumericSubtype'),
  extractFn('fmtAnchor'),
  extractFn('applyAnchorFloorGuard'),
  extractFn('detectAssetClassId'),
  extractFn('clampRangeWidth'),
  extractFn('p3ManualReview'),
  extractFn('classifyAsset'),
  extractFn('detectPattern'),
  extractFn('expertJudgment'),
  extractFn('matchRules'),
  extractFn('resolveDomainStatus'),
  extractFn('resolveAcquirable'),
  extractFn('score6D'),
  extractFn('getRisks'),
  extractFn('getIndustries'),
  extractFn('getConfidence'),
  html.match(/const AI_AUDITOR_OUTPUT_SCHEMA = \{[\s\S]*?\};/m)[0],
  html.match(/const LL_ABBREVIATION_HINTS = \{[\s\S]*?\};/m)[0],
  extractFn('confLevel'),
  extractFn('buildPriceTier'),
  extractFn('buildSystemValuation'),
  extractFn('buildAiAuditTasks'),
  extractFn('pickComparableAnchors'),
  extractFn('buildExpertOneLiner'),
  extractFn('buildExpertMemo'),
  extractFn('buildAiAuditorBrief'),
  extractFn('buildAnalysisBundle'),
].join('\n');

eval(toVar(bootstrap));

function hasNumericPrice(s) {
  return typeof s === 'string' && /\$[\d,]+/.test(s) && !/需人工复核/.test(s);
}

function parseLow(s) {
  const m = (s || '').match(/\$?([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function analyzeDomain(domain) {
  const parsed = parseDomain(domain);
  const asset = classifyAsset(parsed.sld, parsed.tld, parsed.full);
  const scores = score6D(parsed.sld, parsed.tld, asset);
  const conf = getConfidence(asset);
  const risks = getRisks(parsed.sld, parsed.tld, asset, parsed.full);
  const industries = getIndustries(parsed.sld);
  const bundle = buildAnalysisBundle(parsed, asset, scores, conf, risks, industries);
  return { parsed, asset, scores, bundle };
}

// ── Auditor smoke ──
const brief = buildAiAuditorBrief({
  domain: '41235.COM',
  asset_profile: { asset_class: 'NNNNN_COM', tags: ['含4'] },
  expert_view: { one_liner: 'test' },
  system_valuation: { p1: {}, p2: {}, p3: {} },
  ai_audit_tasks: ['含4五数字']
});
check('auditor: not re-valuator', brief.instruction.includes('不是重新估值员'));
check('auditor: no price_range in schema', !JSON.stringify(brief.output_schema).includes('price_range'));
check('auditor: has audit_score', brief.output_schema.audit_score !== undefined);
check('auditor schema: no investor_floor_usd', !JSON.stringify(brief.output_schema).includes('investor_floor_usd'));

// ── Gate: 41235.com ──
{
  const { asset, bundle } = analyzeDomain('41235.com');
  const pl = bundle.valuation.price_lens;
  const memo = bundle.memo;
  check('41235: P1 numeric', hasNumericPrice(pl.p1_investor_liquidity.range));
  check('41235: P2 numeric', hasNumericPrice(pl.p2_listing_negotiation.range));
  check('41235: P3 numeric', hasNumericPrice(pl.p3_strategic_enduser.range));
  check('41235: asset NNNNN_COM', asset.id === 'NNNNN_COM');
  check('41235: tag 含4', memo.asset_profile.tags.includes('含4'));
  check('41235: tag 4开头', memo.asset_profile.tags.includes('4开头'));
  check('41235: audit 含4五数字', memo.ai_audit_tasks.some(t => /含4五数字/.test(t)));
  check('41235: audit 41235终端', memo.ai_audit_tasks.some(t => /41235/.test(t)));
  check('41235: price rows zero 需人工复核',
    ![asset.p1, asset.p2, asset.p3, pl.p1_investor_liquidity.range, pl.p2_listing_negotiation.range, pl.p3_strategic_enduser.range]
      .some(s => /需人工复核/.test(s || '')));
}

// ── Gate: 88888.com ──
{
  const { asset, bundle } = analyzeDomain('88888.com');
  const p1 = bundle.valuation.price_lens.p1_investor_liquidity.range;
  const p3 = bundle.valuation.price_lens.p3_strategic_enduser.range;
  const low = parseLow(p1);
  const high = parseLow(p1.split('–')[1] || p1.split('-')[1]);
  check('88888: all_8_repeat', asset.subtypeDetail === 'all_8_repeat');
  check('88888: P1 ~180K–450K', low >= 180000 && high <= 450000);
  check('88888: P3 strategic numeric', hasNumericPrice(p3));
  check('88888: audit $245K', bundle.memo.ai_audit_tasks.some(t => /245K|88888\.com/.test(t)));
}

// ── Gate: hd.com ──
{
  const { asset, bundle } = analyzeDomain('hd.com');
  const memo = bundle.memo;
  const p3 = bundle.valuation.price_lens.p3_strategic_enduser.range;
  check('hd: LL_COM', asset.id === 'LL_COM');
  check('hd: abbreviation hints', memo.asset_profile.tags.some(t => /Health Data|Hotel|Hardware/.test(t)));
  check('hd: P3 strategic numeric', hasNumericPrice(p3));
  check('hd: audit 两字母', memo.ai_audit_tasks.some(t => /两字母/.test(t)));
}

// ── Gate: text.com ──
{
  const { asset, bundle } = analyzeDomain('text.com');
  const memo = bundle.memo;
  check('text: ULTRA_WORD_COM', asset.id === 'ULTRA_WORD_COM');
  check('text: audit 单词成交', memo.ai_audit_tasks.some(t => /单词/.test(t) && /成交/.test(t)));
  check('text: P1/P2/P3 numeric',
    hasNumericPrice(asset.p1) && hasNumericPrice(asset.p2) && hasNumericPrice(asset.p3));
}

const topP3 = html.match(/all_8_repeat: '([^']+)'/);
check('88888 P3 strategic constant', topP3 && /\$600,000/.test(topP3[1]));

console.log(`\n--- ${pass} pass, ${fail} fail ---`);
process.exit(fail > 0 ? 1 : 0);