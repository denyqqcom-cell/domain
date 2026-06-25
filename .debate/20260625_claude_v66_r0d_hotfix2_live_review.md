# v6.6-R0d-hotfix2 Live 实现审查 — Claude（Rules/Docs/Contract）

**日期**: 2026-06-25  
**审查对象**: `/home/joe/domain` @ `9b97bc9` (`v6.6-R0d-hotfix2: fix AI Auditor Brief prompt contract (B2+)`)  
**对照**: `20260625_v66_r0d_hotfix2_task.md` · Round 2 B2+ scope  
**前置签核**: v6.6-R0d-hotfix @ `219d541` **ACCEPTED**（不撤销）；Round 1 @ `600f47c` **superseded** by B2+  
**审查方式**: Git HEAD 钉死 + 九门禁本机实跑 + `600f47c..HEAD` diff 走读 + QQ/BN brief P0 实证 + 定价路径零 diff grep

---

## Vote

# **APPROVED**

依据：九门禁 **202/202 PASS**（`v66_r0d_hotfix2` **54/54**，含 QQ/BN `copyAuditorBrief` P0）；`600f47c..HEAD` 内 `classifyAsset` / `make` / `applyAnchorFloorGuard` / `p3ManualReview` / `anchor_allowed` 定价路径 **零 diff**；B2+ 六件事全部闭合——`buildTransactionContext` unknown 默认 `pending_live_check` + `actionable:false` + `component_valuation_available:true`；schema 含 `website_check` / `class_reference_note` / `仅品类参考` / `pending_live_check`；`AUDITOR_TRANSACTION_GATE_RULES` 注入 `buildAiAuditorBrief`；`buildExpertMemo` LL_COM 走 `asset_class_judgment`（qq.com `pattern_judgment:null`，无五数字泄漏）；`validateAuditorJson` unknown+actionable:true → error、无 website_check 非全不可判定 → error；hotfix1 禁文案零匹配；8888/goka/55.csah 回归未退化。

---

## Git HEAD

```text
$ git rev-parse HEAD
9b97bc9697e651901ff0025356d680d857daf88e

$ git log -1 --oneline
9b97bc9 v6.6-R0d-hotfix2: fix AI Auditor Brief prompt contract (B2+)

$ git log 600f47c..HEAD --oneline
9b97bc9 v6.6-R0d-hotfix2: fix AI Auditor Brief prompt contract (B2+)

$ git diff --stat 600f47c..HEAD
 index.html                   | 109 ++++++++++++++++++++++++++++++++-----------
 test/v66_r0_gate.js          |   3 ++
 test/v66_r0c_gate.js         |   3 ++
 test/v66_r0d_hotfix2_gate.js |  87 +++++++++++++++++++++++++++++++++-
 test/v66_r0d_hotfix_gate.js  |   3 ++
 5 files changed, 177 insertions(+), 28 deletions(-)

$ git status -sb
## main...origin/main
?? .debate/* / test/r0e_*.md   # 非 hotfix2 签核范围
```

| 检查点 | 结果 |
|--------|------|
| HEAD 与 commit message 对齐 B2+ | ✅ |
| `index.html` 用户可见版本串 | ✅ 仍为 **v6.6-R0d-hotfix2**（B2+ 为 prompt/validator 补丁，未升版本号） |
| `origin/main` 同步 | ✅ `main...origin/main` 无 ahead |

---

## Gates 202/202

```text
$ node test/v66_r0_gate.js
--- 42 pass, 0 fail ---  exit 0

$ node test/v66_r0c0_gate.js
--- 23 pass, 0 fail ---  exit 0

$ node test/v66_r0c_gate.js
--- 17 pass, 0 fail ---  exit 0

$ node test/v66_r0d_gate.js
--- 16 pass, 0 fail ---  exit 0

$ node test/v66_r0d_hotfix_gate.js
--- 28 pass, 0 fail ---  exit 0

$ node test/v66_r0d_hotfix2_gate.js
--- 54 pass, 0 fail ---  exit 0

$ node test/r0f_top_numeric.js
--- Summary: 8 pass, 0 fail ---  exit 0

$ node test/r1_hotfix_verify.js
--- 10 pass, 0 fail ---  exit 0

$ node test/r1_pack_schema_verify.js
--- 4 pass, 0 fail ---  exit 0
```

| 门禁 | 计数 | exit | 任务基线 | Round 1 → Round 2 |
|------|------|------|----------|-------------------|
| `test/v66_r0_gate.js` | **42/42** | 0 | 42/42 ✅ | 不变 |
| `test/v66_r0c0_gate.js` | **23/23** | 0 | 23/23 ✅ | 不变 |
| `test/v66_r0c_gate.js` | **17/17** | 0 | 17/17 ✅ | 不变 |
| `test/v66_r0d_gate.js` | **16/16** | 0 | 16/16 ✅ | 不变 |
| `test/v66_r0d_hotfix_gate.js` | **28/28** | 0 | 28/28 ✅ | 不变 |
| `test/v66_r0d_hotfix2_gate.js` | **54/54** | 0 | 54/54 ✅ | **23 → 54**（+31 P0 brief/memo/validator） |
| `test/r0f_top_numeric.js` | **8/8** | 0 | 8/8 ✅ | 不变 |
| `test/r1_hotfix_verify.js` | **10/10** | 0 | 10/10 ✅ | 不变 |
| `test/r1_pack_schema_verify.js` | **4/4** | 0 | 4/4 ✅ | 不变 |

**合计**: **202/202 PASS**，无 fail、无 skip。

---

## Diff `600f47c..HEAD`（Round 2 B2+ delta）

### 变更文件（5）

| 文件 | 变更性质 | 在 B2+ 范围内 |
|------|----------|---------------|
| `index.html` | +109/-28：prompt contract、validator 硬化、ExpertMemo LL_COM 分支、`class_reference_note` 渲染 | ✅ |
| `test/v66_r0d_hotfix2_gate.js` | +87：QQ/BN brief P0、memo 无数字泄漏、validator 新规则 | ✅ |
| `test/v66_r0_gate.js` | bootstrap 扩展 `AUDITOR_TRANSACTION_GATE_RULES` + memo helpers | ✅ 回归兼容 |
| `test/v66_r0c_gate.js` | 同上 | ✅ |
| `test/v66_r0d_hotfix_gate.js` | 同上 | ✅ |

### B2+ 六件事对照

| # | B2+ 项 | `index.html` 证据 | Gate |
|---|--------|-------------------|------|
| 1 | `buildTransactionContext` unknown 默认 | L2274–2280：`pending_live_check` / `actionable:false` / `component_valuation_available:true` | `qq.com: pending_live_check` · `component valuation available` ✅ |
| 2 | `AI_AUDITOR_OUTPUT_SCHEMA` 扩展 | L2219 `pending_live_check`；L2230–2233 `仅品类参考` + `class_reference_note` | `pending_live_check` · `class_reference_note schema` · `仅品类参考 verdict` ✅ |
| 3 | `AUDITOR_TRANSACTION_GATE_RULES` in brief | L2245–2251 常量；L2522 `transaction_gate_rules` | `transaction_gate_rules` · QQ/BN brief 12+3 项 ✅ |
| 4 | `buildExpertMemo` LL_COM 无数字泄漏 | L2428–2455 `buildAssetClassJudgment`；L2462 `pattern_judgment:null` for non-numeric | QQ memo 5 项 ✅ |
| 5 | `validateAuditorJson` 硬化 | L2814–2816 unknown+actionable；L2820–2831 无 check → 必须全不可判定 | `unknown + actionable:true → error` · `no check + 仅品类参考 → error` ✅ |
| 6 | Gate P0 QQ/BN brief contract | `briefJson()` L127–162 in gate | 54/54 ✅ |

---

## Prompt contract checks

### 1. `buildTransactionContext` — unknown / parked 默认（投喂与 runtime 对齐）

| 字段 | Round 1 (`600f47c`) | Round 2 B2+ (`9b97bc9`) | Gate |
|------|---------------------|-------------------------|------|
| `acquisition_mode` | `domain_only_hypothetical` | **`pending_live_check`** | ✅ |
| `domain_only_price_actionable` | `true`（unknown） | **`false`** | ✅ |
| `domain_only_component_valuation_available` | 无 | **`true`** | ✅ |

active 锚点路径（8888/bn）仍 `actionable:false` + `component_valuation_available:true`，与 B1 一致。

### 2. `AI_AUDITOR_OUTPUT_SCHEMA` + `AUDITOR_TRANSACTION_GATE_RULES`

| 契约元素 | 状态 |
|----------|------|
| `website_check` 空模板（非 example.com 误导） | ✅ |
| `acquisition_mode` 含 `pending_live_check` | ✅ |
| P1/P2/P3 枚举含 **`仅品类参考`** | ✅ |
| `class_reference_note` 字段 | ✅ |
| 五条 `transaction_gate_rules`（先 check → 门禁 verdict → 品类写 note） | ✅ |
| `buildAiAuditorBrief.instruction` 明确 domain-only 非可执行收购价 | ✅ |
| `requirements` 硬句：无 check → 全不可判定；actionable:false → 禁 偏低/合理/偏高 | ✅ |

### 3. `validateAuditorJson` 交叉规则（paste JSON 围栏）

| 规则 | 行为 | Gate |
|------|------|------|
| `website_status:unknown` + `domain_only_price_actionable:true` | **error** | `unknown + actionable:true → error` ✅ |
| 无 `website_check.attempted:true` + 任一 verdict ≠ 不可判定 | **error** | `no check + 仅品类参考 → error` ✅ |
| 无 check + 全 `不可判定` | **warning** | `55.csah JSON: warn not fail` ✅ |
| 交易门禁 + `仅品类参考` | **pass** | `BN: active + 仅品类参考 → pass` ✅ |
| 交易门禁 + `合理` | **error**（B1 保留） | `BN: active + 合理 → error` ✅ |
| redirect + `actionable:true` | **error**（B2 保留） | `BN: redirect + actionable:true → error` ✅ |

### 4. `renderAuditorConclusion`

| 项 | 状态 |
|----|------|
| `class_reference_note` 渲染行「品类参考：」 | ✅ L2763–2765 |
| 交易门禁卡 + domain-only 提示（B1） | ✅ hotfix gate 28/28 |

---

## QQ.com memo / brief evidence（P0 焦点）

**问题背景**：Round 1 在 validator 层拦截了「unknown + 可执行 verdict」，但 Brief 仍默认 `domain_only_price_actionable:true`，诱导 AI 输出「合理」再被 validator 驳回——**Prompt Contract 与 Validator 自相矛盾**。B2+ 闭合此裂缝。

### `copyAuditorBrief('qq.com')` — gate 实测 12/12

| 断言 | 结果 |
|------|------|
| `website_check` / `attempted` / `final_url` / `redirect_detected` / `final_host` / `for_sale_signal_found` | ✅ |
| `transaction_gate_rules` 注入 | ✅ |
| gate rule「无 website_check.attempted:true」 | ✅ |
| gate rule「不得为偏低/合理/偏高」 | ✅ |
| `"domain_only_price_actionable": false` | ✅ |
| `pending_live_check` | ✅ |
| `"domain_only_component_valuation_available": true` | ✅ |

### `buildExpertMemo('qq.com')` — LL_COM 无数字品相泄漏

| 断言 | 结果 |
|------|------|
| `asset_class_judgment` 存在 | ✅ |
| `pattern_judgment === null` | ✅ |
| memo 无「五数字」 | ✅ |
| memo 无「4开头」 | ✅ |
| quality 含「两字母.COM」 | ✅ |

**语义评价**：qq.com 为 `LL_COM` 非纯数字域；`isNumericPatternDomain` 分流正确，避免将字母短域误套数字 punycode 话术（五数字/4开头），与 Joe 裁定的 buyer persona 展示问题分离（`not_engine_bug`）。

### BN.com brief（对照）

| 断言 | 结果 |
|------|------|
| `website_check` + `transaction_gate_rules` | ✅ |
| `"domain_only_price_actionable": false`（锚点注入） | ✅ |

---

## Pricing path zero diff

```bash
git diff 600f47c..HEAD -- index.html | rg 'classifyAsset|function make|applyAnchorFloorGuard|p3ManualReview|anchor_allowed|R1\.1|R2'
# → NO_MATCH_IN_DIFF ✅
```

| 函数 / 约束 | `600f47c..HEAD` diff | 判定 |
|-------------|----------------------|------|
| `classifyAsset` | 无 | ✅ |
| `make`（`classifyAsset` 内闭包） | 无 | ✅ |
| `applyAnchorFloorGuard` | 无 | ✅ |
| `p3ManualReview` | 无 | ✅ |
| `anchor_allowed` 自动定价清单 | 无扩展 | ✅ |
| R1.1 / R2 / API wire | 无 | ✅ |

B2+ 允许变更：`buildTransactionContext` 默认值、`AI_AUDITOR_OUTPUT_SCHEMA`、`AUDITOR_TRANSACTION_GATE_RULES`、`buildAiAuditorBrief`、`buildExpertMemo` 展示层（`asset_class_judgment`）、`validateAuditorJson`、`renderAuditorConclusion`、gate bootstrap。

### hotfix1 禁用户文案（回归）

```bash
rg -n '需人工确认|人工确认是否可收购|未核验持有人状态' index.html
# → FORBIDDEN_COPY_ABSENT ✅
```

---

## Blockers

### Blocking（0）

无。202/202 门禁、B2+ prompt/validator 对齐、QQ/BN P0 brief contract、定价零 diff、B1/B2 validator 回归均满足 `20260625_v66_r0d_hotfix2_task.md` Round 2 验收。

### Non-blocking（3）

1. **辅文档版本链**：`README.md` / `AGENT_PROMPTS.md` / `DOMAIN_VALUATION_PACK.md` / `CORE_RULES_v2.md` 仍记 **v6.6-R0d**，未记 B2+ `transaction_gate_rules` / `class_reference_note` / `pending_live_check` 默认——任务范围未含 docs sync。
2. **`CORE_RULES_v2.md`**：缺「unknown 默认 `actionable:false`」与「品类参考写 `class_reference_note`」一行说明。
3. **R0e defer**：真机 HTTP 跳转探测仍依赖 AI paste 自报 `website_check`；B2+ 正确闭合 prompt↔validator 矛盾，联网 API wire 留 R0e。

---

## 结论

**v6.6-R0d-hotfix2 @ 9b97bc9 Round 2 B2+ 实测通过。** Prompt Contract 与 `validateAuditorJson` 现已同向：unknown 默认不可执行价、无 website_check 不得输出 actionable verdict、品类合理性分流至 `class_reference_note`。建议 Joe 在保持 v6.6-R0d-hotfix_runtime ACCEPTED @ 219d541 前提下签核 hotfix2，闭合 blocker B2。

---

*Claude · v6.6-R0d-hotfix2 Live Review · Round 2 B2+ · Rules/Docs/Contract · 2026-06-25*