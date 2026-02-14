import { Request, Response } from 'express';
import * as eventService from '../services/eventService';
import { AuthRequest } from '../middleware/authMiddleware';

// Create Event
export const createEvent = async (req: Request, res: Response) => {
    try {
        const eventData = req.body;
        // Basic validation could go here or in middleware
        if (!eventData.eventName || !eventData.startTime || !eventData.endTime) {
            return res.status(400).json({ error: "Missing required event fields" });
        }

        const newEvent = await eventService.createEvent(eventData);
        res.status(201).json(newEvent);
    } catch (err: any) {
        console.error("Error creating event:", err);
        res.status(500).json({ error: "Failed to create event" });
    }
};

// List Events
export const getEvents = async (req: Request, res: Response) => {
    try {
        const filter = req.query.filter as 'upcoming' | 'past' | 'all' | undefined;
        const events = await eventService.getEvents(filter);
        res.json(events);
    } catch (err: any) {
        console.error("Error fetching events:", err);
        res.status(500).json({ error: "Failed to fetch events" });
    }
};

// ... (getEligibleStudents, bookStudent, getBookedStudents, cancelBooking remain)

// Delete Event
export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.eventId);
        if (isNaN(eventId)) {
            return res.status(400).json({ error: "Invalid event ID" });
        }
        await eventService.deleteEvent(eventId);
        res.json({ message: "Event deleted successfully" });
    } catch (err: any) {
        console.error("Error deleting event:", err);
        res.status(500).json({ error: "Failed to delete event" });
    }
};

// Get Eligible Students for an Event
export const getEligibleStudents = async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.eventId);
        if (isNaN(eventId)) {
            return res.status(400).json({ error: "Invalid event ID" });
        }

        const students = await eventService.getEligibleStudents(eventId);
        res.json(students);
    } catch (err: any) {
        console.error("Error fetching eligible students:", err);
        res.status(500).json({ error: "Failed to fetch eligible students" });
    }
};



// Book Student
export const bookStudent = async (req: Request, res: Response) => {
    try {
        const { eventId, studentId } = req.body;
        const adminId = (req as AuthRequest).user?.user_id;

        if (!adminId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!eventId || !studentId) {
            return res.status(400).json({ error: "Missing eventId or studentId" });
        }

        const booking = await eventService.bookStudent(eventId, studentId, adminId);
        res.status(201).json(booking);
    } catch (err: any) {
        console.error("Error booking student:", err);
        res.status(500).json({ error: err.message || "Failed to book student" });
    }
};

// Get Booked Students (Admin View)
export const getBookedStudents = async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.eventId);
        if (isNaN(eventId)) {
            return res.status(400).json({ error: "Invalid event ID" });
        }

        const students = await eventService.getBookedStudents(eventId);
        res.json(students);
    } catch (err: any) {
        console.error("Error fetching booked students:", err);
        res.status(500).json({ error: "Failed to fetch booked students" });
    }
};

// Cancel Booking
export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const bookingId = parseInt(req.params.bookingId);
        if (isNaN(bookingId)) {
            return res.status(400).json({ error: "Invalid booking ID" });
        }

        await eventService.cancelBooking(bookingId);
        res.json({ message: "Booking cancelled successfully" });
    } catch (err: any) {
        console.error("Error cancelling booking:", err);
        res.status(500).json({ error: "Failed to cancel booking" });
    }
};

// Get Events for Manager
export const getManagerEvents = async (req: Request, res: Response) => {
    try {
        const managerId = (req as AuthRequest).user?.user_id;
        if (!managerId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const events = await eventService.getEventsForManager(managerId);
        res.json(events);
    } catch (err: any) {
        res.status(500).json({ error: "Failed to fetch manager events" });
    }
};

// Get Events for Teacher
export const getTeacherEvents = async (req: Request, res: Response) => {
    try {
        const teacherId = (req as AuthRequest).user?.user_id;
        if (!teacherId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const events = await eventService.getEventsForTeacher(teacherId);
        res.json(events);
    } catch (err: any) {
        console.error("Error fetching teacher events:", err);
        res.status(500).json({ error: "Failed to fetch teacher events" });
    }
};
