#!/usr/bin/env node

import { createWriteStream, createReadStream } from 'fs';
import { mkdir, readFile, writeFile, rm } from 'fs/promises';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import tar from 'tar';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUILD_DIR = join(__dirname, '.build');
const DIST_DIR = join(__dirname, 'dist');

async function build() {
  console.log('🔨 Building MirrorPool DXT package...');
  
  try {
    // Clean previous builds
    await rm(BUILD_DIR, { recursive: true, force: true });
    await rm(DIST_DIR, { recursive: true, force: true });
    
    // Create build directories
    await mkdir(BUILD_DIR, { recursive: true });
    await mkdir(DIST_DIR, { recursive: true });
    
    // Read package.json
    const packageJson = JSON.parse(
      await readFile(join(__dirname, 'package.json'), 'utf-8')
    );
    
    // Create manifest.json for DXT
    const manifest = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      author: packageJson.author,
      license: packageJson.license,
      main: packageJson.main,
      bin: packageJson.bin,
      keywords: packageJson.keywords,
      repository: packageJson.repository,
      mcp: {
        version: "1.0.4",
        command: "node",
        args: ["server/mirrorpool-server.js"],
        env: {
          REFLECTIONS_PATH: "${CONFIG_DIR}/reflections",
          DEPTH_MODE: "deep"
        }
      },
      files: [
        "server/",
        "lib/",
        "package.json",
        "README.md",
        "LICENSE"
      ]
    };
    
    // Write manifest
    await writeFile(
      join(BUILD_DIR, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    // Copy files to build directory
    console.log('📦 Copying files...');
    const filesToCopy = [
      'server',
      'lib', 
      'package.json',
      'README.md',
      'LICENSE'
    ];
    
    for (const file of filesToCopy) {
      await execAsync(`cp -r ${file} ${BUILD_DIR}/`);
    }
    
    // Create the DXT package (tar.gz)
    const dxtFilename = `${packageJson.name}-${packageJson.version}.dxt`;
    const dxtPath = join(DIST_DIR, dxtFilename);
    
    console.log(`📦 Creating ${dxtFilename}...`);
    
    await tar.create(
      {
        gzip: true,
        file: dxtPath,
        cwd: BUILD_DIR
      },
      ['.']
    );
    
    // Clean up build directory
    await rm(BUILD_DIR, { recursive: true, force: true });
    
    console.log(`✅ Successfully built ${dxtFilename}`);
    console.log(`📍 Package location: ${dxtPath}`);
    console.log('');
    console.log('🚀 To install, run:');
    console.log(`   dxt install ${dxtPath}`);
    console.log('');
    console.log('Or copy the .dxt file and install it:');
    console.log(`   dxt install ${dxtFilename}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build
build();