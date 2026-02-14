import express from 'express';
import * as attendanceController from '../controllers/attendanceController';

const router = express.Router();

// POST /api/attendance - Mark attendance
router.post('/', attendanceController.markAttendance);

// GET /api/attendance/lesson/:lessonId - Get attendance for a specific lesson
router.get('/lesson/:lessonId', attendanceController.getLessonAttendance);

export default router;
