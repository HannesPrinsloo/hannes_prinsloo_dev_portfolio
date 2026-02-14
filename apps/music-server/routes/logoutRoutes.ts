import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    res.status(200).json({message: 'Logged out successfully' });
});

export default router;