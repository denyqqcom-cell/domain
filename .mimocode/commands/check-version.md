---
description: "Check if a local tool is up-to-date by comparing installed version with latest available version."
---

# Version Check

Check if `$ARGUMENTS` is up-to-date.

## Steps

1. **Identify the tool**: Parse `$ARGUMENTS` to determine the tool name and package manager.
   - If not specified, check `claude-code` (default)
   - Supported: `claude-code` (npm), `mimocode` (npm), or any npm package

2. **Check local version**:
   - For claude-code: `claude --version` or `npx @anthropic-ai/claude-code --version`
   - For mimocode: `.mimocode/bin/mimo --version` or `mimocode --version`
   - For npm packages: `npm list -g <package> --depth=0`

3. **Check latest version**:
   - `npm view <package> version` for npm packages
   - Check GitHub releases page if npm is unavailable

4. **Compare and report**:
   ```
   工具: <tool_name>
   本地版本: <local_version>
   最新版本: <latest_version>
   状态: ✅ 已是最新 / ⚠️ 有更新可用

   更新方法:
   <specific update command>
   ```

5. **If update available**, offer to run the update command.
