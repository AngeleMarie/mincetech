import mongoose from "mongoose";

const pinSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pin: { type: String, required: true }
});

export default mongoose.model('Pin', pinSchema);
