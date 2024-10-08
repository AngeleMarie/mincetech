import Transaction from '../../models/TransactionSchema.js';
import Store from '../../models/storeModels/StoreSchema.js';
import StoreInfo from '../../models/storeModels/OtherSchema.js'; 
import Card from '../../models/cardSchema/cardSchema.js';

const getStoreOverview = async (req, res) => {
    try {
        const storeId = req.params.storeId;

        const store = await Store.findById(storeId);
        if (!store) return res.status(404).json({ error: 'Store not found' });

        const [transactions, storeInfo, cards] = await Promise.all([
            Transaction.find({ storeId }),
            StoreInfo.findOne({ storeId }), 
            Card.find({ storeId })
        ]);

        if (!storeInfo) {
            return res.status(404).json({ error: 'Billing information not found for the store' });
        }

        const totalPayments = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        const walletBalance = storeInfo.balance;
        const branchesCount = store.branches.length;

        res.status(200).json({
            totalUsers: cards.length,     
            totalPayments,
            branchesCount,
            walletBalance,
            currency: storeInfo.currency,
            cards
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export default { getStoreOverview };
