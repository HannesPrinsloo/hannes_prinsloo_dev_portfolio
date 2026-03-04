import { Router } from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Require a valid JWT for instrument lookup
router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT instrument_id, instrument_name FROM instruments ORDER BY instrument_name ASC');
        res.json(result.rows);
    } catch (err: any) {
        console.error('Error fetching instruments:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
