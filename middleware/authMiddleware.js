import jwt from 'jsonwebtoken';
import Authentication from '../models/userModels/AuthInfoSchema.js'; 


const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); 
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.sendStatus(403); 
        }

        const user = await Authentication.findById(decoded.id);

        if (!user) {
            console.error('User not found for ID:', decoded.id);
            return res.sendStatus(404); 
        }

        if (!user.isConfirmed) {
            return res.status(403).json({ error: 'Email not confirmed' }); 
        }

        req.user = user; 
        next(); 
    });
};

export default authenticateToken;
