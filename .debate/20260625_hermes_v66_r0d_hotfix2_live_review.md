# Hermes 独立 Live 审查 — v6.6-R0d-hotfix2 Round 2（Prompt Contract B2+）

**日期**: 2026-06-25  
**角色**: Hermes（产品契约守门员）  
**对照契约**: `20260625_v66_r0d_hotfix2_task.md`（P0 · B2 + B2+ Prompt Contract）  
**前置签核**: v6.6-R0d-hotfix **ACCEPTED @ `219d541`** · B1 **CLOSED** · Round 1 B2 **APPROVED @ `600f47c`**  
**代码仓库**: `/home/joe/domain`  
**Git HEAD（实查）**: `9b97bc9` — `v6.6-R0d-hotfix2: fix AI Auditor Brief prompt contract (B2+)`  
**Diff 范围**: B2+ delta `600f47c..HEAD` · 全量 hotfix2 `219d541..HEAD`

---

## Vote

```yaml
vote: APPROVED
round: 2
focus: Prompt Contract B2+
rationale: >
  B2+ 闭合 Round 1 遗留的「brief 诱导合理 / validator 拦截」产品契约矛盾；
  buildAiAuditorBrief 与 validateAuditorJson 在 website_check、unknown 默认 actionable:false、
  交易门禁 verdict、class_reference_note 四处语义对齐；
  QQ/BN copyAuditorBrief P0 门禁 31 项新增全绿；九套件合计 202/202；
  B2+ delta 未触定价路径 / R1.1 / R2 / API wire。
runtime_lock: PENDING_JOE_SIGNOFF
```

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

$ git diff --stat 219d541..HEAD
 index.html                   | 206 ++++++++++++++++++++++++----
 test/v66_r0d_hotfix2_gate.js | 315 +++++++++++++++++++++++++++++++++++++++++++
 test/v66_r0d_hotfix_gate.js  |  26 +++-
 5 files changed, 524 insertions(+), 29 deletions(-)

$ git rev-parse origin/main
9b97bc9697e651901ff0025356d680d857daf88e
```

| 检查点 | 结果 |
|--------|------|
| HEAD 与任务 Round 2 声明一致 | ✅ |
| `origin/main` 已同步 `9b97bc9` | ✅ |
| 用户可见版本串 `v6.6-R0d-hotfix2` | ✅ title / logo / footer / Expert Judgment / `generatePack` / `expVersion` |

---

## Hermes Checklist B2+（逐项）

| # | 契约项 | 判定 | 证据 |
|---|--------|:----:|------|
| 1 | **Prompt contract 消除 validator 矛盾** — brief 不再诱导「合理」而 validator 再拦 | ✅ | `buildAiAuditorBrief.instruction` 明确 P1/P2/P3 仅为 domain-only 组件参考、完成 `website_check` 前不得当可执行收购价；`requirements` 与 `AUDITOR_TRANSACTION_GATE_RULES` 硬写「无 attempted:true → 三 verdict 全不可判定」「actionable:false 时不得偏低/合理/偏高」；`validateAuditorJson` 同规则 ERROR（`isAuditorTransactionGate` + 无 check 非全不可判定 → error）。Round 1 矛盾根因（`600f47c` 默认 unknown `actionable:true` + brief 弱约束）已在 B2+ 消除。 |
| 2 | **unknown 默认 `domain_only_price_actionable:false`** | ✅ | `buildTransactionContext` unknown/parked 分支：`acquisition_mode: pending_live_check`，`domain_only_price_actionable: false`，`domain_only_component_valuation_available: true`；`validateAuditorJson` 新增 `unknown + actionable:true → error`；gate `qq.com: default actionable false` PASS。 |
| 3 | **`transaction_gate_rules` 硬禁偏低/合理/偏高（门禁激活时）** | ✅ | `AUDITOR_TRANSACTION_GATE_RULES[4]` + brief `requirements` 双写；brief 导出含 `transaction_gate_rules` 字段；`isAuditorTransactionGate(tx)` 在 `actionable:false` 或 active 未挂牌时触发；validator `AUDITOR_ACTIONABLE_VERDICTS` 命中 → error；gate `BN: active + 合理 → error` / `QQ brief: gate rule forbid 合理` PASS。 |
| 4 | **`class_reference_note` 分离品类参考与可执行交易** | ✅ | `AI_AUDITOR_OUTPUT_SCHEMA` 新增 `class_reference_note` + verdict 枚举 `仅品类参考`；brief requirement「品类估值合理性只能写入 class_reference_note 或 market_reality_check」；`renderAuditorConclusion` 渲染「品类参考：」行；gate `BN: active + 仅品类参考 → pass` / `no check + 仅品类参考 → error` PASS。 |
| 5 | **LL_COM `pattern_judgment` null — 无数字品相泄漏** | ✅ | `isNumericPatternDomain` + `buildAssetClassJudgment`：字母类（qq.com LL_COM）`pattern_judgment: null`，`asset_class_judgment` 承载品类语义；gate `QQ memo: pattern_judgment null` / `no 五数字 leak` / `no 4开头 leak` / `LL_COM quality` 全 PASS。 |
| 6 | **无定价路径 diff · 无 R1.1/R2/API wire** | ✅ | `600f47c..HEAD`：`classifyAsset` / `make` / `applyAnchorFloorGuard` / `p3ManualReview` / `anchor_allowed` / API wire **零本体改动**（仅 gate bootstrap 引用 `classifyAsset`）；`219d541..HEAD` 定价内核函数本体未改。 |
| 7 | **门禁 202/202 含 QQ/BN brief P0** | ✅ | 见下节；`v66_r0d_hotfix2_gate.js` **54/54**（Round 1 为 23/23，+31 项 QQ/BN/unknown/仅品类参考）。 |

---

## 门禁实测（本机独立实跑 · 2026-06-25）

```bash
cd /home/joe/domain
for g in test/v66_r0_gate.js test/v66_r0c0_gate.js test/v66_r0c_gate.js test/v66_r0d_gate.js \
         test/v66_r0d_hotfix_gate.js test/v66_r0d_hotfix2_gate.js test/r0f_top_numeric.js \
         test/r1_hotfix_verify.js test/r1_pack_schema_verify.js; do
  node "$g"
done
```

| 套件 | 通过/总数 | Round 2 增量 / Hermes 关注点 |
|------|-----------|-------------------------------|
| `v66_r0d_hotfix2_gate.js` | **54/54** | +31：QQ brief 14 项 · BN brief 3 项 · unknown+actionable · 仅品类参考 · index schema 5 项 |
| `v66_r0d_hotfix_gate.js` | **28/28** | B1 禁文案 · 8888/goka/55.csah 回归 |
| `v66_r0d_gate.js` | **16/16** | 围栏/锚点不退化 |
| `v66_r0c_gate.js` | **17/17** | goka active gate |
| `v66_r0c0_gate.js` | **23/23** | buyer persona 不退化 |
| `v66_r0_gate.js` | **42/42** | 数字定价内核 |
| `r0f_top_numeric.js` | **8/8** | Price Lens |
| `r1_hotfix_verify.js` | **10/10** | 含4抵扣 |
| `r1_pack_schema_verify.js` | **4/4** | pack schema |
| **合计** | **202/202** | exit 0 全套件 |

**不在 202 签核范围**：`test/v64_regression.js`（legacy 2 fail，任务卡已标注弃用）、`test/r0e_supplementary.js`（R0e 草稿）。

---

## B2+ 契约闭合说明（产品语义）

### 矛盾修复前后对照

| 场景 | `600f47c`（Round 1） | `9b97bc9`（Round 2 B2+） |
|------|----------------------|--------------------------|
| 系统默认 unknown 域（qq.com） | `domain_only_price_actionable: true` | `false` + `pending_live_check` |
| Brief 无 website_check | 「unknown 仅可 WARNING + 不可判定」（模糊） | 「必须全部为不可判定」（与 validator ERROR 一致） |
| AI 认为品类估值合理 | 可写入 p1/p2/p3「合理」→ validator 拦 | 只能写 `class_reference_note` / `market_reality_check` |
| LL_COM expert memo | `pattern_judgment` 含数字品相话术风险 | `asset_class_judgment` + `pattern_judgment: null` |

### 关键代码锚点（`index.html`）

- `AUDITOR_TRANSACTION_GATE_RULES` — L2245–2251  
- `buildTransactionContext` unknown 默认 — L2274–2280  
- `buildAssetClassJudgment` / `buildExpertMemo` LL_COM 路径 — L2424–2498  
- `buildAiAuditorBrief` + `transaction_gate_rules` — L2510–2541  
- `renderAuditorConclusion` `class_reference_note` — L2763–2765  
- `validateAuditorJson` unknown/actionable + gate verdict — L2814–2861  

---

## 禁止文案 grep（B1 回归）

```bash
rg '需人工确认|人工确认是否可收购|未核验持有人状态' index.html
```

| 短语 | 命中 |
|------|:----:|
| 三项 B1 禁文案 | **0** |

---

## Scope Lock（`219d541..HEAD`）

| 禁区 | 状态 |
|------|:----:|
| `classifyAsset` 行为 | 未改 |
| `make` 工厂 | 未改 |
| `applyAnchorFloorGuard` | 未改 |
| `p3ManualReview` | 未改 |
| `anchor_allowed` 既有条目 | 未改 |
| R1.1 / R2 / API wire | 未改 |
| `buildSystemValuation` / `buildPriceTier` 定价路径 | 未改 |

**本批允许改动**：审计 schema · validator · render · brief contract · expert memo 品类语义 · `bn.com` reference_only 锚 · gate 套件。

---

## 风险与残余（informational）

| 项 | 级别 | 说明 |
|----|------|------|
| AI 遵从度 | INFO | 契约已对齐；实际 paste JSON 仍依赖模型遵守 brief——validator 为硬兜底。 |
| `parked` 默认 actionable:false | INFO | B2+ 产品裁定：未完成 live check 一律不可执行价；与 Round 1 `parked:true` 行为变更，已由 gate 锁定。 |
| Joe 签核 | BLOCKER（流程） | 四 Agent Round 2 审查完成后需 `Joe_SIGNOFF` 方可 runtime ACCEPTED。 |

---

## 落盘路径

| 路径 | 状态 |
|------|------|
| `/mnt/f/3agent辩论/domain_project/20260625_hermes_v66_r0d_hotfix2_live_review.md` | ✅ 本文件（Round 2 覆写） |
| `/home/joe/domain/.debate/20260625_hermes_v66_r0d_hotfix2_live_review.md` | ✅ 镜像 |

---

**Hermes · Round 2 · APPROVED · Gates 202/202 · HEAD `9b97bc9`**