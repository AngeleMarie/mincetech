
import mongoose from "mongoose"

const billingSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    plan: {
      type: String,
      enum: ['Basic', 'Premium', 'Free Trial'],
      required: true,
    },
    profilePicture:{type:String, required:false},
    balance: {
      type: Number,
      default: 0, 
    },
    currency:{type:String,default:"frw"}

  });
  
  export default mongoose.model('StoreInfo', billingSchema);