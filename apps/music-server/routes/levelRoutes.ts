
import { Router } from 'express';
import * as levelController from '../controllers/levelController';

const router = Router();

// GET /api/levels
router.get('/', levelController.getLevels);

// POST /api/levels/assign
router.post('/assign', levelController.assignLevel);

export default router;
