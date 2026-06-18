# Domain AI Judge v5

> **域名价值评估系统** — 6维评分 · 5 AI评委投票 · GPT5.5 结构化Prompt · 实时市场资讯

🌐 **在线使用**：[https://denyqqcom-cell.github.io/domain](https://denyqqcom-cell.github.io/domain)

---

## 功能概览

| 功能 | 说明 |
|------|------|
| ⚡ 6维评分 | TLD强度 / 终端匹配 / 域名品质 / 市场定价 / 市场热度 / Outbound操作性 |
| 💰 三档估值 | 批发价（同行）/ 品牌溢价（命名师）/ 终端零售（企业）|
| 🤖 AI评委面板 | 粘贴各AI返回分数，自动去头尾均分 |
| 📄 结构化Prompt | 一键生成含6维说明的GPT/Claude/Gemini评委提示词 |
| 📡 资讯提示 | 自动生成 DNW / NameBio / Crunchbase 监测链接 |
| 📈 历史记录 | 本地存储，支持CSV导出 |
| ⚙️ 权重自定义 | 6维权重可调，支持5种预设方案 |

---

## 快速使用

```
1. 输入域名，如 TEX.COM
2. 粘贴 .md 背景文件（终端公司、融资、现用域名、行业）
3. 点击「评估」→ 复制 AI 评委 Prompt
4. 发给 GPT-5.5 / Claude / Gemini / DeepSeek / Grok
5. 将各AI返回的 finalscore 填入评委面板
6. 系统自动去头尾均分 → 生成最终置信度结果
```

---

## 核心规则文件

| 文件 | 内容 |
|------|------|
| [CORE_RULES_v1.md](./CORE_RULES_v1.md) | 完整评分规则（TLD/终端/品质/市场/Outbound）|
| [CORE_RULES_v2.md](./CORE_RULES_v2.md) | v2升级说明（6维框架 + GPT5.5融合思路）|
| [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) | 各AI评委专属系统提示词 |
| [OUTBOUND_TEMPLATE.md](./OUTBOUND_TEMPLATE.md) | Outbound外销邮件模板库 |

---

## 数据源

| 优先级 | 来源 | 用途 |
|--------|------|------|
| P0 | [Domain Name Wire](https://domainnamewire.com/) | 每日成交新闻 |
| P0 | [Sedo](https://sedo.com) | 市场实价参考 |
| P0 | [NameBio](https://namebio.com/) | 历史成交库 |
| P1 | [DomainGang](https://domaingang.com/) | 行业动态 |
| P1 | [domainclub.org](https://www.domainclub.org) | 经纪人经验 |
| P2 | [BrandDo](https://www.branddo.com/) | 品牌域名定价 |
| P2 | [OYZTA](https://www.oyzta.com/) | 精选成交记录 |
| P2 | [Afternic](https://afternic.com) | Fast Transfer布局 |
| P2 | [Estibot](https://www.estibot.com/) | 自动估值参考 |

---

## 技术栈

- 纯静态 HTML + CSS + JavaScript（无后端）
- GitHub Pages 部署
- 本地 localStorage 存储历史记录

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v5.0 | 2026-06-18 | 6维评分 + GPT5.5 Prompt + 价格置信度 + 资讯提示 |
| v4.0 | 2026-06-18 | 9项功能完整版（雷达图/趋势图/PDF导出）|
| v1.0 | 2026-06-18 | 初始版本，5 Agent协作设计 |

---

*由 5-Agent 团队协作设计：Claude · MiMo · OpenCode · Hermes · Grok*
