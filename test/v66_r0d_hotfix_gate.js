#!/usr/bin/env node
/**
 * v6.6-R0d-hotfix: Active Site Semantic Guard gates
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
  html.match(/const LL_ABBREVIATION_HINTS = \{[\s\S]*?\};/m)[0],
  html.match(/const AUDITOR_FORBIDDEN_FIELDS = \[[\s\S]*?\];/m)[0],
  html.match(/const AUDITOR_ACTIONABLE_VERDICTS = \[[\s\S]*?\];/m)[0],
  html.match(/const AUDITOR_NON_ACTIONABLE_VERDICTS = \[[\s\S]*?\];/m)[0],
  html.match(/const REDIRECT_ACTIVE_SITE_TYPES = new Set\(\[[\s\S]*?\]\);/m)[0],
  extractFn('hostFromUrl'),
  extractFn('hasAnyAuditorVerdict'),
  extractFn('isRedirectActiveBrandSite'),
  extractFn('isAuditorTransactionGate'),
  extractFn('formatAuditorVerdict'),
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
  extractFn('validateAuditorJson'),
  extractFn('renderAuditorConclusion'),
].join('\n').replace(/^const /gm, 'var ');

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

eval(bootstrap);

function analyze(domain) {
  const parsed = parseDomain(domain);
  const asset = classifyAsset(parsed.sld, parsed.tld, parsed.full);
  const scores = score6D(parsed.sld, parsed.tld, asset);
  const conf = getConfidence(asset);
  const risks = getRisks(parsed.sld, parsed.tld, asset, parsed.full);
  return buildAnalysisBundle(parsed, asset, scores, conf, risks, getIndustries(parsed.sld));
}

const FORBIDDEN_USER_COPY = [
  '需人工确认',
  '人工确认是否可收购',
  '未核验持有人状态，需人工确认是否可收购',
];

FORBIDDEN_USER_COPY.forEach(phrase => {
  check('forbidden copy absent: ' + phrase, !html.includes(phrase));
});

check('index: v6.6-R0d-hotfix2', /v6\.6-R0d-hotfix2/.test(html));
check('index: isAuditorTransactionGate', /function isAuditorTransactionGate/.test(html));
check('index: ac-gate-card CSS', /\.ac-gate-card/.test(html));
check('index: 8888.com anchor', /'8888\.com':/.test(html));
check('index: AI_VERIFY_PENDING_NOTE', /AI核验项：建站状态、出售状态、持有人与可转移性待联网核验/.test(html));

{
  const b = analyze('8888.com');
  const note = b.acquirableInfo.acquirable_note || '';
  const tx = b.memo.transaction_context;
  check('8888: active_operating_site', b.statusInfo.domain_status === 'active_operating_site');
  check('8888: acquirable false', b.acquirableInfo.acquirable === false);
  check('8888: no 需人工确认', !/需人工确认/.test(note));
  check('8888: domain_only not actionable', tx.domain_only_price_actionable === false);
  check('8888: audit tasks mention domain-only', b.memo.ai_audit_tasks.some(t => /domain-only|建站|出售/i.test(t)));
  check('8888: NNNN_COM class', b.memo.asset_profile.asset_class === 'NNNN_COM');
}

{
  const b = analyze('goka.com');
  check('goka: gate not regressed', b.statusInfo.domain_status === 'active_operating_site');
  check('goka: acquirable false', b.acquirableInfo.acquirable === false);
  check('goka: domain_only not actionable', b.memo.transaction_context.domain_only_price_actionable === false);
}

{
  const b = analyze('55.csah');
  check('55.csah: not active site', b.statusInfo.domain_status !== 'active_operating_site');
  check('55.csah: unknown acquirable', b.acquirableInfo.acquirable === 'unknown');
  check('55.csah: AI verify note', /AI核验项/.test(b.acquirableInfo.acquirable_note || ''));
}

const wcStub = {
  attempted: true,
  input_url: 'https://8888.com/',
  final_url: 'https://8888.com/',
  redirect_detected: false,
  final_host: '8888.com',
  site_type: 'active_operating_site',
  for_sale_signal_found: false,
  evidence_source: 'live_website'
};

const badJson = {
  website_check: wcStub,
  transaction_status: {
    website_status: 'active_operating_site',
    sale_status: 'not_verified_for_sale',
    acquisition_mode: 'website_or_business_acquisition',
    domain_only_price_actionable: false
  },
  dispute_check: { udrp_status: 'none_found', risk_level: 'low' },
  p1_verdict: '偏低',
  p2_verdict: '合理',
  p3_verdict: '合理'
};

const goodJson = {
  ...badJson,
  p1_verdict: '不可判定',
  p2_verdict: '不可判定',
  p3_verdict: '不可判定'
};

const missingTxJson = {
  dispute_check: { udrp_status: 'unknown', risk_level: 'low' }
};

{
  const vBad = validateAuditorJson(badJson);
  check('validator: active+偏低 → error', vBad.errors.some(e => /p1_verdict/.test(e)));
  check('validator: active gate multiple errors', vBad.errors.length >= 2);
}

{
  const vGood = validateAuditorJson(goodJson);
  check('validator: active+不可判定 → pass', vGood.errors.length === 0);
}

{
  const vMiss = validateAuditorJson(missingTxJson);
  check('validator: missing tx → warning not fail', vMiss.errors.length === 0 && vMiss.warnings.some(w => /transaction_status/.test(w)));
}

{
  const vPrice = validateAuditorJson({ suggested_price: 100, p1_verdict: '合理' });
  check('validator: suggested_price still fail', vPrice.errors.some(e => /suggested_price/.test(e)));
}

{
  const htmlOut = renderAuditorConclusion(goodJson);
  check('render: gate card', /交易门禁/.test(htmlOut));
  check('render: domain-only hint', /域名组件估值/.test(htmlOut));
  check('render: 不可判定 shown', /不可判定/.test(htmlOut));
}

console.log(`\n--- ${pass} pass, ${fail} fail ---`);
process.exit(fail > 0 ? 1 : 0);