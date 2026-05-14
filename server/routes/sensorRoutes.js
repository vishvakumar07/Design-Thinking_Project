import express from 'express';
import SensorData from '../models/SensorData.js';
import Alert from '../models/Alert.js';
import Worker from '../models/Worker.js';

const router = express.Router();

// Get sensor data for a worker
router.get('/:workerId', async (req, res) => {
    try {
        const data = await SensorData.find({ workerId: req.params.workerId }).sort({ createdAt: -1 }).limit(50);
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Post new sensor data
router.post('/', async (req, res) => {
    try {
        const { workerId, gasLevel, temperature, humidity, heartRate, location, status, risk_score, explanation } = req.body;

        const io = req.app.get('io');

        // 1. Emit live data immediately to UI (Fault Tolerant Mode)
        const livePayload = {
            workerId, gasLevel, temperature, humidity, heartRate, location, status, risk_score, explanation
        };

        if (io) {
            io.emit('sensorData', livePayload);
            io.emit('systemLog', {
                timestamp: new Date().toISOString(),
                type: status === 'CRITICAL' ? 'CRITICAL' : status === 'WARNING' ? 'WARNING' : 'INFO',
                message: `Sensor update from Worker ${workerId}: HR ${heartRate}bpm, Gas ${gasLevel}ppm`
            });

            if (status === 'WARNING' || status === 'CRITICAL') {
                io.emit('newAlert', {
                    workerId, type: 'ai_risk', message: explanation || `Abnormal conditions. Risk Score: ${risk_score}%`, severity: status
                });
                io.emit('systemLog', {
                    timestamp: new Date().toISOString(),
                    type: status,
                    message: `[${status}] Worker ${workerId}: ${explanation}`
                });
            }
        }

        // Return 201 immediately so the generator doesn't crash on DB timeouts
        res.status(201).json({ success: true, livePayload });

        // 2. Attempt Database Saves in Background
        try {
            const sensorData = new SensorData(livePayload);
            await sensorData.save();

            if (status === 'WARNING' || status === 'CRITICAL') {
                const alert = new Alert({
                    workerId,
                    type: 'ai_risk',
                    message: explanation || `Abnormal conditions. Risk Score: ${risk_score}%`,
                    severity: status
                });
                await alert.save();
            }

            if (location) {
                await Worker.findByIdAndUpdate(workerId, { lastLocation: location, isOnline: true });
            }
        } catch (dbError) {
            console.error("Database save skipped/failed (Fallback Mode):", dbError.message);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
