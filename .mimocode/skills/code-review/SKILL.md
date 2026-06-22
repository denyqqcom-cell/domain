---
name: code-review
description: "Independent code review and architecture audit workflow. Read task spec, examine git history and codebase, write structured review with findings."
---

# Code Review / Architecture Audit (代码审阅/架构审计)

Perform an independent code review or architecture audit as part of a multi-agent review cycle. Used for version reviews, architecture gate decisions, and implementation audits.

## Trigger

User provides a task file with review scope, or inline instructions specifying what to review and where to write findings.

## Workflow

### Phase 1 — Task Intake

1. Read the task specification. Parse:
   - **Review target** (version range, commit range, feature, or architecture component)
   - **Checklist** (specific items to verify, e.g. function names, feature flags, data structures)
   - **Output path** (where to write your review)
   - **Reference documents** (design docs, rules files, changelogs)

### Phase 2 — Context Gathering

Build your understanding of the codebase state:

1. **Git history**:
   - `git log --oneline -20` — recent commits
   - `git diff <base>..<target> --stat` — scope of changes
   - `git diff <base>..<target> -- <files>` — detailed diff for key files
   - `git show <commit> --name-only` — files touched per commit

2. **Codebase inspection**:
   - Read the target files (full content, not just snippets)
   - Search for specific patterns mentioned in the checklist (`grep -n "function_name" file`)
   - Check file sizes, line counts, structural integrity

3. **Reference documents**:
   - Read any rules files (e.g. `CORE_RULES_v2.md`, `AGENT_PROMPTS.md`)
   - Read changelogs or design docs
   - Compare implementation against spec

### Phase 3 — Structured Review

Write your review with these sections:

```markdown
# [Agent] 独立审阅 — [Target]

**审阅人**: [Agent name]
**审阅时间**: YYYY-MM-DD
**审阅范围**: [version/commit range]

## 变更概要
(Brief summary of what changed)

## 逐项检查
### [Checklist item 1]
- Status: ✅ / ⚠️ / ❌
- Finding: ...
- Evidence: (file path, line number, code snippet)

### [Checklist item 2]
...

## 架构评估
(If architecture audit: assess design decisions, coupling, testability, maintainability)

## 风险发现
(High/medium/low risks with evidence)

## 建议
(Actionable recommendations, prioritized)
```

### Phase 4 — Gate Decision (Optional)

If the task is an architecture gate (P0→P1, merge approval, release gate):

1. State your **GO / NO-GO** recommendation with rationale
2. List **blocking issues** (must fix before gate)
3. List **non-blocking issues** (should fix, won't block)
4. Assign **confidence level** (HIGH / MEDIUM / LOW) based on review depth

### Phase 5 — Output

1. Write your review to the specified output path
2. If this is part of a multi-agent review, ensure your review is **independent** — don't read other agents' reviews before writing yours

## Anti-Patterns

- **Don't read other agents' reviews** before writing yours (for blind review tasks)
- **Don't skip git history** — context of *why* changes were made matters
- **Don't review in aggregate** — check each item individually with evidence
- **Don't give vague findings** — always cite file path, line number, and code snippet
