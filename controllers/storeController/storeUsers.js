import Card from '../../models/cardSchema/cardSchema.js';
import Authentication from '../../models/userModels/AuthInfoSchema.js';
import Store from '../../models/storeModels/StoreSchema.js';


const addCardForUser = async (req, res) => {
    try {
        const { uid, fullName, phoneNumber, branchName, email, storeName, cardNumber } = req.body;

        const user = await Authentication.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const store = await Store.findOne({ storeName: storeName });
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        const card = new Card({
            uid,
            fullName,
            phoneNumber,
            cardNumber,
            branchName,
            userEmail: email,
            userId: user._id,
            storeId: store._id,
        });

        await card.save();
        res.status(201).json({ message: 'Card added successfully', card });
    } catch (error) {
        console.error('Error adding card:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllCards = async (req, res) => {
    try {
        const cards = await Card.find()
            .populate('userId', 'email') 
            .populate('storeId', 'name') 
            .select('uid fullName phoneNumber branchName userEmail');

        res.status(200).json({ cards });
    } catch (error) {
        console.error('Error fetching cards:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateCardForUser = async (req, res) => {
    try {
        const { cardId } = req.params;
        const { fullName, phoneNumber, branchName, uid } = req.body;

        const updatedCard = await Card.findByIdAndUpdate(
            cardId,
            { fullName, phoneNumber, branchName, uid, updatedAt: Date.now() },
            { new: true } // Return the updated document
        );

        if (!updatedCard) {
            return res.status(404).json({ error: 'Card not found' });
        }

        res.status(200).json({ message: 'Card updated successfully', updatedCard });
    } catch (error) {
        console.error('Error updating card:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const deleteCardForUser = async (req, res) => {
    try {
        const { cardId } = req.params;

        const deletedCard = await Card.findByIdAndDelete(cardId);
        if (!deletedCard) {
            return res.status(404).json({ error: 'Card not found' });
        }

        res.status(200).json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error('Error deleting card:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default { addCardForUser, getAllCards, updateCardForUser, deleteCardForUser };
