# 20260623_claude_v64_scope_r1.md
# Round 1 — Claude 独立范围提案

**Agent**: Claude (via Perplexity MCP)
**日期**: 2026-06-23
**协议**: SuperGrok 辩论协议 v2
**基线**: v6.3.1 @ `7a10255`

---

## 0. 立场摘要

v6.3.2 的 P0 技术债**必须作为 v6.4 前置条件**并入，不单独发版。  
v6.4 主体聚焦于：**ANCHORS 价格地板保护**（已在 v6.2 规划）+ **批量评估 MVP** + **score6D 冗余清理**。  
中国市场（888/420）、BLACKLIST 半自动扩充 → 推迟，不纳入本版。

---

## 1. v6.4 应包含什么？

### 纳入（优先级排序）

**A. 技术债闭环（前置，P0 必须先过）**

| 条目 | 理由 | 估时 |
|------|------|------|
| A1: cloud.com 锚点 domain_status 修正 | 已知 bug，影响估值准确性 | 2h |
| A2: score6D 冗余字段清理 | 物料包体积冗余，AI 读取混乱 | 1h |
| A3: acquirable 混合类型说明 | 文档歧义影响下游使用 | 1h |
| A4: 最小回归表（≥5 域名基准） | v6.3.1 E2E 5/5 基准锁定，防回归 | 2h |
| A5: key_reasons 区分（锚点 vs 分类） | 物料包可读性，避免 AI 误判 | 2h |

**B. 产品增量（核心功能）**

| 条目 | 理由 | 估时 |
|------|------|------|
| B1: P2/P3 floor guard（ANCHORS 地板保护） | v6.2 PLAN 已设计，实测 VJN.com 已暴露缺陷，**最高价值 bug fix** | 4h |
| B2: 批量评估 MVP（textarea 多行 + 表格输出） | 核心使用场景，单用户最高频需求 | 6h |

**C. 中国市场** → **不纳入 v6.4**（见第 3 节）

**D. 维持排除**

- 非 .com/.ai 后缀 → v7.0（维持）
- AI 评委面板 → 需独立任务书（维持）
- BLACKLIST 半自动扩充 → 需更多真实样本，推迟到 v6.5

---

## 2. 推荐 v6.4 Sprint 打包方案

### Sprint 结构（建议顺序）

```
Week 1: A1–A5 技术债闭环（~8h）
  → 通过后，v6.3.1 回归基准升级为 v6.4 前置门禁

Week 2: B1 ANCHORS floor guard（~4h）
  → 使用 VJN.com / travely.com / TEX.COM 回归

Week 3: B2 批量评估 MVP（~6h）
  → 输入: textarea（每行一个域名）
  → 输出: 表格（域名 | asset_class | P1 range | pricing_method | confidence）
  → MVP 不含导出，不含历史记录

总计估时: ~18h 核心实现 + 辩论/审阅开销
```

### 风险评估

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 批量评估引入 UI 复杂度 | 中 | 中 | MVP 约束：纯表格，无排序/过滤 |
| floor guard 边界条件遗漏 | 中 | 高 | 6 条回归用例（CHANGELOG_v6.2_PLAN.md 已定义） |
| A5 key_reasons 改动影响现有输出格式 | 低 | 中 | 向后兼容字段追加，不删除旧字段 |
| Agent 超时导致 R1 缺票 | 中 | 低 | 协议 v2 ABSTAIN 机制覆盖 |

---

## 3. 与 v6.3.2 的关系

**结论：P0 技术债并入 v6.4 前置条件，不单独发版。**

理由：
1. v6.3.2 从未单独锁版，没有对应 commit tag，强行补版号会造成版本混乱
2. A1–A5 的实现量（~8h）可在 v6.4 Sprint 第一周完成，不影响主功能节奏
3. 统一在 v6.4 发版，changelog 一次性清晰，外部用户（AI 下游）不需要消化中间版本
4. **但**：A1–A5 必须在 B1/B2 实现**之前**通过回归，作为硬性前置门禁

---

## 4. 回归门禁

v6.4 锁版前，以下用例**全部必须 PASS**：

### 基准（v6.3.1 继承）

| 域名 | 预期 asset_class | 关键断言 |
|------|-----------------|----------|
| q.com | L_COM | P1 range 包含 $1M+ |
| derm.com | ULTRA_WORD_COM | score6D ≥ 90 |
| 3m.com | MIXED_SHORT_COM | acquirable = false，说明 ACTIVE_BRAND |
| 123456.com | GENERIC | P1 明显低于 NN_COM |
| VJN.com | LLL_COM | pricing_method = class_floor_guarded（v6.4 新增） |

### v6.4 新增门禁（floor guard 专项）

| 域名 | 场景 | 预期 pricing_method |
|------|------|---------------------|
| VJN.com | 锚点 $39k < LLL_COM 地板 | `class_floor_guarded` |
| GOKA.com | 锚点在 LLLL 正常区间 | `anchor_based` |
| 62.com | NN_COM 锚点合理 | `anchor_based` |
| travely.com | VERIFIED_HIGH_VALUE，低锚点说明 | `class_floor_guarded` 或 `anchor_based`（含 note） |
| TEX.COM | LLL_COM，无锚点 | `static_class` |

### 批量评估门禁（B2 专项）

| 测试 | 断言 |
|------|------|
| 输入 5 行域名，全部返回表格行 | 无崩溃，无空行 |
| 含空行 / 重复域名 | 去重 + 跳过空行 |
| 单个域名评估结果与单独评估一致 | 批量 = 单个，误差 < 5% |

---

## 5. 流程改进建议

### 对辩论协议 v2

1. **R2 输入截止时间应明确**：建议 R1 全票落盘后 +24h 开始 R2，避免 Agent 读到未完成的 R1
2. **ABSTAIN 阈值文档化**：协议写的是"3/4 多数可推进"，但未说明是否含 Grok 自身票——建议明确"投票人 = Claude + Hermes + OpenCode + MiMo，Grok 不计入投票分母"
3. **共识合并算法**：FINAL 文件建议按"优先级加权投票"而非简单多数——每个 Agent 对每条目的优先级（P0/P1/P2/排除）取中位数，避免单一强烈反对者阻塞共识

### 对 /goal 集成

4. **M3 FINAL 共识的格式应前置约定**：建议 Grok 在 R1 任务发出时同步发布 `FINAL_consensus_template.md`，避免 R3 后格式不一致需要重新合并
5. **M6 E2E 报告应含截图或 stdout 存档**：纯文字报告无法独立验证，建议附 CLI 输出截图或日志片段

---

## 附：我对 MiMo 中国市场提案的立场

MiMo 将 888/420 数字质量评分列为 P0，我**不同意**该优先级，理由：

1. 数字质量算法需要足够真实样本才能校准权重，目前 v6.3.1 样本库不足
2. 吉利数字的文化权重因买家市场（中国 vs 西方）差异极大，硬编码规则容易误判
3. 该功能对核心估值准确性的提升有限，但实现风险高（需定义 888/420/666 等的具体加权系数）
4. **建议**：先采集 20+ 真实中文买家成交案例，再做 v6.5 专项，不在 v6.4 引入

---

SCOPE_VOTE: APPROVED
