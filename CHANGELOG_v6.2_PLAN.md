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
|------|-----|
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

---

## 锚点乘数定义

基于锚点成交价（`anchor_usd`）推算三层价格区间：

| 层级 | 乘数区间 | 说明 |
|------|----------|------|
| **P1** 投资人流通底价 | `anchor × 0.7` ~ `anchor × 1.5` | 保守估值下限，考虑市场流动性折扣 |
| **P2** 品牌资产价 | `anchor × 1.2` ~ `anchor × 3.0` | 主动外销时的合理报价区间 |
| **P3** 终端买家价 | `anchor × 2.0`+ | 终端收购方案价，视行业需求上不封顶 |

> 以上乘数用于 `anchor_based` 和 `anchor_floor_adjusted` 路径。`class_floor_guarded` 路径不使用乘数，直接沿用类别静态区间。

---

## 四种 pricing_method

| 值 | 触发条件 | 含义 |
|----|----------|------|
| `static_class` | 无锚点 | 纯类别静态区间，缺乏成交数据支撑 |
| `anchor_based` | 锚点 P1 下限 ≥ 类别地板 | 锚点完全在类别基准以上，直接使用锚点区间 |
| `anchor_floor_adjusted` | 锚点 P1 下限 < 类别地板，但锚点 P1 上限 ≥ 类别地板 | 锚点区间跨越类别地板，下限抬至类别地板，上限保留锚点推算值 |
| `class_floor_guarded` | 锚点 P1 上限 < 类别地板 | 锚点为历史低价异常值，完全不用锚点乘数，沿用类别静态区间 |

---

## 判断逻辑（伪代码）

```javascript
function applyAnchorFloorGuard(anchorUsd, assetClass) {
  const classFloor = assetClass.priceFloor[0];  // 类别 P1 静态下限

  // 用乘数推算锚点区间
  const anchorP1Low  = anchorUsd * 0.7;
  const anchorP1High = anchorUsd * 1.5;

  if (anchorP1High < classFloor) {
    // 分支 3：锚点上限 < 类别地板 → 历史低价异常值，完全不用
    return {
      pricing_method: 'class_floor_guarded',
      p1: assetClass.staticPriceRange,
      anchor_deal_used: true,
      anchor_deal_usd: anchorUsd,
      anchor_note: '历史低价锚点，仅作参考；当前估值不低于该类别地板'
    };

  } else if (anchorP1Low < classFloor) {
    // 分支 2：锚点区间跨越地板 → 下限抬至类别地板，保留锚点上限
    return {
      pricing_method: 'anchor_floor_adjusted',
      p1: { low: classFloor, high: anchorP1High },
      anchor_deal_used: true,
      anchor_deal_usd: anchorUsd,
      anchor_note: '锚点下限低于类别基准，已自动抬至类别地板'
    };

  } else {
    // 分支 1：锚点完全在地板以上 → 直接使用锚点乘数区间
    return {
      pricing_method: 'anchor_based',
      p1: { low: anchorP1Low, high: anchorP1High },
      anchor_deal_used: true,
      anchor_deal_usd: anchorUsd,
      anchor_note: null
    };
  }
}
```

---

## 物料包新增字段

在生成的 `DOMAIN_VALUATION_PACK.md` 价格区间章节中新增：

```json
{
  "pricing_method": "anchor_based | anchor_floor_adjusted | class_floor_guarded | static_class",
  "anchor_deal_used": true,
  "anchor_deal_usd": 39000,
  "anchor_note": "历史低价锚点，仅作参考；当前估值不低于 LLL_COM 类别地板 $100,000"
}
```

**anchor_note 显示位置：**

- **UI**：价格卡片下方一行，黄色说明文字（`#anchor-note` 元素，`color: var(--gold)`）
- **PACK**：价格区间章节文字 + JSON 字段均输出；`pricing_method = static_class` 时 `anchor_note` 为 `null`，不显示

---

## 回归测试（共 6 条）

### 正式测试域名

| # | 域名 | 类别 | 触发路径 | 预期 pricing_method | 预期 P1 下限 |
|---|------|------|----------|---------------------|-------------|
| 1 | VJN.com | `LLL_COM` | 锚点 $39K，P1 上限 $58.5K < 类别地板 $100K | `class_floor_guarded` | ≥ $100,000 |
| 2 | GOKA.com | `LLLL_PRONOUNCEABLE_COM` | 锚点 $399,995，P1 下限 $280K ≥ 类别地板 $8K | `anchor_based` | 锚点驱动 |
| 3 | 62.com | `NN_COM` | 锚点 $1.82M，P1 下限 $1.27M ≥ 类别地板 $200K | `anchor_based` | 锚点驱动 |
| 4 | travely.com | `VERIFIED_HIGH_VALUE_COM` | 检查锚点是否低于类别地板 | 视锚点值 | 人工复核 |
| 5 | gunar.com | `VERIFIED_HIGH_VALUE_COM` | 锚点价格合理，应在地板以上 | `anchor_based` | 锚点驱动 |
| 6 | TEX.COM | `LLL_COM` | 无锚点 | `static_class` | $100,000 |

### 分支 2（anchor_floor_adjusted）专项测试

当前正式 ANCHORS 表中无刚好覆盖分支 2 的域名（即锚点区间恰好跨越类别地板）。

**测试方案：使用 fixture 锚点（不进入正式 ANCHORS 表）**

```javascript
// 仅用于 v6.2 分支 2 测试，不写入 ANCHORS
const FIXTURE_ANCHORS = {
  'fixture-lll.com': 80000  // LLL_COM，锚点 $80K
                            // P1 低 = $80K × 0.7 = $56K < 地板 $100K
                            // P1 高 = $80K × 1.5 = $120K ≥ 地板 $100K
                            // → 触发 anchor_floor_adjusted
};
```

预期结果：

| 项目 | 值 |
|------|----|
| pricing_method | `anchor_floor_adjusted` |
| P1 下限 | $100,000（抬至类别地板） |
| P1 上限 | $120,000（保留锚点上限） |
| anchor_note | 显示黄色说明 |

> Fixture 仅在开发/测试阶段启用，正式发布时移除或注释掉。

---

## v6.2 代码实现原则

### 影响范围（最小 patch）

基于 v6.1.3 完整文件做最小修改，**不重写**。

**必须保留（不动）：**
- `analyze()`
- `buildPack()`
- `copyPack()`
- UI 渲染函数
- 现有分类链（`classifyAsset()`）
- 现有 `score6D()`
- 现有 `getConfidence()`

**只新增：**

| 新增内容 | 位置 | 说明 |
|----------|------|------|
| `CLASS_STATIC_PRICES` | 常量区 | 每个 asset_class 的 P1 静态价格区间 |
| `applyAnchorFloorGuard()` | 定价函数区 | 实现上方四分支逻辑 |
| `pricing_method` / `anchor_note` 字段 | 定价结果对象 | 传递给 UI 和 PACK |
| 价格卡片 pricing badge | UI | 小标签显示 `anchor_based` 等 |
| 价格卡片 anchor note | UI | 黄色一行说明，仅 `anchor_note != null` 时显示 |
| PACK JSON 新字段 | `buildPack()` | 输出 `pricing_method` / `anchor_deal_usd` / `anchor_note` |

### 不影响范围

- 资产分类逻辑（`classifyAsset()`）**完全不变**
- 六维评分逻辑（`score6D()`）**完全不变**
- 置信度逻辑（`getConfidence()`）**完全不变**
- 所有现有 ANCHORS 成交记录**保留不删**

---

## 暂不处理

以下功能需要更多真实样本数据或独立方案，**不在 v6.2 范围内**：

| 功能 | 暂缓原因 |
|------|---------|
| 88.com $1M vs $10M+ 行业共识 | 锚点数据质量问题，不是 floor guard 逻辑问题 |
| 吉利数字自动加分（8/6/9） | 需中国市场真实成交样本 |
| P2 / P3 floor guard | P1 guard 先验证，后续视需要扩展 |
| 非 .com/.ai 后缀扩展 | 需覆盖更广泛域名类型 |
| AI 评委面板 | 依赖 API 集成 |
| 更多资产类别 | 当前 11 个类别已足够 |

> 尤其是 88.com：这是锚点数据质量问题，不是 floor guard 逻辑问题。v6.2 只解决"锚点压低类别地板"，不扩大范围。

---

## 实施顺序

1. ✅ **文档修清楚**（本次提交）
2. ⬜ 基于 v6.1.3 `index.html` 做最小 patch，新增 `CLASS_STATIC_PRICES` + `applyAnchorFloorGuard()`
3. ⬜ 新增 UI：价格卡片 pricing badge + anchor note 黄色说明
4. ⬜ 更新 PACK 输出：`buildPack()` 补充新字段
5. ⬜ 跑 6 条回归测试（含 fixture 分支 2）
6. ⬜ 更新 README.md 至 v6.2
7. ⬜ 更新 `CORE_RULES_v2.md`：新增 §定价保护规则 章节
8. ⬜ 更新 `AGENT_PROMPTS.md`：JSON schema 补充 `pricing_method` 字段说明

---

*规划日期：2026-06-19*  
*基于：v6.1.3 A阶段实测报告*
