#!/usr/bin/env node
/**
 * v6.6-R0d-hotfix2: Live Website Redirect Check gates (B2)
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

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
  html.match(/const LL_ABBREVIATION_HINTS = \{[\s\S]*?\};/m)[0],
  html.match(/const AUDITOR_FORBIDDEN_FIELDS = \[[\s\S]*?\];/m)[0],
  html.match(/const AUDITOR_ACTIONABLE_VERDICTS = \[[\s\S]*?\];/m)[0],
  html.match(/const AUDITOR_NON_ACTIONABLE_VERDICTS = \[[\s\S]*?\];/m)[0],
  html.match(/const AUDITOR_TRANSACTION_GATE_RULES = \[[\s\S]*?\];/m)[0],
  html.match(/const REDIRECT_ACTIVE_SITE_TYPES = new Set\(\[[\s\S]*?\]\);/m)[0],
  extractFn('isNumericPatternDomain'),
  extractFn('buildAssetClassJudgment'),
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
  extractFn('buildExpertMemo'),
  extractFn('buildAiAuditorBrief'),
  extractFn('buildAnalysisBundle'),
  html.match(/const AUDITOR_ENUM_ZH = \{[\s\S]*?\};/m)[0],
  extractFn('zhEnum'),
  extractFn('auditorDomainLabel'),
  extractFn('buildAuditorReportHeadline'),
  extractFn('formatAuditorProse'),
  extractFn('formatPriceAuditLine'),
  extractFn('formatEvidenceHuman'),
  extractFn('renderAuditorReportSections'),
  extractFn('validateAuditorJson'),
  extractFn('renderAuditorConclusion'),
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

const bnWebsiteCheck = {
  attempted: true,
  input_url: 'https://bn.com/',
  final_url: 'https://www.barnesandnoble.com/',
  redirect_detected: true,
  final_host: 'www.barnesandnoble.com',
  page_title_or_brand: 'Barnes & Noble',
  site_type: 'active_brand_site',
  for_sale_signal_found: false,
  evidence_source: 'live_website'
};

const bnTxActive = {
  website_status: 'active_operating_site',
  sale_status: 'not_verified_for_sale',
  acquisition_mode: 'website_or_business_acquisition',
  domain_only_price_actionable: false
};

check('index: v6.6-R0d-hotfix3', /v6\.6-R0d-hotfix3/.test(html));
check('index: website_check schema', /website_check/.test(html));
check('index: bn.com anchor', /'bn\.com':/.test(html));
check('index: Live website audit task', /Live website 核验/.test(html));
check('index: transaction_gate_rules', /transaction_gate_rules/.test(html));
check('index: class_reference_note schema', /class_reference_note/.test(html));
check('index: 仅品类参考 verdict', /仅品类参考/.test(html));
check('index: pending_live_check', /pending_live_check/.test(html));

function briefJson(domain) {
  const b = analyze(domain);
  return JSON.stringify(b.auditorBrief);
}

// P0: copyAuditorBrief contract — QQ.com
{
  const j = briefJson('qq.com');
  check('QQ brief: website_check', /website_check/.test(j));
  check('QQ brief: attempted field', /"attempted"/.test(j));
  check('QQ brief: final_url field', /"final_url"/.test(j));
  check('QQ brief: redirect_detected', /"redirect_detected"/.test(j));
  check('QQ brief: final_host', /"final_host"/.test(j));
  check('QQ brief: for_sale_signal_found', /"for_sale_signal_found"/.test(j));
  check('QQ brief: gate rule no check', /无 website_check\.attempted:true/.test(j));
  check('QQ brief: gate rule forbid 合理', /不得为偏低\/合理\/偏高/.test(j));
  check('QQ brief: transaction_gate_rules', /transaction_gate_rules/.test(j));
  check('QQ brief: default actionable false', /"domain_only_price_actionable"\s*:\s*false/.test(j));
  check('QQ brief: pending_live_check', /pending_live_check/.test(j));
  check('QQ brief: component valuation true', /"domain_only_component_valuation_available"\s*:\s*true/.test(j));
  const b = analyze('qq.com');
  const memo = JSON.stringify(b.memo);
  check('QQ memo: no 五数字 leak', !/五数字/.test(memo));
  check('QQ memo: no 4开头 leak', !/4开头/.test(memo));
  check('QQ memo: asset_class_judgment', /asset_class_judgment/.test(memo));
  check('QQ memo: pattern_judgment null', b.memo.expert_view.pattern_judgment === null);
  check('QQ memo: LL_COM quality', /两字母\.COM/.test(memo));
}

// P0: copyAuditorBrief contract — BN.com
{
  const j = briefJson('bn.com');
  check('BN brief: website_check', /website_check/.test(j));
  check('BN brief: gate rules', /transaction_gate_rules/.test(j));
  check('BN brief: domain_only false', /"domain_only_price_actionable"\s*:\s*false/.test(j));
}

// unknown + domain_only_price_actionable:true in AI output
{
  const v = validateAuditorJson({
    transaction_status: { website_status: 'unknown', sale_status: 'unknown', domain_only_price_actionable: true },
    dispute_check: { udrp_status: 'none_found', risk_level: 'low' },
    p1_verdict: '不可判定', p2_verdict: '不可判定', p3_verdict: '不可判定'
  });
  check('unknown + actionable:true → error', v.errors.some(e => /domain_only_price_actionable/.test(e)));
}

// BN.com — missing website_check
{
  const v = validateAuditorJson({
    transaction_status: { website_status: 'unknown', sale_status: 'unknown', domain_only_price_actionable: true },
    dispute_check: { udrp_status: 'none_found', risk_level: 'low' },
    p1_verdict: '合理', p2_verdict: '合理', p3_verdict: '合理'
  });
  check('BN: no website_check + verdict → error', v.errors.some(e => /website_check/.test(e)));
}

// BN.com — unknown + no website_check + actionable
{
  const v = validateAuditorJson({
    transaction_status: { website_status: 'unknown', sale_status: 'unknown', domain_only_price_actionable: true },
    dispute_check: { udrp_status: 'none_found', risk_level: 'low' },
    p1_verdict: '合理', p2_verdict: '合理'
  });
  check('BN: unknown + no check + 合理 → error', v.errors.length >= 1);
}

// redirect + domain_only_price_actionable:true
{
  const v = validateAuditorJson({
    website_check: bnWebsiteCheck,
    transaction_status: { website_status: 'unknown', sale_status: 'unknown', domain_only_price_actionable: true },
    dispute_check: { udrp_status: 'none_found', risk_level: 'low' },
    p1_verdict: '不可判定', p2_verdict: '不可判定', p3_verdict: '不可判定'
  });
  check('BN: redirect + actionable:true → error', v.errors.some(e => /domain_only_price_actionable/.test(e)));
}

// active + 合理
{
  const v = validateAuditorJson({
    website_check: bnWebsiteCheck,
    transaction_status: bnTxActive,
    dispute_check: { udrp_status: 'none_found', risk_level: 'low' },
    p1_verdict: '合理', p2_verdict: '合理', p3_verdict: '合理'
  });
  check('BN: active + 合理 → error', v.errors.some(e => /p1_verdict/.test(e)));
}

// active + 不可判定
{
  const v = validateAuditorJson({
    website_check: bnWebsiteCheck,
    transaction_status: bnTxActive,
    dispute_check: { udrp_status: 'none_found', risk_level: 'low' },
    p1_verdict: '不可判定', p2_verdict: '不可判定', p3_verdict: '不可判定',
    market_reality_check: 'BN.com 跳转 Barnes & Noble，domain-only 组件估值'
  });
  check('BN: active + 不可判定 → pass', v.errors.length === 0);
}

// active + 仅品类参考
{
  const v = validateAuditorJson({
    website_check: bnWebsiteCheck,
    transaction_status: bnTxActive,
    dispute_check: { udrp_status: 'none_found', risk_level: 'low' },
    p1_verdict: '仅品类参考', p2_verdict: '仅品类参考', p3_verdict: '不可判定',
    class_reference_note: 'LLL 品类估值可作组件参考，非可执行收购价'
  });
  check('BN: active + 仅品类参考 → pass', v.errors.length === 0);
}

// no website_check + 仅品类参考 → error
{
  const v = validateAuditorJson({
    transaction_status: { website_status: 'unknown', sale_status: 'unknown', domain_only_price_actionable: false },
    dispute_check: { udrp_status: 'none_found', risk_level: 'low' },
    p1_verdict: '仅品类参考', p2_verdict: '仅品类参考', p3_verdict: '不可判定'
  });
  check('no check + 仅品类参考 → error', v.errors.length >= 1);
}

// render redirect messaging
{
  const htmlOut = renderAuditorConclusion({
    website_check: bnWebsiteCheck,
    transaction_status: bnTxActive,
    dispute_check: { udrp_status: 'none_found', risk_level: 'low' },
    p1_verdict: '不可判定', p2_verdict: '不可判定', p3_verdict: '不可判定',
    confidence: 'medium'
  });
  check('BN render: 跳转', /跳转至/.test(htmlOut));
  check('BN render: domain-only', /domain-only 组件估值/.test(htmlOut));
  check('BN render: 非可执行收购价', /裸域名收购价不可执行|不具备裸域名|非可执行收购价/.test(htmlOut));
}

// system bn.com
{
  const b = analyze('bn.com');
  check('bn.com: active_operating_site', b.statusInfo.domain_status === 'active_operating_site');
  check('bn.com: acquirable false', b.acquirableInfo.acquirable === false);
  check('bn.com: domain_only false', b.memo.transaction_context.domain_only_price_actionable === false);
}

// system qq.com default context
{
  const b = analyze('qq.com');
  check('qq.com: LL_COM', b.valuation.asset_class === 'LL_COM');
  check('qq.com: default actionable false', b.memo.transaction_context.domain_only_price_actionable === false);
  check('qq.com: pending_live_check', b.memo.transaction_context.acquisition_mode === 'pending_live_check');
  check('qq.com: component valuation available', b.memo.transaction_context.domain_only_component_valuation_available === true);
}

// 8888 regression
{
  const b = analyze('8888.com');
  check('8888: no regression active', b.statusInfo.domain_status === 'active_operating_site');
  check('8888: acquirable false', b.acquirableInfo.acquirable === false);
}

// goka regression
{
  const b = analyze('goka.com');
  check('goka: active gate', b.statusInfo.domain_status === 'active_operating_site');
  check('goka: domain_only false', b.memo.transaction_context.domain_only_price_actionable === false);
}

// 55.csah unknown + warning path
{
  const b = analyze('55.csah');
  check('55.csah: not active', b.statusInfo.domain_status !== 'active_operating_site');
  check('55.csah: unknown', b.acquirableInfo.acquirable === 'unknown');
  const v = validateAuditorJson({
    transaction_status: { website_status: 'unknown', sale_status: 'unknown', domain_only_price_actionable: false },
    dispute_check: { udrp_status: 'unknown', risk_level: 'low' },
    p1_verdict: '不可判定', p2_verdict: '不可判定', p3_verdict: '不可判定'
  });
  check('55.csah JSON: 不可判定 no check → warn not fail', v.errors.length === 0 && v.warnings.some(w => /未完成网站核验/.test(w)));
}

// forbidden price fields
{
  const v = validateAuditorJson({ fair_value: 1, website_check: { attempted: true, input_url: 'https://x.com/' } });
  check('fair_value still fail', v.errors.some(e => /fair_value/.test(e)));
}

console.log(`\n--- ${pass} pass, ${fail} fail ---`);
process.exit(fail > 0 ? 1 : 0);