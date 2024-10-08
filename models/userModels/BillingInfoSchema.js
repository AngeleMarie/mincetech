import mongoose from "mongoose"


const billingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Authentication', required: true },
    plan: {
      type: String,
      enum: ['Basic', 'Premium', 'Free Trial'],
      required: true,
    },
    UUID:{type:String,required:true},
    balance: {
      type: Number,
      default: 0, 
    },
  });
  
  export default mongoose.model('Billing', billingSchema);