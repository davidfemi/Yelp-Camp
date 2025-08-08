#!/usr/bin/env node

/*
  Permanent patch for expo-module-scripts naming mismatch.
  Creates node_modules/expo-module-scripts/tsconfig.base that extends
  the real tsconfig.base.json shipped with the package.
  This prevents TypeScript from reporting "File not found" errors
  when dependencies reference "expo-module-scripts/tsconfig.base".
*/

const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'expo-module-scripts', 'tsconfig.base');
const content = JSON.stringify({ extends: './tsconfig.base.json' }, null, 2) + '\n';

try {
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, content, 'utf8');
    console.log('✅ Patched expo-module-scripts/tsconfig.base');
  }
} catch (error) {
  console.error('⚠️  Unable to patch expo-module-scripts:', error);
  // Do not block install.
}
