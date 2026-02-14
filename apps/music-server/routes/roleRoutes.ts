import { Router } from 'express';
import pool from '../db';

const router = Router();

//GET all roles
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT role_id, role_name FROM roles ORDER BY role_id ASC');
        res.json(result.rows);
    } catch (err: any) {
        console.error('Error fetching roles:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//GET a single role, by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT role_id, role_name FROM roles WHERE role_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.json(result.rows[0]);
    } catch (err: any) {
        console.error(`Error fetching role with ID ${id}:`, err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
