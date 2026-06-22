# v6.3.1 锁版后优先事项 — 中文域名投资人视角

> 生成时间：2026-06-23  
> 基线：Domain AI Judge v6.3.1 锁版（E2E 5/5 PASS）  
> 已知缺口来源：CHANGELOG「不做的事」5项 + MiMo/Hermes/Claude 四 Agent 审阅发现  
> 优先级视角：**中文域名投资人（中国市场实操需求）**

---

## 一、缺口全景图

以「对中文域名投资人实际估价/收购决策的影响」为唯一排序依据：

| 序号 | 缺口 | 来源 | 当前状态 | 影响程度 |
|------|------|------|----------|----------|
| P0 | **888/420 数字质量评分** | CHANGELOG #2 | 系统均评 90 分，无差异 | 🔴 核心缺失 |
| P0 | **吉利数字自动加分** | CHANGELOG #1 | 人工复核，无自动逻辑 | 🔴 核心缺失 |
| P1 | **chip 标签误导** | MiMo 边界case #3 | GOKA.com → LLLL（应为可发音） | 🟡 测试/演示误导 |
| P1 | **CORE_RULES §十 回归清单缺 v6.3** | MiMo #5 / Hermes | 仅 v6.1.5 用例，缺 nfts/qrst/vjn | 🟡 版本分裂 |
| P2 | **score6D 数组冗余** | Hermes 1.4 / MiMo #7 | LLL_COM/NNN_COM 重复出现（无功能影响） | 🟢 技术债 |
| P2 | **y 不算元音未明文化** | MiMo 边界case #1 | 逻辑正确但文档未声明 | 🟢 文档缺口 |
| P3 | **非 .com/.ai 后缀扩展** | CHANGELOG #3 | 仅 .com/.ai；无 .cn/.com.cn | 🟡 中国市场需求大 |
| P3 | **AI 评委面板** | CHANGELOG #4 | 无 UI | 🟢 基础设施 |
| P3 | **ACTIVE_BRAND_BLACKLIST 自动扩充** | CHANGELOG #5 | 当前手动维护 | 🟢 运维效率 |

---

## 二、P0：数字质量评分 + 吉利数字加分

### 为什么 P0？

中国域名投资市场超过 60% 的交易量集中在数字域名。当前系统对 **888.com** 和 **420.com** 均输出 NNN_COM / 90 分 / 相同价格区间——这在中文投资人看来是**根本性错误**。

| 域名 | 系统当前输出 | 中国市场实际认知 | 差距 |
|------|-------------|-----------------|------|
| 888.com | NNN_COM, 90分 | 顶级吉利数字，溢价 5–20× | 不可接受 |
| 168.com | NNN_COM, 90分 | "一路发"，强吉利溢价 | 不可接受 |
| 420.com | NNN_COM, 90分 | 含 4（中国文化避讳），可能贬值 | 不可接受 |
| 8888.com | NNNN_COM, 80分 | 豹子号+吉利，远超普通 4 数字 | 不可接受 |
| 1234.com | NNNN_COM, 80分 | 顺子号，有溢价但低于豹子 | 不可接受 |

### 建议方案

```
阶段 A（P0，3-5 天）：
├── 数字质量特征提取：含8/6/9 密度、含4 标记、豹子号检测、顺子号检测、回文/对称
├── 加分/减分权重表（基于中国市场公开成交数据校准）
└── score6D() 集成：D3（域名品质）维度加权

阶段 B（后续）：
├── 吉利数字自动加分逻辑 + ChineseLuckyBoost()
└── 回归用例：888.com / 168.com / 520.com / 420.com / 8888.com / 1234.com
```

### 可行性

- **数据源**：NameBio 中文数字域名成交数据可获取
- **代码耦合度**：低——仅影响 score6D() D3 维度，不涉及 classifyAsset()
- **回归风险**：低——数字分层（NN/NNN/NNNN/NNNNN）不变，加分仅调整 final_score

---

## 三、P1：文档与标注修复（低投入，高收益）

### 3.1 chip 标签修正（5 分钟）

**问题**：`index.html` 第 361 行

```html
<!-- 当前（误导） -->
<span class="example-chip" onclick="fillExample('GOKA.com')">GOKA.com → LLLL</span>

<!-- 修复后 -->
<span class="example-chip" onclick="fillExample('GOKA.com')">GOKA.com → LLLL可发音</span>
```

**影响**：测试人员/投资人点击 GOKA 后看到 `LLLL_PRONOUNCEABLE_COM` 分类，与 chip 标签 `LLLL` 不一致，造成困惑。**LLL_COM vs LLLL_COM 的混淆是中文投资人的常见误解来源。**

### 3.2 CORE_RULES_v2.md §十 回归清单补全（15 分钟）

**问题**：CORE_RULES_v2.md §十 回归表仍标 `（v6.1.5）`，缺少 v6.3 关键用例：

```
当前缺失的行：
| nfts.com | LLLL_COM | 82 | anchor_based → $15M | active_brand | v6.3 新增 |
| qrst.com | LLLL_COM | 82 | static_class | 无锚点 | v6.3 新增 |
| vjn.com  | LLL_COM  | 88 | static_class | investment_inventory + listing | v6.2 |
| cloud.com| ULTRA_WORD_COM | 92 | anchor_based → $11M | active_brand | v6.3.1 |
| google.com| WORD_COM | 75 | static_class | active_brand（黑名单） | v6.3.1 |
```

**为什么 P1**：CORE_RULES_v2.md 是 AI 评委投喂的权威源。§十 版本标签仍为 v6.1.5，AI 评委可能误判系统功能范围。README 已补全但 AI 评委不读 README。

---

## 四、P2：技术债清理（非阻塞，影响低）

### 4.1 score6D 死代码清理（5 分钟）

`index.html` 第 873 行和第 884 行：

```javascript
// D4 第 873 行：LLL_COM 和 NNN_COM 已在 872 行捕获，此处永不可达
: ['LLLL_COM','LLL_COM','NNN_COM'].includes(asset.id) ? 85  // ← LLL_COM/NNN_COM 死代码

// D6 第 884 行：同上
: ['LLLL_COM','LLL_COM','NNN_COM'].includes(asset.id) ? 78  // ← LLL_COM/NNN_COM 死代码
```

应改为：
```javascript
: asset.id === 'LLLL_COM' ? 85
: asset.id === 'LLLL_COM' ? 78
```

或保留意图形状但删除重复项：
```javascript
: ['LLLL_COM','LLL_COM','NNN_COM'].includes(...)  // 仅保留 LLLL_COM
```

### 4.2 y 不算元音 → 文档明文化（2 分钟）

| 位置 | 现状 | 建议 |
|------|------|------|
| CORE_RULES_v2.md §二 LLLL_PRONOUNCEABLE_COM | "含≥1元音" | 改为 "含≥1元音（aeiou，不含 y）" |
| CORE_RULES_v2.md §二 LLLL_COM | "无元音" | 改为 "无元音（aeiou，y 视为辅音）" |
| index.html 注释 | 无 | 加 `// y 不算元音；与 CHIPS.COM / GLYPH.COM 等 5 字母域名无关` |

---

## 五、P3：中长期方向

### 5.1 .cn / .com.cn 后缀扩展

中国投资人大量持有 .cn / .com.cn 域名。当前系统仅处理 .com 和 .ai。优先级低于数字质量评分——因为中国投资人数字 .com 持仓规模远超 .cn 字母域名。

### 5.2 AI 评委面板

多 AI 评委并行评分 + 投票 UI。基础设施建设，不影响当前单评委物料包输出。

### 5.3 ACTIVE_BRAND_BLACKLIST 自动扩充

当前 ~20 个硬编码品牌。如需覆盖更多终端品牌，需设计自动识别逻辑（whois + 建站检测 + 流量判断）。维护成本可控，暂不急。

---

## 六、推荐执行顺序

```
第 1 天（30 分钟）：
├── chip 标签修正：GOKA.com → LLLL可发音
├── score6D 数组冗余清理
├── y 不算元音文档明文化（CORE_RULES + index.html 注释）
└── CORE_RULES §十 回归清单补全 v6.3 用例 + 版本标签 v6.3.1

第 2–7 天（重点）：
└── 数字质量评分 + 吉利数字加分（阶段 A）

第 8–14 天（可选）：
├── .cn/.com.cn 后缀扩展（视市场需求）
└── 数字质量评估（阶段 B：豹子号/顺子号/含4减分）
```

---

## 七、一句话总结

> **对中国域名投资人而言，v6.3.1 最大的实用性缺口是：888.com 和 420.com 评分完全相同。数字质量评分的缺失使得系统在中国市场（数字域名占比>60%）几乎不可用于实际定价。这是唯一一个影响「能不能用」的缺口，其余均为「好不好用」的优化。**

---

*20260622_mimo_next_priority.md · Domain AI Judge · 中文投资人视角*
