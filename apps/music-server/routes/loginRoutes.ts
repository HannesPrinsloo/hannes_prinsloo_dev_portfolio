import { Router } from 'express';
import pool from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateRequest } from '../middleware/validateRequest';
import { userLoginSchema } from '../validation/loginValidation';
 

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET env variable not set.");
}

router.post('/', validateRequest(userLoginSchema), async (req, res) => {
    const { email, password_hash: password } = req.body;
    try {
        const userResult = await pool.query('SELECT user_id, password_hash FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            const payload = { user_id: user.user_id };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h'});
            
            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
            });

            res.status(200).json( payload );
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err: any) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;