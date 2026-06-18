# Domain AI Judge v5.2

> 域名 AI 多评委打分估值工作台 · 资产类别优先 · CORE_RULES v2 对齐

🔗 **在线使用**：https://denyqqcom-cell.github.io/domain/

---

## 功能表

| 功能 | 说明 |
|------|------|
| 资产类别优先判定 | 先判 LLL_COM / ULTRA_WORD_COM / AI_KEYWORD_TLD 等，再算分 |
| 六维评分框架 | TLD强度 / 终端匹配 / 域名品质 / 市场定价 / 市场热度 / Outbound操作性 |
| 分类价格输出 | 稀缺资产：投资人流通底价 / 品牌资产价 / 终端报价区间 |
| 成交锚点校准 | 内置 10 条公开成交（cloud.com $11M – MyCar.ai $10K） |
| AI 评委投票 | 录入多个 AI 的 `final_score`，自动去头尾均分 |
| 结构化报告生成 | 自动生成 域名.md + AI 评委提示词 |
| 市场监测链接入口 | 自动生成 DNW / NameBio / Crunchbase 检索链接 |
| 历史排名 & CSV 导出 | 本地内存存储，刷新后清空，支持 CSV 即时导出 |

---

## 快速使用

1. 打开在线页面，输入域名（如 `TEX.COM`）
2. 可选粘贴终端企业 / 融资 / 现用域名等背景信息
3. 点击「⚡ 评估」，查看资产类别、六维分数、价格区间
4. 复制「域名.md」+ AI 评委提示词，分别投喂多个 AI
5. 将各 AI 返回 JSON 中的 `final_score` 填入评委面板
6. 点击「计算均分」→ 系统自动去头尾均分

> 建议至少录入 3 个 AI 评委分数以启用自动去头尾均分模式。

---

## 资产类别优先级

| 类别 ID | 示例 | 最低分 | 价格标签 |
|---------|------|--------|----------|
| `LL_COM` | AA.com | 95 | 投资人流通底价 |
| `LLL_COM` | TEX.com | 88 | 投资人流通底价 |
| `ULTRA_WORD_COM` | Cloud.com, Excel.com | 92 | 投资人流通底价｜需人工复核 |
| `WORD_COM` | Travel.com | 82 | 投资人流通底价 |
| `LLLL_PRONOUNCEABLE_COM` | GOKA.com | 78 | 投资人底价 |
| `SHORT_NUMERIC_COM` | 12345.com | 75 | 投资人流通底价 |
| `AI_KEYWORD_TLD` | MyCar.ai | 69 | 投资人流通价 |
| `GENERIC` | 普通域名 | 0 | 同行参考价 |

---

## 防回归测试样例

| 域名 | 应识别类别 | 应显示价格标签 | 备注 |
|------|-----------|--------------|------|
| TEX.COM | `LLL_COM` | 投资人流通底价 | 不得显示普通批发价 |
| GOKA.com | `LLLL_PRONOUNCEABLE_COM` | 投资人底价 | 参照 $399,995 成交 |
| Derm.com | `ULTRA_WORD_COM` | 投资人流通底价｜需人工复核 | 医疗高价值单词 |
| Excel.com | `ULTRA_WORD_COM` | 投资人流通底价｜需人工复核 | Ultra Premium |
| 12345.com | `SHORT_NUMERIC_COM` | 投资人流通底价 | 短数字.COM |
| MyCar.ai | `AI_KEYWORD_TLD` | 投资人流通价 | 不得重复加权 |
| Farfield.com | `VERIFIED_HIGH_VALUE_COM` | 投资人底价 | 参照 $15,000 |
| Travely.com | `VERIFIED_HIGH_VALUE_COM` | 投资人底价 | 参照 $13,000 |

---

## 文件结构

```
domain/
├── index.html              ← 主工具（v5.2）
├── README.md               ← 本文件
├── CORE_RULES_v2.md        ← ✅ 当前核心规则（请使用此版本）
├── CORE_RULES_v1.md        ← ⚠️ Deprecated（早期草稿，已废弃）
├── AGENT_PROMPTS.md        ← ✅ 5大AI评委 System Prompt（v2 schema对齐）
└── OUTBOUND_TEMPLATE.md    ← Outbound 邮件模板
```

---

## 数据源说明

| 来源 | 优先级 | 状态 |
|------|--------|------|
| NameBio | P1 | ✅ 可用 |
| DNW (Domain Name Wire) | P1 | ✅ 可用 |
| DomainGang | P1 | ✅ 可用 |
| Sedo / Afternic | P1 | ✅ 可用 |
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
| v5.2 | 2026-06-19 | AGENT_PROMPTS 升级至 v2 schema；新增 ULTRA_WORD_COM；清理 OUTBOUND_TEMPLATE 平台口径 |
| v5.1 | 2026-06-19 | 资产类别优先、价格标签重命名、LLL_COM 最低分 88、成交锚点校准 |
| v5.0 | 2026-06-18 | 六维评分、多AI评委投票、生成域名.md |
| v4.x | 2026-06-17 | 三维评分初版 |
