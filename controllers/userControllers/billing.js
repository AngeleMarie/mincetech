import billingValidator from "../../validators/billingValidator.js";
import BillingSchema from "../../models/userModels/BillingInfoSchema.js";
import Authentication from "../../models/userModels/AuthInfoSchema.js";
import Transaction from "../../models/TransactionSchema.js"; 

const registerBillingInfo = async (req, res) => {
    try {
        const { userId } = req.params;
        const { error, value } = billingValidator.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Validation error', details: error.details });
        }
        const user = await Authentication.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let billing = await BillingSchema.findOne({ userId: user._id });
        if (!billing) {
            billing = new BillingSchema({
                userId: user._id,
                plan: value.plan,
           
            });
        } else {
            billing.plan = value.plan;
            billing.accounts = value.accounts;
        }
        const transactions = await Transaction.find({ userId: user._id, status: 'Completed' });
        let totalTransactionAmount = 0;
        
        if (transactions && transactions.length > 0) {
            totalTransactionAmount = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
        }

        billing.balance += totalTransactionAmount;
        await billing.save();

        res.status(201).json({ message: 'Billing information registered successfully', data: billing });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export default registerBillingInfo;
