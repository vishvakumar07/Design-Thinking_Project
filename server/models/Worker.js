import mongoose from 'mongoose';

const workerSchema = mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    contact: { type: String },
    isOnline: { type: Boolean, default: false },
    lastLocation: {
        lat: { type: Number },
        lng: { type: Number }
    }
}, { timestamps: true });

const Worker = mongoose.model('Worker', workerSchema);
export default Worker;
