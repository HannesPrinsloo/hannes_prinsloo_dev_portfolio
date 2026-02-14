import { Request, Response } from 'express';
import * as attendanceService from '../services/attendanceService';

export const markAttendance = async (req: Request, res: Response) => {
    try {
        const { lessonId, studentId, teacherId, status, notes } = req.body;

        if (!lessonId || !studentId || !teacherId || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const record = await attendanceService.markAttendance(
            lessonId,
            studentId,
            teacherId,
            status,
            notes
        );
        res.json(record);
    } catch (err: any) {
        console.error('Error marking attendance:', err.message);
        res.status(500).json({ error: err.message || 'Internal server error' });
    }
};

export const getLessonAttendance = async (req: Request, res: Response) => {
    try {
        const lessonId = parseInt(req.params.lessonId as string);
        if (isNaN(lessonId)) {
            return res.status(400).json({ error: 'Invalid lesson ID' });
        }

        const attendance = await attendanceService.getLessonAttendance(lessonId);
        res.json(attendance);
    } catch (err: any) {
        console.error(`Error fetching attendance for lesson ${req.params.lessonId}:`, err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
