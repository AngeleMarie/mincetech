import crypto from 'crypto';
import storeSchema from '../../validators/storeValidator.js';
import Store from '../../models/storeModels/StoreSchema.js';
import bcrypt from 'bcrypt'
import transporter from '../../config/emailConfig.js';
import jwt from "jsonwebtoken"

const registerStore = async (req, res) => {
    try {
        const { error } = storeSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ errors: error.details.map(detail => detail.message) });
        }

        const { storeName, email, password, country, city, postalCode, role } = req.body;

        let existingStore = await Store.findOne({ email });
        if (existingStore) {
            return res.status(400).json({ error: 'Store already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const confirmationToken = crypto.randomBytes(20).toString('hex');
        const secretKey = crypto.randomBytes(16).toString('hex');
        const newStore = new Store({
            storeName,
            email,
            password: hashedPassword,
            country,
            city,
            postalCode,
            role: role || 'Sub Admin', 
            confirmationToken,
            isConfirmed: false,
            branches: [
                {
                    branchName: city, 
                    secretKey: secretKey, 
                    totalUsers: 0,
                    balance: 0
                }
            ]
        });

        await newStore.save();

        const confirmationUrl = `http://localhost:6345/api/store/auth/confirm/${confirmationToken}`;
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Email Confirmation',
            text: `Please confirm your email by clicking the following link: ${confirmationUrl}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ error: 'Error sending confirmation email' });
            }       
            console.log('Email sent:', info.response);
            res.status(201).json({ message: 'Store registered successfully. Please check your email for confirmation.' });
        });

    } catch (err) {
        console.error('Error registering store:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
const confirmEmail = async (req, res) => {
    const { token } = req.params;

    try {
        console.log(`Confirmation token received: ${token}`);

        const store = await Store.findOne({ confirmationToken: token });

        if (!store) {
            console.error('Invalid or expired confirmation token');
            return res.status(400).json({ error: 'Invalid or expired confirmation token' });
        }
        store.isConfirmed = true;
        await store.save();

        console.log('Email confirmed successfully');
        res.status(200).json({ message: 'Email confirmed successfully', redirectUrl: 'https://mince-web-lmg4.vercel.app/admin/dashboard' });
    } catch (err) {
        console.error('Error confirming email:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


const loginStore = async (req, res) => {
    try {
        const { email, password, secretKey } = req.body;

        const store = await Store.findOne({ email });
        if (!store) {
            return res.status(400).json({ error: 'Store not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, store.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        if (!store.isConfirmed) {
            return res.status(400).json({ error: 'Please confirm your email before logging in.' });
        }

        const branch = store.branches.find(branch => branch.secretKey === secretKey);
        if (!branch) {
            return res.status(400).json({ error: 'Invalid secret key. Branch not found.' });
        }
        const token = jwt.sign(
            { storeId: store._id, branchId: branch._id, role: store.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            branchName: branch.branchName,
            role: store.role,
            storeName:store.storeName
        });

    } catch (err) {
        console.error('Error logging in store:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


export default {registerStore,loginStore,confirmEmail}