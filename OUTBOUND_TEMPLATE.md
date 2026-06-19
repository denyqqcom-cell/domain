# Outbound 外销邮件模板库

> **版本：v6.1.3** | 与 CORE_RULES_v2.md v6.1 字段对齐
>
> 变更说明：数字 .com 已拆分为 NN/NNN/NNNN/NNNNN_COM 四个单独类别，SHORT_NUMERIC_COM 已废弃。数字域名各类质量溢价需人工复核。

---

## 平台布局建议

| 平台 | 定位 | 状态 | 建议用途 |
|------|------|------|----------|
| **Afternic** | GoDaddy 分发网络入口 | ✅ 可用 | 提高曙光，适合快速成交 |
| **Sedo** | 国际买家和经纪渠道 | ✅ 可用 | 高端域名，经纪人谈判 |
| **Dan.com** | 快速成交平台 | ✅ 可用 | 中低价域名，自助成交 |
| **NamePros / DNForum** | 投资者社区 | ✅ 可用 | 询价参考，投资者买家 |
| **Atom** | 精品域名市场 | ⚠️ 人工校验 | 自动访问可能受 Cloudflare 限制，建议人工上架 |
| **Squadhelp** | 品牌命名平台 | ⚠️ 访问性不稳定 | 创业公司品牌买家，视情况使用 |
| **BrandDo** | 品牌域名市场 | ⚠️ 历史快照参考 | 当前可访问性不稳定，不作为主力渠道 |
| **Efty** | 落地页工具 | ✅ 可用 | 自建域名落地页，非上架平台 |

> **注意：** 不建议以「GoDaddy 占 X% 市场份额」等统计数字作为报价依据，市场份额数据更新慢，容易误导买家。

---

## 资产类别与定价层级对应（v6.1 已更新）

| asset_class | 定价层级 | 备注 |
|------------|---------|------|
| LL_COM / LLL_COM / ULTRA_WORD_COM / WORD_COM | P1/P2/P3 高价值稿价资产标签 | 禁用批发/零售词 |
| LLLL_PRONOUNCEABLE_COM / VERIFIED_HIGH_VALUE_COM | P1/P2/P3 高价值稿价资产标签 | 需人工复核 |
| NN_COM / NNN_COM / NNNN_COM / NNNNN_COM | P1/P2/P3 高价值稿价资产标签 | 数字质量溢价需人工复核 |
| MIXED_SHORT_COM | P1/P2/P3 参考价标签 | 记录可能较稀疏 |
| AI_KEYWORD_TLD | P1/P2/P3 流通价标签 | 参考 MyCar.ai $10,000 |
| GENERIC | 同行参考价 | 不使用 P1-P3 标签 |

> ⚠️ `SHORT_NUMERIC_COM` 已废弃（v5.x 遗留）。如在历史文件中遇到此分类，请映射到对应的 NN/NNN/NNNN/NNNNN_COM。

---

## 定价层级

### 高价值稿价资产（LLL_COM / WORD_COM / ULTRA_WORD_COM / 数字类等）

| 层级 | 标签 | 说明 |
|------|------|------|
| P1 | 投资人流通底价 | 同行成交价下限，流动性锚点 |
| P2 | 品牌资产价 | 命名机构 / 品牌投资方报价区间 |
| P3 | 终端报价区间 | 企业终端买家的成交预期 |

### 普通域名（GENERIC）

| 层级 | 标签 | 说明 |
|------|------|------|
| P1 | 同行参考价 | 域名投资者之间的批发流转价格 |
| P2 | 品牌命名师价 | 命名师或品牌公司采购价 |
| P3 | 终端零售价 | 企业终端买家预期 |

---

## A 模板 — 通用冷邮件（适合 WORD_COM / LLLL_COM）

**主题：** `[Domain.com] — Available for Acquisition`

```
Hi [First Name],

I noticed [Company] is operating on [currentdomain.com]. I own [Domain.com] — a shorter, more memorable alternative that aligns directly with your brand.

Recent comparable sales for similar assets:
- [Comparable1.com] — $[Price] ([Source], [Year])
- [Comparable2.com] — $[Price] ([Source], [Year])

I’d be open to discussing acquisition. Would you be the right person to connect with on this?

Best,
[Your Name]
```

---

## B 模板 — 融资/IPO 触发邮件

**主题：** `Congrats on [Funding Round] — [Domain.com] could be your next brand move`

```
Hi [First Name],

Congratulations on [Company]’s recent [Series X / IPO]. As you scale, brand clarity becomes critical.

I own [Domain.com] — a premium asset that matches your exact category. Companies in [Industry] have paid $[X]–$[Y] for comparable domains (NameBio / DNW data).

Would [Domain.com] fit your brand roadmap?

[Your Name]
```

---

## C 模板 — 竞争对手触发邮件

**主题：** `[Competitor] almost owns your brand — [Domain.com]`

```
Hi [First Name],

A quick heads-up: [Domain.com] — a domain closely matching [Company]’s brand — is currently available.

Given how [Competitor] has been expanding into your space, securing this domain proactively may be worth considering.

Happy to discuss if timing is right.

[Your Name]
```

---

## D 模板 — LLL_COM 专用（高价值稿价资产）

**主题：** `[XYZ.com] — 3-Letter .COM Available | Investment Grade Asset`

```
Hi [First Name],

[XYZ.com] is available for acquisition. Three-letter .COM domains are a finite, investment-grade asset class.

Recent 3L .COM sales for reference:
- VJN.com — $39,000 (NameBio)
- [Other comps if available]

Let me know if you’d like to discuss.

[Your Name]
```

---

## E 模板 — .AI 域名专用

**主题：** `[Keyword.ai] — Available for Your AI Product`

```
Hi [First Name],

With [Company]’s focus on AI, [Keyword.ai] is a natural brand fit. The .AI extension is currently at peak demand in 2026.

For reference: MyCar.ai sold for $10,000 (NameBio).

Would this be relevant to your roadmap?

[Your Name]
```

---

## F 模板 — 数字 .COM 专用（NN/NNN/NNNN_COM）

**主题：** `[NNN.com] — Premium Numeric .COM Available`

```
Hi [First Name],

[NNN.com] is available for acquisition. Short numeric .COM domains are among the most liquid assets in the domain aftermarket, with strong demand from Asian markets and tech companies.

For reference: comparable [N-digit] numeric .COM domains have traded at $[X]–$[Y] (NameBio 2026).

Let me know if you’d like to discuss.

[Your Name]
```

> ⚠️ 数字质量溢价（如吉利数字、对称数字）需人工复核，不建议直接在模板中未核实就声称溢价。

---

## 成功率提升技巧

1. **个性化主题行** — 提及公司名或融资轮次，开信率提升 2–3×
2. **附上可比成交** — 使用 NameBio / DNW / DomainGang 公开数据，增强可信度
3. **控制邮件长度** — 正文不超过 150 字，保持核心信息
4. **避免附件** — 第一封不附文件，降低过滤风险
5. **跟进节奏** — 首发后第 5 天跟进一次，不超过 2 次
6. **不要谈价格底线** — 首封只问兴趣，价格在第 2 轮沟通

---

## 变更日志

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v6.1.3 | 2026-06-19 | 「稿价资产」→「高价值稿价资产」（小标题及表格）；「稿疑」→「稿疏」（MIXED_SHORT_COM 备注）；同步版本头至 v6.1.3 |
| v6.1.2 | 2026-06-19 | 废弃 SHORT_NUMERIC_COM 说明；补充数字类资产对应表；新增 F 模板（数字 .COM）；同步版本头至 v6.1.2 |
| v5.2 | 2026-06-18 | 初始版本 |

---

*Domain AI Judge v6.1.3 · Outbound Templates · 2026-06-19*
