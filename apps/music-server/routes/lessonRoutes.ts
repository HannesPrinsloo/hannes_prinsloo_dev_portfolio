import express from 'express';
import * as lessonController from '../controllers/lessonController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Require a valid JWT for all lesson routes
router.use(authenticateToken);


// POST /api/lessons - Create a new lesson
router.post('/', lessonController.createLesson);

// DELETE /api/lessons/:id - Delete a single lesson
router.delete('/:id', lessonController.deleteLesson);

// DELETE /api/lessons/series/:groupId - Delete a series of lessons
router.delete('/series/:groupId', lessonController.deleteLessonSeries);

// GET /api/lessons/teacher/:teacherId - Get schedule for a teacher
router.get('/teacher/:teacherId', lessonController.getTeacherSchedule);

export default router;
