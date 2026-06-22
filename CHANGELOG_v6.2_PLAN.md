# CHANGELOG v6.2 — ANCHORS Price Floor Guard

**基线版本**: v6.1.5（已上线，E2E 10/10 通过，2026-06-22）
**目标版本**: v6.2
**五 Agent 表决**: 5/5 APPROVED（2026-06-22）

---

## v6.1.5 已完成（不再属于 v6.2 范围）

| 已完成 | 状态 |
|--------|------|
| anchor_relation / anchor_note 字段 | ✅ v6.1.5 |
| manual_review_only 硬规则 | ✅ v6.1.5 |
| buildAnchorDealsTable() 动态表 | ✅ v6.1.5 |
| VJN.com 不被 $39K 压低（reference_only） | ✅ v6.1.5 |
| zkp / 62 / tronscan / 12 降级 | ✅ v6.1.5 |

⚠️ 旧版 VJN.com class_floor_guarded 用例已过时，已在本版本替换。

---

## v6.2 核心目标：applyAnchorFloorGuard()

### 4 种 pricing_method

| 分支 | 触发条件 | 行为 |
|------|---------|------|
| static_class | 无 anchor_allowed 锚 | 走类别静态区间（现有） |
| anchor_based | 锚点区间完全在地板以上 | 正常锚点定价（现有） |
| anchor_floor_adjusted | 锚点下界低于地板，上界正常 | 抬下界至类别地板 |
| class_floor_guarded | 锚点上界也低于地板 | 整体用类别区间 |

### 核心逻辑

```javascript
function applyAnchorFloorGuard(anchorUsd, assetClass) {
  const floor = CLASS_P1_FLOOR[assetClass];
  const anchorP1Low  = anchorUsd * 0.7;
  const anchorP1High = anchorUsd * 1.5;

  if (anchorP1High < floor) {
    return { method: 'class_floor_guarded' };
  } else if (anchorP1Low < floor) {
    return { method: 'anchor_floor_adjusted', p1Low: floor, p1High: anchorP1High };
  } else {
    return { method: 'anchor_based', p1Low: anchorP1Low, p1High: anchorP1High };
  }
}
```

### CLASS_P1_FLOOR（$）

LLL_COM=100000, LL_COM=500000, L_COM=5000000,
NN_COM=200000, NNN_COM=50000, NNNN_COM=5000, NNNNN_COM=1000,
ULTRA_WORD_COM=500000, LLLL_PRONOUNCEABLE_COM=8000,
MIXED_SHORT_COM=30000, WORD_COM=15000,
AI_KEYWORD_TLD=1000, VERIFIED_HIGH_VALUE_COM=10000, GENERIC=0

---

## v6.2 回归测试（6 用例，基于 v6.1.5 重写）

| # | 域名 | 类别 | 预期 pricing_method |
|---|------|------|---------------------|
| 1 | farfield.com | VERIFIED_HIGH_VALUE_COM | anchor_based |
| 2 | FIXTURE_LOW（$30K LLL） | LLL_COM | class_floor_guarded |
| 3 | FIXTURE_MID（$80K LLL） | LLL_COM | anchor_floor_adjusted |
| 4 | GOKA.com | LLLL_PRONOUNCEABLE_COM | anchor_based |
| 5 | 62.com | NN_COM | static_class |
| 6 | TEX.COM | LLL_COM | static_class |

---

## 实现约束

- 不重写 classifyAsset() / score6D() / ANCHORS / buildAnchorDealsTable()
- applyAnchorFloorGuard() 作为独立函数插入 anchor_allowed 分支
- manual_review_only 路径不受影响

## 下一步

1. ✅ Step 0：本文件已更新至 v6.1.5 基线
2. 🔲 Step 1：五 Agent 对本设计再表决
3. 🔲 Step 2：实现 applyAnchorFloorGuard() + CLASS_P1_FLOOR
4. 🔲 Step 3：UI badge + 物料包字段
5. 🔲 Step 4：6 用例回归
6. 🔲 Step 5：commit + push → v6.2