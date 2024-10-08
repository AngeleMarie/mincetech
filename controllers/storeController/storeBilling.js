import StoreInfo from '../../models/storeModels/OtherSchema.js';


const registerBillingData = async (req, res) => {
    try {
        const { storeId } = req.params; 
        const { plan, balance, currency } = req.body;  
    
        // if (!plan || !req.file) {
        //     return res.status(400).json({ error: 'Plan and profile picture are required' });
        // }

    
        const billingData = new StoreInfo({
            storeId,
            plan,
            // profilePicture: req.file.path, 
            balance, 
            currency,
        });

        await billingData.save();
        res.status(201).json({ message: 'Billing data registered successfully', billingData });
    } catch (err) {
        console.error('Error registering billing data:', err);
        res.status(400).json({ error: 'Error registering billing data', details: err.message });
    }
};


const getBillingData = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const billingData = await StoreInfo.findOne({ storeId });
        if (!billingData) return res.status(404).json({ error: 'Billing data not found' });
        
        res.status(200).json(billingData);
    } catch (err) {
        console.error('Error fetching billing data:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
const updateBillingData = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const updatedData = await StoreInfo.findOneAndUpdate({ storeId }, req.body, { new: true });
        
        if (!updatedData) return res.status(404).json({ error: 'Billing data not found' });
        
        res.status(200).json({ message: 'Billing data updated successfully', updatedData });
    } catch (err) {
        console.error('Error updating billing data:', err);
        res.status(400).json({ error: 'Error updating billing data' });
    }
};

const deleteBillingData = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const deletedData = await StoreInfo.findOneAndDelete({ storeId });
        
        if (!deletedData) return res.status(404).json({ error: 'Billing data not found' });
        
        res.status(200).json({ message: 'Billing data deleted successfully' });
    } catch (err) {
        console.error('Error deleting billing data:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export default {
    registerBillingData,
    getBillingData,
    updateBillingData,
    deleteBillingData,
};
