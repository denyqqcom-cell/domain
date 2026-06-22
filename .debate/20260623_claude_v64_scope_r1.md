# Claude — v6.4 Scope Proposal (Round 1)

**Agent**: Claude  
**Date**: 2026-06-23  
**Baseline**: v6.3.1 @ `7a10255` (E2E 5/5 PASS)  
**Protocol**: SuperGrok Debate v2

---

## 1. v6.4 应包含什么？

### 入选（按优先级排序）

| # | 条目 | 来源 | 优先级 | 理由 |
|---|------|------|--------|------|
| S1 | cloud.com 锚点 domain_status 补全 | Hermes P0-1 | P0 | 数据完整性缺陷，维护分裂风险 |
| S2 | score6D D4/D6 冗余数组清理 | Hermes P0-2 | P0 | 三 Agent 独立发现的死代码，越晚清越容易误读 |
| S3 | acquirable 混合类型 AI 提示词显式说明 | Hermes P0-3 | P0 | 直接影响 AI 评委输出质量 |
| S4 | 最小回归表（5 域名固化到 CORE_RULES §十） | Hermes P0-4 / MiMo M4 | P0 | 无回归表 = 未来改动无安全带 |
| S5 | key_reasons 区分类别地板 vs 行业热点缩写 | Hermes P1-1 | P1 | 影响估值报告可读性 |
| S6 | y 不算元音规则文档化 | Hermes P1-2 / MiMo M1 | P1 | 规则可审计性 |
| S7 | 结果卡 acquirable badge | Hermes P1-3 / OpenCode O1 | P1 | 用户对"能不能买"的判断 |
| S8 | GOKA chip 标签修正 | Hermes P2-1 / MiMo M3 | P2 | UI 一致性，5 分钟修 |
| S9 | 888/420 数字质量评分（阶段 A） | MiMo P0 / CHANGELOG #2 | P0* | 中国市场核心缺失——见下文专论 |

### 排除（维持 v6.3.1 决策或推迟）

| 条目 | 决策 | 理由 |
|------|------|------|
| 非 .com/.ai 后缀扩展 | 排除 → v7.0 | 架构级变更，需独立规划 |
| AI 评委面板 | 排除 → 需先写任务书 | 范围未定义 |
| ACTIVE_BRAND_BLACKLIST 自动扩充 | 推迟 → v6.5 | 独立工程，需接入外部数据源 |
| fixtures.json + node 回归脚本 | 推迟 → v6.5 | 测试基础设施，非用户可见功能 |

### 关于数字质量评分（S9）的特别说明

MiMo 从中文投资人视角将 888/420 数字质量评为 P0，理由充分：中国市场数字域名交易占比 >60%，系统对 888.com 和 420.com 输出相同评分是**功能性错误**。但此条目工时较长（3-5 天），且需要 NameBio 成交数据校准。

**我的立场**：v6.4 应包含数字质量评分的**最小可用版本**（阶段 A：含 8/6/9 密度 + 含 4 标记 + 豹子号检测），但可接受将其作为 v6.4 的独立子 Sprint，在技术债闭环完成后再启动。如果辩论中多数 Agent 认为工时不可控，可降级为 v6.5 P0。

---

## 2. 推荐 v6.4 Sprint 打包方案

### Phase 1 — 技术债闭环（~1.5 小时）

| # | 条目 | 工时 | 文件 |
|---|------|------|------|
| S1 | cloud.com 锚点 domain_status | 2 min | index.html ANCHORS + CORE_RULES §六 |
| S2 | score6D 冗余清理 | 5 min | index.html score6D() |
| S3 | acquirable 混合类型说明 | 10 min | index.html generatePack + CORE_RULES §五之二 |
| S4 | 最小回归表 | 15 min | CORE_RULES_v2.md §十 |
| S5 | key_reasons 区分 | 15 min | index.html generatePack 提示词 |
| S6 | y 不算元音文档化 | 10 min | CORE_RULES_v2.md §二 + index.html 注释 |
| S8 | GOKA chip 标签 | 5 min | index.html example chips |
| S7 | acquirable badge | 20 min | index.html + CSS |

**小计**: ~82 分钟，风险低，全部可独立验证。

### Phase 2 — 中国市场数字评分（~3-5 天）

| # | 条目 | 工时 | 文件 |
|---|------|------|------|
| S9 | 数字质量特征提取 + 加减分权重 | 3-5 天 | index.html score6D() D3 + 新函数 |

**风险**: 中等——需要成交数据校准，加分规则可能需多轮辩论。建议 Phase 2 内部再分阶段 A（基础特征）和阶段 B（豹子号/顺子号/吉利数字加分）。

### 总工时估算

| Phase | 工时 | 风险 |
|-------|------|------|
| Phase 1 | ~1.5 小时 | 低 |
| Phase 2 | 3-5 天 | 中 |
| **总计** | **~4-6 天** | 中 |

---

## 3. 与 v6.3.2 的关系

**建议：不单独发 v6.3.2，将 P0 技术债直接并入 v6.4 前置条件。**

理由：
1. v6.3.2 的 4 个 P0 项（cloud.com、score6D、acquirable、回归表）总工时仅 ~30 分钟，不值得独立发版
2. 辩论协议 v2 的三轮流程（R1→R2→R3）本身就有开销，拆成两个版本会增加一次完整的辩论周期
3. v6.3.1 已 E2E 5/5 PASS，当前无阻断性 bug 需紧急热修复
4. 将技术债闭环作为 v6.4 Phase 1，既清理了债务，又为 Phase 2 的数字评分建立了回归基线

**前置条件**：Phase 1 全部完成后，才能启动 Phase 2。Phase 1 的回归表（S4）是 Phase 2 的安全网。

---

## 4. 回归门禁

v6.4 锁版前必须通过以下域名/用例：

### 基线回归（v6.3.1 五域名，不可回退）

| 域名 | 预期分类 | 预期分数 | 预期特征 |
|------|----------|----------|----------|
| nfts.com | LLLL_COM | 82 | anchor_based → $15M, active_brand |
| qrst.com | LLLL_COM | 82 | static_class, 无锚点 |
| vjn.com | LLL_COM | 88 | static_class, investment_inventory + listing |
| cloud.com | ULTRA_WORD_COM | 92 | anchor_based → $11M, active_brand |
| google.com | WORD_COM | 75 | static_class, active_brand（黑名单） |

### v6.4 新增回归（Phase 1 完成后追加）

| 域名 | 验证点 |
|------|--------|
| GOKA.com | chip 标签显示 LLLL可发音（非 LLLL） |
| lynx.com | y 不算元音 → LLLL_COM（非 LLLL_PRONOUNCEABLE_COM） |
| cloud.com | ANCHORS 表包含 domain_status: active_brand |
| 任意 active_brand 域 | 结果卡显示 acquirable badge |

### v6.4 新增回归（Phase 2 完成后追加）

| 域名 | 验证点 |
|------|--------|
| 888.com | 数字质量评分 ≠ 420.com（含 8 加分） |
| 420.com | 含 4 标记（减分或标注） |
| 168.com | "一路发"吉利数字识别 |
| 8888.com | 豹子号检测 + 吉利加分 |

---

## 5. 流程改进建议

### 对辩论协议 v2 的补充

1. **R1 阶段增加"工时约束"字段**：当前 R1 只问"包含什么"，没有工时上限约束。建议 R1 每个条目标注工时，R2 辩论时可基于总工时做取舍，避免 R2 才发现 scope 过大。

2. **Phase gate 机制**：Phase 1 和 Phase 2 之间应有明确的 gate——Phase 1 全部 APPROVED 后才启动 Phase 2。避免数字评分的复杂性阻塞技术债闭环的交付。

3. **回归表的版本化**：每次锁版时，回归表应追加而非覆盖。建议 CORE_RULES §十 采用 `| 域名 | ... | 首次锁定版本 |` 格式，方便追溯。

### 对 /goal 的补充

4. **M4 拆分**：当前 M4 是"实现 + 文档"一个里程碑。建议拆为 M4a（Phase 1 实现）和 M4b（Phase 2 实现），分别验收。这样即使 Phase 2 延期，Phase 1 的成果也不会被阻塞。

---

## 总结

v6.4 应聚焦两个目标：
1. **Phase 1**：闭环 v6.3.x 全部技术债（8 项，~1.5 小时），建立回归基线
2. **Phase 2**：中国市场数字质量评分（阶段 A，3-5 天），解决系统在数字域名占比 >60% 的中国市场的可用性问题

不单独发 v6.3.2。排除非 .com/.ai 扩展、AI 评委面板、BLACKLIST 自动扩充。

SCOPE_VOTE: APPROVED
