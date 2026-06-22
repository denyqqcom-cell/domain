# CORE_RULES v2 — Domain AI Judge v6.3.1

> 当前正式规则文件，v6.3.1 · 2026-06-22。请始终使用此版本投喂 AI 评委。

---

## 一、核心原则：资产类别优先于一切

**正确流程：先判资产类别 → 再算六维分数 → 再套对应价格模型 → 输出估值**

不得反过来先按普通域名算价格。

---

## 二、资产类别表

### 字母类

| 类别 ID | 识别规则 | 最低系统分 | P1 投资人流通底价区间 | 价格标签 |
|---------|---------|----------|-----------------|---------| 
| `L_COM` | 1字母 + .com | **98** | $5,000,000 – $50,000,000+ | 投资人流通底价 |
| `LL_COM` | 2字母 + .com | **95** | $500,000 – $5,000,000+ | 投资人流通底价 |
| `LLL_COM` | 3字母 + .com | **88** | $100,000 – $800,000 | 投资人流通底价 |
| `ULTRA_WORD_COM` | 顶级单词/强品类词 + .com（cloud, excel, text, derm 等） | **92** | $500,000+，不机械估值 | 投资人流通底价｜**需人工经纪复核** |
| `WORD_COM` | 普通英文单词 + .com | **75** | $15,000 – $200,000 | 投资人流通底价 |
| `VERIFIED_HIGH_VALUE_COM` | 已有公开成交记录的 .com | **82** | 对标成交锚点 | 投资人底价 |
| `LLLL_PRONOUNCEABLE_COM` | 4字母可发音 + .com（含≥1元音） | **78** | $8,000 – $120,000 | 投资人底价 |
| `LLLL_COM` | 4字母纯辅音/行业缩写 + .com（无元音，如 nfts） | **82** | $50,000 – $500,000+ | 投资人流通底价 |

### 数字类（v6.1 四级分层）

| 类别 ID | 识别规则 | 最低系统分 | P1 投资人流通底价区间 | 备注 |
|---------|---------|----------|-----------------|---------| 
| `NN_COM` | 1–2位纯数字 + .com | **95** | $200,000 – $5,000,000 | 全球仅100个，稀缺度对标 LL_COM |
| `NNN_COM` | 3位纯数字 + .com | **90** | $50,000 – $800,000 | 全球仅1,000个 |
| `NNNN_COM` | 4位纯数字 + .com | **80** | $5,000 – $150,000 | 全球仅10,000个 |
| `NNNNN_COM` | 5位纯数字 + .com | **70** | $1,000 – $30,000 | 全球仅100,000个 |

> ⚠️ **分层判定规则**：纯数字优先判断位数，不得被 `MIXED_SHORT_COM` 捕获。`MIXED_SHORT_COM` 仅适用于**同时含字母和数字**的混合域名。

> ~~`SHORT_NUMERIC_COM`~~ — **已废弃（v6.1 起）**。该类别将 2–5 位数字域名合并，导致 62.com 与 12345.com 同区间估值，严重低估短数字资产。v6.1 起拆分为以上四个独立类别。

### 混合类 & 其他

| 类别 ID | 识别规则 | 最低系统分 | P1 投资人流通底价区间 | 价格标签 |
|---------|---------|----------|-----------------|---------| 
| `MIXED_SHORT_COM` | 2–4字符、同时含字母和数字 + .com（3m.com / h20.com） | **72** | $30,000 – $300,000 | 投资人流通底价 |
| `AI_KEYWORD_TLD` | 任意 SLD + .ai | **69** | $1,000 – $8,000 | 投资人流通价 |
| `GENERIC` | 其他 | 0 | 按六维分数模型 | 同行参考价 |

> **关键：** 最低系统分是地板，不是天花板。AI 评委判断结果可以更高，但不得低于此分。

---

## 三、数字类特别规则

### 3.1 四级分层判定优先级

```
输入 SLD → 是否纯数字？
  是 → 位数判断：
       ≤2位 → NN_COM
       3位  → NNN_COM
       4位  → NNNN_COM
       5位  → NNNNN_COM
       ≥6位 → GENERIC
  否（含字母）→ 继续判断是否 MIXED_SHORT_COM
```

### 3.2 数字质量溢价（⚠️ 系统不自动计算，须人工复核）

系统当前**不自动量化**以下数字质量因素，此项须人工判断：

| 质量因素 | 说明 | 溢价参考 |
|---------|------|---------| 
| 吉利数字 | 含 8、6、9（如 888.com > 420.com） | 中国买家市场溢价明显 |
| 豹子号 | 三/四位相同（777.com、8888.com） | 收藏品溢价 |
| 顺子号 | 1234.com、5678.com | 品牌记忆度溢价 |
| 含 4 | 4 在部分文化中视为不吉 | 可能贬值 |
| 对称号 | 1221.com、8998.com | 视觉溢价 |

> 示例：当前 888.com 和 420.com 均归类为 `NNN_COM`，系统评分均为 90 分。实际市场价差需人工复核。

---

## 四、六维评分框架

| 维度 | 权重 | 评分要点 |
|------|------|---------| 
| D1 TLD强度 | 20% | .COM=100分基准；.AI=69；.IO=64；其他后缀按流通性降分 |
| D2 终端匹配 | 25% | 终端公司数、规模、现用域名质量、融资利好信号、行业付费能力 |
| D3 域名品质 | 20% | 长度 / 可发音性 / 品牌可塑性 / 关键词质量 |
| D4 市场定价 | 20% | 平台布局、对标成交锚点、定价策略合理性 |
| D5 市场热度 | 10% | 行业当前热度、后缀市场情绪、搜索趋势 |
| D6 Outbound | 5% | 终端匹配数量、可联系渠道、成交可能性 |

---

## 五、价格标签规则

**稀缺资产**（LL_COM / LLL_COM / ULTRA_WORD_COM / NN_COM / NNN_COM / NNNN_COM / NNNNN_COM / MIXED_SHORT_COM / LLLL_PRONOUNCEABLE_COM / WORD_COM / VERIFIED_HIGH_VALUE_COM / AI_KEYWORD_TLD）：

- P1 标签：**投资人流通底价**
- P2 标签：**品牌资产价**
- P3 标签：**终端报价区间**

**普通域名**（GENERIC）：

- P1 标签：同行参考价
- P2 标签：品牌命名师价
- P3 标签：终端零售价

---

## 五之二、域名状态与可收购性（v6.3.1）

> 估值系统适用边界：并非所有域名都处于可收购状态。

### domain_status 取值

| 值 | 含义 | 估值用途 |
|----|------|---------|
| `investment_inventory` | 投资人持有，可收购 | ✅ 核心适用场景 |
| `active_brand` | 终端建站运营 | ⚠️ 历史成交可作类别参考，本身不可收购 |
| `parked` | 停泊，可能出售 | ✅ 可能可收购 |

### acquirable 物料包字段

- `true` — 投资人持有/挂牌，估值有实际交易意义
- `false` — 活跃品牌，估值仅供学术/类别参考
- `"unknown"` — 未核验持有人状态

### 已知 active_brand 示例

NFTs.com（$15M 成交后已建站）、google.com、openai.com、x.com 等 — 系统输入端与物料包顶部均会警告。

---

## 六、成交锚点（2026 公开数据）

> ⚠️ **v6.1.5 数据可信度标注**：仅 `anchor_allowed` 锚点可参与自动定价；`manual_review_only` 锚点不得用于自动估值，只能作为参考说明。

| 域名 | 类别 | 价格参考 | 可信度 | pricing_use | 备注 |
|------|------|---------|--------|-------------|------| 
| cloud.com | ULTRA_WORD_COM | $11,000,000 | ✅ verified | anchor_allowed | 公开拍卖记录；**active_brand**（Citrix/云品类终端品牌，已建站运营，不在二级市场流通） |
| NFTs.com | LLLL_COM | $15,000,000 | ✅ verified | anchor_allowed | Escrow.com 2022；**active_brand**（成交后已建站，锚点仅作类别参考） |
| 01.com | NN_COM | $1,820,000 | ✅ verified | anchor_allowed | DNJournal 2017 可查 |
| derm.com | ULTRA_WORD_COM | ~$825,000 | ✅ verified | anchor_allowed | 公开成交记录 |
| GOKA.com | LLLL_PRONOUNCEABLE_COM | $399,995 | ✅ verified | anchor_allowed | DomainGang 报道 |
| gunar.com | VERIFIED_HIGH_VALUE_COM | $175,000 | ✅ verified | anchor_allowed | NameBio 可查 |
| Balaena.com | VERIFIED_HIGH_VALUE_COM | $89,000 | ✅ verified | anchor_allowed | NameBio 可查 |
| Farfield.com | VERIFIED_HIGH_VALUE_COM | $15,000 | ✅ verified | anchor_allowed | NameBio 可查 |
| Travely.com | VERIFIED_HIGH_VALUE_COM | $13,000 | ✅ verified | anchor_allowed | NameBio 可查 |
| MyCar.ai | AI_KEYWORD_TLD | $10,000 | ✅ verified | anchor_allowed | NameBio 可查 |
| 60.com | NN_COM | $310,000 | ⚠️ low confidence | manual_review_only | 2012年历史成交，年代久远；不代表当前NN_COM水平 |
| VJN.com | LLL_COM | $39,000 | ⚠️ listing价 | manual_review_only | 挂牌价非成交价（Afternic listing） |
| tronscan.com | LLL_COM | $250,000 | ⚠️ unverified | manual_review_only | 公开报道，未经DNJournal/NameBio独立核验 |
| zkp.com | LLL_COM | $5,000,000 | ⚠️ buyer-claimed | manual_review_only | 买方自报价格，无数据库核验；远超LLL_COM类别均值 |
| 77.com | NN_COM | 未独立核验 | ⚠️ unverified | manual_review_only | 公开报道未找到DNJournal/NameBio独立核验链接 |
| 88.com | NN_COM | ~$12,000,000 est. | ⚠️ market_estimate | manual_review_only | 未核验市场估计，公开成交价未披露 |
| 62.com | NN_COM | 无可用价格 | 🔴 ambiguous | manual_review_only | 原$1.82M与01.com混淆，62.com自身无独立成交来源 |

---

## 七、AI 评委 JSON 输出格式

AI 评委必须返回以下标准 JSON：

```json
{
  "judge": "你的AI名称",
  "domain": "",
  "asset_class": "",
  "tld_score": 0,
  "enduser_score": 0,
  "quality_score": 0,
  "market_score": 0,
  "heat_score": 0,
  "outbound_score": 0,
  "final_score": 0,
  "confidence": "low|medium|high",
  "pricing_method": "anchor_based|static_class",
  "domain_status": "active_brand|investment_inventory|parked|null",
  "acquirable": true,
  "acquirable_note": "",
  "p1_investor_floor": "",
  "p2_brand_asset": "",
  "p3_enduser_range": "",
  "key_reasons": ["原因1", "原因2", "原因3"],
  "risk_flags": ["风险1"]
}
```

> 所有分数字段均使用下划线命名：`final_score`、`tld_score` 等。不得使用 camelCase（如 `finalScore`）。
>
> **v6.3.1 新增字段说明**：
> - `pricing_method`：`"anchor_based"` 表示基于锚点成交价定价，`"static_class"` 表示基于资产类别静态区间定价
> - `domain_status`：`"active_brand"`（终端运营中，不可收购）、`"investment_inventory"`（投资人持有）、`"parked"`（停泊）、`null`（未核验）
> - `acquirable`：`true`（可收购场景）、`false`（不可收购）、`"unknown"`（需人工确认）。**`acquirable === false` 时必须注明估值仅供参考，不得输出收购建议价**

---

## 八、数据源优先级

| 来源 | 优先级 | 状态 |
|------|--------|------| 
| NameBio | P1 | ✅ 可用 |
| DNW (Domain Name Wire) | P1 | ✅ 可用 |
| DNJournal | P1 | ✅ 可用 |
| DomainGang | P1 | ✅ 可用 |
| Sedo / Afternic / Dan.com | P1 | ✅ 可用 |
| NamePros / DNForum | P1 | ✅ 可用 |
| Above.com | P2 | ✅ 可用 |
| Atom | P2 | ⚠️ 人工校验，自动访问可能受 CF 拦截 |
| Estibot | P3 | ⚠️ 历史参考，不作为核心估值依据 |
| BrandDo | P3 | ⚠️ 历史快照，当前可访问性不稳定 |

---

## 九、不允许事项（红线）

1. 不得因没有终端买家资料就把 LLL_COM / WORD_COM 压到普通批发价区间
2. 不得对高流动性 .com 显示「批发价（同行）」标签
3. 不得把 `finalscore`（camelCase）写入 JSON，必须为 `final_score`
4. 不得将 CORE_RULES_v1.md 用于任何 AI 投喂
5. 不得将「市场资讯检索入口」标注为「实时市场资讯」
6. ULTRA_WORD_COM 必须标注「需人工经纪复核」，不得机械给出低价
7. 不得将 Estibot / BrandDo 列为 P1/P2 核心参考来源
8. **不得使用已废弃的 `SHORT_NUMERIC_COM`**，必须使用 NN_COM / NNN_COM / NNNN_COM / NNNNN_COM 四级分层
9. **不得将纯数字域名归类为 `MIXED_SHORT_COM`**，纯数字优先走数字分层判断
10. **不得将 `manual_review_only` 锚点用于自动估值**（zkp / tronscan / 77 / 88 / 62 / 60 / VJN）

---

## 十、防回归测试样例（v6.3.2）

| 域名 | 应识别类别 | 最低分 | 价格标签 | 备注 |
|------|-----------|--------|---------|------| 
| 6.com | `NN_COM` | 95 | 投资人流通底价 | 纯数字≤2位 |
| 62.com | `NN_COM` | 95 | 投资人流通底价 | **无可用锚点**（原$1.82M为01.com数据，62.com无独立来源）|
| 88.com | `NN_COM` | 95 | 投资人流通底价 | 吉利数字溢价需人工复核；锚点为市场估计，不参与自动定价 |
| 888.com | `NNN_COM` | 90 | 投资人流通底价 | 3位数字 |
| 1234.com | `NNNN_COM` | 80 | 投资人流通底价 | 4位数字 |
| 12345.com | `NNNNN_COM` | 70 | 投资人流通底价 | 5位数字，**不得混入 NN_COM** |
| 123456.com | `GENERIC` | 0 | 同行参考价 | 超出分层范围 |
| 3m.com | `MIXED_SHORT_COM` | 72 | 投资人流通底价 | 含字母+数字 |
| h20.com | `MIXED_SHORT_COM` | 72 | 投资人流通底价 | 含字母+数字 |
| TEXT.COM | `ULTRA_WORD_COM` | 92 | 投资人流通底价｜需人工复核 | 顶级行业词 |
| GOKA.com | `LLLL_PRONOUNCEABLE_COM` | 78 | 投资人底价 | 参照 $399,995（anchor_allowed）|
| zkp.com | `LLL_COM` | 88 | 投资人流通底价 | **锚点为买方自报，manual_review_only，不参与自动定价** |
| VJN.com | `LLL_COM` | 88 | 投资人流通底价 | 锚点为挂牌价（listing），不参与自动定价 |
| nfts.com | `LLLL_COM` | 82 | 历史类别参考价 | **active_brand**，acquirable=false，历史成交仅作类别基准 |
| qrst.com | `LLLL_COM` | 82 | 投资人流通底价 | 4字母纯辅音，无锚点，acquirable=unknown |
| cloud.com | `ULTRA_WORD_COM` | 92 | 历史类别参考价 | **active_brand**（黑名单），acquirable=false |
| google.com | `WORD_COM` | 75 | 历史类别参考价 | **active_brand**（黑名单），acquirable=false，6字母普通单词 |
| vjn.com | `LLL_COM` | 88 | 投资人流通底价 | listing锚点，acquirable=true（投资人挂牌中） |

---

## 十一、ANCHORS 可信度分级规则（v6.1.5 硬规则）

只有满足以下条件才能 `verified:true + confidence:high + pricing_use:anchor_allowed`：
- DNJournal 成交报告
- NameBio 成交数据库记录
- Sedo / Afternic 官方成交公告
- 其他可独立核验的成交数据库

以下来源**不得**直接 `verified:true`：
- public report / broker claim / project self-report / market rumor / 买方声明

**当前 ANCHORS 均为 exact-domain reference，尚未接入 comparable-sale 样本库。**

---

*CORE_RULES v2 · Domain AI Judge v6.3.1 · 2026-06-22*
