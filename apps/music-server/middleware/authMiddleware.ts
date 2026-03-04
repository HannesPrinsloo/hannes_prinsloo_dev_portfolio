
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET env variable not set. Server cannot start safely.');
}


export interface AuthRequest extends Request {
    user?: {
        user_id: number;
        role_id?: number; // Add role_id if available in token, usually just user_id
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ error: 'No authentication token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { user_id: number; role_id?: number };
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};
