import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Models
import Alert from './models/Alert.js';
import Worker from './models/Worker.js';

// Routes
import workerRoutes from './routes/workerRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Set io instance accessible in routes
app.set('io', io);

// API Routes
app.use('/api/workers', workerRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/sensor', sensorRoutes);

// Socket.io Connection
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });

    // Listen for emergency SOS from worker app
    socket.on('sosAlert', async (data) => {
        console.log('SOS Alert received', data);
        const { workerId, location } = data;

        try {
            const worker = await Worker.findById(workerId);

            // 1. Create alert in DB
            const alert = new Alert({
                workerId,
                type: 'sos',
                message: `MANUAL SOS TRIGGERED BY ${worker?.name || workerId}`,
                severity: 'CRITICAL'
            });
            const createdAlert = await alert.save();
            const populatedAlert = await Alert.findById(createdAlert._id).populate('workerId', 'name role');

            // 2. Emit to supervisors & dashboards
            io.emit('emergencySOS', populatedAlert);
            io.emit('newAlert', populatedAlert);

            // 3. Emit System Log
            io.emit('systemLog', {
                timestamp: new Date().toISOString(),
                type: 'CRITICAL',
                message: `[MANUAL SOS] Worker ${worker?.name || workerId} requested immediate emergency assistance!`
            });

        } catch (error) {
            console.error("SOS Alert saving error:", error);
        }
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
