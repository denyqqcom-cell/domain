#!/usr/bin/env node
/**
 * v6.6-R0c Transaction & Legal DD gates
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

const bootstrap = [
  ...(html.match(/const V65_ENABLE_[^;]+;/g) || []),
  sliceBetween('const EXPERTRULES = {', 'function matchRules'),
  sliceBetween('const ACTIVE_BRAND_BLACKLIST = {', 'const AI_VERIFY_PENDING_NOTE'),
  'const AI_VERIFY_PENDING_NOTE = ' + html.match(/const AI_VERIFY_PENDING_NOTE = '[^']+';/)[0].split('=').slice(1).join('='),
  sliceBetween('const ANCHORS = {', 'function classifyAsset'),
  html.match(/const NUMERIC_LEN_SUFFIX = \{[\s\S]*?^};/m)[0],
  html.match(/const NUMERIC_SUBTYPE_JUDGMENTS = \{[\s\S]*?\};/m)[0],
  html.match(/const AI_AUDITOR_OUTPUT_SCHEMA = \{[\s\S]*?\};/m)[0],
  html.match(/const AUDITOR_TRANSACTION_GATE_RULES = \[[\s\S]*?\];/m)[0],
  html.match(/const PINYIN_INITIAL_SLDS = new Set\(\[[\s\S]*?\]\);/m)[0],
  html.match(/const LL_ABBREVIATION_HINTS = \{[\s\S]*?\};/m)[0],
  extractFn('parseDomain'),
  extractFn('detectNumericSubtypeDetail'),
  extractFn('detectAssetClassId'),
  extractFn('classifyAsset'),
  extractFn('detectPattern'),
  extractFn('expertJudgment'),
  extractFn('matchRules'),
  extractFn('resolveDomainStatus'),
  extractFn('resolveAcquirable'),
  extractFn('score6D'),
  extractFn('getRisks'),
  extractFn('getConfidence'),
  extractFn('getIndustries'),
  extractFn('confLevel'),
  extractFn('buildPriceTier'),
  extractFn('buildTransactionContext'),
  extractFn('buildDdAuditTasks'),
  extractFn('buildSystemValuation'),
  extractFn('buildAiAuditTasks'),
  extractFn('anchorAssetClassForDomain'),
  extractFn('pickComparableAnchors'),
  extractFn('buildNumericProfileTags'),
  extractFn('buildExpertOneLiner'),
  extractFn('buyerPersona'),
  extractFn('ruleHitsMatch'),
  extractFn('hasAiSemantic'),
  extractFn('hasWeb3Semantic'),
  extractFn('aiWeb3Personas'),
  extractFn('buildBuyerPersonas'),
  extractFn('isNumericPatternDomain'),
  extractFn('buildAssetClassJudgment'),
  extractFn('buildExpertMemo'),
  extractFn('buildAiAuditorBrief'),
  extractFn('buildAnalysisBundle'),
].join('\n').replace(/^const /gm, 'var ');

eval(bootstrap);

function analyze(domain) {
  const parsed = parseDomain(domain);
  const asset = classifyAsset(parsed.sld, parsed.tld, parsed.full);
  const scores = score6D(parsed.sld, parsed.tld, asset);
  const conf = getConfidence(asset);
  const risks = getRisks(parsed.sld, parsed.tld, asset, parsed.full);
  return buildAnalysisBundle(parsed, asset, scores, conf, risks, getIndustries(parsed.sld));
}

check('index: v6.6-R0d', /v6\.6-R0d/.test(html));
check('index: no 价格口径 card', !/card-label">价格口径/.test(html));
check('index: 系统专家三档估值', /系统专家三档估值/.test(html));
check('index: AI_AUDITOR_JSON_v2', /AI_AUDITOR_JSON_v2/.test(html));
check('index: transaction_status schema', /transaction_status/.test(html));
check('index: dispute_check schema', /dispute_check/.test(html));
check('index: applyAuditorJson', /function applyAuditorJson/.test(html));
check('index: renderAuditorConclusion', /function renderAuditorConclusion/.test(html));
check('schema: 不可判定 verdict', /不可判定/.test(html));
check('schema: website_evidence tier', /website_evidence/.test(html));

{
  const b = analyze('goka.com');
  const tx = b.memo.transaction_context;
  const anchors = b.memo.comparable_anchors.map(a => a.domain);
  check('goka: active_operating_site', b.statusInfo.domain_status === 'active_operating_site');
  check('goka: acquirable false', b.acquirableInfo.acquirable === false);
  check('goka: domain_only not actionable', tx.domain_only_price_actionable === false);
  check('goka: no self comparable', !anchors.some(d => /goka\.com/i.test(d)));
  check('goka: dd audit tasks', b.memo.ai_audit_tasks.some(t => /UDRP|website_status/i.test(t)));
}

{
  const b = analyze('888.com');
  check('888: still NNN', b.memo.asset_profile.asset_class === 'NNN_COM');
  check('888: P1 numeric', /\$/.test(b.valuation.price_lens.p1_investor_liquidity.range));
}

console.log(`\n--- ${pass} pass, ${fail} fail ---`);
process.exit(fail > 0 ? 1 : 0);