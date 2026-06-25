# MiMo 独立 Live 审查 — v6.6-R0d-hotfix2 Round 2（Prompt Contract B2+）

**审查员**: MiMo · 中文市场 / 买家语义 / QQ.com · VJN.com 个案  
**日期**: 2026-06-25  
**工作目录**: `/home/joe/domain`  
**Git HEAD**: `9b97bc9` — `v6.6-R0d-hotfix2: fix AI Auditor Brief prompt contract (B2+)`  
**对照基线**: `600f47c`（Round 1 B2 validator）· `219d541`（hotfix1 ACCEPTED）  
**任务卡**: `/mnt/f/3agent辩论/domain_project/20260625_v66_r0d_hotfix2_task.md`  
**方法**: 九套件门禁本机实跑 + bootstrap `analyze('qq.com')`（同 `v66_r0d_hotfix2_gate.js`）+ `600f47c..HEAD` diff 走读 + 华语买家文案 grep

---

## Vote

```yaml
vote: APPROVED
rationale: >
  Round 2 Prompt Contract 闭合 B2+ 根因：QQ.com brief 默认 pending_live_check + domain_only_price_actionable:false，
  transaction_gate_rules 五条中文硬规则与 requirements 并列投喂，不再诱导「品类估值合理 → P1/P2 合理」。
  LL_COM asset_class_judgment 全中文可读且无五数字/4开头泄漏；class_reference_note 与 market_reality_check
  在 schema / brief / render 三路分离；「仅品类参考」已入 verdict 枚举与 validator 非可执行集合。
  VJN.com 买家卡（v66_r0c0）与 QQ/BN brief P0（hotfix2 54 项）回归全绿；九门禁 202/202。
lock_ready: true
defer_unchanged:
  - classifyAsset / make / applyAnchorFloorGuard / p3ManualReview / R1.1 / R2 / API wire / anchor_allowed / 定价路径
```

---

## 1. Git HEAD 核验

```bash
cd /home/joe/domain && git rev-parse HEAD && git log -1 --oneline
```

| 项 | 结果 |
|----|------|
| HEAD | `9b97bc9697e651901ff0025356d680d857daf88e` |
| 提交信息 | `v6.6-R0d-hotfix2: fix AI Auditor Brief prompt contract (B2+)` |
| `origin/main` | `9b97bc9`（已对齐） |
| Round 2 diff `600f47c..HEAD` | `index.html` +109/−28；`v66_r0d_hotfix2_gate.js` +87；bootstrap 三文件各 +3 |

---

## 2. 门禁实测（合计 202/202）

```bash
cd /home/joe/domain
for g in test/v66_r0_gate.js test/v66_r0c_gate.js test/v66_r0c0_gate.js test/v66_r0d_gate.js \
         test/v66_r0d_hotfix_gate.js test/v66_r0d_hotfix2_gate.js test/r0f_top_numeric.js \
         test/r1_hotfix_verify.js test/r1_pack_schema_verify.js; do node "$g"; done
```

| 套件 | 通过/总数 | MiMo 相关断言 |
|------|-----------|---------------|
| `v66_r0d_hotfix2_gate.js` | **54/54** | QQ/BN brief P0 · transaction_gate_rules · pending_live_check · QQ memo LL_COM 无数字泄漏 · BN 仅品类参考 pass |
| `v66_r0d_hotfix_gate.js` | **28/28** | B1 禁文案 · 8888/goka/55.csah · active gate render |
| `v66_r0d_gate.js` | **42/42** | 888/777/88888 数字定价不退化 |
| `v66_r0c_gate.js` | **17/17** | goka active · domain_only not actionable |
| `v66_r0c0_gate.js` | **23/23** | **VJN** LLL_COM 买家卡 · 无「中文域名收藏家」· 888 华语市场数字 |
| `v66_r0d_gate.js` | **16/16** | fence strip · JSON 契约 |
| `r0f_top_numeric.js` | **8/8** | 顶级数字 Price Lens |
| `r1_hotfix_verify.js` | **10/10** | 含4折价中文注解 |
| `r1_pack_schema_verify.js` | **4/4** | pack schema |
| **合计** | **202/202** | 0 fail · exit 0 |

> Round 1 为 171/171（hotfix2 23 项）；Round 2 hotfix2 扩至 **54/54**（+31 项 QQ/BN Prompt Contract P0），总门禁 **202/202** 与任务卡一致。

---

## 3. QQ.com bootstrap — brief JSON 合同（P0）

同 `v66_r0d_hotfix2_gate.js` bootstrap `analyze('qq.com')`：

| 字段 / 断言 | 实测 |
|-------------|------|
| `asset_class` | `LL_COM` ✅ |
| `transaction_context.acquisition_mode` | `pending_live_check` ✅ |
| `transaction_context.domain_only_price_actionable` | `false` ✅ |
| `domain_only_component_valuation_available` | `true` ✅ |
| `auditorBrief.transaction_gate_rules` | 存在，**5 条** ✅ |
| `output_schema` 含 `website_check` / `class_reference_note` / `仅品类参考` | ✅ |
| `instruction` 首句 | 「不是重新估值员」「不得将其当作可执行收购价」✅ |
| `expert_view.pattern_judgment` | `null`（LL_COM 不走数字品相）✅ |
| `expert_view.asset_class_judgment` | 全中文字段（quality / liquidity_signal / enduser_signal / relative_position）✅ |
| memo 禁泄漏 | 无「五数字」「4开头」✅ |

**gate P0 摘录（54 项内）**：

- `QQ brief: gate rule no check` — requirements 含「无 website_check.attempted:true 时…全部为不可判定」
- `QQ brief: gate rule forbid 合理` — requirements 含「不得为偏低/合理/偏高」
- `QQ brief: transaction_gate_rules` / `pending_live_check` / `default actionable false`

**MiMo 裁定**：Round 1 仅 validator 拦截「合理」时，brief 仍可能让华语 AI 先写品类合理再被拦；Round 2 在**投喂层**用 `AUDITOR_TRANSACTION_GATE_RULES` 第 4、5 条 + `requirements` 双重约束，语义闭环。

---

## 4. 华语焦点走读

### 4.1 QQ.com brief 不再诱导「品类合理 = 可执行 P1/P2」

| 机制 | 中文表达 | 作用 |
|------|----------|------|
| 默认 `buildTransactionContext` | `unknown` → `pending_live_check`，`actionable: false` | 系统侧不预设可收购 |
| `transaction_gate_rules[4]` | domain_only=false 时 verdict 不得「偏低/合理/偏高」 | 硬门禁文案 |
| `transaction_gate_rules[5]` | LL_COM/NNN/ULTRA 品类合理 → 只写 `class_reference_note` 或 `market_reality_check` | **分离品类参考与可执行价** |
| `requirements[4]` | 同上，禁止写成可执行 P1/P2/P3 购买价 | 与 gate_rules 重复强化 |
| `validateAuditorJson` | 门禁下 `AUDITOR_ACTIONABLE_VERDICTS` 含「合理」→ ERROR | 执行层兜底 |

### 4.2 LL_COM / QQ 买家卡与 `asset_class_judgment`

`buildBuyerPersonas`（LL_COM，`qq.com`）：

- `两字母短域投资人` — 「LL.COM 极度稀缺，投资人硬通货」
- `全球缩写/品牌终端` — 「QQ 常为知名缩写…需核验终端」
- `华语市场短字母投资人` — 「两字母在华语市场有流通（**非 punycode/IDN**）」

`buildAssetClassJudgment`（LL_COM）：

```json
{
  "quality": "两字母.COM 顶级稀缺短域",
  "liquidity_signal": "高流通性，短域投资市场核心资产",
  "enduser_signal": "强品牌缩写潜力，但需核验是否已绑定现有品牌",
  "relative_position": "LL_COM 顶级资产类别，具体价值取决于字母组合与终端绑定"
}
```

- 无「中文域名收藏家」等误导标签（`v66_r0c0` gate 显式禁止）✅  
- `buildExpertMemo` 对非数字域走 `asset_class_judgment`，`pattern_judgment: null` — QQ 不会泄漏五数字话术 ✅

### 4.3 `class_reference_note` vs `market_reality_check`

| 字段 | brief 指引 | render 标签 | 华语 AI 语义 |
|------|------------|---------------|--------------|
| `class_reference_note` | gate_rule 5 / requirements[4]：品类估值合理性 | **品类参考：** | 组件价/品类层级认可，**非收购指令** |
| `market_reality_check` | 同上或交易现实（跳转、运营站、不出售） | **核心原因：** | 解释为何不可按 domain-only 成交 |

BN.com gate 实证：`market_reality_check: 'BN.com 跳转 Barnes & Noble，domain-only 组件估值'` + verdict 不可判定 → pass；`class_reference_note: 'LLL 品类估值可作组件参考，非可执行收购价'` + **仅品类参考** → pass。

### 4.4 「仅品类参考」对华语 AI 审计员

- 已写入 `p1/p2/p3_verdict` schema 枚举第六项  
- `AUDITOR_NON_ACTIONABLE_VERDICTS = ['不可判定','数据不足','仅品类参考']`  
- 无 `website_check` 时即使选「仅品类参考」→ **ERROR**（gate：`no check + 仅品类参考 → error`）— 防止跳过 live check 仍给品类价判断  
- `renderAuditorConclusion` 门禁下行尾标注「· 仅品类参考」/ P3「· 仅站点/业务收购场景参考」— 对华语用户可读  

**MiMo 结论**：「仅品类参考」与「不可判定」分工清晰 — 前者承认系统品类价合理但不可执行，后者表示证据不足；对华语 prompt 足够明确。

### 4.5 VJN.com 回归（`v66_r0c0_gate.js`）

| 断言 | 状态 |
|------|:----:|
| `vjn: LLL_COM` | ✅ |
| `vjn: 三字母短域投资人` (high) | ✅ |
| `vjn: 全球缩写/品牌终端` + trademark audit | ✅ |
| `vjn: 华语` — 「非标准拼音声母组合，不宜按纯声母域名加价」（vjn ∉ PINYIN_INITIAL_SLDS） | ✅ 源码 |
| forbidden「中文域名收藏家」等 | ✅ |
| AI/Web3 low + `price_impact` 全卡 | ✅ |

VJN 挂牌锚 `reference_only`（`vjn.com` anchor）未进入 hotfix2 禁止路径，数字品相与买家语义无退化。

---

## 5. 禁止文案 grep（B1 + R0c-0 回归）

```bash
rg '需人工确认|人工确认是否可收购|未核验持有人状态|中文域名收藏家' index.html
```

| 短语 | `index.html` |
|------|:------------:|
| 四项 | **零匹配** ✅ |

---

## 6. Scope 合规（`600f47c..9b97bc9`）

| 任务项 | Round 2 增量 | 判定 |
|--------|--------------|:----:|
| `AUDITOR_TRANSACTION_GATE_RULES` + brief 投喂 | 新增常量 + `buildAiAuditorBrief` | ✅ |
| 默认 `pending_live_check` / `actionable:false` | `buildTransactionContext` 三路默认 | ✅ |
| `class_reference_note` + `仅品类参考` | schema + validator + render | ✅ |
| `buildAssetClassJudgment` + LL_COM memo 无 pattern 泄漏 | `isNumericPatternDomain` 分支 | ✅ |
| QQ/BN brief P0 gates | hotfix2 +31 checks | ✅ |
| 定价内核 | `classifyAsset` / `make` / anchors 自动定价 — **无 diff** | ✅ |

---

## 7. 观察项（非阻断 · 不降级 vote）

| # | 项 | 说明 |
|---|-----|------|
| 1 | render 门禁行 | P1/P2 行尾固定「· 仅品类参考」即使 verdict 已是「仅品类参考」— 略冗余但强化语义 |
| 2 | QQ 终端绑定 | `enduser_signal` 写「需核验是否已绑定现有品牌」— 对华语 AI 正确，不暗示 Tencent 可收购 |
| 3 | Pages | `origin/main` = `9b97bc9`；Joe 签核后确认 CDN 显示 **v6.6-R0d-hotfix2** |

---

## 8. 落盘路径

| 路径 | 状态 |
|------|:----:|
| `/mnt/f/3agent辩论/domain_project/20260625_mimo_v66_r0d_hotfix2_live_review.md` | ✅ 本文件副本 |
| `/home/joe/domain/.debate/20260625_mimo_v66_r0d_hotfix2_live_review.md` | ✅ 本文件 |

---

**MiMo · 2026-06-25 · Round 2 Prompt Contract B2+ · APPROVED · 202/202**