# v6.2 设计规范 — ANCHORS Price Floor Guard

> 状态：规划中  
> 前置版本：v6.1.3（2026-06-19 定版）  
> 目标：只做一件事，不引入额外复杂度

---

## 背景：为什么需要 v6.2

### A 阶段实测发现的问题

v6.1.3 实测中，ANCHORS 成交锚点会直接覆盖类别定价基准，导致**稀缺类别因历史低价成交被压低估值**。

**典型案例：VJN.com**

| 项目 | 值 |
|------|----|
| 资产分类 | `LLL_COM` |
| 类别 P1 静态底价 | $100,000 – $800,000 |
| ANCHORS 成交锚点 | $39,000（历史低价成交） |
| 系统当前 P1 输出 | $27,300 – $58,500 ✗ |
| 应有 P1 输出 | $100,000+ ✓ |

**根本原因：** 当前逻辑中 ANCHORS 定价路径无类别价格地板保护。历史低价成交（可能因急售、熊市、特殊交易背景）不应成为当前市场估值的上限。

### 已稳定的部分（不动）

- ✅ `L_COM`：q.com → L_COM / 98
- ✅ 数字四级：NN > NNN > NNNN > NNNNN
- ✅ `ULTRA_WORD_COM`：derm.com / TEXT.COM → 92
- ✅ `MIXED_SHORT_COM`：3m.com / a1.com → MIXED_SHORT_COM
- ✅ `GENERIC`：123456.com → GENERIC

---

## v6.2 唯一功能：ANCHORS Price Floor Guard

### 核心规则

分类逻辑不变：**先判断 asset_class，再判断是否有 ANCHORS。**  
价格逻辑改变：**ANCHORS 可以提高估值，但不应将估值压低到该 asset_class 的静态地板以下。**

### 判断逻辑（伪代码）

```javascript
function applyAnchorGuard(anchorPrice, assetClass) {
  const classFloor = assetClass.priceFloor[0];  // 类别 P1 静态下限

  if (anchor_p1_high < classFloor) {
    // 锚点上限 < 类别地板 → 锚点为历史低价异常值，完全不用
    return {
      pricing_method: 'class_floor_guarded',
      price: assetClass.staticPriceRange,
      anchor_deal_used: true,
      anchor_deal_usd: anchorPrice,
      anchor_note: '历史低价锚点，仅作参考；当前估值不低于该类别地板价'
    };
  } else if (anchor_p1_low < classFloor) {
    // 锚点区间跨越类别地板 → 下限抬至类别地板，保留锚点上限
    return {
      pricing_method: 'anchor_based',
      price: { low: classFloor, high: anchor_p1_high },
      anchor_deal_used: true,
      anchor_deal_usd: anchorPrice
    };
  } else {
    // 锚点完全在类别地板以上 → 直接用锚点区间
    return {
      pricing_method: 'anchor_based',
      price: anchorBasedPriceRange,
      anchor_deal_used: true,
      anchor_deal_usd: anchorPrice
    };
  }
}
```

### 物料包新增字段

在生成的 `DOMAIN_VALUATION_PACK.md` 中，价格区间部分新增以下字段：

```json
{
  "pricing_method": "anchor_based | class_floor_guarded | static_class",
  "anchor_deal_used": true,
  "anchor_deal_usd": 39000,
  "anchor_note": "历史低价锚点，仅作参考；当前估值不低于 LLL_COM 类别地板 $100,000"
}
```

**三种 pricing_method 含义：**

| 值 | 触发条件 | AI 解读 |
|----|----------|---------|
| `anchor_based` | 锚点 ≥ 类别地板 | 直接使用锚点区间，可信度高 |
| `class_floor_guarded` | 锚点 < 类别地板 | 锚点为历史低价，当前估值已抬至类别基准 |
| `static_class` | 无锚点 | 纯类别静态区间，缺乏成交数据支撑 |

---

## 回归测试（共 6 个）

| # | 域名 | 类别 | 触发路径 | 期望 pricing_method | 期望 P1 下限 |
|---|------|------|----------|---------------------|-------------|
| 1 | VJN.com | `LLL_COM` | 锚点 $39K < 类别底 $100K | `class_floor_guarded` | ≥ $100,000 |
| 2 | GOKA.com | `LLLL_PRONOUNCEABLE_COM` | 锚点 $399,995 ≥ 类别底 $8K | `anchor_based` | 锚点驱动 |
| 3 | 62.com | `NN_COM` | 锚点 $1.82M ≥ 类别底 $200K | `anchor_based` | 锚点驱动 |
| 4 | travely.com | `VERIFIED_HIGH_VALUE_COM` | 锚点低时需检查说明 | 视锚点值 | 人工复核 |
| 5 | gunar.com | `VERIFIED_HIGH_VALUE_COM` | 锚点价格合理 | `anchor_based` | 锚点驱动 |
| 6 | TEX.COM | `LLL_COM` | 无锚点 | `static_class` | $100,000 |

---

## 暂缓功能（不在 v6.2 范围内）

以下功能需要更多真实样本数据，暂缓实现：

| 功能 | 暂缓原因 |
|------|----------|
| 吉利数字自动加分（8/6/9）| 需中国市场真实成交样本 |
| 888/420 数字质量评分 | 需对照组数据 |
| 非 .com/.ai 后缀扩展 | 需覆盖更广泛域名类型 |
| AI 评委面板 | 依赖 API 集成 |
| 更多资产类别 | 当前 11 个类别已足够 |

---

## 实现说明

### 影响范围

- `index.html`：修改 `calcPrice()` 或 ANCHORS 定价分支，增加 guard 逻辑
- `buildReport()` / `buildPrompt()`：在物料包中输出 `pricing_method` 等新字段
- `CORE_RULES_v2.md`：新增 §定价保护规则 章节
- `AGENT_PROMPTS.md`：在 JSON schema 中补充 `pricing_method` 字段说明
- `README.md`：更新至 v6.2

### 不影响范围

- 资产分类逻辑（`classifyAsset()`）**完全不变**
- 六维评分逻辑（`score6D()`）**完全不变**
- 置信度逻辑（`getConfidence()`）**完全不变**
- 所有现有 ANCHORS 成交记录**保留不删**

---

## 为什么 v6.2 只做这一件事

> "这会直接解决实测中最明显的价格偏差，而且不会把系统重新做复杂。"

v6.1.3 的分类体系已经稳定。任何新功能（吉利数字算法、新 TLD 支持、AI 面板）都需要额外数据验证。而 ANCHORS price floor guard 逻辑清晰、改动范围小、回归测试可穷举，是当前最安全、最有价值的一步。

---

*规划日期：2026-06-19*  
*基于：v6.1.3 A阶段实测报告*
