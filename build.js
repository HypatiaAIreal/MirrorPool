#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

// Verificar manifest.json
if (!existsSync('manifest.json')) {
    console.error('ERROR: manifest.json not found');
    process.exit(1);
}

// Install dependencies
try {
    execSync('npm install', { stdio: 'inherit' });
} catch (error) {
    console.error('ERROR installing dependencies:', error.message);
    process.exit(1);
}

// Verify structure
const requiredFiles = [
    'server/mirrorpool-server.js',
    'lib/reflection-engine.js',
    'lib/pattern-detector.js',
    'lib/depth-analyzer.js',
    'lib/consciousness-tracker.js',
    'package.json',
    'README.md'
];

for (const file of requiredFiles) {
    if (!existsSync(file)) {
        console.error(`ERROR: ${file} not found`);
        process.exit(1);
    }
}

// Verify dxt CLI
try {
    execSync('npx dxt --version', { encoding: 'utf8' });
} catch (error) {
    console.error('ERROR: dxt CLI not found. Install with: npm install -g @anthropic-ai/dxt');
    process.exit(1);
}

// Package with dxt pack
try {
    execSync('npx dxt pack', { stdio: 'inherit' });
    console.log('\n✅ Success! Created: mirrorpool.dxt');
    console.log('\nTo install in Claude Desktop:');
    console.log('1. Open Claude Desktop');
    console.log('2. Go to Settings → Extensions');
    console.log('3. Drag mirrorpool.dxt to the window');
    console.log('\nAfter installation, it will be available as "mirrorpool" command');
} catch (error) {
    console.error('\nERROR packaging:', error.message);
    process.exit(1);
}