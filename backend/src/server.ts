import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import path from 'path';


import config from './shared/config';
import authRouter from './auth/routes';
import plantRouter from './plants/routes';
import { deserializeUser } from './shared/middleware/auth.middleware';
import swaggerDocument from '../swagger.json';

const app = express();
const server = createServer(app);

// Socket.IO setup for real-time communication
const io = new SocketIOServer(server, {
    cors: {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            
            if (process.env.NODE_ENV === 'production') {
                if (origin.includes('schwager.fr')) {
                    return callback(null, true);
                }
            } else {
                if (origin.includes('localhost')) {
                    return callback(null, true);
                }
            }
            
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    },
});

// --- Global Middlewares ---
// Enable CORS
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (process.env.NODE_ENV === 'production') {
            if (origin.includes('schwager.fr')) {
                return callback(null, true);
            }
        } else {
            if (origin.includes('localhost')) {
                return callback(null, true);
            }
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Deserialize user from access token in cookies
app.use(deserializeUser);

// --- API Routes ---
app.use('/api', authRouter);
app.use('/api/plants', plantRouter);

// --- Swagger API Docs ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- WebSocket Events ---
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle plant control events
    socket.on('control:pump', (data) => {
        // Broadcast pump control to all connected devices
        socket.broadcast.emit('pump:activate', data);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io accessible to routes
app.set('io', io);

// --- Start Server ---
server.listen(config.port, () => {
    console.log(`Server is running at http://localhost:${config.port}`);
    console.log(`API Docs available at http://localhost:${config.port}/api-docs`);
    console.log('WebSocket server ready for real-time communication');
});