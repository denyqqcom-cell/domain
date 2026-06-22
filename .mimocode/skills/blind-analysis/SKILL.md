---
name: blind-analysis
description: "Multi-agent blind analysis workflow for A-share market. Read task spec, collect real-time data via web search and APIs, write independent blind analysis, then merge and debate with other agents' outputs."
---

# Blind Analysis (盲审分析)

Perform an independent blind analysis of A-share market conditions as part of a multi-agent review cycle. This is the core workflow used in the 3-agent debate framework (Claude / Hermes / Grok).

## Trigger

User provides a task file (e.g. `YYYYMMDD_task_blind.txt`) or inline instructions with a date and analysis scope.

## Workflow

### Phase 1 — Task Intake

1. Read the task specification file. If user provides inline instructions instead, parse:
   - **Date** (analysis target date)
   - **Output path** (where to write your analysis)
   - **Scope** (which indices, sectors, themes to cover)
   - **Rules** (any special constraints like "真实数据", "防伪造")

### Phase 2 — Data Collection

Collect real-time data using **at least 3 independent sources**. Never rely on a single data point.

**Mandatory data categories:**
- Index levels: 上证指数, 深证成指, 创业板指, 科创50
- Sector performance: top gainers/losers with percentages
- Volume and turnover (成交额)
- Northbound capital flow (北向资金)
- Advance/decline counts (涨跌家数), limit-up/limit-down counts
- Key news and events

**Data source priority:**
1. **API endpoints** (most reliable):
   - `https://push2.eastmoney.com/api/qt/ulist.np/get?secids=1.000001,0.399001,0.399006,1.000688&fields=f43,f44,f45,f46,f47,f48,f170`
   - `https://push2delay.eastmoney.com/api/qt/stock/get?secid=1.000001&fields=f43,f44,f45,f46,f47,f48`
   - Sina K-line API: `https://quotes.sina.cn/cn/api/jsonp_v2.php/var/CN_MarketDataService.getKLineData?symbol=sh000001&scale=240&ma=no&datalen=30`
2. **Financial portals**: eastmoney.com, sina finance, cls.cn, yicai.com, 10jqka.com.cn
3. **Web search**: for context, news, analyst opinions

**Data integrity rules:**
- Cross-validate numbers across sources
- Record source URL and timestamp for each data point
- If an API fails, fall back to portal scraping but flag the lower confidence
- Never fabricate data — if you can't get a number, state "数据不可用"

### Phase 3 — Analysis

Write your blind analysis with these sections:

```markdown
# [Agent] 盲审分析 — YYYY-MM-DD

## 数据来源清单
| 数据项 | 来源 | 时间戳 |
|--------|------|--------|

## 指数数据
(上证、深成、创业、科创50 的点位、涨跌幅、成交量)

## 板块分析
(领涨/领跌板块, 涨跌幅, 资金流向)

## 盘面特征
(量能、北向资金、涨跌家数、市场情绪)

## 关键事件/消息
(影响市场的重大新闻)

## 技术面判断
(均线位置、支撑/压力位、趋势方向)

## 独立观点
(你自己的判断，不同于共识的部分要特别标注)
```

### Phase 4 — Output

1. Write your analysis to the specified output path
2. Reply `DONE` to signal completion
3. If the task requires a follow-up debate phase, proceed to Phase 5

### Phase 5 — Debate (Optional)

If `merged_blind.md` (other agents' combined analyses) is available:

1. Read the merged analysis
2. Identify **points of disagreement** (分歧)
3. For each disagreement:
   - State your position with evidence
   - Counter the opposing view
   - Assign a probability or confidence level
4. Write your debate response

## Anti-Patterns

- **Don't reuse cached data** from previous sessions — always collect fresh
- **Don't use training data** as market data — always verify with live sources
- **Don't write template analyses** — each day's conditions are different
- **Don't skip the data source table** — provenance is critical for blind review credibility
