#!/usr/bin/env node

/**
 * OpenClaw Plaintext Credential Cleanup Script
 * Scans for API keys in config files and proposes removal
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API key patterns
const KEY_PATTERNS = [
  { name: 'OpenAI', pattern: /sk-proj-[A-Za-z0-9_-]{96}/g },
  { name: 'OpenAI Legacy', pattern: /sk-[A-Za-z0-9]{48}/g },
  { name: 'Anthropic', pattern: /sk-ant-api03-[A-Za-z0-9_-]{95}/g },
  { name: 'OpenRouter', pattern: /sk-or-v1-[A-Za-z0-9]{64}/g },
  { name: 'Google', pattern: /AIza[0-9A-Za-z_-]{35}/g },
  { name: 'Brave', pattern: /BSA[A-Za-z0-9]{28}/g },
];

// Files to scan
const FILES_TO_SCAN = [
  '.env',
  '.env.local',
  'openclaw.json',
  '.openclaw/openclaw.json',
  '.openclaw/agents/main/agent/auth-profiles.json',
  'MEMORY.md',
  'memory/*.md',
];

function maskKey(key) {
  if (key.length < 12) return '***MASKED***';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

function scanFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const findings = [];
  
  for (const { name, pattern } of KEY_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      for (const match of matches) {
        findings.push({
          file: filePath,
          type: name,
          key: match,
          masked: maskKey(match),
        });
      }
    }
  }
  
  return findings.length > 0 ? findings : null;
}

function expandGlob(pattern) {
  const dir = path.dirname(pattern);
  const filePattern = path.basename(pattern);
  
  if (!fs.existsSync(dir)) return [];
  
  if (filePattern.includes('*')) {
    const regex = new RegExp(filePattern.replace('*', '.*'));
    return fs.readdirSync(dir)
      .filter(file => regex.test(file))
      .map(file => path.join(dir, file));
  }
  
  return [pattern];
}

async function promptYesNo(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(question + ' (y/N): ', (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

function createSanitizedContent(filePath, findings) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace each key with a vault reference or remove it
  for (const finding of findings) {
    const placeholder = `<REMOVED_${finding.type.toUpperCase().replace(' ', '_')}_KEY>`;
    content = content.replace(finding.key, placeholder);
  }
  
  return content;
}

async function cleanup() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  OpenClaw Plaintext Credential Cleanup');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Scanning for plaintext API keys...\n');
  
  const allFindings = [];
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  
  for (const filePattern of FILES_TO_SCAN) {
    const filePaths = expandGlob(
      filePattern.startsWith('.openclaw') 
        ? path.join(homeDir, filePattern)
        : filePattern
    );
    
    for (const filePath of filePaths) {
      const findings = scanFile(filePath);
      if (findings) {
        allFindings.push(...findings);
      }
    }
  }
  
  if (allFindings.length === 0) {
    console.log('✓ No plaintext API keys found!\n');
    return;
  }
  
  console.log(`⚠️  Found ${allFindings.length} plaintext API key(s):\n`);
  
  // Group by file
  const byFile = {};
  for (const finding of allFindings) {
    if (!byFile[finding.file]) byFile[finding.file] = [];
    byFile[finding.file].push(finding);
  }
  
  for (const [file, findings] of Object.entries(byFile)) {
    console.log(`  ${file}:`);
    for (const finding of findings) {
      console.log(`    - ${finding.type}: ${finding.masked}`);
    }
    console.log();
  }
  
  console.log('─────────────────────────────────────────────────────────────\n');
  console.log('PROPOSED CLEANUP PLAN:\n');
  console.log('1. Create backup of each file with .backup extension');
  console.log('2. Replace plaintext keys with <REMOVED_*_KEY> placeholders');
  console.log('3. You can manually restore from backups if needed\n');
  
  const proceed = await promptYesNo('Proceed with cleanup?');
  
  if (!proceed) {
    console.log('\nCleanup cancelled. No files were modified.\n');
    return;
  }
  
  console.log('\nCleaning up...\n');
  
  for (const [file, findings] of Object.entries(byFile)) {
    try {
      // Create backup
      const backupPath = `${file}.backup`;
      fs.copyFileSync(file, backupPath);
      console.log(`  ✓ Backup created: ${backupPath}`);
      
      // Create sanitized content
      const sanitized = createSanitizedContent(file, findings);
      fs.writeFileSync(file, sanitized, 'utf-8');
      console.log(`  ✓ Sanitized: ${file}`);
    } catch (error) {
      console.error(`  ✗ Failed to process ${file}: ${error.message}`);
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Cleanup Complete!');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Backups have been created with .backup extension.');
  console.log('You can restore from backups if needed.\n');
  console.log('Next steps:');
  console.log('  1. Verify credentials are in vault: node scripts/vault_test.js');
  console.log('  2. Restart OpenClaw gateway');
  console.log('  3. Test that everything works');
  console.log('  4. If all is well, delete .backup files\n');
}

cleanup().catch(console.error);
