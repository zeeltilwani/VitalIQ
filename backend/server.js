require('dotenv').config();
const express = require('express');
const cors = require('cors');


const authRoutes = require('./routes/auth');
const logRoutes = require('./routes/logs');
const aiRoutes = require('./routes/ai');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*',
    allowedHeaders: ['Authorization', 'Content-Type']
}));
app.use(express.json());
app.use('/diet-pdfs', express.static('assets/diet-plans'));
app.use('/uploads', express.static('uploads'));

// Global request logger — fires on EVERY request
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
    next();
});

// Health-check route — use this to test connectivity from phone
app.get('/test', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), message: 'VitalIQ backend is reachable' });
});

const apiLogger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] Incoming request: ${req.method} ${req.originalUrl}`);
    next();
};

console.log("[Startup] System initializing... Mounting routes:");
console.log(" -> Mounted: /api/auth");
app.use('/api/auth', apiLogger, authRoutes);
console.log(" -> Mounted: /api/logs");
app.use('/api/logs', apiLogger, logRoutes);
console.log(" -> Mounted: /api/ai");
app.use('/api/ai', apiLogger, aiRoutes);
console.log(" -> Mounted: /api/user");
app.use('/api/user', apiLogger, userRoutes);

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server running on 0.0.0.0:${PORT}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ ERROR: Port ${PORT} is already in use by another process.`);
        console.error(`Please stop duplicate instances or check what is using this port.\n`);
        process.exit(1);
    } else {
        console.error('Server encountered an error:', error);
    }
});

// Graceful shutdown handling
const handleShutdown = (signal) => {
    console.log(`\n[Shutdown] Received ${signal}, closing server gracefully...`);
    server.close(() => {
        console.log('[Shutdown] Server connections safely closed.');
        process.exit(0);
    });

    // Force shutdown after 10s if connections persist
    setTimeout(() => {
        console.error('[Shutdown] Force closing lingering connections.');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
