#!/usr/bin/env node
/**
 * v6.6-R0d-hotfix3: Human-readable AI Audit Report Renderer gates (B3)
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
  html.match(/const AUDITOR_ACTIONABLE_VERDICTS = \[[\s\S]*?\];/m)[0],
  html.match(/const AUDITOR_NON_ACTIONABLE_VERDICTS = \[[\s\S]*?\];/m)[0],
  html.match(/const REDIRECT_ACTIVE_SITE_TYPES = new Set\(\[[\s\S]*?\]\);/m)[0],
  html.match(/const AUDITOR_ENUM_ZH = \{[\s\S]*?\};/m)[0],
  html.match(/const AUDITOR_RAW_ENUM_FORBIDDEN = \[[\s\S]*?\];/m)[0],
  html.match(/const AUDITOR_FORBIDDEN_FIELDS = \[[\s\S]*?\];/m)[0],
  extractFn('hostFromUrl'),
  extractFn('hasAnyAuditorVerdict'),
  extractFn('isRedirectActiveBrandSite'),
  extractFn('isAuditorTransactionGate'),
  extractFn('zhEnum'),
  extractFn('auditorDomainLabel'),
  extractFn('buildAuditorReportHeadline'),
  extractFn('formatAuditorProse'),
  extractFn('formatPriceAuditLine'),
  extractFn('formatEvidenceHuman'),
  extractFn('renderAuditorReportSections'),
  extractFn('renderAuditorConclusion'),
  extractFn('validateAuditorJson'),
].join('\n').replace(/^const /gm, 'var ');

eval(bootstrap);

const FORBIDDEN_VISIBLE = [
  'active_operating_site', 'not_verified_for_sale', 'website_or_business_acquisition',
  'source_tier', 'verified_status', 'unverified_claim'
];

const qqAuditor = {
  schema_version: 'AI_AUDITOR_JSON_v2',
  website_check: {
    attempted: true,
    input_url: 'https://qq.com/',
    final_url: 'https://www.qq.com/',
    redirect_detected: true,
    final_host: 'www.qq.com',
    page_title_or_brand: '腾讯 QQ / QQ.com',
    site_type: 'active_brand_site',
    for_sale_signal_found: false,
    evidence_source: 'live_website'
  },
  transaction_status: {
    website_status: 'active_operating_site',
    sale_status: 'not_verified_for_sale',
    acquisition_mode: 'website_or_business_acquisition',
    domain_only_price_actionable: false
  },
  dispute_check: {
    udrp_status: 'none_found',
    risk_level: 'high',
    trademark_conflict: 'likely'
  },
  audit_score: 28,
  p1_verdict: '仅品类参考',
  p2_verdict: '仅品类参考',
  p3_verdict: '不可判定',
  class_reference_note: '系统 LL_COM 品类估值可作为域名组件参考，但 QQ.com 已绑定腾讯核心品牌，不能作为可执行裸域收购价。',
  market_reality_check: 'QQ.com 为腾讯核心品牌运营站点，未发现公开出售状态，实际交易应视为品牌/业务级收购尽调。',
  correction_suggestion: '①保留系统估值作 LL_COM 组件参考；②P1/P2/P3 不再展示为可购买价格；③补充商标与品牌权利核验。',
  top_evidence: [{
    domain: 'qq.com',
    price: 'n/a',
    source: '腾讯官方网站',
    source_url: 'https://www.qq.com/',
    source_tier: 'website_evidence',
    verified_status: 'verified',
    relevance: '证实为运营品牌站点，无公开出售迹象'
  }],
  confidence: 'medium'
};

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
check('index: renderAuditorReportSections', /function renderAuditorReportSections/.test(html));
check('index: AUDITOR_ENUM_ZH', /AUDITOR_ENUM_ZH/.test(html));

const qqHtml = renderAuditorConclusion(qqAuditor);
check('QQ render: AI 联网复核结论', /AI 联网复核结论/.test(qqHtml));
check('QQ render: 不具备裸域名可执行收购价', /不具备裸域名可执行收购价/.test(qqHtml));
check('QQ render: 一、交易状态', /一、交易状态/.test(qqHtml));
check('QQ render: 二、三档价格审计', /二、三档价格审计/.test(qqHtml));
check('QQ render: 三、核心原因', /三、核心原因/.test(qqHtml));
check('QQ render: 四、品类参考', /四、品类参考/.test(qqHtml));
check('QQ render: 五、修正建议', /五、修正建议/.test(qqHtml));
check('QQ render: 六、关键证据', /六、关键证据/.test(qqHtml));
check('QQ render: 运营中的品牌站点', /运营中的品牌站点/.test(qqHtml));
check('QQ render: 未发现公开出售状态', /未发现公开出售状态/.test(qqHtml));
check('QQ render: 网站 \/ 品牌 \/ 业务收购', /网站 \/ 品牌 \/ 业务收购/.test(qqHtml));
check('QQ render: 裸域名收购价不可执行', /裸域名收购价不可执行/.test(qqHtml));
check('QQ render: 仅品类参考', /仅品类参考/.test(qqHtml));
FORBIDDEN_VISIBLE.forEach(e => {
  check('QQ render: no raw ' + e, !qqHtml.includes(e));
});

// numbered list in correction_suggestion
check('QQ render: ① list split', /<ol class="ar-list">/.test(qqHtml) && /①/.test(qqHtml));

// BN B2 regression
{
  const bnHtml = renderAuditorConclusion({
    website_check: bnWebsiteCheck,
    transaction_status: bnTxActive,
    dispute_check: { udrp_status: 'none_found', risk_level: 'low' },
    p1_verdict: '不可判定', p2_verdict: '不可判定', p3_verdict: '不可判定',
    confidence: 'medium'
  });
  check('BN render: 跳转', /跳转/.test(bnHtml));
  check('BN render: domain-only', /domain-only|组件估值/.test(bnHtml));
  check('BN render: 裸域名收购价不可执行', /裸域名收购价不可执行|不具备裸域名/.test(bnHtml));
  FORBIDDEN_VISIBLE.forEach(e => {
    check('BN render: no raw ' + e, !bnHtml.includes(e));
  });
}

// validator regression
{
  const v = validateAuditorJson({
    website_check: bnWebsiteCheck,
    transaction_status: bnTxActive,
    dispute_check: { udrp_status: 'none_found', risk_level: 'low' },
    p1_verdict: '仅品类参考', p2_verdict: '仅品类参考', p3_verdict: '不可判定',
    class_reference_note: '品类参考'
  });
  check('B2+ validator: active + 仅品类参考 pass', v.errors.length === 0);
}

console.log(`\n--- ${pass} pass, ${fail} fail ---`);
process.exit(fail > 0 ? 1 : 0);