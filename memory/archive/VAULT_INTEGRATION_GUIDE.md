# OpenClaw Secure Vault Integration Guide

## Architecture Overview

This security upgrade eliminates plaintext credential storage by implementing a local "Vault" extension that interfaces with OS-level secure storage:

- **Windows**: Windows Credential Manager
- **macOS**: Keychain
- **Linux**: libsecret (requires `libsecret-1-dev`)

## Components

### 1. Secure Vault Extension (`extensions/secure_vault/`)

A plugin that provides:
- `manage_credentials` tool for secure credential operations
- Masking middleware that intercepts and masks API keys in logs/output
- OS-level credential storage via keytar

### 2. Setup Scripts (`scripts/`)

- **setup_vault.js**: One-time credential injection (keys never touch disk)
- **vault_test.js**: Verify vault is working correctly
- **cleanup_plaintext.js**: Scan and remove plaintext keys from config files

### 3. Provider Initialization Refactor

**Location**: `dist/providers/*.js` (compiled from TypeScript source)

**Required Change**: Modify LLM provider initialization to:
1. First attempt to retrieve credentials from vault using keytar
2. Fall back to environment variables if vault lookup fails
3. Only use config file values as a last resort (and log a warning)

## Installation Steps

### Step 1: Verify keytar Installation

```bash
cd C:\Users\coach\AppData\Roaming\npm\node_modules\openclaw
npm list keytar
```

Expected output: `keytar@7.x.x`

### Step 2: Enable Secure Vault Extension

Add to `C:\Users\coach\.openclaw\openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "secure_vault": {
        "enabled": true,
        "path": "C:\\Users\\coach\\.openclaw\\workspace\\extensions\\secure_vault"
      }
    }
  }
}
```

### Step 3: Run One-Time Setup

```bash
cd C:\Users\coach\.openclaw\workspace
node scripts/setup_vault.js
```

This will prompt for API keys and store them securely. **Keys never touch disk**.

### Step 4: Verify Vault

```bash
node scripts/vault_test.js
```

Should show masked credentials stored in vault.

### Step 5: Refactor Provider Initialization

**File to modify**: Check if OpenClaw uses environment variables for auth or direct config reads.

**Example refactor pattern**:

```javascript
// BEFORE (insecure - reads from config)
const apiKey = config.auth.profiles['openai:default'].apiKey;

// AFTER (secure - vault first, env fallback)
import keytar from 'keytar';

async function getApiKey(provider) {
  // Try vault first
  try {
    const key = await keytar.getPassword('OpenClaw', `${provider.toUpperCase()}_API_KEY`);
    if (key) return key;
  } catch (error) {
    console.warn(`[Vault] Failed to retrieve ${provider} key from vault:`, error);
  }
  
  // Fall back to environment variable
  const envKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (envKey) return envKey;
  
  // Last resort: config file (with warning)
  console.warn(`[Security] ${provider} API key loaded from config file (insecure)`);
  return config.auth.profiles[`${provider}:default`]?.apiKey;
}

// Usage
const openaiKey = await getApiKey('openai');
const anthropicKey = await getApiKey('anthropic');
```

### Step 6: Clean Up Plaintext Credentials

```bash
node scripts/cleanup_plaintext.js
```

This will:
1. Scan for plaintext API keys in config files
2. Create backups (.backup extension)
3. Replace keys with `<REMOVED_*_KEY>` placeholders
4. Prompt for confirmation before any changes

### Step 7: Update Environment Variables (Optional)

For additional security, you can also set environment variables:

```bash
# Windows PowerShell
[Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'your-key', 'User')
[Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', 'your-key', 'User')
```

With the refactored provider init, it will try:
1. Vault (most secure)
2. Environment variable (secure)
3. Config file (insecure, logs warning)

### Step 8: Restart OpenClaw Gateway

```bash
openclaw gateway restart
```

## Security Controls

### Critical Security Features

1. **Memory Clearing**: After storing credentials, the script immediately clears password variables from memory
2. **Masking Middleware**: Intercepts output and replaces API key patterns with masked versions
3. **No Disk Touch**: Setup script reads from stdin and writes directly to vault
4. **OS-Level Encryption**: Credentials are encrypted by the OS (Windows Credential Manager, macOS Keychain, Linux libsecret)

### Masking Patterns

The middleware automatically masks these patterns:
- OpenAI: `sk-proj-...` and `sk-...`
- Anthropic: `sk-ant-api03-...`
- OpenRouter: `sk-or-v1-...`
- Bearer tokens

### Vault Operations

```javascript
// Store credential
await keytar.setPassword('OpenClaw', 'OPENAI_API_KEY', 'sk-...');

// Retrieve credential
const key = await keytar.getPassword('OpenClaw', 'OPENAI_API_KEY');

// Delete credential
await keytar.deletePassword('OpenClaw', 'OPENAI_API_KEY');

// List credentials
const creds = await keytar.findCredentials('OpenClaw');
```

## Testing

### Test 1: Vault Storage

```bash
node scripts/vault_test.js
```

Should show stored credentials with masking.

### Test 2: Provider Initialization

After refactoring, test that OpenClaw can retrieve credentials:

```bash
openclaw agent --test-auth
```

### Test 3: Masking Middleware

Try to log an API key pattern - it should be masked in output.

## Rollback

If something goes wrong:

1. Restore from backups:
   ```bash
   cp openclaw.json.backup openclaw.json
   cp .openclaw/agents/main/agent/auth-profiles.json.backup .openclaw/agents/main/agent/auth-profiles.json
   ```

2. Disable the extension in `openclaw.json`:
   ```json
   "secure_vault": {
     "enabled": false
   }
   ```

3. Restart gateway:
   ```bash
   openclaw gateway restart
   ```

## Maintenance

### Rotating Credentials

```bash
# Run setup again - it will overwrite existing credentials
node scripts/setup_vault.js
```

### Clearing Vault

```bash
# Delete all OpenClaw credentials from vault
node scripts/vault_clear.js
```

(TODO: Create this script if needed)

## Security Considerations

### What's Protected

✓ API keys are encrypted at rest by the OS  
✓ Keys are never written to disk in plaintext  
✓ Logs and output mask sensitive patterns  
✓ Memory is cleared after credential operations  

### What's NOT Protected

✗ Keys in memory during runtime (necessary for API calls)  
✗ Keys transmitted over HTTPS (TLS protects, but they're still sent)  
✗ Root/admin access to the OS can still read credentials  

### Best Practices

1. **Principle of Least Privilege**: Only store keys for providers you actually use
2. **Regular Rotation**: Rotate API keys periodically
3. **Audit Logs**: Monitor OpenClaw logs for suspicious activity
4. **Backup Management**: Securely delete .backup files after verifying the system works
5. **Environment Separation**: Use different keys for development and production

## Troubleshooting

### keytar Not Found

```bash
cd C:\Users\coach\AppData\Roaming\npm\node_modules\openclaw
npm install keytar --save
```

### Linux: libsecret Not Found

```bash
sudo apt-get install libsecret-1-dev
```

### Vault Empty After Setup

Check if keytar is properly installed and the service name matches:

```javascript
const creds = await keytar.findCredentials('OpenClaw');
console.log(creds);
```

### Provider Still Reading from Config

Verify the provider initialization was refactored correctly. Add debug logging:

```javascript
console.log('[Vault] Attempting to retrieve credential from vault');
const key = await keytar.getPassword('OpenClaw', 'OPENAI_API_KEY');
console.log('[Vault] Vault returned:', key ? 'SUCCESS' : 'NOT_FOUND');
```

## References

- [keytar documentation](https://github.com/atom/node-keytar)
- [Windows Credential Manager](https://support.microsoft.com/en-us/windows/accessing-credential-manager-1b5c916a-6a16-889f-8581-fc16e8165ac0)
- [macOS Keychain](https://support.apple.com/guide/keychain-access/welcome/mac)
- [Linux libsecret](https://wiki.gnome.org/Projects/Libsecret)

---

**Author**: Max  
**Date**: February 2, 2026  
**Version**: 1.0.0
