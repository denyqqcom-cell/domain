# CHANGELOG v6.3 — LLLL_COM 分类盲区修复 + domain_status 过滤

**基线版本**: v6.2（ANCHORS 地板保护已完成）  
**目标版本**: v6.3.1  
**五 Agent 表决**: 5/5 APPROVED（2026-06-22）  
**锁版日期**: 2026-06-23  
**E2E 验证**: 5/5 PASS（浏览器端到端，2026-06-22）

---

## 问题根因（双盲区，须同步修复）

### 盲区 1：LLLL_COM 类别缺失

`classifyAsset()` 旧逻辑对 4 字母域名只有两条路径：
- `LLLL_PRONOUNCEABLE_COM`：含元音，可发音（如 GOKA）
- `WORD_COM`：兜底（如 NFTS — **错误**）

4 字母全辅音缩写（NFTS、QRST）无专属类别，被错误归入 WORD_COM，导致：
- nfts.com P1 输出 $15K–$200K
- 实际成交 $15,000,000
- 误差倍数：~75–1000×

### 盲区 2：ANCHORS 缺 nfts.com $15M 锚点

nfts.com 于 2022-08-03 以 $15,000,000 成交，来源：
- [Escrow.com 官方新闻稿](https://www.escrow.com/news/articles/nfts_com_bought_for_15_000_000)（P1 核验来源）
- DNJournal：史上第二大公开 .com 成交记录
- 经手方：Domainer.com + GoDaddy，Escrow.com 托管

该锚点符合 `anchor_allowed` + `verified: true` + `confidence: high` 标准，但此前未录入。

---

## v6.3 修复内容

### 1. 新增 LLLL_COM 资产类别

| 字段 | 值 |
|------|----|
| 类别 ID | `LLLL_COM` |
| 定义 | 4字母纯字母、无元音；行业缩写为主（NFTS, QRST, DAPP…） |
| 分类优先级 | 在 `LLLL_PRONOUNCEABLE_COM` 之后、`WORD_COM` 之前 |
| 最低分（score_floor） | 82 |
| P1 投资人底价 | $50,000 – $500,000+ |
| P2 品牌资产价 | $150,000 – $1,500,000 |
| P3 终端/战略价 | $500,000 – $5,000,000+ |
| CLASS_P1_FLOOR | 50,000 |

**`classifyAsset()` 新路径**：
```
sld = 4字母, isAlpha = true
→ /[aeiou]/.test(sld) → false
→ return make('LLLL_COM', ...)
```

### 2. nfts.com 写入 ANCHORS

```javascript
'nfts.com': {
  usd: 15000000,
  type: 'sale',
  source: 'Escrow.com official press release (2022-08-03) + DNJournal',
  verified: true,
  confidence: 'high',
  pricing_use: 'anchor_allowed',
  anchor_relation: 'exact_domain_historical_sale',
  domain_status: 'active_brand',
  status_note: '成交后已被终端用户建站运营，不在二级市场流通',
  anchor_note: '$15M 为 2022 年成交价（Escrow.com + DNJournal verified）；'
             + '成交后域名已建站，本身不可收购；'
             + '仍作 LLLL_COM 类别基准参考'
}
```

### 3. domain_status + acquirable 字段

所有 ANCHORS 条目新增 `domain_status` 字段：

| 值 | 含义 |
|----|------|
| `'investment_inventory'` | 投资人持有，可收购（核心估值场景） |
| `'active_brand'` | 企业已建站运营，历史锚点有参考价值，本身不可收购 |
| `'parked'` | 已注册但停泊，出售状态待确认 |

物料包 JSON 新增字段：
```json
{
  "domain_status": "active_brand | investment_inventory | parked | null",
  "acquirable": true,
  "acquirable_note": "..."
}
```

### 4. ACTIVE_BRAND_BLACKLIST + 黄色警告

系统内置知名品牌域名黑名单，触发时在物料包顶部显示黄色警告：
```
⚠️ 该域名为活跃品牌网站（active_brand），估值仅供学术/类别参考，不代表当前可收购。
```

**设计原则**：
- 黑名单与分类链**解耦**：active_brand 警告独立触发，不影响 classifyAsset() 的分类结果
- google.com 分类仍正确输出 `WORD_COM`（6字母普通单词，不在 ULTRA_WORD_LIST）
- 警告逻辑只影响 `domain_status` / `acquirable` / UI 提示，不影响定价

---

## E2E 浏览器验证结果（2026-06-22）

| # | 域名 | asset_class | pricing_method | acquirable | active_brand 警告 | 结论 |
|---|------|-------------|----------------|------------|-------------------|------|
| 1 | nfts.com | LLLL_COM | anchor_based | false | ✅ | PASS |
| 2 | vjn.com | LLL_COM | static_class | true | ❌ 无（正确） | PASS |
| 3 | cloud.com | ULTRA_WORD_COM | anchor_based | false | ✅ Citrix | PASS |
| 4 | google.com | WORD_COM | static_class | false | ✅ | PASS（分类正确）|
| 5 | qrst.com | LLLL_COM | static_class | unknown | ❌ 无（正确） | PASS |

**google.com 说明**：预期 `L_COM` 为记录错误，L_COM 仅用于单字母域名。6字母 google → WORD_COM 为代码正确输出，非 bug。

---

## 不做的事（本次范围外）

- 吉利数字自动加分（需更多真实样本）
- 888/420 数字质量评分
- 非 .com/.ai 后缀扩展
- AI 评委面板
- ACTIVE_BRAND_BLACKLIST 自动扩充（当前手动维护）

---

## 来源验证

- [Escrow.com 官方新闻稿 2022-08-03](https://www.escrow.com/news/articles/nfts_com_bought_for_15_000_000)
- [DNJournal 报道](https://www.dnjournal.com/archive/lowdown/2022/dailyposts/20220803.htm)
- [DomainNameWire 报道](https://domainnamewire.com/2022/08/03/nfts-com-domain-sells-for-whopping-15-million/)
- [DomainIncite 报道](https://domainincite.com/28089-at-15-million-nfts-com-becomes-second-biggest-domain-sale-ever)

---

*CHANGELOG_v6.3_PLAN.md · Domain AI Judge · 锁版 2026-06-23*
