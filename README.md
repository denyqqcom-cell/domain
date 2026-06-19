# Domain AI Judge v6.1.3

> 域名估值物料包生成器 · 资产类别优先 · CORE_RULES v2 对齐

🔗 **在线使用**：https://denyqqcom-cell.github.io/domain/

---

## 功能表

| 功能 | 说明 |
|------|------|
| 资产类别优先判定 | 先判 NN_COM / LLL_COM / ULTRA_WORD_COM 等，再算分 |
| 六维评分框架 | TLD强度 / 终端匹配 / 域名品质 / 市场定价 / 市场热度 / Outbound操作性 |
| 分类价格输出 | 稀缺资产：投资人流通底价 / 品牌资产价 / 终端报价区间 |
| 成交锚点校准 | 内置 12 条公开成交（cloud.com $11M – MyCar.ai $10K；含数字.COM 锚点） |
| 物料包生成 | 自动生成结构化 DOMAIN_VALUATION_PACK.md，可直接转发给 AI |
| 高级六维明细 | 可展开查看 D1–D6 各维度分数及风险标记 |

---

## 快速使用

1. 打开在线页面，输入域名（如 `62.com`、`888.com`、`TEXT.COM`）
2. 点击「生成估值包」，查看资产类别、综合评分、三层估值
3. 复制「DOMAIN_VALUATION_PACK.md」全文，转发给 AI 请求深度估值
4. 高级模式可展开查看六维明细和风险标记

---

## 资产类别优先级

### 字母类

| 类别 ID | 示例 | 最低分 | 价格区间（P1 投资人底价） |
|---------|------|--------|----------|
| `L_COM` | A.com | 98 | $5,000,000 – $50,000,000+ |
| `LL_COM` | AA.com | 95 | $500,000 – $5,000,000+ |
| `LLL_COM` | ZKP.com | 88 | $100,000 – $800,000 |
| `ULTRA_WORD_COM` | Cloud.com, TEXT.com | 92 | $500,000+，需人工复核 |
| `LLLL_PRONOUNCEABLE_COM` | GOKA.com | 78 | $8,000 – $120,000 |
| `WORD_COM` | Travel.com | 75 | $15,000 – $200,000 |

### 数字类（v6.1 四级分层）

| 类别 ID | 规则 | 最低分 | 价格区间（P1 投资人底价） | 备注 |
|---------|------|--------|-----------|------|
| `NN_COM` | 1–2位数字 + .com | 95 | $200,000 – $5,000,000 | 全球仅100个，对标 LL_COM |
| `NNN_COM` | 3位数字 + .com | 90 | $50,000 – $800,000 | 全球仅1,000个 |
| `NNNN_COM` | 4位数字 + .com | 80 | $5,000 – $150,000 | 全球仅10,000个 |
| `NNNNN_COM` | 5位数字 + .com | 70 | $1,000 – $30,000 | 全球仅100,000个 |
| ~~`SHORT_NUMERIC_COM`~~ | ~~2–5位数字合并类~~ | ~~75~~ | ~~废弃~~ | ⚠️ **已废弃**，v6.1 起拆分为以上四级 |

### 混合类 & 其他

| 类别 ID | 示例 | 最低分 | 价格区间（P1）|
|---------|------|--------|-------|
| `MIXED_SHORT_COM` | 3m.com, h20.com | 72 | $30,000 – $300,000 |
| `AI_KEYWORD_TLD` | MyCar.ai | 69 | $1,000 – $8,000 |
| `GENERIC` | 普通域名 | 0 | 人工复核 |

---

## ⚠️ 已知限制说明

### 1. 数字质量溢价需人工复核

系统**不自动量化**以下数字质量溢价，此项须人工判断：

- **吉利数字**：含 8、6、9 的组合（如 888.com > 420.com）
- **顺子号**：如 1234.com、5678.com
- **豹子号**：如 777.com、999.com
- **含 4 的号码**：在部分市场视为贬值因子
- **重复/对称**：如 1221.com、8998.com

> 当前 888.com 和 420.com 均归类为 `NNN_COM`，系统评分均为 90 分。市场实际溢价差异需人工复核。

### 2. ANCHORS 价格锚点与类别地板保护（v6.2 修复中）

当前版本（v6.1.3）中，ANCHORS 成交锚点可能把稀缺类别的估值压低到类别静态地板以下。

典型问题：
- VJN.com → 分类 `LLL_COM`（类别 P1 底价 $100,000–$800,000）
- 锚点成交 $39,000 → 系统 P1 输出 $27,300–$58,500
- **结论：历史低价成交不应覆盖类别基准**

> ⚠️ **此问题将在 v6.2 修复。** 修复原则：ANCHORS 可提高估值，不应将估值压低到该 asset_class 的静态价格地板以下。  
> 详见 [CHANGELOG_v6.2_PLAN.md](./CHANGELOG_v6.2_PLAN.md)

---

## 防回归测试样例（v6.1.3）

| 域名 | 应识别类别 | 最低分 | 备注 |
|------|-----------|--------|------|
| 6.com | `NN_COM` | 95 | 纯数字≤2位 |
| 62.com | `NN_COM` | 95 | 纯数字≤2位，参照 $1.82M 锚点 |
| 88.com | `NN_COM` | 95 | 纯数字≤2位，吉利数字 |
| 888.com | `NNN_COM` | 90 | 3位数字 |
| 1234.com | `NNNN_COM` | 80 | 4位数字 |
| 12345.com | `NNNNN_COM` | 70 | 5位数字，不得混入 NN_COM |
| 123456.com | `GENERIC` | 0 | 超出分层范围 |
| 3m.com | `MIXED_SHORT_COM` | 72 | 含字母+数字，非纯数字 |
| h20.com | `MIXED_SHORT_COM` | 72 | 含字母+数字 |
| TEXT.COM | `ULTRA_WORD_COM` | 92 | 顶级行业词 |
| GOKA.com | `LLLL_PRONOUNCEABLE_COM` | 78 | 4字母可发音，参照 $399,995 |
| zkp.com | `LLL_COM` | 88 | 3字母，参照 $5M 锚点 |
| q.com | `L_COM` | 98 | 单字母 |

### v6.2 新增回归测试（ANCHORS 价格地板保护）

| 域名 | 类别 | 触发场景 | 预期 pricing_method |
|------|------|----------|--------------------|
| VJN.com | `LLL_COM` | 锚点 $39K < 类别底价 $100K | `class_floor_guarded` |
| GOKA.com | `LLLL_PRONOUNCEABLE_COM` | 锚点 $399,995 ≥ 类别底价 | `anchor_based` |
| 62.com | `NN_COM` | 锚点 $1.82M ≥ 类别底价 | `anchor_based` |
| travely.com | `VERIFIED_HIGH_VALUE_COM` | 低锚点时需检查说明 | 人工复核 |
| gunar.com | `VERIFIED_HIGH_VALUE_COM` | 锚点价格合理 | `anchor_based` |
| TEX.COM | `LLL_COM` | 无锚点 | `static_class` |

---

## 文件结构

```
domain/
├── index.html                  ← 主工具（v6.1.3）
├── README.md                   ← 本文件（v6.1.3）
├── CHANGELOG_v6.2_PLAN.md      ← v6.2 设计规范（ANCHORS 价格地板保护）
├── CORE_RULES_v2.md            ← ✅ 当前核心规则（请使用此版本）
├── CORE_RULES_v1.md            ← ⚠️ Deprecated（早期草稿，已废弃）
├── AGENT_PROMPTS.md            ← AI评委 System Prompt（v2 schema对齐）
└── OUTBOUND_TEMPLATE.md        ← Outbound 邮件模板
```

---

## 数据源说明

| 来源 | 优先级 | 状态 |
|------|--------|------|
| NameBio | P1 | ✅ 可用 |
| DNW (Domain Name Wire) | P1 | ✅ 可用 |
| DNJournal | P1 | ✅ 可用 |
| DomainGang | P1 | ✅ 可用 |
| Sedo / Afternic / Dan.com | P1 | ✅ 可用 |
| NamePros / DNForum | P1 | ✅ 可用 |
| Above.com | P2 | ✅ 可用 |
| Atom | P2 | ⚠️ 人工校验，自动抓取可能受 Cloudflare 限制 |
| Estibot | P3 | ⚠️ 历史参考，不作为核心估值依据 |
| BrandDo | P3 | ⚠️ 历史快照参考，当前可访问性不稳定 |

---

## 隐私说明

本工具完全在本地浏览器运行，**不联网、不发送任何域名数据**。历史记录仅内存存储，刷新页面后清空。

---

## 版本历史

| 版本 | 日期 | 主要变动 |
|------|------|----------|
| **v6.1.3** | **2026-06-19** | **正式定版。发现 ANCHORS 价格可能压低类别估值问题，规划 v6.2 修复** |
| v6.1.1 | 2026-06-19 | 文档收口：README/CORE_RULES_v2 同步 v6.1；SHORT_NUMERIC_COM 标废弃；新增数字质量溢价人工复核说明 |
| v6.1 | 2026-06-19 | 数字.COM 四级分层（NN/NNN/NNNN/NNNNN_COM）；修复 MIXED_SHORT_COM 误判纯数字；完善 d2/d4/d6/getConfidence/getRisks |
| v6.0.3 | 2026-06-19 | 核心分类链稳定版 |
| v5.2 | 2026-06-19 | AGENT_PROMPTS 升级至 v2 schema；新增 ULTRA_WORD_COM |
| v5.1 | 2026-06-19 | 资产类别优先、价格标签重命名、LLL_COM 最低分 88 |
| v5.0 | 2026-06-18 | 六维评分、多AI评委投票、生成域名.md |
| v4.x | 2026-06-17 | 三维评分初版 |
