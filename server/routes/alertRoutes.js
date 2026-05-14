import express from 'express';
import Alert from '../models/Alert.js';

const router = express.Router();

// Get all alerts
router.get('/', async (req, res) => {
    try {
        const alerts = await Alert.find({}).populate('workerId', 'name role').sort({ createdAt: -1 });
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new alert
router.post('/', async (req, res) => {
    try {
        const { workerId, type, message, severity } = req.body;
        const alert = new Alert({ workerId, type, message, severity });
        const createdAlert = await alert.save();
        res.status(201).json(createdAlert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Resolve alert
router.put('/:id/resolve', async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);
        if (alert) {
            alert.resolved = true;
            const updatedAlert = await alert.save();
            res.json(updatedAlert);
        } else {
            res.status(404).json({ message: 'Alert not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
