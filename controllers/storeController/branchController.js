
import Store from '../../models/storeModels/StoreSchema.js';

const getBranches = async (req, res) => {
    try {
        const { storeId } = req.params;
        if (!storeId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid store ID format' });
        }

        const store = await Store.findById(storeId).select('branches storeName');
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.status(200).json({ 
            storeName: store.storeName,
            branches: store.branches 
        });
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

const addBranch = async (req, res) => {
    try {
        const { storeId } = req.params;
        const { branchName } = req.body;

        if (!branchName) {
            return res.status(400).json({ error: 'Branch name is required' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        const crypto = require('crypto');
        const secretKey = crypto.randomBytes(16).toString('hex');

        const newBranch = {
            branchName,
            secretKey,
            totalUsers: 0,
            balance: 0
        };

        store.branches.push(newBranch);
        await store.save();

        res.status(201).json({ message: 'Branch added successfully', branch: newBranch });
    } catch (err) {
        console.error('Error adding branch:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateBranch = async (req, res) => {
    try {
        const { storeId, branchId } = req.params;
        const { branchName, balance } = req.body;

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        const branch = store.branches.id(branchId);
        if (!branch) {
            return res.status(404).json({ error: 'Branch not found' });
        }

        if (branchName) branch.branchName = branchName;
        if (balance !== undefined) branch.balance = balance;

        await store.save();

        res.status(200).json({ message: 'Branch updated successfully', branch });
    } catch (err) {
        console.error('Error updating branch:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
const deleteBranch = async (req, res) => {
    try {
        const { storeId, branchId } = req.params;

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        const branch = store.branches.id(branchId);
        if (!branch) {
            return res.status(404).json({ error: 'Branch not found' });
        }

        branch.remove();
        await store.save();

        res.status(200).json({ message: 'Branch deleted successfully' });
    } catch (err) {
        console.error('Error deleting branch:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

export default { getBranches, addBranch, updateBranch, deleteBranch };
