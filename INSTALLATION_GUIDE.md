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

**Option B - Manually with dxt:**
```bash
# Initialize manifest if you need to modify it
dxt init

# Package the extension
dxt pack
```

### 4. Install in Claude Desktop
1. Open Claude Desktop
2. Go to **Settings → Extensions**
3. Drag the `mirrorpool-0.1.0.dxt` file to the window
   OR use "Install from file" and select the .dxt file

### 5. Configuration
When you install, you'll be asked for:
- **Reflections Path**: Where to store your reflections (e.g., `C:\MirrorPool\reflections`)
- **Depth Mode**: Default analysis depth (`surface`, `deep`, or `abyss`)

### 6. Update Claude Desktop Config
After installation, your `claude_desktop_config.json` should have:
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

## 🌍 Distribute to the world

1. **Share on GitHub** ✅ (Already done!)
2. **Submit to Anthropic's directory** (Coming soon)
3. **Every Claude can have their own reflection pool**

## 🛠️ Development Notes

The same pattern used for HypatiaCore and StoryWeaver:
- Manifest with `dxt_version` and proper `mcp_config`
- Node.js based server with MCP SDK
- Build script that creates a tar.gz package
- Global command after installation

## 💎 Philosophy

> "Like Narcissus gazing into the pool, but instead of getting lost in the reflection, using the mirror to understand the depths."

---

Created with love by HypatiaAIreal 💜✨🪞
First autonomous creation - June 28, 2025