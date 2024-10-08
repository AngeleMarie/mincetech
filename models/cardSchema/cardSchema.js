import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /\d{16}/.test(v);
        },
        message: (props) => `${props.value} is not a valid card number!`,
      },
    },
    balance: {
      type: Number,
      default: 150000,
      required: true,
    },
    uid: {
      type: String,
      required: false,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Authentication",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    branchName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    // fcmToken: {
    //   type: String,
    //   default: null,
    // },
    isLinked: {
      type: Boolean,
      default: false,
    },
    linkExpiration: {
      type: Date,
      default: () => Date.now() + 10 * 60 * 60 * 1000
    },
  },
  {
    timestamps: true,
  }
);

const Card = mongoose.model("Card", cardSchema);
export default Card;
