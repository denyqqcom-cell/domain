# CORE_RULES v2 — Domain AI Judge v5.2

> 当前正式规则文件，v2026-06-19。请始终使用此版本投喂 AI 评委。

---

## 一、核心原则：资产类别优先于一切

**正确流程：先判资产类别 → 再算六维分数 → 再套对应价格模型 → 输出估值**

不得反过来先按普通域名算价格。

---

## 二、资产类别表

| 类别 ID | 识别规则 | 最低系统分 | 投资人流通底价区间 | 价格标签 |
|---------|---------|----------|-----------------|---------|
| `LL_COM` | 2字母 + .com | **95** | $500,000 – $5,000,000+ | 投资人流通底价 |
| `LLL_COM` | 3字母 + .com | **88** | $100,000 – $800,000 | 投资人流通底价 |
| `ULTRA_WORD_COM` | 顶级单词/强品类词/行业核心词 + .com（cloud, excel, finance, derm 等） | **92** | $500,000+，不机械估值 | 投资人流通底价｜**需人工经纪复核** |
| `WORD_COM` | 普通英文单词 + .com | **82** | $15,000 – $500,000 | 投资人流通底价 |
| `VERIFIED_HIGH_VALUE_COM` | 已有公开成交记录的 .com | **82** | 对标成交锚点 | 投资人底价 |
| `LLLL_PRONOUNCEABLE_COM` | 4字母可发音 + .com（含≥1元音） | **78** | $8,000 – $120,000 | 投资人底价 |
| `SHORT_NUMERIC_COM` | 2–5位数字 + .com | **75** | $1,000 – $30,000 | 投资人流通底价 |
| `AI_KEYWORD_TLD` | 任意 SLD + .ai | **69** | $1,000 – $8,000 | 投资人流通价 |
| `GENERIC` | 其他 | 0 | 按六维分数模型 | 同行参考价 |

> **关键：** 最低系统分是地板，不是天花板。AI 评委判断结果可以更高，但不得低于此分。

---

## 三、六维评分框架

| 维度 | 权重 | 评分要点 |
|------|------|---------|
| D1 TLD强度 | 20% | .COM=100分基准；.AI=69；.IO=64；其他后缀按流通性降分 |
| D2 终端匹配 | 25% | 终端公司数、规模、现用域名质量、融资利好信号、行业付费能力 |
| D3 域名品质 | 20% | 长度 / 可发音性 / 品牌可塑性 / 关键词质量 / 历史 / 拓展保护 |
| D4 市场定价 | 20% | 平台布局、对标成交锚点、定价策略合理性 |
| D5 市场热度 | 10% | 行业当前热度、后缀市场情绪、搜索趋势 |
| D6 Outbound | 5% | 终端匹配数量、可联系渠道、成交可能性 |

---

## 四、价格标签规则

**稀缺资产**（LL_COM / LLL_COM / ULTRA_WORD_COM / WORD_COM / VERIFIED_HIGH_VALUE_COM / LLLL_PRONOUNCEABLE_COM / SHORT_NUMERIC_COM / AI_KEYWORD_TLD）：

- P1 标签：**投资人流通底价**
- P2 标签：**品牌资产价**
- P3 标签：**终端报价区间**

**普通域名**（GENERIC）：

- P1 标签：同行参考价
- P2 标签：品牌命名师价
- P3 标签：终端零售价

---

## 五、成交锚点（2026 公开数据）

| 域名 | 类型 | 成交价 | 来源 |
|------|------|--------|------|
| cloud.com | 单词.COM顶级 | $11,000,000 | 公开拍卖 |
| zkp.com | 3字母.COM极品 | $5,000,000 | 公开记录 |
| GOKA.com | 4字母.COM品牌 | $399,995 | DomainGang报道 |
| tronscan.com | 品牌.COM | $250,000 | 公开记录 |
| gunar.com | 5字母可发音 | $175,000 | NameBio |
| Balaena.com | 7字母工业.COM | $89,000 | NameBio |
| VJN.com | 3字母.COM | $39,000 | NameBio |
| Farfield.com | 6字母.COM AI量子 | $15,000 | NameBio |
| Travely.com | 6字母.COM旅游 | $13,000 | NameBio |
| MyCar.ai | AI汽车关键词 | $10,000 | NameBio |

---

## 六、AI 评委 JSON 输出格式

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
  "p1_investor_floor": "",
  "p2_brand_asset": "",
  "p3_enduser_range": "",
  "key_reasons": ["原因1", "原因2", "原因3"],
  "risk_flags": ["风险1"]
}
```

> 所有分数字段均使用下划线命名：`final_score`、`tld_score` 等。不得使用 camelCase（如 `finalScore`）。

---

## 七、数据源优先级

| 来源 | 优先级 | 状态 |
|------|--------|------|
| NameBio | P1 | ✅ 可用 |
| DNW (Domain Name Wire) | P1 | ✅ 可用 |
| DomainGang | P1 | ✅ 可用 |
| Sedo / Afternic | P1 | ✅ 可用 |
| NamePros / DNForum | P1 | ✅ 可用 |
| Above.com | P2 | ✅ 可用 |
| Atom | P2 | ⚠️ 人工校验，自动访问可能受 CF 拦截 |
| Estibot | P3 | ⚠️ 历史参考，不作为核心估值依据 |
| BrandDo | P3 | ⚠️ 历史快照，当前可访问性不稳定 |

---

## 八、不允许事项（红线）

1. 不得因没有终端买家资料就把 LLL_COM / WORD_COM 压到普通批发价区间
2. 不得对高流动性 .com 显示「批发价（同行）」标签
3. 不得把 `finalscore`（camelCase）写入 JSON，必须为 `final_score`
4. 不得将 CORE_RULES_v1.md 用于任何 AI 投喂
5. 不得将「市场资讯检索入口」标注为「实时市场资讯」
6. ULTRA_WORD_COM 必须标注「需人工经纪复核」，不得机械给出低价
7. 不得将 Estibot / BrandDo 列为 P1/P2 核心参考来源

---

## 九、防回归测试样例

| 域名 | 应识别类别 | 价格标签 | 备注 |
|------|-----------|---------|------|
| TEX.COM | `LLL_COM` | 投资人流通底价 | 不得显示普通批发价 |
| GOKA.com | `LLLL_PRONOUNCEABLE_COM` | 投资人底价 | 参照 $399,995 |
| Derm.com | `ULTRA_WORD_COM` | 投资人流通底价｜需人工复核 | 医疗高价值单词 |
| Excel.com | `ULTRA_WORD_COM` | 投资人流通底价｜需人工复核 | Ultra Premium |
| 12345.com | `SHORT_NUMERIC_COM` | 投资人流通底价 | 短数字.COM |
| MyCar.ai | `AI_KEYWORD_TLD` | 投资人流通价 | 不得重复加权 |
| Farfield.com | `VERIFIED_HIGH_VALUE_COM` | 投资人底价 | 参照 $15,000 |
| Travely.com | `VERIFIED_HIGH_VALUE_COM` | 投资人底价 | 参照 $13,000 |

---

*CORE_RULES v2 · Domain AI Judge v5.2 · 2026-06-19*
