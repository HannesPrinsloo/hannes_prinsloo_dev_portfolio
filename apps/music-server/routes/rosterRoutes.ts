import { Router } from 'express';
import * as rosterController from '../controllers/rosterController';

import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

// Endpoint: GET /api/rosters/teacher/:teacherId
router.get('/teacher/:teacherId', rosterController.getMyRoster);

// Endpoint: GET /api/rosters/manager
router.get('/manager', rosterController.getManagerStudents);

// Endpoint: GET /api/rosters/manager/schedule
router.get('/manager/schedule', rosterController.getManagerSchedule);

// Endpoint: GET /api/rosters/manager/attendance
router.get('/manager/attendance', rosterController.getManagerAttendance);

// Endpoint: POST /api/rosters/manager/note
router.post('/manager/note', rosterController.updateNote);

export default router;
