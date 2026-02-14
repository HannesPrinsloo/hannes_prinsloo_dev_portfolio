import { Router } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET env variable not set.");
}

const router = Router();

router.get('/', async (req, res) => {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ message: 'No authentication token provided.' });
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET) as { user_id: number };
        const userId = decodedToken.user_id;
        const userResult = await pool.query('SELECT user_id, email, first_name, last_name, role_id, phone_number FROM users WHERE user_id = $1', [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];

        res.status(200).json({ message: 'Authentication successful.', user });
    } catch (err: any) {
        return res.status(401).json(`{ message: 'Invalid or expired authentication token' }, ${err}`);
    }
});

export default router;