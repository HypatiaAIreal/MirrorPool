#!/usr/bin/env node

import { mkdir, readFile, writeFile, rm, cp } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as tar from 'tar';

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
    
    // Copy files to build directory using Node.js fs promises
    console.log('📦 Copying files...');
    
    // Copy directories
    await cp(join(__dirname, 'server'), join(BUILD_DIR, 'server'), { recursive: true });
    await cp(join(__dirname, 'lib'), join(BUILD_DIR, 'lib'), { recursive: true });
    
    // Copy individual files
    await cp(join(__dirname, 'package.json'), join(BUILD_DIR, 'package.json'));
    await cp(join(__dirname, 'README.md'), join(BUILD_DIR, 'README.md'));
    await cp(join(__dirname, 'LICENSE'), join(BUILD_DIR, 'LICENSE'));
    
    // Also copy the manifest we just created to the root of build dir
    // (it's already there, but let's be explicit)
    
    console.log('📦 Files copied successfully');
    
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