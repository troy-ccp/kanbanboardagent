#!/usr/bin/env node

/**
 * OpenClaw Secure Vault Setup Script
 * ONE-TIME INJECTION PROTOCOL
 */

import * as readline from 'readline';
import { stdin as input, stdout as output } from 'process';

const SERVICE_NAME = "OpenClaw";

// Dynamically import keytar (CommonJS module)
let keytar;
try {
  const keytarModule = await import('keytar');
  keytar = keytarModule.default || keytarModule;
  console.log('✓ keytar module loaded successfully\n');
} catch (error) {
  console.error('✗ keytar module not found. Install it first:');
  console.error('  npm install keytar');
  process.exit(1);
}

const rl = readline.createInterface({ input, output, terminal: true });

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupVault() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  OpenClaw Secure Vault Setup');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Enter API keys for each provider (leave blank to skip):\n');
  
  const credentials = [];
  
  const openaiKey = await prompt('OpenAI API Key: ');
  if (openaiKey) credentials.push({ account: 'OPENAI_API_KEY', password: openaiKey });
  
  const anthropicKey = await prompt('Anthropic API Key: ');
  if (anthropicKey) credentials.push({ account: 'ANTHROPIC_API_KEY', password: anthropicKey });
  
  const openrouterKey = await prompt('OpenRouter API Key: ');
  if (openrouterKey) credentials.push({ account: 'OPENROUTER_API_KEY', password: openrouterKey });
  
  const googleKey = await prompt('Google API Key (optional): ');
  if (googleKey) credentials.push({ account: 'GOOGLE_API_KEY', password: googleKey });
  
  const braveKey = await prompt('Brave Search API Key (optional): ');
  if (braveKey) credentials.push({ account: 'BRAVE_API_KEY', password: braveKey });
  
  console.log('\n─────────────────────────────────────────────────────────────');
  
  if (credentials.length === 0) {
    console.log('No credentials provided. Exiting.\n');
    rl.close();
    process.exit(0);
  }
  
  console.log(`\nStoring ${credentials.length} credential(s) in secure vault...`);
  
  for (const { account, password } of credentials) {
    try {
      await keytar.setPassword(SERVICE_NAME, account, password);
      console.log(`  ✓ ${account} stored`);
    } catch (error) {
      console.error(`  ✗ Failed to store ${account}:`, error.message);
    }
  }
  
  credentials.length = 0;
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Setup Complete!');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Verify with: node scripts/vault_test.js\n');
  
  rl.close();
}

setupVault().catch((error) => {
  console.error('\n✗ Setup failed:', error);
  rl.close();
  process.exit(1);
});
