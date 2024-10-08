import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
  branchName: { type: String, required: true },
  secretKey: { type: String, required: true, unique: true },
  totalUsers: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
});

const storeInfoSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  isConfirmed: { type: Boolean, default: false },
  confirmationToken: { type: String, default: "" },
  googleId: { type: String, unique: true },
  role: { type: String, default: "Sub Admin" },
  branches: [branchSchema],
});

export default mongoose.model("Store", storeInfoSchema);
