# Domain AI Judge v6.3.1

> 域名估值物料包生成器 · 资产类别优先 · CORE_RULES v2 对齐

🔗 **在线使用**：https://denyqqcom-cell.github.io/domain/

---

## 功能表

| 功能 | 说明 |
|------|------|
| 资产类别优先判定 | 先判 NN_COM / LLL_COM / LLLL_COM / ULTRA_WORD_COM 等，再算分 |
| 六维评分框架 | TLD强度 / 终端匹配 / 域名品质 / 市场定价 / 市场热度 / Outbound操作性 |
| 分类价格输出 | 稀缺资产：投资人流通底价 / 品牌资产价 / 终端报价区间 |
| 成交锚点校准 | 内置成交锚点（含 nfts.com $15M；cloud.com $11M 等）；domain_status 标注 |
| ANCHORS 地板保护 | anchor_based / anchor_floor_adjusted / class_floor_guarded 三分支 |
| domain_status 过滤 | active_brand 自动触发黄色警告；acquirable 字段明确可收购状态 |
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
| `LLLL_COM` | NFTS.com, QRST.com | 82 | $50,000 – $500,000+ |
| `WORD_COM` | Travel.com | 75 | $15,000 – $200,000 |

> **v6.3 新增 `LLLL_COM`**：4字母纯字母、无元音的缩写类域名（如 NFTS、QRST）。此前此类域名误落入 WORD_COM，v6.3 起独立成类，最低分 82，P1 $50K–$500K+。

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

### 2. ACTIVE_BRAND_BLACKLIST — 已建站大型品牌

系统内置 `ACTIVE_BRAND_BLACKLIST`，对已确认建站运营的大型品牌域名（如 google.com、openai.com、x.com、nfts.com 等）自动触发黄色警告：

```
⚠️ 该域名为活跃品牌网站（active_brand），估值仅供学术/类别参考，不代表当前可收购。
```

同时输出：
- `domain_status: 'active_brand'`
- `acquirable: false`

> **注意**：成交锚点（如 nfts.com $15M）仍保留在 ANCHORS 中，用于同类别价格参考，但物料包会明确标注「成交后已建站，不在二级市场流通」。

### 3. ANCHORS 价格地板保护（v6.2 ✅ 已修复）

历史成交锚点不会将稀缺类别估值压低到类别静态地板以下：

| pricing_method | 触发条件 | 行为 |
|---------------|---------|------|
| `anchor_based` | 锚点区间完全在地板以上 | 正常锚点定价 |
| `anchor_floor_adjusted` | 锚点下界低于地板，上界正常 | 抬下界至类别地板 |
| `class_floor_guarded` | 锚点上界也低于地板 | 整体用类别区间 |
| `static_class` | 无 anchor_allowed 锚点 | 走类别静态区间 |

---

## 防回归测试样例（v6.3.1）

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
| **nfts.com** | **`LLLL_COM`** | **82** | **v6.3 新增；anchor_based $15M；active_brand** |
| **qrst.com** | **`LLLL_COM`** | **82** | **v6.3 新增；无锚点；static_class** |
| **vjn.com** | **`LLL_COM`** | **88** | **v6.2/v6.3；$39K 挂牌 reference_only，不压低定价** |

### v6.3.1 E2E 浏览器验证（2026-06-22）

| # | 域名 | asset_class | pricing_method | acquirable | active_brand 警告 | 状态 |
|---|------|-------------|----------------|------------|-------------------|------|
| 1 | nfts.com | LLLL_COM | anchor_based | false | ✅ 显示 | ✅ PASS |
| 2 | vjn.com | LLL_COM | static_class | true | ❌ 无（正确） | ✅ PASS |
| 3 | cloud.com | ULTRA_WORD_COM | anchor_based | false | ✅ 显示(Citrix) | ✅ PASS |
| 4 | google.com | WORD_COM | static_class | false | ✅ 显示 | ✅ PASS |
| 5 | qrst.com | LLLL_COM | static_class | unknown | ❌ 无（正确） | ✅ PASS |

> **google.com 分类说明**：主体 `google` 为6字母普通单词，不在 ULTRA_WORD_LIST，正确落入 WORD_COM。
> active_brand 警告通过 ACTIVE_BRAND_BLACKLIST 独立触发，与分类结果解耦，不影响价格逻辑。

---

## 文件结构

```
domain/
├── index.html                  ← 主工具（v6.3.1）
├── README.md                   ← 本文件（v6.3.1）
├── CHANGELOG_v6.2_PLAN.md      ← v6.2 设计规范（ANCHORS 价格地板保护，已完成）
├── CHANGELOG_v6.3_PLAN.md      ← v6.3 设计规范（LLLL_COM + domain_status，已完成）
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
| **v6.3.1** | **2026-06-23** | **锁版。LLLL_COM 新类别 + domain_status/acquirable 字段 + active_brand 黄色警告 + nfts.com $15M 锚点。E2E 5/5 PASS。** |
| v6.3 (P0) | 2026-06-22 | LLLL_COM 分类盲区修复（nfts.com 误分 WORD_COM → LLLL_COM）；nfts.com $15M 写入 ANCHORS（Escrow.com verified）；五 Agent 5/5 APPROVED |
| v6.2 | 2026-06-22 | ANCHORS 价格地板保护（applyAnchorFloorGuard）；pricing_method 四分支；CLASS_P1_FLOOR 常量表 |
| **v6.1.5** | **2026-06-22** | anchor_relation / anchor_note 字段；manual_review_only 硬规则；buildAnchorDealsTable() 动态表 |
| **v6.1.3** | **2026-06-19** | 正式定版。发现 ANCHORS 价格可能压低类别估值问题，规划 v6.2 修复 |
| v6.1.1 | 2026-06-19 | 文档收口：README/CORE_RULES_v2 同步 v6.1；SHORT_NUMERIC_COM 标废弃 |
| v6.1 | 2026-06-19 | 数字.COM 四级分层（NN/NNN/NNNN/NNNNN_COM）；修复 MIXED_SHORT_COM 误判纯数字 |
| v6.0.3 | 2026-06-19 | 核心分类链稳定版 |
| v5.2 | 2026-06-19 | AGENT_PROMPTS 升级至 v2 schema；新增 ULTRA_WORD_COM |
| v5.1 | 2026-06-19 | 资产类别优先、价格标签重命名、LLL_COM 最低分 88 |
| v5.0 | 2026-06-18 | 六维评分、多AI评委投票、生成域名.md |
| v4.x | 2026-06-17 | 三维评分初版 |
