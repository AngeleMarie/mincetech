import mongoose from "mongoose";

const personalInfoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Authentication",
    required: true,
  },
  fullName: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [
      "individual user",
      "small organization",
      "other financial institution",
    ],
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  profilePicture: {
    type: String,
  },
});

export default mongoose.model("PersonalInfo", personalInfoSchema);
