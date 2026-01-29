import type { OpsNavigationConfig, EnvSpecificConfig } from '../types/schema';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
    // Get current config
    async getConfig(): Promise<OpsNavigationConfig> {
        const res = await fetch(`${API_BASE}/api/config`);
        if (!res.ok) throw new Error('Failed to fetch config');
        return res.json();
    },

    // Update full config
    async saveConfig(config: OpsNavigationConfig): Promise<OpsNavigationConfig> {
        const res = await fetch(`${API_BASE}/api/config`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });
        if (!res.ok) throw new Error('Failed to save config');
        return res.json();
    },

    // Update env-specific config
    async saveEnvConfig(env: string, envConfig: EnvSpecificConfig): Promise<OpsNavigationConfig> {
        const res = await fetch(`${API_BASE}/api/config/env/${encodeURIComponent(env)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(envConfig),
        });
        if (!res.ok) throw new Error('Failed to save env config');
        return res.json();
    },

    // Health check
    async health(): Promise<boolean> {
        try {
            const res = await fetch(`${API_BASE}/api/health`);
            return res.ok;
        } catch {
            return false;
        }
    },
};
