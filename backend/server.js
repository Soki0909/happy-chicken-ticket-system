const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Import database utilities
const { initializeDatabase, healthCheck } = require('./src/utils/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'happy-chicken-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Static files (serve frontend)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbHealth = await healthCheck();
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            service: 'Happy Chicken Ticket System',
            database: dbHealth
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR', 
            timestamp: new Date().toISOString(),
            service: 'Happy Chicken Ticket System',
            error: error.message
        });
    }
});

// Import Ticket model for testing
const Ticket = require('./src/models/ticket');

// Temporary test endpoint
app.get('/api/test/ticket', async (req, res) => {
    try {
        // Create a test ticket
        const ticket = await Ticket.create();
        res.json({
            success: true,
            message: 'Test ticket created successfully',
            data: ticket
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API routes will be added here later
// app.use('/api/tickets', require('./src/routes/tickets'));
// app.use('/api/admin', require('./src/routes/admin'));

// Serve frontend for any non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        code: 'INTERNAL_ERROR'
    });
});

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database
        await initializeDatabase();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`🐔 Happy Chicken Ticket System server running on port ${PORT}`);
            console.log(`📱 Health check: http://localhost:${PORT}/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;