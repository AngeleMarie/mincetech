import mongoose from "mongoose";

const authInfoSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  confirmationToken: {
    type: String,
    default: "",
  },
  googleId: {
    type: String,
    unique: false,
  },
  pin: {
    type: String,
  },
  auth2FA: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Authentication", authInfoSchema);
