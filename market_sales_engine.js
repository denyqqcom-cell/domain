/**
 * market_sales_engine.js — v6.4.1 Comparable Sales Engine
 * 
 * 三层定价路径：ANCHORS（精确匹配） → COMPARABLE_ANCHORS（类别聚合） → static_class（类别地板）
 * 
 * 8 个核心函数：
 *   1. classifyMixed(sld)                     — MIXED_2C_COM vs MIXED_SHORT_COM 分类
 *   2. loadComparableAnchors()                 — 加载 comparable_anchors 数据库
 *   3. findComparableSales(assetClassId, sld)  — 按类别查找可比成交
 *   4. scoreComparableSimilarity(target, sample)— 计算相似度（阈值 ≥0.55）
 *   5. computeComparableAggregate(samples)      — 修剪均值聚合 + P1/P2/P3 区间
 *   6. determinePricingMethod(asset, compResult)— 三层决策定价方式
 *   7. applyMixedMarketAdjustments(pricing, sld)— 区域/数字文化调整
 *   8. resolveMixedPricing(sld, tld, full)      — 混合域名端到端定价
 * 
 * 依赖：需在加载本文件前已定义 ANCHORS、SCORE_FLOOR_MAP、CLASS_P1/P2/P3_FLOOR、
 *       applyAnchorFloorGuard、detectAssetClassId、parseDomain 等基础函数。
 * 
 * @version  v6.4.1
 * @date     2026-06-23
 * @status   STAGING — 骨架代码，数据就绪后激活
 */

// ============================================================================
//  Function 1: classifyMixed(sld)
//  MIXED_2C_COM (2字符混合) vs MIXED_SHORT_COM (3-4字符混合) 拆分
// ============================================================================

/**
 * 将混合域名（字母+数字）按长度拆分为两个类别
 * 
 * @param {string} sld — 二级域名（已 lowercase）
 * @returns {string|null} — 'MIXED_2C_COM' | 'MIXED_SHORT_COM' | null（非混合域名）
 * 
 * 规则：
 *   - 2 字符 + 含字母和数字 → MIXED_2C_COM
 *   - 3-4 字符 + 含字母和数字 → MIXED_SHORT_COM
 *   - 5+ 字符或纯字母/纯数字 → null（由上游 classifyAsset 处理）
 * 
 * 边界保护：纯数字（62.com）和纯字母（aa.com）已在 detectAssetClassId 中
 * 提前返回，不会进入本函数。本函数仅处理已判定为混合的域名。
 */
function classifyMixed(sld) {
  const len = sld.length;
  const hasDigit = /[0-9]/.test(sld);
  const hasLetter = /[a-z]/.test(sld);
  
  // 必须是混合域名
  if (!hasDigit || !hasLetter) return null;
  
  // 2 字符混合 → MIXED_2C_COM（新类别，v6.4.1 引入）
  if (len === 2) return 'MIXED_2C_COM';
  
  // 3-4 字符混合 → MIXED_SHORT_COM（v6.4 原有类别，范围限缩）
  if (len >= 3 && len <= 4) return 'MIXED_SHORT_COM';
  
  // 5+ 字符混合 → 不在此引擎处理范围
  return null;
}


// ============================================================================
//  Function 2: loadComparableAnchors()
//  加载 comparable_anchors 数据库（JSON 或内联后备）
// ============================================================================

/**
 * 默认 COMPARABLE_ANCHORS 内联后备数据（v6.4.1 骨架）
 * 
 * 数据结构：
 *   domain:      域名
 *   price:       成交价 USD
 *   assetClass:  资产类别
 *   role:        'comparable_reference' | 'context_only'
 *   verified:    'V1' | 'V2' | 'V3'
 *   year:        成交年份（unknown 表示缺失）
 *   source:      来源平台
 *   direction:   'LN' | 'NL'（字母-数字顺序）
 *   digit_culture: 'lucky_8' | 'lucky_6' | 'lucky_9' | 'neutral' | 'taboo_4'
 *   letter_quality: 'premium' | 'good' | 'neutral' | 'weak' | 'poor'
 */
const DEFAULT_COMPARABLE_ANCHORS = {
  // ── MIXED_2C_COM comparable_reference（6 条可参与定价）──
  '8t.com': {
    price: 76000, assetClass: 'MIXED_2C_COM', role: 'comparable_reference',
    verified: 'V1', year: 'unknown', source: 'unknown',
    direction: 'NL', digit_culture: 'lucky_8', letter_quality: 'good'
  },
  'q4.com': {
    price: 53000, assetClass: 'MIXED_2C_COM', role: 'comparable_reference',
    verified: 'V1', year: 'unknown', source: 'unknown',
    direction: 'LN', digit_culture: 'taboo_4', letter_quality: 'poor'
  },
  'o5.com': {
    price: 56000, assetClass: 'MIXED_2C_COM', role: 'comparable_reference',
    verified: 'V1', year: 'unknown', source: 'unknown',
    direction: 'LN', digit_culture: 'neutral', letter_quality: 'weak'
  },
  '9j.com': {
    price: 56000, assetClass: 'MIXED_2C_COM', role: 'comparable_reference',
    verified: 'V1', year: 'unknown', source: 'unknown',
    direction: 'NL', digit_culture: 'lucky_9', letter_quality: 'neutral'
  },
  'l6.com': {
    price: 52000, assetClass: 'MIXED_2C_COM', role: 'comparable_reference',
    verified: 'V1', year: 'unknown', source: 'unknown',
    direction: 'LN', digit_culture: 'lucky_6', letter_quality: 'weak'
  },
  '6k.com': {
    price: 48000, assetClass: 'MIXED_2C_COM', role: 'comparable_reference',
    verified: 'V1', year: 'unknown', source: 'unknown',
    direction: 'NL', digit_culture: 'lucky_6', letter_quality: 'neutral'
  },
  
  // ── MIXED_2C_COM context_only（2 条不参与定价，仅定性参考）──
  '1m.com': {
    price: 104000, assetClass: 'MIXED_2C_COM', role: 'context_only',
    verified: 'V1', year: 'unknown', source: 'unknown',
    direction: 'LN', digit_culture: 'neutral', letter_quality: 'premium',
    context_note: '品牌对标："1M"=One Million/1MORE，价格显著高于可比群均值 1.82×，不参与可比聚合'
  },
  'v8.com': {
    price: 274000, assetClass: 'MIXED_2C_COM', role: 'context_only',
    verified: 'V1', year: 'unknown', source: 'unknown',
    direction: 'NL', digit_culture: 'lucky_8', letter_quality: 'premium',
    context_note: '极端离群值：v=VIP/victory + 8=发，双重极品组合，价格 4.8× 可比均值，不参与可比聚合'
  }
};

/**
 * 外部数据加载标志 — 若 data/comparable_anchors.json 存在且加载成功则覆盖 DEFAULT
 */
let _comparableAnchorsLoaded = false;
let _comparableAnchors = null;

/**
 * 加载 comparable_anchors 数据
 * 
 * 优先级：外部 JSON > 内联 DEFAULT_COMPARABLE_ANCHORS
 * 若外部 JSON 加载失败（文件不存在/解析错误），自动回退到 DEFAULT
 * 
 * @returns {object} — comparable_anchors 数据对象
 */
function loadComparableAnchors() {
  if (_comparableAnchorsLoaded) return _comparableAnchors;
  
  // TODO v6.5: fetch('data/comparable_anchors.json')
  // 当前阶段使用内联 DEFAULT 作为骨架
  _comparableAnchors = DEFAULT_COMPARABLE_ANCHORS;
  _comparableAnchorsLoaded = true;
  
  return _comparableAnchors;
}


// ============================================================================
//  Function 3: findComparableSales(assetClassId, sld)
//  按资产类别查找可比成交记录
// ============================================================================

/**
 * 查找指定类别内的可比成交
 * 
 * @param {string} assetClassId — 资产类别（如 'MIXED_2C_COM'）
 * @param {string} sld           — 目标域名的 SLD（用于排除自身）
 * @returns {object}             — { samples: [], contextOnly: [], count: n, usable: boolean }
 * 
 * 过滤规则：
 *   1. 仅筛选 role='comparable_reference' 的样本
 *   2. 排除目标域名自身
 *   3. role='context_only' 的样本单独返回，不参与聚合
 *   4. 若样本 < 2 条 → usable=false，回退 static_class
 */
function findComparableSales(assetClassId, sld) {
  const allAnchors = loadComparableAnchors();
  const samples = [];
  const contextOnly = [];
  
  for (const [domain, entry] of Object.entries(allAnchors)) {
    // 仅匹配同类
    if (entry.assetClass !== assetClassId) continue;
    
    // 排除目标域名自身
    if (domain === sld + '.com') continue;
    
    if (entry.role === 'comparable_reference') {
      samples.push({
        domain,
        price: entry.price,
        verified: entry.verified,
        year: entry.year,
        source: entry.source,
        direction: entry.direction,
        digit_culture: entry.digit_culture,
        letter_quality: entry.letter_quality
      });
    } else if (entry.role === 'context_only') {
      contextOnly.push({
        domain,
        price: entry.price,
        context_note: entry.context_note || null
      });
    }
  }
  
  return {
    samples,
    contextOnly,
    count: samples.length,
    usable: samples.length >= 2  // ≥2 条才触发 comparable_anchor 路径
  };
}


// ============================================================================
//  Function 4: scoreComparableSimilarity(target, sample)
//  计算目标域名与可比样本的相似度（0.0–1.0）
// ============================================================================

/**
 * 计算相似度分数
 * 
 * 维度权重（MIXED_2C_COM）：
 *   - 方向匹配 (LN vs NL):  0.30
 *   - 数字文化匹配:          0.30
 *   - 字母质量匹配:          0.25
 *   - 长度匹配（均为2C）:    0.15
 * 
 * @param {object} target — { direction, digit_culture, letter_quality, length }
 * @param {object} sample — { direction, digit_culture, letter_quality }
 * @returns {number}      — 0.0–1.0 相似度分数
 * 
 * 阈值 ≥0.55：低于此值的样本不参与聚合
 */
function scoreComparableSimilarity(target, sample) {
  let score = 0;
  
  // 方向匹配（LN vs NL）：权重 0.30
  if (target.direction === sample.direction) {
    score += 0.30;
  }
  
  // 数字文化匹配：权重 0.30（四级梯度）
  const digitGradient = {
    'lucky_8': 4, 'lucky_6': 3, 'lucky_9': 3,
    'neutral': 2, 'taboo_4': 1
  };
  const tDigit = digitGradient[target.digit_culture] || 2;
  const sDigit = digitGradient[sample.digit_culture] || 2;
  const digitDiff = Math.abs(tDigit - sDigit);
  if (digitDiff === 0) score += 0.30;
  else if (digitDiff === 1) score += 0.22;
  else if (digitDiff === 2) score += 0.12;
  else score += 0.04;
  
  // 字母质量匹配：权重 0.25（三级梯度）
  const letterGradient = {
    'premium': 4, 'good': 3, 'neutral': 2, 'weak': 1, 'poor': 0
  };
  const tLetter = letterGradient[target.letter_quality] || 2;
  const sLetter = letterGradient[sample.letter_quality] || 2;
  const letterDiff = Math.abs(tLetter - sLetter);
  if (letterDiff === 0) score += 0.25;
  else if (letterDiff === 1) score += 0.18;
  else if (letterDiff === 2) score += 0.10;
  else score += 0.03;
  
  // 长度匹配（MIXED_2C_COM 均为 2 字符）：权重 0.15
  score += 0.15;  // 同类长度，满分
  
  return score;
}

/**
 * 快速判定目标域名的特征标签
 * 
 * @param {string} sld — SLD（已 lowercase）
 * @returns {object}   — { direction, digit_culture, letter_quality, length }
 */
function computeTargetFeatures(sld) {
  const len = sld.length;
  const firstChar = sld[0];
  const secondChar = sld[1];
  
  // 方向
  const direction = /[0-9]/.test(firstChar) ? 'NL' : 'LN';
  
  // 数字文化
  const digit = /[0-9]/.test(firstChar) ? firstChar : secondChar;
  const digitCultureMap = {
    '8': 'lucky_8', '6': 'lucky_6', '9': 'lucky_9',
    '4': 'taboo_4'
  };
  const digit_culture = digitCultureMap[digit] || 'neutral';
  
  // 字母质量
  const letter = /[a-z]/.test(firstChar) ? firstChar : secondChar;
  const premiumLetters = ['a', 'b', 'c', 'd', 'e', 'i', 'm', 'p', 'v', 't'];
  const goodLetters = ['f', 'g', 'h', 'n', 'r', 's', 'w'];
  const poorLetters = ['q', 'x', 'z'];
  let letter_quality = 'neutral';
  if (premiumLetters.includes(letter)) letter_quality = 'premium';
  else if (goodLetters.includes(letter)) letter_quality = 'good';
  else if (poorLetters.includes(letter)) letter_quality = 'poor';
  
  return { direction, digit_culture, letter_quality, length: len };
}


// ============================================================================
//  Function 5: computeComparableAggregate(samples)
//  修剪均值聚合 → P1/P2/P3 区间
// ============================================================================

/**
 * 从可比成交样本计算聚合价格区间
 * 
 * 算法：
 *   1. 按相似度排序（scoreComparableSimilarity ≥ 0.55 过滤）
 *   2. 修剪均值：去掉最低价和最高价（n ≥ 4 时）
 *   3. 修剪均值 → P1 中位锚点
 *   4. P1 = [trimmed_mean × 0.85, trimmed_mean × 1.50]
 *   5. P2 = [trimmed_mean × 1.20, trimmed_mean × 3.00]
 *   6. P3 = [trimmed_mean × 2.00, +∞)
 *   7. 各类地板保护（不低于 CLASS_P1/P2/P3_FLOOR）
 * 
 * @param {Array}  samples          — 可比样本列表（已过滤相似度）
 * @param {string} assetClassId     — 资产类别，用于地板保护
 * @returns {object}                — { method, p1Low, p1High, p2Low, p2High, p3Low, 
 *                                     sampleCount, trimmedMean, note }
 */
function computeComparableAggregate(samples, assetClassId) {
  const n = samples.length;
  
  // 样本不足
  if (n < 2) {
    return {
      method: 'insufficient_data',
      sampleCount: n,
      note: `可比样本不足（${n}条 < 2条），回退 static_class`
    };
  }
  
  // 提取价格并排序
  const prices = samples.map(s => s.price).sort((a, b) => a - b);
  
  // 修剪均值：n ≥ 4 时去掉最低和最高
  let trimmedPrices;
  let trimNote = '';
  if (n >= 4) {
    trimmedPrices = prices.slice(1, -1);
    trimNote = `（修剪均值，去掉最低 $${prices[0].toLocaleString()} 和最高 $${prices[prices.length-1].toLocaleString()}，n=${trimmedPrices.length}）`;
  } else {
    trimmedPrices = prices;
    trimNote = `（全样本均值，n=${n}）`;
  }
  
  // 修剪均值
  const trimmedMean = trimmedPrices.reduce((a, b) => a + b, 0) / trimmedPrices.length;
  
  // P1/P2/P3 区间
  let p1Low  = Math.round(trimmedMean * 0.85);
  let p1High = Math.round(trimmedMean * 1.50);
  let p2Low  = Math.round(trimmedMean * 1.20);
  let p2High = Math.round(trimmedMean * 3.00);
  let p3Low  = Math.round(trimmedMean * 2.00);
  
  // 类别地板保护
  const p1Floor = CLASS_P1_FLOOR[assetClassId] || 0;
  const p2Floor = CLASS_P2_FLOOR[assetClassId] || 0;
  const p3Floor = CLASS_P3_FLOOR[assetClassId] || 0;
  
  let method = 'comparable_anchor';
  let guardNote = '';
  
  if (p1High < p1Floor) {
    // 可比均值远低于类别地板 → class_floor_guarded
    method = 'class_floor_guarded';
    guardNote = `可比成交修剪均值 $${Math.round(trimmedMean).toLocaleString()} 低于 ${assetClassId} 类别地板 P1 $${p1Floor.toLocaleString()}，已启用类别地板保护`;
    p1Low = p1Floor;
    p1High = Math.round(p1Floor * 2.5);
    p2Low = p2Floor;
    p2High = Math.round(p2Floor * 2.5);
    p3Low = p3Floor;
  } else {
    // 正常可比定价 + 地板保护
    p1Low = Math.max(p1Low, p1Floor);
    p2Low = Math.max(p2Low, p2Floor);
    p3Low = Math.max(p3Low, p3Floor);
    
    if (p1Low > p1Floor || p2Low > p2Floor || p3Low > p3Floor) {
      guardNote = `P1/P2/P3 下界已受类别地板保护`;
    }
  }
  
  return {
    method,
    p1Low, p1High,
    p2Low, p2High,
    p3Low,
    sampleCount: n,
    trimmedMean: Math.round(trimmedMean),
    trimNote,
    guardNote
  };
}


// ============================================================================
//  Function 6: determinePricingMethod(asset, comparableResult)
//  三层决策：ANCHORS → COMPARABLE_ANCHORS → static_class
// ============================================================================

/**
 * 三层定价决策
 * 
 * 优先级：
 *   Layer 1: ANCHORS 精确匹配     → anchor_based / anchor_floor_adjusted
 *   Layer 2: COMPARABLE_ANCHORS    → comparable_anchor（≥2条样本且修剪均值≥地板）
 *   Layer 3: static_class          → 类别静态区间（始终可达，永不失效）
 * 
 * @param {object} asset          — classifyAsset 返回的资产对象
 * @param {object} comparableResult— findComparableSales 返回的结果
 * @returns {object}               — { method, pricing, rationale }
 */
function determinePricingMethod(asset, comparableResult) {
  // Layer 1: ANCHORS 精确匹配优先（已在 classifyAsset 中处理）
  if (asset.pricingMethod && asset.pricingMethod !== 'static_class') {
    return {
      method: asset.pricingMethod,
      pricing: {
        p1: asset.p1, p2: asset.p2, p3: asset.p3
      },
      rationale: 'ANCHORS 精确匹配定价'
    };
  }
  
  // Layer 2: COMPARABLE_ANCHORS（v6.5-R0: V65_ENABLE_COMPARABLE_ANCHOR_PRICING 门禁）
  if (typeof V65_ENABLE_COMPARABLE_ANCHOR_PRICING !== 'undefined' && V65_ENABLE_COMPARABLE_ANCHOR_PRICING && comparableResult && comparableResult.usable) {
    return {
      method: 'comparable_anchor',
      pricing: {
        p1Low: comparableResult.p1Low,
        p1High: comparableResult.p1High,
        p2Low: comparableResult.p2Low,
        p2High: comparableResult.p2High,
        p3Low: comparableResult.p3Low
      },
      sampleCount: comparableResult.sampleCount,
      trimmedMean: comparableResult.trimmedMean,
      rationale: `可比成交聚合定价（${comparableResult.sampleCount}条样本${comparableResult.trimNote || ''}）`
    };
  }
  
  // Layer 3: static_class（安全网，始终可达）
  return {
    method: 'static_class',
    pricing: {
      p1Low: CLASS_P1_FLOOR[asset.id] || 0,
      p2Low: CLASS_P2_FLOOR[asset.id] || 0,
      p3Low: CLASS_P3_FLOOR[asset.id] || 0
    },
    rationale: comparableResult
      ? `可比样本不足（${comparableResult.samples.length}条），回退静态类别定价`
      : '无 COMPARABLE_ANCHORS 数据，回退静态类别定价'
  };
}


// ============================================================================
//  Function 7: applyMixedMarketAdjustments(pricing, sld)
//  区域/数字文化/字母质量调整
// ============================================================================

/**
 * 对 MIXED_2C_COM 定价应用市场调整因子
 * 
 * 调整维度（乘法器）：
 *   - 数字文化：8 → 1.30×, 6/9 → 1.08×, 4 → 0.85×, 中性 → 1.00×
 *   - 字母质量：premium → 1.12×, good → 1.05×, poor → 0.90×
 *   - 方向（LN/NL）：无显著溢价（6 条样本中不可靠），不应用调整
 * 
 * @param {object} pricing — { p1Low, p1High, p2Low, p2High, p3Low }
 * @param {string} sld     — SLD（已 lowercase）
 * @returns {object}       — 调整后的 pricing + adjustment_note
 */
function applyMixedMarketAdjustments(pricing, sld) {
  const features = computeTargetFeatures(sld);
  let multiplier = 1.0;
  const adjustments = [];
  
  // 数字文化调整
  const digitMultipliers = {
    'lucky_8': 1.30,
    'lucky_6': 1.08,
    'lucky_9': 1.08,
    'neutral': 1.00,
    'taboo_4': 0.85
  };
  const digitMul = digitMultipliers[features.digit_culture] || 1.00;
  if (digitMul !== 1.00) {
    multiplier *= digitMul;
    adjustments.push(`数字文化(${features.digit_culture}) ×${digitMul.toFixed(2)}`);
  }
  
  // 字母质量调整
  const letterMultipliers = {
    'premium': 1.12,
    'good': 1.05,
    'neutral': 1.00,
    'weak': 0.97,
    'poor': 0.90
  };
  const letterMul = letterMultipliers[features.letter_quality] || 1.00;
  if (letterMul !== 1.00) {
    multiplier *= letterMul;
    adjustments.push(`字母质量(${features.letter_quality}) ×${letterMul.toFixed(2)}`);
  }
  
  // 无调整时直接返回
  if (Math.abs(multiplier - 1.0) < 0.001) {
    return { ...pricing, adjustment_note: null };
  }
  
  return {
    p1Low:  Math.round(pricing.p1Low  * multiplier),
    p1High: Math.round(pricing.p1High * multiplier),
    p2Low:  Math.round(pricing.p2Low  * multiplier),
    p2High: Math.round(pricing.p2High * multiplier),
    p3Low:  Math.round(pricing.p3Low  * multiplier),
    adjustment_note: `已应用市场调整因子：${adjustments.join('；')}，综合乘数 ×${multiplier.toFixed(2)}`
  };
}


// ============================================================================
//  Function 8: resolveMixedPricing(sld, tld, full)
//  混合域名端到端定价（classify → find → determine → adjust）
// ============================================================================

/**
 * 混合域名完整定价路径
 * 
 * 流程：
 *   1. classifyMixed(sld)           — 确定 MIXED_2C_COM 还是 MIXED_SHORT_COM
 *   2. findComparableSales(cls, sld)— 查找同类可比成交
 *   3. scoreComparableSimilarity    — 过滤低相似度样本（≥0.55）
 *   4. computeComparableAggregate   — 修剪均值聚合
 *   5. determinePricingMethod       — 三层决策
 *   6. applyMixedMarketAdjustments  — 市场调整
 * 
 * @param {string} sld  — SLD（已 lowercase）
 * @param {string} tld  — TLD
 * @param {string} full — 完整域名（用于 ANCHORS 查询）
 * @returns {object}     — 完整定价结果
 * 
 * 回退保障：任何环节失败都回退到 static_class，确保永不报错
 */
function resolveMixedPricing(sld, tld, full) {
  try {
    // Step 1: 分类
    const mixedClass = classifyMixed(sld);
    if (!mixedClass) {
      return {
        method: 'not_mixed',
        note: '非混合域名，由 classifyAsset 处理'
      };
    }
    
    // Step 2: 查找可比成交
    const comparableResult = findComparableSales(mixedClass, sld);
    
    // Step 3: 相似度过滤（仅 MIXED_2C_COM 做精细过滤）
    let filteredSamples = comparableResult.samples;
    if (mixedClass === 'MIXED_2C_COM' && comparableResult.samples.length > 0) {
      const targetFeatures = computeTargetFeatures(sld);
      filteredSamples = comparableResult.samples
        .map(s => ({
          ...s,
          similarity: scoreComparableSimilarity(targetFeatures, s)
        }))
        .filter(s => s.similarity >= 0.55)
        .sort((a, b) => b.similarity - a.similarity);
    }
    
    // Step 4: 聚合计算
    let aggregate;
    if (filteredSamples.length >= 2) {
      aggregate = computeComparableAggregate(filteredSamples, mixedClass);
    } else {
      aggregate = {
        method: 'insufficient_data',
        sampleCount: filteredSamples.length,
        note: `过滤后可比样本不足（${filteredSamples.length}条），回退 static_class`
      };
    }
    
    // Step 5: 三层决策（v6.5-R0: V65_ENABLE_COMPARABLE_ANCHOR_PRICING 门禁）
    let pricing;
    let method;

    // v6.5-R0: 开关关闭时，comparable_anchor 不参与定价，强制回退 static_class
    const comparableEnabled = typeof V65_ENABLE_COMPARABLE_ANCHOR_PRICING !== 'undefined' && V65_ENABLE_COMPARABLE_ANCHOR_PRICING;

    if (comparableEnabled && (aggregate.method === 'comparable_anchor' || aggregate.method === 'class_floor_guarded')) {
      pricing = {
        p1Low: aggregate.p1Low,
        p1High: aggregate.p1High,
        p2Low: aggregate.p2Low,
        p2High: aggregate.p2High,
        p3Low: aggregate.p3Low
      };
      method = aggregate.method;
    } else {
      // 回退 static_class
      pricing = {
        p1Low: CLASS_P1_FLOOR[mixedClass] || 30000,
        p1High: (CLASS_P1_FLOOR[mixedClass] || 30000) * 10,
        p2Low: CLASS_P2_FLOOR[mixedClass] || 90000,
        p2High: (CLASS_P2_FLOOR[mixedClass] || 90000) * 8.9,
        p3Low: CLASS_P3_FLOOR[mixedClass] || 200000
      };
      method = 'static_class';
    }
    
    // Step 6: 市场调整（仅 comparable_anchor 路径）
    let adjustedPricing = pricing;
    let adjustmentNote = null;
    
    if (method === 'comparable_anchor' && mixedClass === 'MIXED_2C_COM') {
      const adjusted = applyMixedMarketAdjustments(pricing, sld);
      adjustedPricing = adjusted;
      adjustmentNote = adjusted.adjustment_note;
    }
    
    // 格式化输出
    const fmtUSD = (n) => '$' + Math.round(n).toLocaleString();
    
    return {
      domain: full || (sld + tld),
      assetClass: mixedClass,
      pricingMethod: method,
      pricing: {
        p1: fmtUSD(adjustedPricing.p1Low) + ' – ' + fmtUSD(adjustedPricing.p1High),
        p2: fmtUSD(adjustedPricing.p2Low) + ' – ' + fmtUSD(adjustedPricing.p2High),
        p3: fmtUSD(adjustedPricing.p3Low) + '+'
      },
      p1Low: adjustedPricing.p1Low,
      p1High: adjustedPricing.p1High,
      p2Low: adjustedPricing.p2Low,
      p2High: adjustedPricing.p2High,
      p3Low: adjustedPricing.p3Low,
      comparableSampleCount: aggregate.sampleCount || 0,
      comparableTrimmedMean: aggregate.trimmedMean || null,
      contextOnlyCount: comparableResult.contextOnly.length,
      adjustmentNote,
      guardNote: aggregate.guardNote || null,
      note: aggregate.note || null,
      scoreFloor: SCORE_FLOOR_MAP[mixedClass] || 72
    };
    
  } catch (err) {
    // 终极安全网：任何异常回退 static_class
    return {
      domain: full || (sld + tld),
      assetClass: classifyMixed(sld) || 'MIXED_SHORT_COM',
      pricingMethod: 'static_class',
      pricing: {
        p1: '$30,000 – $300,000',
        p2: '$80,000 – $800,000',
        p3: '$200,000 – $2,000,000'
      },
      error: err.message,
      note: '定价引擎异常，已回退 static_class 安全网'
    };
  }
}


// ============================================================================
//  引擎自检：加载时验证数据完整性
// ============================================================================
(function engineSelfCheck() {
  const data = loadComparableAnchors();
  const counts = {};
  for (const [domain, entry] of Object.entries(data)) {
    const key = entry.assetClass + '::' + entry.role;
    counts[key] = (counts[key] || 0) + 1;
  }
  
  const m2cRef = counts['MIXED_2C_COM::comparable_reference'] || 0;
  const m2cCtx = counts['MIXED_2C_COM::context_only'] || 0;
  
  console.log(`[market_sales_engine] v6.4.1 就绪`);
  console.log(`  MIXED_2C_COM comparable_reference: ${m2cRef} 条 (≥2=${m2cRef>=2})`);
  console.log(`  MIXED_2C_COM context_only: ${m2cCtx} 条`);
  console.log(`  数据质量: V1_untested | 时间戳: unknown | V3 交叉验证: 0 条`);
  console.log(`  定价路径: 当前所有 MIXED_2C_COM 回退 static_class（无 V3 验证样本）`);
})();
