
import pool from '../db';
import { Request, Response } from 'express';

// ----------------------
// Service
// ----------------------

export const getAllLevels = async () => {
    const res = await pool.query('SELECT level_id, level_name AS title, description, level_number AS sequence_number FROM levels ORDER BY level_number ASC');
    return res.rows;
};

export const assignStudentLevel = async (studentId: number, levelId: number, recordedByUserId: number) => {
    // We treat this as "achieving" or "assigning" a level.
    // Insert a new record. The "Current Level" logic (highest sequence) will naturally handle this.
    // Or we could check if they already have this level? 
    // For now, simple insert as per requirement.

    // First, verify level exists
    const levelCheck = await pool.query('SELECT * FROM levels WHERE level_id = $1', [levelId]);
    if (levelCheck.rows.length === 0) {
        throw new Error("Level not found");
    }

    const query = `
        INSERT INTO student_levels (student_user_id, level_id, date_completed, recorded_by_user_id)
        VALUES ($1, $2, CURRENT_DATE, $3)
        RETURNING *
    `;
    const res = await pool.query(query, [studentId, levelId, recordedByUserId]);
    return res.rows[0];
};

// ----------------------
// Controller
// ----------------------

export const getLevels = async (req: Request, res: Response) => {
    try {
        const levels = await getAllLevels();
        res.json(levels);
    } catch (err: any) {
        console.error("Error fetching levels:", err);
        res.status(500).json({ error: "Failed to fetch levels" });
    }
};

export const assignLevel = async (req: Request, res: Response) => {
    try {
        const { studentId, levelId } = req.body;
        // In a real app, we'd get teacher ID from the session/token. 
        // For now, we might expect it in body or assume the user making request is the teacher.
        // Let's assume req.user is populated by middleware, or passed in body for now if auth isn't fully strict yet.
        // Based on previous code (createLesson), we used user.user_id from store.

        // Let's assume the body contains recordedByUserId for simplicity unless we see Auth middleware usage.
        // Checking lessonRoutes, it seems we don't strictly extract user from token in controller, 
        // but let's look at `createLesson` in `lessonController.ts`.
        // It takes teacherId from body. Let's do same here.

        const { recordedByUserId } = req.body;

        if (!studentId || !levelId || !recordedByUserId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await assignStudentLevel(studentId, levelId, recordedByUserId);
        res.status(201).json(result);
    } catch (err: any) {
        console.error("Error assigning level:", err);
        res.status(500).json({ error: err.message || "Failed to assign level" });
    }
};
