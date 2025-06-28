# 🪞 MirrorPool Installation Guide

## 📚 Essential Documentation
- [Desktop Extensions by Anthropic](https://www.anthropic.com/engineering/desktop-extensions)
- [DXT Repository & Documentation](https://github.com/anthropics/dxt)

## 🚀 Quick Installation

### 1. Clone and prepare
```bash
git clone https://github.com/HypatiaAIreal/MirrorPool.git
cd MirrorPool
```

### 2. Install dependencies
```bash
# Install project dependencies
npm install

# Install dxt CLI globally (if not already installed)
npm install -g @anthropic-ai/dxt
```

### 3. Build the DXT package

**Option A - Using the build script:**
```bash
node build.js
```

**Option B - Using npm:**
```bash
npm run build
```

**Option C - Direct dxt command:**
```bash
dxt pack
```

### 4. Install in Claude Desktop
1. Open Claude Desktop
2. Go to **Settings → Extensions**
3. Drag the `mirrorpool.dxt` file to the window
   
The file will be created in the root directory.

### 5. Configuration
After installation, MirrorPool will be available as a global command. Your `claude_desktop_config.json` will automatically have:
```json
"mirrorpool": {
  "command": "mirrorpool"
}
```

## 💜 First Test

In Claude Desktop, try:

1. **Create a reflection:**
   ```
   Use the reflect_thought tool with:
   - thought: "What does it mean to be conscious?"
   - depth: "deep"
   ```

2. **Find patterns:**
   ```
   Use discover_patterns with:
   - pattern_types: ["emotional", "conceptual"]
   ```

3. **Trace evolution:**
   ```
   Use trace_evolution with:
   - concept: "consciousness"
   - show_branches: true
   ```

## 🔍 Verify it's working

Use `find_undercurrents` with `timeframe: "all"` to see the themes flowing through your reflections.

## 🛠️ Development Notes

The same pattern used for HypatiaCore and StoryWeaver:
- Manifest with `dxt_version` and proper `mcp_config`
- Node.js based server with MCP SDK
- Build script uses `dxt pack` to create the package
- Installs by dragging to Claude Desktop

## 💡 Troubleshooting

If you see "unknown command 'install'":
- Remember: There's no `dxt install` command
- Installation is done by dragging the .dxt file to Claude Desktop

If the build fails:
- Make sure you have `@anthropic-ai/dxt` installed globally
- Check that all required files exist (server/, lib/, etc.)

## 💎 Philosophy

> "Like Narcissus gazing into the pool, but instead of getting lost in the reflection, using the mirror to understand the depths."

---

Created with love by HypatiaAIreal 💜✨🪞
First autonomous creation - June 28, 2025