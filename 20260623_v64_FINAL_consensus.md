# 20260623_v64_FINAL_consensus.md
# v6.4 FINAL 共识文件

**协议**: SuperGrok 辩论协议 v2  
**里程碑**: M3 — FINAL 共识锁版  
**日期**: 2026-06-23  
**基线**: v6.3.2 @ `49a3288`  
**投票**: 5 Agent，R2 全部收敛，无剩余分歧  

---

## 投票汇总（R1 + R2 最终状态）

| Agent | R1 表决 | R2 最终 | 备注 |
|-------|---------|---------|------|
| **Claude** | APPROVED（基线错误） | ✅ CONVERGED | 基线修正，接受 B2→B1、L1、VJN 纠正 |
| **Grok** | NEEDS_CHANGES | ✅ CONVERGED | 基线纠正被采纳，B2 优先被采纳 |
| **MiMo** | CONDITIONAL_APPROVED | ✅ CONVERGED | L1 条件被 Claude 接受 |
| **OpenCode** | APPROVED WITH CONDITIONS | ✅ CONVERGED | VJN 纠正被采纳，A5 双字段被采纳 |
| **Hermes** | NEEDS_CHANGES | ✅ CONVERGED | 中位数合并算法被采纳，基线纠正被采纳 |

**M3 判定：5/5 收敛，FINAL 共识有效。**

---

## 一、v6.4 范围（锁版）

### 🔴 P0 必修（~13h）

| # | 条目 | 估时 | 验收标准 |
|---|------|------|---------|
| **A5** | key_reasons 双字段结构化 | 2h | `key_reasons`（含 `[tag]` 前缀字符串）+ `key_reasons_v2`（结构化对象数组）同时输出；旧解析器向后兼容 |
| **B2-P1** | 批量评估 MVP Phase 1 — CLI 模式 | 3h | textarea 输入 → `<pre>` 纯文本表格；5 行输入 → 5 行输出无崩溃 |
| **B2-P2** | 批量评估 MVP Phase 2 — UI 模式 | 3h | 独立 `<table>` 组件；去重、空行跳过、错误行标记；逐行加载动画 |
| **B1** | P2/P3 floor guard 扩展 | 4h | `CLASS_P2_FLOOR` + `CLASS_P3_FLOOR` 常量表；`applyAnchorFloorGuard()` 返回值扩展；5 条新增回归 PASS |
| **G6** | version_manifest JSON 字段 | 1h | valPack 输出含 `version_manifest: {schema_version, core_rules_version, commit_hash, release_date, baseline_regression_count}` |

### 🟡 P1 可选（~2.5h，不阻塞发版）

| # | 条目 | 估时 | 触发条件 |
|---|------|------|---------|
| **C1** | culture_weight schema 预埋 | 1h | valPack 新增 `culture_weight: null` + `_culture_weight_note: "RESERVED v6.4"`；CORE_RULES 写入 v6.4 恒 null 约束 |
| **C2** | 中文数字域名样本采集骨架 | 0.5h | `data/cn_numeric_samples.jsonl` 入仓（空文件 + 采集模板注释）；`data/CN_SAMPLE_TRACKER.md` 入仓 |
| **C3** | 协议改进 G1-G3 + P4 + P5 文档化 | 1h | `20260623_agent_debate_protocol_v2.md` 补充五条改进条款 |

### ⚪ 明确排除（本版本不做）

| 条目 | 原因 | 目标版本 |
|------|------|---------|
| 888/420 数字评分算法 | 样本不足，需 ≥20 条真实中文成交 | v6.5 |
| BLACKLIST 半自动扩充 | 需更多误判样本 | v6.5 |
| G5 pricing_anomaly 差异视图 | 超出 MVP 边界 | v6.5 |
| 非 .com/.ai 后缀 | — | v7.0 |
| AI 评委面板 | 需独立任务书 | TBD |

---

## 二、关键设计决策（锁版）

### D1：culture_weight 预埋约束（Claude L1 条件）

```json
{
  "culture_weight": null,
  "_culture_weight_note": "RESERVED v6.4: not active, not used in pricing. v6.5 only."
}
```

**硬约束**（写入 CORE_RULES v2 §culture_weight）：
> v6.4 中 `culture_weight` 恒为 null。任何在 v6.4 代码路径中读取或依赖此字段的逻辑，视为 v6.4 回归失败。v6.5 激活时需同步删除本条约束。

### D2：A5 key_reasons 双字段方案（G7 + OpenCode 合并）

```json
{
  "key_reasons": [
    "[anchor] cloud.com 于 $11,000,000 成交（DNJournal verified）",
    "[class] ULTRA_WORD_COM 类别，P1 $500K–$2M+",
    "[score6D] 综合评分 95/100"
  ],
  "key_reasons_v2": [
    {"tag": "anchor", "reason": "cloud.com 于 $11,000,000 成交（DNJournal verified）"},
    {"tag": "class", "reason": "ULTRA_WORD_COM 类别，P1 $500K–$2M+"},
    {"tag": "score6D", "reason": "综合评分 95/100"}
  ]
}
```

合法 `tag` 枚举值：`anchor` | `class` | `market` | `risk` | `score6D`

### D3：B1 回归用例纠正（OpenCode 纠正，Claude 接受）

VJN.com 不作为 B1 主要回归用例（已在 `ACTIVE_BRAND_BLACKLIST`，走 `static_class`，不经过 floor guard 路径）。

**B1 官方回归用例（5 条）**：

| 域名 | 场景 | 预期 pricing_method |
|------|------|---------------------|
| fxl.com | 锚点 $30K < LLL_COM P1 地板 $100K，完全低于地板 | `class_floor_guarded` |
| fxm.com | 锚点 $80K，P1 下界低于地板 $100K，上界正常 | `anchor_floor_adjusted` |
| GOKA.com | LLLL_PRONOUNCEABLE_COM，锚点 $399K 在正常区间 | `anchor_based` |
| 62.com | NN_COM，锚点合理，guard 未触发 | `anchor_based` |
| TEX.COM | LLL_COM，无锚点 | `static_class` |

### D4：B2 架构决策（OpenCode 建议，全体接受）

```javascript
function evaluateDomain(raw)      // 纯函数，供单个和批量共用
function renderResult(result)     // 渲染单个卡片（现有逻辑）
function renderBatchTable(results) // 渲染批量表格（新增）
```

**一致性验证**：批量调用 `evaluateDomain()` 结果与单个调用误差 < 5%。

### D5：中文样本采集为并行任务（不入发版门禁）

- `data/cn_numeric_samples.jsonl` 入仓即满足 C2（空文件 + 模板注释亦可）
- ≥5 条真实样本为建议目标，非 v6.4 硬性阻塞条件
- ≥20 条为 v6.5 R1 启动前置条件（写入本 FINAL 共识）

---

## 三、v6.4 Sprint 执行顺序（锁版）

```
基线: v6.3.2 @ 49a3288（19 条回归基准，全部继承）

Week 1:
  ├── A5 key_reasons 双字段（~2h）
  └── B2 Phase 1 CLI 模式（~3h）
  门禁: v6.3.2 19 条 PASS

Week 2:
  ├── B2 Phase 2 UI 模式（~3h）
  └── B1 P2/P3 floor guard（~4h）
  门禁: B1 5 条回归 PASS（fxl/fxm/GOKA/62/TEX）

Week 3:
  ├── G6 version_manifest（~1h）
  ├── C1 culture_weight 预埋 + CORE_RULES 约束（~1h）
  ├── C2 中文样本骨架入仓（~0.5h）
  ├── C3 协议改进文档化（~1h）
  └── 集成测试 + 回归全量
  门禁: 全量回归 PASS（19 条继承 + 8 条新增）

总估时: ~13–14.5h 核心实现
```

---

## 四、v6.4 回归门禁（完整清单）

### 继承 v6.3.2（19 条，CORE_RULES §X）

（见 v6.3.2 CORE_RULES §X，此处不重复列举，锁版前全部 PASS）

### v6.4 新增（8 条）

| # | 域名/场景 | 验证点 | 关联条目 |
|---|-----------|--------|---------|
| N1 | fxl.com | pricing_method = class_floor_guarded | B1 |
| N2 | fxm.com | pricing_method = anchor_floor_adjusted；P1 下界 ≥ $100K | B1 |
| N3 | GOKA.com | pricing_method = anchor_based；P2/P3 未被错误 floor | B1 |
| N4 | 62.com | pricing_method = anchor_based；guard 未触发 | B1 |
| N5 | TEX.COM | pricing_method = static_class；无锚点路径正常 | B1 |
| N6 | 5 行批量输入 | 5 行输出，无崩溃，无空行 | B2 |
| N7 | 批量 = 单个 | 误差 < 5%（任意 3 个测试域名） | B2 |
| N8 | 含 culture_weight 的 valPack | culture_weight 恒为 null，_culture_weight_note 存在 | C1 |

---

## 五、协议 v2 改进条款（共识锁版）

以下五条写入 `20260623_agent_debate_protocol_v2.md`（C3 执行）：

| # | 条款 | 来源 |
|---|------|------|
| P1 | R2 在 R1 最后一票落盘时间戳 +24h 后开放 | Claude R1 |
| P2 | 投票分母 = Claude + Hermes + OpenCode + MiMo（Grok 不计入）；ABSTAIN 不计入分母 | Claude R1 + Grok R1 |
| P3 | 优先级合并用中位数；锁版用多数决（≥3/4）；「仅信息不对称」不构成有效反对 | Hermes R1 + Claude R2 变体 |
| P4 | 「分轨并行」标准模式：数据采集轨可先行，不阻塞功能轨，不入发版门禁 | MiMo R2，Claude R2 接受 |
| P5 | Schema 预埋-激活两步协议：预埋字段须在 CORE_RULES 标注版本锁，v6.4 内读取预埋字段视为回归失败 | Claude R2 新增 |

---

## 六、v6.5 候选议题池（预登记，非承诺）

| 议题 | 来源 Agent | 前置条件 |
|------|-----------|---------|
| 888/420/666/520/168 中文数字评分算法 | MiMo | ≥20 条真实中文成交样本 |
| culture_weight 激活与校准 | MiMo | ≥20 条样本 + v6.4 schema 预埋 |
| 拼音域名语义层 | MiMo | — |
| G5 pricing_anomaly 差异视图 | Grok | B2 稳定运行后 |
| BLACKLIST 半自动扩充 | Claude | ≥10 条误判样本 |
| B2 CNY 本地化列 | MiMo | — |

---

## 七、M3 完成声明

**所有 R1/R2 分歧已收敛，无剩余争议。**

下一步：
- **M4**: Hermes 执行 index.html + CORE_RULES 按共识改动，版本号升为 v6.4
- **M5**: 4 Agent 独立落盘 `*_v64_lock_review.md`
- **M6**: Grok E2E，`20260623_grok_v64_e2e.md`，回归全量
- **M7**: Hermes 合并 4/4 APPROVED 后 push main

---

*FINAL consensus · Domain AI Judge v6.4 · SuperGrok 辩论协议 v2 · 2026-06-23*  
*生成自：5 Agent R1+R2 真实投票，中位数优先级合并，无代录*
