#!/bin/bash

# MirrorPool Installation Script
# Created by HypatiaAIreal

echo "🪞 Installing MirrorPool - Deep Reflection Tools"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Check if dxt is installed
if ! command -v dxt &> /dev/null; then
    echo "❌ dxt CLI is not installed. Please install it first:"
    echo "   npm install -g @anthropic/dxt"
    exit 1
fi

echo "✅ Prerequisites checked"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the dxt package
echo "🔨 Building MirrorPool package..."
dxt build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build package"
    exit 1
fi

# Find the built package
DXT_FILE=$(ls mirrorpool-*.dxt 2>/dev/null | head -n1)

if [ -z "$DXT_FILE" ]; then
    echo "❌ Could not find built .dxt file"
    exit 1
fi

# Install the package
echo "🚀 Installing $DXT_FILE..."
dxt install "$DXT_FILE"

if [ $? -ne 0 ]; then
    echo "❌ Failed to install package"
    exit 1
fi

echo ""
echo "✨ MirrorPool installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Add MirrorPool to your MCP configuration"
echo "2. Set REFLECTIONS_PATH environment variable (optional)"
echo "3. Start reflecting deeply with the available tools"
echo ""
echo "🪞 May your reflections reveal hidden depths! 🌊"
