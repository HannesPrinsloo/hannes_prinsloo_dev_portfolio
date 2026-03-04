import express from 'express';
import * as attendanceController from '../controllers/attendanceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Require a valid JWT for all attendance routes
router.use(authenticateToken);


// POST /api/attendance - Mark attendance
router.post('/', attendanceController.markAttendance);

// GET /api/attendance/lesson/:lessonId - Get attendance for a specific lesson
router.get('/lesson/:lessonId', attendanceController.getLessonAttendance);

export default router;
