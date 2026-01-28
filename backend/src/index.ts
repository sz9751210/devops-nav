import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import configRoutes from './routes/config.js';

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/opsbridge';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/config', configRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
async function start() {
    try {
        console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`API server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
