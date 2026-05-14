import express from 'express';
import Worker from '../models/Worker.js';

const router = express.Router();

// Get all workers
router.get('/', async (req, res) => {
    try {
        const workers = await Worker.find({});
        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new worker
router.post('/', async (req, res) => {
    try {
        const { name, role, contact } = req.body;
        const worker = new Worker({ name, role, contact });
        const createdWorker = await worker.save();
        res.status(201).json(createdWorker);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get worker by ID
router.get('/:id', async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id);
        if (worker) {
            res.json(worker);
        } else {
            res.status(404).json({ message: 'Worker not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
