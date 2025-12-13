const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();

// Import passport configuration
require('./config/passport');

const connectDB = require('./config/database');
const { initializeSocket } = require('./services/socketService');

// Import routes
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/polls');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Socket.IO setup
const io = socketIo(server, {
    cors: {
        origin: [
            process.env.CORS_ORIGIN,
            'http://localhost:3000', 
            'http://localhost:3001'
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Initialize socket service
initializeSocket(io);

// Middleware
app.use(helmet());
app.use(cors({
    origin: [
        process.env.CORS_ORIGIN,
        'http://localhost:3000', 
        'http://localhost:3001'
    ],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
});

module.exports = { app, server };