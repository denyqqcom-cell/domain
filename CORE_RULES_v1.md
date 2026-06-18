# Domain AI Judge — 核心评估规则 v1.0

> 本文件由 5 个 Agent（Claude / MiMo / OpenCode / Hermes / Grok）协作研究设计
> 参考源：Domain Name Wire · Sedo · BrandDo · OYZTA · Identity Digital · domainclub.org · NameBio
> 最后更新：2026-06-18

---

## 一、TLD 后缀强度评分（满分 100）

### 1.1 标准分布表

| TLD | 基础分 | 说明 |
|-----|---------|------|
| .COM | 100 | 全球流通性最强，Afternic/Sedo Fast Transfer支持，Alexa Top 1M中占比最高 |
| .AI | 69 | 2026年AI行业深度绑延，Identity Digital有效注册量 6,700万+；速度洚升 |
| .IO | 64 | 科技初创公司首选，市场认可度高；注册量推动价格可观 |
| .NET | 45 | 天花板底部，仅次于.COM的智识传统认知 |
| .ORG | 40 | 非营利性领域认可度强；流通性小于.COM |
| ccTLD (.de/.cn等) | 30–50 | 基于具体地区市场规模和注册量动态评分 |
| 新gTLD (.xyz/.shop等) | 15–30 | 市场认可度弱，流通性差；仅限特定垂直市场场景 |

### 1.2 加分 / 减分规则

**加分项：**
- `.AI`：若域名本身与AI行业关键词强相关（如 NeuralAgent.ai），额外 +5分
- `.COM`：若域名在 Afternic Sedo Fast Transfer 网络中，额外 +3分
- `.IO`：若域名对应行业为 SaaS / DevTool，额外 +4分

**减分项：**
- 后缀注册量小于 100万 → -5分
- 初次登录长度超过 5年 → -3分
- 已进入 UDRP 争议或商标单独占用 → -20分

### 1.3 数据源
- Identity Digital 注册量官方报告（每季度更新）
- Domain Name Wire — [domainnamewire.com](https://domainnamewire.com/)
- ShareShift — ccTLD nameserver 分析工具

---

## 二、终端用户匹配度评分（满分 100）

### 2.1 五个子维度权重

| 子维度 | 权重 | 评分逐项说明 |
|---------|------|----------------|
| 终端存在性 | 30% | Google / LinkedIn 可搜到该行业匹配企业数量 |
| 终端规模 | 25% | 是否为达到内斯敊米拉基准的大中型丁业 / 上市公司 |
| 现用域名匹配性 | 20% | 现有网站域名是否比评估域名更难记 / 更长 / 更差 |
| 利好消息 | 15% | 最近 12 个月内是否有融资/上市/新业务等 |
| Crunchbase 信号 | 10% | CIPO / 专利新增、A轮及以上融资新闻 |

### 2.2 现用域名比较标准

```
判断逻辑（优质终端条件）：
  ✔ 现用域名 字符数 > 评估域名字符数 + 3
  ✔ 现用域名包含连字符 (-) 或数字
  ✔ 现用域名非 .COM（如 example.net），评估域名为 .COM
  ✔ 现用域名品牌性弱（无意义单词拼凑）
  ✔ 现用域名 Alexa/SimilarWeb 无流量指标
```

### 2.3 利好消息加分细则

| 事件类型 | 加分 | 说明 |
|---------|------|------|
| A轮及以上融资（过20M USD） | +10 | 融资后通常需要品牌升级 |
| IPO / SPAC 上市吉刨 | +8 | 上市公司对域名品牌有兴趣 |
| 新业务线 / 新品牌发布 | +5 | 业务扩展带来域名需求 |
| 行业最近生成强增长报道 | +3 | 行业热度决定终端主动联系意愿 |

### 2.4 数据源清单

- **Crunchbase** — 融资/上市/创始人变动
- **Google News** — 关键词搜索 “[domain keyword] funding 2025”
- **CIPO / 商标局** — 新增商标申请
- **LinkedIn** — 终端公司网络存在性验证

---

## 三、域名本身品质评分（满分 100）

### 3.1 长度评分表

| 字符数（含后缀前） | 分数 | 市场参考 |
|------------|------|----------|
| 1–2字 | 100 | cloud.com $11M, voice.com $30M |
| 3–4字 | 92–98 | zkp.com $5M, VJN.com $39K |
| 5–6字 | 80–92 | OYZTA.com 上架利平均 $5K–$25K |
| 7–9字 | 55–80 | 主流两单词品牌类 |
| 10–14字 | 30–55 | 需强终端匹配导流通性 |
| 15字以上 | ≤ 15 | 仅限精准匹配长尾关键词 |

### 3.2 词汇类型加分

| 类型 | 加分 | 示例 |
|------|------|------|
| 单一英文单词（字典词） | +15 | money.com, voice.com |
| CVCV 四字结构 | +12 | dujo.com, oyzta.com 模式 |
| 两单词可拼接品牌（Blended） | +10 | MakeMatter.com, PressBridge.com |
| 高价关键词域名（Finance/Health/AI） | +8 | ExpressLoans.com, RiversideHealth.com |
| 数字+字母混合 | -5 | 如 4U.com, 1stCar.com |
| 包含连字符 (-) | -8 | Best-Deals.com |
| 拼写难发音 | -10 | 如 Bxqzt.com |

### 3.3 历史域名状态检查

- WHOIS 创建日期：越早越好（1990s–早期 +10，2020年后 ±0）
- Wayback Machine 历史建站记录：曾有实质内容 +5
- UDRP / 争议记录：-20（重大费频）
- 商标注册冲突局饵：-15

---

## 四、市场价格参考体系（满分 100）

### 4.1 当前市场挖单价对标表

> 数据源：Sedo 2026-06 成交展示、BrandDo上架定价、OYZTA平台成交单均价

| 域名类型 | 参考市场唳价区间 | 代表成交 |
|---------|------------------|---------|
| 两单词品牌类 (.com) | $3,000 – $15,000 | MakeMatter.com $15K，PressBridge.com $5K |
| CVCV .com | $15,000 – $50,000 | dujo.com $36K |
| 三字母 .com | $30,000 – $80,000 | VJN.com $39K |
| 两字母+单词 .com | $100,000 – $10M | Dragonfly.com，Money.com $10.5M |
| 单词类关键词 .com | $100,000 – $3.5M | WaterFilters.com $3.5M |
| .ai 域名 | $5,000 – $15,000 | MyCar.ai $10K，kickers.ai $8K |
| .io 域名 | $5,000 – $15,000 | expedite.io $14,995 |
| ccTLD 优质域名 | $3,000 – $25,000 | Chance.de $21.8K，NEX.de $10K |
| 初级品牌类 | $1,500 – $2,000 | FixJar.com $1,993 |

### 4.2 市场平台尚架价参考

| 平台 | 定价逐项 | 备注 |
|------|---------|------|
| **BrandDo** | 两单词 $199–$1,200；简短自造词 $999–$9,999 | 固定价/出价两种模式 |
| **OYZTA** | 精选域名均价 $5K–$25K | Stripe支付，Auth-Code转移 |
| **Efty Investor** | 四字域名 $4–$4，平均 $5K–$25K | Outbound主导 |
| **iBusinessNames** | 初级品牌类 $1,500–$2,000 | FixJar.com类 |
| **Sedo** | 小型 $2,500–$5,000；中型 SaaS $15K–$50K | 经纪 $89K Balaena.com |
| **Atom (Dan.com)** | Hand Reg Deals $7.75；Instant Premium起 | 不分期付款 |
| **Afternic GoDaddy** | Fast Transfer网络；LTO 分期付款模式 | GoDaddy 占全球 65.2% 注册市场 |

### 4.3 布局策略评分项

| 指标 | 评分 | 条件 |
|------|------|------|
| 已在 Afternic/Sedo 上架 | +8 | 多平台曝光提升成交機率 |
| 提供 Logo / 脉软借助工具 | +5 | OYZTA模式 |
| 支持 LTO 分期付款 | +4 | Afternic LTO 模式提升成交概率 |
| 已有播布经纪追踪 | +3 | James Booth / Arif Sengoren 结构 |

---

## 五、实时市场资讯抓取规则

### 5.1 数据源优先级

| 优先级 | 数据源 | 类型 | URL |
|---------|-------|------|-----|
| P0 | Domain Name Wire | 成交新闻 | domainnamewire.com |
| P0 | Sedo 成交公告 | 市场实价 | sedo.com |
| P0 | NameBio | 历史成交库 | namebio.com |
| P1 | DomainGang | 行业动态 | domaingang.com |
| P1 | domainclub.org | 社区经验 | domainclub.org |
| P1 | DomainInvesting.com | 投资视角 | domaininvesting.com |
| P2 | Estibot / GoDaddy估值 | 自动估值参考 | estibot.com |
| P2 | Afternic / GoDaddy | 小型上架定价 | afternic.com |
| P2 | BrandDo / OYZTA | 精品域名市场价 | branddo.com / oyzta.com |

### 5.2 每日监测内容

```
1. Domain Name Wire 最新 5 条成交新闻 → 更新市场局对标
2. Sedo / Afternic 实时成交 API → 相似结构域名定价校准
3. Identity Digital 官方公告 → TLD 注册量及价格调整
4. domainclub.org 论坛帖子 → 经纪 Outbound 策略经验
5. Estibot.com API → 自动估值作为辅助参考（非绑定权重）
```

### 5.3 成交新闻参考系数（市场乘数）

> 基于 Sedo 2026年 6月成交数据推算

| 域名结构 | 乘数 | 市场情绪 |
|---------|------|----------|
| 单词 .com | 1.4× | 长期稳定需求 |
| 两单词品牌 .com | 1.3× | 逐渐回暖趋势 |
| AI相关 .ai | 1.3× | 持续高热 |
| CVCV .com | 1.2× | 稳定消化 |
| ccTLD 优质 | 0.8× | 依地区市场确认 |
| 三字母 .com | 1.0× | 市场稳定 |

---

## 六、Outbound 主动销售规则

### 6.1 匹配继拄判断树

```
步骤1： Google 搜索 "[domain_keyword] company" → 找出匹配企业列表
步骤2： 排除已使用该域名的公司
步骤3： 根据下列条件构建优先级列表：
  ★★★ 大企业 + 有利好消息 + 现用域名较差
  ★★  中型企业 + 可搜到联系人 + 行业匹配
  ★   初创公司 + 行业匹配（价格谈判空间更大）
```

### 6.2 联系渠道优先级

1. LinkedIn InMail — 直接联系 CMO/CEO
2. 公司官网 联系表单
3. Hunter.io 抄写邮箱格式→ 发送简介邮件
4. domainclub.org / NamePros 经纪转介
5. Efty Investor 自动追踪 Outbound 流程

### 6.3 价格谈判参考层级

| 层级 | 价格区间 | 适用场景 |
|------|---------|----------|
| 自用建站 | $10 – $500 | 个人购买、庌期 |
| 初创品牌 | $200 – $2,000 | 命名师推州 + Logo |
| 中型企业品牌升级 | $2,000 – $100,000 | 基本市场，.COM主体 |
| 大企业 / 全球品牌 | $100K以上 | 须经纪谈判 + 法律支持 |

---

## 七、综合评分计算公式

```
最终得分 = 
  TLD强度得分 × W₁ +
  终端匹配度得分 × W₂ +
  域名品质得分 × W₃ +
  市场价格佔位得分 × W₄ +
  局对市场却动性得分 × W₅

默认权重：
W₁ = 0.20 (后缀强度)
W₂ = 0.25 (终端匹配)
W₃ = 0.20 (域名品质)
W₄ = 0.20 (市场定价)
W₅ = 0.15 (市场热度)
```

> 所有权重可在 v4 系统“⚙️ 权重设置” Tab 中自定义，支持保存多套方案。

---

## 八、AI 评委投喂提示词扩展（第六步维度建议）

### 建议将以下评分维度内嵌进提示词

| 维度编号 | 维度名称 | 对应核心规则章节 | 权重建议 |
|---------|---------|----------------|----------|
| D1 | TLD 后缀强度 | 第一章 | 20% |
| D2 | 终端匹配度 | 第二章 | 25% |
| D3 | 域名本身品质 | 第三章 | 20% |
| D4 | 市场定价佔位 | 第四章 | 20% |
| D5 | 市场资讯热度 | 第五章 | 10% |
| D6 | Outbound可操作性 | 第六章 | 5% |

---

## 九、评分等级转化价格预估匹配表

| 结果得分 | 等级 | 参考估值区间 | 补充说明 |
|---------|------|--------------|---------|
| 90–100 | 💎 顶级 | $200K – $2M+ | 单词.COM / 三字母高玉 |
| 80–89 | 🥇 优质 | $30K – $200K | CVCV / 两单词品牌层 |
| 70–79 | 🥈 良好 | $5K – $30K | 常规品牌类 .com |
| 60–69 | ⚠️ 谨慎 | $500 – $5K | 市场流通需局终端写病 |
| ≤ 59 | ❌ 低质 | < $500 | 不建议投资持有 |

---

## 十、数据源核心参考链接库

### 卡片类— 市场资讯
- [Domain Name Wire](https://domainnamewire.com/) — 每日成交新闻 P0
- [DomainGang](https://domaingang.com/) — 行业全景资讯
- [DomainInvesting.com](https://domaininvesting.com/) — 投资者视角
- [NamePros News](https://www.namepros.com/news/) — 社区新闻
- [DomainState](https://www.domainstate.com/) — 统计数据

### 卡片类— 市场价格
- [BrandDo](https://www.branddo.com/) — 品牌域名定价参考
- [OYZTA](https://www.oyzta.com/) — 精选域名成交记录
- [Efty](https://efty.com/) — Outbound CRM工具
- [Aftermarket.com](https://aftermarket.com) — 拍卖平台
- [MediaOptions](https://mediaoptions.com/) — 高端经纪
- [Squadhelp](https://www.squadhelp.com/) — 命名师 + 域名市场
- [SAW.com](https://saw.com/buy/) — 精品域名圈

### 卡片类— 局对与分析
- [Estibot](https://www.estibot.com/) — 自动估值 P2
- [NameBio](https://namebio.com/) — 历史成交库
- [domainclub.org](https://www.domainclub.org) — 经纪经验论坛
- [Domain Advisors](https://domainadvisors.com/) — 经纪资讯
- [Lumis](https://lumis.com/) — 数字资产和经纪咨询

---

*本文件由 Domain AI Judge 项目 5-Agent 团队协作生成。*
*驱动模型： Claude · MiMo · OpenCode · Hermes · Grok*
*项目仓库： [denyqqcom-cell/domain](https://github.com/denyqqcom-cell/domain)*
