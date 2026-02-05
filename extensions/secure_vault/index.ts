/**
 * OpenClaw Secure Vault Extension
 * Eliminates plaintext credential storage by interfacing with OS-level secure storage
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { z } from "zod";

// Import keytar for OS-level credential storage
let keytar: any;
try {
  keytar = await import("keytar");
} catch (error) {
  console.error("[SecureVault] keytar module not found. Install with: npm install keytar");
}

const DEFAULT_SERVICE = "OpenClaw";

// Masking middleware - intercepts and masks sensitive values
function maskSecret(value: string): string {
  if (!value || value.length < 8) return "***MASKED***";
  return `***${value.slice(-4)}***`;
}

// Tool schema for credential management
const ManageCredentialsSchema = z.object({
  mode: z.enum(["store", "retrieve", "delete", "list"]),
  service: z.string().optional().default(DEFAULT_SERVICE),
  account: z.string().optional(),
  password: z.string().optional(),
});

const plugin = {
  id: "secure_vault",
  name: "Secure Vault",
  description: "OS-level credential storage using keytar",
  configSchema: emptyPluginConfigSchema(),
  
  register(api: OpenClawPluginApi) {
    // Register the ManageCredentials tool
    api.registerTool({
      name: "manage_credentials",
      description: "Securely store, retrieve, or delete credentials using OS-level secure storage (Windows Credential Manager, macOS Keychain, Linux libsecret)",
      schema: ManageCredentialsSchema,
      
      async execute(params: z.infer<typeof ManageCredentialsSchema>) {
        if (!keytar) {
          throw new Error("keytar module not available. Install with: npm install keytar");
        }
        
        const { mode, service = DEFAULT_SERVICE, account, password } = params;
        
        try {
          switch (mode) {
            case "store": {
              if (!account || !password) {
                throw new Error("Both 'account' and 'password' are required for store mode");
              }
              
              await keytar.setPassword(service, account, password);
              
              // Critical Security Control: Clear password from memory
              // @ts-ignore - intentionally clearing the variable
              params.password = undefined;
              // @ts-ignore
              password = undefined;
              
              return {
                success: true,
                message: `Credential stored for account: ${account}`,
                service,
                account,
              };
            }
            
            case "retrieve": {
              if (!account) {
                throw new Error("'account' is required for retrieve mode");
              }
              
              const credential = await keytar.getPassword(service, account);
              
              if (!credential) {
                return {
                  success: false,
                  message: `No credential found for account: ${account}`,
                  service,
                  account,
                };
              }
              
              // Return the credential (will be used internally, not logged)
              return {
                success: true,
                credential,
                service,
                account,
                // Include masked version for any logging
                masked: maskSecret(credential),
              };
            }
            
            case "delete": {
              if (!account) {
                throw new Error("'account' is required for delete mode");
              }
              
              const deleted = await keytar.deletePassword(service, account);
              
              return {
                success: deleted,
                message: deleted 
                  ? `Credential deleted for account: ${account}`
                  : `No credential found for account: ${account}`,
                service,
                account,
              };
            }
            
            case "list": {
              const credentials = await keytar.findCredentials(service);
              
              return {
                success: true,
                count: credentials.length,
                accounts: credentials.map((c: any) => c.account),
                service,
              };
            }
            
            default:
              throw new Error(`Unknown mode: ${mode}`);
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      },
    });
    
    // Register masking middleware
    api.registerMiddleware({
      name: "credential_masking",
      priority: 1000, // High priority to run early
      
      async onOutput(output: string): Promise<string> {
        // Mask common API key patterns
        let masked = output;
        
        // OpenAI keys
        masked = masked.replace(/sk-proj-[A-Za-z0-9_-]{96}/g, (match) => maskSecret(match));
        masked = masked.replace(/sk-[A-Za-z0-9]{48}/g, (match) => maskSecret(match));
        
        // Anthropic keys
        masked = masked.replace(/sk-ant-api03-[A-Za-z0-9_-]{95}/g, (match) => maskSecret(match));
        
        // OpenRouter keys  
        masked = masked.replace(/sk-or-v1-[A-Za-z0-9]{64}/g, (match) => maskSecret(match));
        
        // Generic patterns
        masked = masked.replace(/Bearer\s+[A-Za-z0-9_-]{32,}/g, "Bearer ***MASKED***");
        
        return masked;
      },
    });
    
    console.log("[SecureVault] Plugin registered successfully");
  },
};

export default plugin;
