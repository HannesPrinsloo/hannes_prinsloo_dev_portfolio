
import { Request, Response } from 'express';
import * as levelService from '../services/levelService';

export const getLevels = async (req: Request, res: Response) => {
    try {
        const levels = await levelService.getAllLevels();
        res.json(levels);
    } catch (err: any) {
        console.error("Error fetching levels:", err);
        res.status(500).json({ error: "Failed to fetch levels" });
    }
};

export const assignLevel = async (req: Request, res: Response) => {
    try {
        const { studentId, levelId, recordedByUserId } = req.body;

        if (!studentId || !levelId || !recordedByUserId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await levelService.assignStudentLevel(studentId, levelId, recordedByUserId);
        res.status(201).json(result);
    } catch (err: any) {
        console.error("Error assigning level:", err);
        res.status(500).json({ error: err.message || "Failed to assign level" });
    }
};
