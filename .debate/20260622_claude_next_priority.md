# v6.3.2 Priority Ranking — Domain AI Judge

**Author**: Hermes Agent (delegated)  
**Date**: 2026-06-23  
**Source context**: CHANGELOG_v6.3_PLAN.md "不做的事" (5项) + MiMo v6.3.1 Review deferred 建议 + 各 Agent 审阅中非阻断建议  
**Methodology**: 从功能完整性角度排序——先修错误/缺陷，再补半成品，最后做增量功能。

---

## 全景：所有待定项汇总

### CHANGELOG "不做的事"（v6.3.1 明确排除，5 项）

| # | 项目 | 来源 |
|---|------|------|
| D1 | 吉利数字自动加分 | CHANGELOG L125 |
| D2 | 888/420 数字质量评分 | CHANGELOG L126 |
| D3 | 非 .com/.ai 后缀扩展 | CHANGELOG L127 |
| D4 | AI 评委面板 | CHANGELOG L128 |
| D5 | ACTIVE_BRAND_BLACKLIST 自动扩充 | CHANGELOG L129 |

### MiMo deferred 建议（3 + 1 项）

| # | 项目 | 来源 |
|---|------|------|
| M1 | y不算元音规则写入 CORE_RULES | MiMo review §1.1 边界case #1 |
| M2 | key_reasons 区分类别地板 vs 行业热点缩写 | MiMo review §1.1 边界case #2 |
| M3 | GOKA chip 标签改正（LLLL → LLLL 可发音） | MiMo review §1.1 边界case #3 |
| M4 | 增加最小回归表（nfts/vjn/cloud/google/qrst 5行） | MiMo review §二 L118 |

### 其他 Agent 非阻断建议

| # | 项目 | 来源 |
|---|------|------|
| C1 | score6D D4/D6 条件链冗余清理 | Claude §四 + Hermes §1.4 |
| C2 | acquirable 混合类型 AI 提示词显式说明 | Claude §四 #2 |
| C3 | cloud.com 锚点补 domain_status: active_brand | OpenCode §六 #1 |
| O1 | 结果卡增加 acquirable badge | OpenCode §六 #2 |
| O2 | fixtures.json + node 脚本回归 | OpenCode §六 #3 |
| H1 | 无 v6.3 专项回归清单 | Hermes §三 |

---

## 优先级排序（功能完整性视角）

### 🔴 P0 — 阻断性修复（v6.3.2 必修，约 30 分钟）

这些项是 v6.3.1 已锁版但**不完整/存在已知缺陷**的部分，属于"锁版后才发现没做完"。

| 优先级 | 项目 | 理由 | 工时 |
|--------|------|------|------|
| **P0-1** | **cloud.com 锚点补 domain_status: active_brand** | cloud.com 同时在 BLACKLIST 和 ANCHORS 中，锚点表缺少 domain_status 标注。当前靠 BLACKLIST 兜底，行为正确但维护分裂——未来若 BLACKLIST 修改而 ANCHORS 忘改，行为会漂移。**数据完整性问题。** | 2 min |
| **P0-2** | **score6D D4/D6 冗余数组清理** | `['LLLL_COM','LLL_COM','NNN_COM']` 中 LLL_COM 为死代码（前一个条件已捕获）。不影响结果，但 Claude、Hermes、MiMo 三 Agent 独立发现。**代码卫生问题，越晚清越容易引入误读。** | 5 min |
| **P0-3** | **acquirable 混合类型 AI 提示词显式说明** | `acquirable` 实际值为 `true`(bool) / `false`(bool) / `"unknown"`(string)，AI 评委可能误判类型。CORE_RULES §五之二已说明，但 generatePack 内嵌 AI 提示词 JSON 模板未明确。**直接影响 AI 评委输出质量。** | 10 min |
| **P0-4** | **最小回归表（nfts/vjn/cloud/google/qrst 5行）** | MiMo 明确建议"可 v6.3.2"，且 Grok 浏览器实测已输出 5 域名正确结果——只需将实测数据固化为 CORE_RULES §十 新节，锁定为回归基准。**无回归表 = 未来改动无安全带。** | 15 min |

### 🟡 P1 — 高价值完善（v6.3.2 建议做，约 45 分钟）

这些项让 v6.3.1 的半成品功能真正"闭环"，提升 AI 评委准确性和用户体验。

| 优先级 | 项目 | 理由 | 工时 |
|--------|------|------|------|
| **P1-1** | **key_reasons 区分类别地板 vs 行业热点缩写** | 无锚点的 4 辅音域名（qrst.com）走 $50K–$500K+ 类别底价，有锚点的（nfts.com）走 $10M+ 锚点价。当前 AI 评委 key_reasons 不区分两者，可能误导投资人对普通 4 辅音域名预期过高。**影响估值报告可读性与投资人决策。** | 15 min |
| **P1-2** | **y不算元音规则写入 CORE_RULES** | 当前元音判定仅 `aeiou`。4 字母含 y 的可发音缩写（如 lynx.com）会落入 LLLL_COM 而非 LLLL_PRONOUNCEABLE_COM。规则本身可接受，但必须文档化，避免未来维护者误以为这是 bug。**规则可审计性要求。** | 10 min |
| **P1-3** | **结果卡增加 acquirable badge** | 当前 acquirable 仅在输入框 hint 和物料包中显示，主结果卡看不到。用户最快看到的 P1 价格卡片无"可收购/不可收购"标识。OpenCode 明确指出 active_brand 域名仍输出高额 P1 数字在产品语义上需要缓解。**直接影响用户对"这个域名能买吗"的判断。** | 20 min |

### 🟢 P2 — 中优先级增强（v6.3.2 可选，约 30 分钟）

| 优先级 | 项目 | 理由 | 工时 |
|--------|------|------|------|
| **P2-1** | **GOKA chip 标签改正** | chip 显示 `GOKA.com → LLLL`，实际为 LLLL_PRONOUNCEABLE_COM。用户点 chip 后结果卡正确显示 LLLL_PRONOUNCEABLE_COM，但 chip 标签长期误导测试人员。**小修，UI 一致性。** | 5 min |
| **P2-2** | **fixtures.json + node 脚本回归** | OpenCode 建议用 fixtures.json 固化 5+ 回归域名，一行 node 脚本跑全量。比手工点浏览器更可靠，且可集成到锁版门禁。**测试基础设施，长期价值高。** | 25 min |

### ⚪ P3 — 大型扩展（不放入 v6.3.2，建议单独规划）

这些是 CHANGELOG 明确列为"本次范围外"的项目，属于**新功能模块**而非缺陷修复，应独立评估需求后再启动。

| 优先级 | 项目 | 理由 |
|--------|------|------|
| **P3-1** | ACTIVE_BRAND_BLACKLIST 自动扩充 | 当前 9 个黑名单域名手动维护。自动化需要接入域名 Whois/建站检测/品牌数据库，是独立工程，不应混入 v6.3.2。**建议 v6.4 专项。** |
| **P3-2** | 吉利数字自动加分 + 数字质量评分 | 需更多真实成交样本才能校准加分规则，当前样本量不足。**建议积累数据后再启动。** |
| **P3-3** | 非 .com/.ai 后缀扩展 | 改动分类链（增加 .io/.org/.net 等分支），涉及 anchor 表、floor 表、六维评分全链路修改。**架构级变更，建议 v7.0 规划。** |
| **P3-4** | AI 评委面板 | CHANGELOG 提及但未定义范围。需先明确"AI 评委面板"是什么——是 Web UI 上的多模型打分看板？还是独立工具？**建议先写任务书，再排期。** |

---

## v6.3.2 推荐实施计划

### Sprint 目标
> 修复 v6.3.1 锁版后发现的 4 个缺陷 + 补齐 4 个高价值完善项，使 Domain AI Judge 在"估值准确性、数据完整性、AI 评委输出质量、用户可读性"四个维度达到 v6.3.x 分支的完整状态。

### 两阶段交付

**Phase 1（P0，必修）**: 4 项，约 30 分钟
1. cloud.com 锚点 domain_status → index.html ANCHORS 表 + CORE_RULES §六
2. score6D 冗余清理 → index.html score6D()
3. acquirable 混合类型说明 → index.html generatePack AI 提示词 + CORE_RULES §五之二
4. 最小回归表 → CORE_RULES_v2.md §十新增 v6.3.2 回归用例节

**Phase 2（P1，建议）**: 3 项，约 45 分钟
5. key_reasons 区分逻辑 → index.html buildKeyReasons() 或 generatePack 提示词规则
6. y不算元音文档化 → CORE_RULES_v2.md §四字母类说明
7. 结果卡 acquirable badge → index.html + CSS

**Phase 3（P2，可选）**: 2 项，约 30 分钟
8. GOKA chip 标签 → index.html example chips
9. fixtures.json + node 回归脚本 → /home/joe/domain/test/

### 不做的事（明确排除）
- ACTIVE_BRAND_BLACKLIST 自动扩充 → v6.4
- 数字域名加分 → 待样本积累
- 非 .com/.ai 扩展 → v7.0
- AI 评委面板 → 需先写任务书

---

## 五 Agent 待办

v6.3.2 执行时，建议沿用 v6.3.1 锁版流程：
1. Hermes 写 task → 并行调 Claude/OpenCode/MiMo/Grok 审阅
2. 修复后四 Agent 独立表决
3. Grok 浏览器端到端验证（回归 5 域名 + 新增回归用例）
4. Hermes 合并共识后 push

---

*20260622_claude_next_priority.md · Domain AI Judge · 2026-06-23*
