#!/usr/bin/env node

/**
 * OpenClaw Secure Vault Test Script
 * Verifies that credentials are properly stored and retrievable
 */

const SERVICE_NAME = "OpenClaw";

// Dynamically import keytar (CommonJS module)
let keytar;
try {
  const keytarModule = await import('keytar');
  keytar = keytarModule.default || keytarModule;
} catch (error) {
  console.error('✗ keytar module not found. Install it first: npm install keytar');
  process.exit(1);
}

// Mask secrets for display
function maskSecret(value) {
  if (!value || value.length < 8) return '***MASKED***';
  return `***${value.slice(-4)}`;
}

async function testVault() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  OpenClaw Secure Vault Test');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const accounts = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'OPENROUTER_API_KEY',
    'GOOGLE_API_KEY',
    'BRAVE_API_KEY',
  ];
  
  console.log('Checking stored credentials:\n');
  
  let foundCount = 0;
  for (const account of accounts) {
    try {
      const credential = await keytar.getPassword(SERVICE_NAME, account);
      if (credential) {
        console.log(`  ✓ ${account.padEnd(25)} ${maskSecret(credential)}`);
        foundCount++;
      } else {
        console.log(`  ○ ${account.padEnd(25)} (not set)`);
      }
    } catch (error) {
      console.log(`  ✗ ${account.padEnd(25)} Error: ${error.message}`);
    }
  }
  
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log(`Found ${foundCount} credential(s) in vault\n`);
  
  if (foundCount === 0) {
    console.log('No credentials found. Run: node scripts/setup_vault.js\n');
  }
}

testVault().catch(console.error);
