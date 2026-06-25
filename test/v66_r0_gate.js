#!/usr/bin/env node
/**
 * v6.6-R0 / R0a product contract gates (source + runtime builders)
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
check('AI schema: source_url field', /source_url/.test(html));
check('AI schema: source_tier field', /source_tier/.test(html));
check('index: detectNumericSubtypeDetail', /function detectNumericSubtypeDetail/.test(html));
check('index: NUMERIC_SUBTYPE_JUDGMENTS', /NUMERIC_SUBTYPE_JUDGMENTS/.test(html));
check('index: anchorAssetClassForDomain', /function anchorAssetClassForDomain/.test(html));
check('index: v6.6-R0d version', /v6\.6-R0d/.test(html));
check('index: no 估值物料包 in hero', !/输入域名，生成可转发给 AI 的估值物料包/.test(html));
check('index: 生成专家估值 CTA', /生成专家估值/.test(html));

// ── Bootstrap runtime ──
const bootstrap = [
  ...(html.match(/const V65_ENABLE_[^;]+;/g) || []),
  sliceBetween('const EXPERTRULES = {', 'function matchRules'),
  sliceBetween('const ACTIVE_BRAND_BLACKLIST = {', 'const AI_VERIFY_PENDING_NOTE'),
  'const AI_VERIFY_PENDING_NOTE = ' + html.match(/const AI_VERIFY_PENDING_NOTE = '[^']+';/)[0].split('=').slice(1).join('='),
  sliceBetween('const ANCHORS = {', 'function classifyAsset'),
  html.match(/const NUMERIC_LEN_SUFFIX = \{[\s\S]*?^};/m)[0],
  html.match(/const NUMERIC_SUBTYPE_JUDGMENTS = \{[\s\S]*?\};/m)[0],
  extractFn('buildAnchorDisplayNote'),
  extractFn('formatAnchorDisplayPrice'),
  extractFn('buildAnchorDealsTable'),
  extractFn('parseDomain'),
  extractFn('detectNumericSubtypeDetail'),
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
  html.match(/const AUDITOR_TRANSACTION_GATE_RULES = \[[\s\S]*?\];/m)[0],
  html.match(/const LL_ABBREVIATION_HINTS = \{[\s\S]*?\};/m)[0],
  extractFn('confLevel'),
  extractFn('buildPriceTier'),
  extractFn('buildSystemValuation'),
  extractFn('buildAiAuditTasks'),
  extractFn('anchorAssetClassForDomain'),
  extractFn('pickComparableAnchors'),
  extractFn('buildNumericProfileTags'),
  extractFn('buildExpertOneLiner'),
  html.match(/const PINYIN_INITIAL_SLDS = new Set\(\[[\s\S]*?\]\);/m)[0],
  extractFn('buyerPersona'),
  extractFn('ruleHitsMatch'),
  extractFn('hasAiSemantic'),
  extractFn('hasWeb3Semantic'),
  extractFn('aiWeb3Personas'),
  extractFn('buildBuyerPersonas'),
  extractFn('buildTransactionContext'),
  extractFn('buildDdAuditTasks'),
  extractFn('isNumericPatternDomain'),
  extractFn('buildAssetClassJudgment'),
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

// ── Gate: 888.com (R0a blocker) ──
{
  const { asset, bundle } = analyzeDomain('888.com');
  const memo = bundle.memo;
  const pj = memo.expert_view.pattern_judgment;
  const anchors = memo.comparable_anchors.map(a => a.domain);
  check('888: asset_class NNN_COM', asset.id === 'NNN_COM');
  check('888: subtype_detail all_8_repeat_nnn', asset.subtypeDetail === 'all_8_repeat_nnn');
  check('888: tag AAA豹子号', memo.asset_profile.tags.includes('AAA豹子号'));
  check('888: tag 全8吉利号', memo.asset_profile.tags.includes('全8吉利号'));
  check('888: pattern not ordinary', !/普通品相/.test(JSON.stringify(pj)));
  check('888: no NFTs in anchors', !anchors.some(d => /nfts/i.test(d)));
  check('888: no cloud in anchors', !anchors.some(d => /cloud/i.test(d)));
  check('888: audit NNN_COM task', memo.ai_audit_tasks.some(t => /NNN_COM|AAA数字|888\.com/.test(t)));
  check('888: anchors allowed_for_audit', memo.comparable_anchors.every(a => a.allowed_for_audit === true));
  check('888: comparable >= 2 NNN', memo.comparable_anchors.length >= 2);
  check('888: no self-anchor', !anchors.some(d => /^888\.com$/i.test(d)));
}

// ── Gate: 100.com (MiMo anchor-path blocker) ──
{
  const { asset, bundle } = analyzeDomain('100.com');
  const pj = bundle.memo.expert_view.pattern_judgment;
  check('100: NNN_COM', asset.id === 'NNN_COM');
  check('100: subtype round_hundred_nnn', asset.subtypeDetail === 'round_hundred_nnn');
  check('100: pattern not ordinary', !/普通品相/.test(JSON.stringify(pj)));
}

// ── Gate: 777.com (MiMo 7豹子) ──
{
  const { asset, bundle } = analyzeDomain('777.com');
  const pj = bundle.memo.expert_view.pattern_judgment;
  check('777: subtype all_7_repeat_nnn', asset.subtypeDetail === 'all_7_repeat_nnn');
  check('777: pattern not ordinary', !/普通品相/.test(JSON.stringify(pj)));
}

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
}

// ── Gate: 88888.com ──
{
  const { asset, bundle } = analyzeDomain('88888.com');
  const p1 = bundle.valuation.price_lens.p1_investor_liquidity.range;
  const low = parseLow(p1);
  const high = parseLow(p1.split('–')[1] || p1.split('-')[1]);
  check('88888: all_8_repeat', asset.subtypeDetail === 'all_8_repeat');
  check('88888: P1 ~180K–450K', low >= 180000 && high <= 450000);
  check('88888: P3 strategic numeric', hasNumericPrice(bundle.valuation.price_lens.p3_strategic_enduser.range));
}

// ── Gate: hd.com ──
{
  const { asset, bundle } = analyzeDomain('hd.com');
  check('hd: LL_COM', asset.id === 'LL_COM');
  check('hd: P3 numeric', hasNumericPrice(bundle.valuation.price_lens.p3_strategic_enduser.range));
}

// ── Gate: text.com ──
{
  const { asset, bundle } = analyzeDomain('text.com');
  check('text: ULTRA_WORD_COM', asset.id === 'ULTRA_WORD_COM');
  check('text: audit 单词成交', bundle.memo.ai_audit_tasks.some(t => /单词/.test(t)));
}

console.log(`\n--- ${pass} pass, ${fail} fail ---`);
process.exit(fail > 0 ? 1 : 0);