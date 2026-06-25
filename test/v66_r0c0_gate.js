#!/usr/bin/env node
/**
 * v6.6-R0c-0 Buyer Persona Taxonomy gates
 * Run: node test/v66_r0c0_gate.js
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

const boot = [
  ...(html.match(/const V65_ENABLE_[^;]+;/g) || []),
  sliceBetween('const EXPERTRULES = {', 'function matchRules'),
  sliceBetween('const PINYIN_INITIAL_SLDS', 'function buyerPersona'),
  html.match(/const PINYIN_INITIAL_SLDS = new Set\(\[[\s\S]*?\]\);/m)[0],
  extractFn('buyerPersona'),
  extractFn('ruleHitsMatch'),
  extractFn('hasAiSemantic'),
  extractFn('hasWeb3Semantic'),
  extractFn('aiWeb3Personas'),
  extractFn('buildBuyerPersonas'),
  extractFn('matchRules'),
  extractFn('detectPattern'),
  extractFn('parseDomain'),
  sliceBetween('const ANCHORS = {', 'function classifyAsset'),
  extractFn('detectAssetClassId'),
  extractFn('classifyAsset'),
].join('\n').replace(/^const /gm, 'var ');

eval(boot);

const FORBIDDEN = [/中文域名/, /中国域名投资人/, /全球品牌终端(?!\/)/, /中文域名收藏家/];

function analyze(domain) {
  const parsed = parseDomain(domain);
  const asset = classifyAsset(parsed.sld, parsed.tld, parsed.full);
  const hits = matchRules(parsed.sld, asset.id);
  const personas = buildBuyerPersonas(parsed.sld, asset, hits);
  return { asset, personas, hits, memoLabels: personas.map(p => p.label).join('|') };
}

check('index: v6.6-R0d', /v6\.6-R0d/.test(html));
check('index: L2 chip 拼音声母', /L2 拼音声母/.test(html));
check('index: L2 dev 拼音声母识别层', /L2: 拼音声母识别层/.test(html));
check('index: no L2 中文域名识别层 dev comment', !/L2: 中文域名识别层/.test(html));
check('index: medium-high fit in UI', /medium-high/.test(html) && /中高适配/.test(html));
check('index: no infer 中文域名收藏家 in buildBuyerPersonas', !/中文域名收藏家/.test(extractFn('buildBuyerPersonas')));
check('index: 全球缩写/品牌终端', /全球缩写\/品牌终端/.test(html));

// VJN.COM
{
  const { asset, personas } = analyze('vjn.com');
  const blob = JSON.stringify(personas);
  check('vjn: LLL_COM', asset.id === 'LLL_COM');
  FORBIDDEN.forEach(re => check('vjn: forbidden ' + re, !re.test(blob)));
  check('vjn: 三字母短域投资人', personas.some(p => p.label === '三字母短域投资人' && p.fit === 'high'));
  check('vjn: 华语短字母 medium-high', personas.some(p => p.label === '华语市场短字母投资人' && p.fit === 'medium-high'));
  check('vjn: 域名经纪 medium-high', personas.some(p => p.label === '域名经纪/交易商' && p.fit === 'medium-high'));
  check('vjn: 全球缩写/品牌终端 + audit', personas.some(p => /全球缩写/.test(p.label) && /trademark/i.test(p.ai_audit_task)));
  check('vjn: AI low', personas.some(p => p.label === 'AI创业公司' && p.fit === 'low'));
  check('vjn: Web3 low', personas.some(p => p.label === 'Web3/加密项目' && p.fit === 'low'));
  check('vjn: has price_impact', personas.every(p => p.price_impact));
}

// GOKA.COM
{
  const { personas } = analyze('goka.com');
  check('goka: no 中文域名', !/中文域名/.test(JSON.stringify(personas)));
  check('goka: 可发音四字母', personas.some(p => /可发音/.test(p.label)));
}

// TEXT.COM
{
  const { asset, personas } = analyze('text.com');
  check('text: ULTRA_WORD', asset.id === 'ULTRA_WORD_COM');
  check('text: 全球单词品牌', personas.some(p => /全球单词/.test(p.label)));
  check('text: no 全球品牌终端 bare', !personas.some(p => p.label === '全球品牌终端'));
}

// 888.COM
{
  const { personas } = analyze('888.com');
  check('888: 华语市场数字', personas.some(p => /华语市场数字/.test(p.label)));
  check('888: no 中文域名', !/中文域名/.test(JSON.stringify(personas)));
}

// 41235.COM
{
  const { personas } = analyze('41235.com');
  check('41235: no 中文域名', !/中文域名/.test(JSON.stringify(personas)));
  check('41235: 数字投资人', personas.some(p => /数字域名投资人/.test(p.label)));
}

console.log(`\n--- ${pass} pass, ${fail} fail ---`);
process.exit(fail > 0 ? 1 : 0);