
import { Router } from 'express';
import * as eventController from '../controllers/eventController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// POST /api/events - Create Event (Admin)
router.post('/', eventController.createEvent);

// GET /api/events - List Upcoming Events
router.get('/', eventController.getEvents);

// GET /api/events/manager - Get events for logged-in manager
router.get('/manager', eventController.getManagerEvents);

// GET /api/events/teacher - Get events for logged-in teacher
router.get('/teacher', eventController.getTeacherEvents);

// GET /api/events/:eventId/eligible-students - Get students eligible for this event
router.get('/:eventId/eligible-students', eventController.getEligibleStudents);

// GET /api/events/:eventId/bookings - Get booked students
router.get('/:eventId/bookings', eventController.getBookedStudents);

// POST /api/events/book - Book a student
router.post('/book', eventController.bookStudent);

// DELETE /api/events/bookings/:bookingId - Cancel booking
router.delete('/bookings/:bookingId', eventController.cancelBooking);

// DELETE /api/events/:eventId - Delete Event
router.delete('/:eventId', eventController.deleteEvent);

export default router;
