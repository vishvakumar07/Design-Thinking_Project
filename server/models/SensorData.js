import mongoose from 'mongoose';

const sensorDataSchema = mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    gasLevel: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    heartRate: { type: Number, required: true },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    status: { type: String, enum: ['SAFE', 'WARNING', 'CRITICAL'], default: 'SAFE' },
    risk_score: { type: Number, default: 0 },
    explanation: { type: String, default: 'Systems normal' }
}, { timestamps: true });

const SensorData = mongoose.model('SensorData', sensorDataSchema);
export default SensorData;
