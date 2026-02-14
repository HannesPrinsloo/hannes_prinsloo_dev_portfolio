import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
    });

    res.status(200).json({ message: 'Logged out successfully' });
});

export default router;