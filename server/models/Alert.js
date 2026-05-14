import mongoose from 'mongoose';

const alertSchema = mongoose.Schema({
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    type: { type: String, enum: ['gas', 'temperature', 'heartRate', 'sos', 'multiple', 'ai_risk'], required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['WARNING', 'CRITICAL'], required: true },
    resolved: { type: Boolean, default: false }
}, { timestamps: true });

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
