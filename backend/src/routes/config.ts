import { Router, Request, Response } from 'express';
import { Config, IConfig } from '../models/Config.js';

const router = Router();

// Default config for initialization
const DEFAULT_CONFIG = {
    _id: 'default',
    title: 'OpsBridge Navigation',
    environments: [],
    columns: [],
    services: [],
    envGroups: [],
    favoriteEnvs: [],
    envConfigs: {},
};

// GET /api/config - Get current config
router.get('/', async (_req: Request, res: Response) => {
    try {
        let config = await Config.findById('default');

        if (!config) {
            // Create default config if not exists
            config = new Config(DEFAULT_CONFIG);
            await config.save();
        }

        res.json(config);
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
});

// PUT /api/config - Update full config
router.put('/', async (req: Request, res: Response) => {
    try {
        const configData = { ...req.body, _id: 'default' };

        const config = await Config.findByIdAndUpdate(
            'default',
            configData,
            { new: true, upsert: true, runValidators: true }
        );

        res.json(config);
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

// PATCH /api/config/env/:env - Update env-specific config
router.patch('/env/:env', async (req: Request, res: Response) => {
    try {
        const { env } = req.params;
        const envConfig = req.body;

        const config = await Config.findById('default');
        if (!config) {
            return res.status(404).json({ error: 'Configuration not found' });
        }

        // Update the specific environment config
        const envConfigs = config.envConfigs || {};
        envConfigs[env] = envConfig;
        config.envConfigs = envConfigs;
        await config.save();

        res.json(config);
    } catch (error) {
        console.error('Error updating env config:', error);
        res.status(500).json({ error: 'Failed to update environment configuration' });
    }
});

export default router;
