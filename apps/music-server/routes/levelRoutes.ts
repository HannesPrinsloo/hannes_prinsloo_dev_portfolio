
import { Router } from 'express';
import * as levelController from '../controllers/levelController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Require a valid JWT for all level routes
router.use(authenticateToken);


// GET /api/levels
router.get('/', levelController.getLevels);

// POST /api/levels/assign
router.post('/assign', levelController.assignLevel);

export default router;
