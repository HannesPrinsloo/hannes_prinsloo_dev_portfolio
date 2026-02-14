import { Request, Response } from 'express';
import * as rosterService from '../services/rosterService';

export const getMyRoster = async (req: Request, res: Response) => {
    try {
        const teacherId = parseInt(req.params.teacherId);

        if (isNaN(teacherId)) {
            return res.status(400).json({ error: 'Invalid teacher ID provided' });
        }

        /**
         * TODO: Security/Role Check
         * 1. Check if the user making the request has the 'Teacher' role (role_id: 2).
         * 2. (After Auth0) Check if the authenticated user's ID matches the teacherId 
         * requested, or if they are an 'Admin' (role_id: 1).
         */

        const roster = await rosterService.getTeacherRoster(teacherId);

        // We return an empty array if no students are found, which is a valid state
        res.json(roster);
    } catch (err: any) {
        console.error(`Error fetching roster for teacher ${req.params.teacherId}:`, err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Manager Students
export const getManagerStudents = async (req: Request, res: Response) => {
    try {
        const managerId = (req as any).user?.user_id;

        if (!managerId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const students = await rosterService.getManagerStudents(managerId);
        res.json(students);
    } catch (err: any) {
        console.error("Error fetching manager students:", err);
        res.status(500).json({ error: "Failed to fetch students" });
    }
};

export const getManagerSchedule = async (req: Request, res: Response) => {
    try {
        const managerId = (req as any).user?.user_id;
        const schedule = await rosterService.getManagerSchedule(managerId);
        res.json(schedule);
    } catch (err: any) {
        console.error("Error fetching manager schedule:", err);
        res.status(500).json({ error: "Failed to fetch schedule" });
    }
};

export const getManagerAttendance = async (req: Request, res: Response) => {
    try {
        const managerId = (req as any).user?.user_id;
        const attendance = await rosterService.getManagerAttendance(managerId);
        res.json(attendance);
    } catch (err: any) {
        console.error("Error fetching manager attendance:", err);
        res.status(500).json({ error: "Failed to fetch attendance" });
    }
};

export const updateNote = async (req: Request, res: Response) => {
    try {
        const { enrollmentId, note } = req.body;
        if (!enrollmentId) return res.status(400).json({ error: "Missing enrollment ID" });

        const updated = await rosterService.updateLessonNote(enrollmentId, note);
        res.json(updated);
    } catch (err: any) {
        console.error("Error updating note:", err);
        res.status(500).json({ error: "Failed to update note" });
    }
};