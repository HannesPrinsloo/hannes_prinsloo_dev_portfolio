import { Request, Response } from 'express';
import * as lessonService from '../services/lessonService';

export const createLesson = async (req: Request, res: Response) => {
    try {
        const { teacherId, studentId, studentIds, instrumentId, startTime, durationMinutes, recurrenceCount } = req.body;

        // Validation
        if (!teacherId || !instrumentId || !startTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Normalize studentIds
        let targetStudents: number[] = [];
        if (studentIds && Array.isArray(studentIds)) {
            targetStudents = studentIds;
        } else if (studentId) {
            targetStudents = [studentId];
        }

        if (targetStudents.length === 0) {
            return res.status(400).json({ error: 'At least one student is required' });
        }

        const result = await lessonService.createLesson(
            teacherId,
            targetStudents,
            instrumentId,
            startTime,
            durationMinutes || 60, // Default to 60 mins
            recurrenceCount || 1
        );
        res.status(201).json(result);
    } catch (err: any) {
        console.error('Error creating lesson:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteLesson = async (req: Request, res: Response) => {
    try {
        const lessonId = parseInt(req.params.id as string);
        if (isNaN(lessonId)) {
            return res.status(400).json({ error: 'Invalid lesson ID' });
        }
        const success = await lessonService.deleteLesson(lessonId);
        if (!success) {
            return res.status(404).json({ error: 'Lesson not found' });
        }
        res.json({ message: 'Lesson deleted successfully' });
    } catch (err: any) {
        console.error('Error deleting lesson:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteLessonSeries = async (req: Request, res: Response) => {
    try {
        const { groupId } = req.params;
        const { fromDate } = req.query; // Optional, defaults to now/today in frontend maybe? 
        // If fromDate is not provided, we should probably require it or default to "now"

        if (!groupId) {
            return res.status(400).json({ error: 'Missing Group ID' });
        }

        const dateStr = (fromDate as string) || new Date().toISOString();

        const count = await lessonService.deleteLessonSeries(groupId as string, dateStr);
        res.json({ message: `Deleted ${count} lessons from the series.` });
    } catch (err: any) {
        console.error('Error deleting lesson series:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getTeacherSchedule = async (req: Request, res: Response) => {
    try {
        const teacherId = parseInt(req.params.teacherId as string);
        if (isNaN(teacherId)) {
            return res.status(400).json({ error: 'Invalid teacher ID' });
        }

        const schedule = await lessonService.getTeacherSchedule(teacherId);
        res.json(schedule);
    } catch (err: any) {
        console.error(`Error fetching schedule for teacher ${req.params.teacherId}:`, err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
