import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err: any) {
        console.error('Error fetching users:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Controller for single user
export const getUser = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);

        // Call the service logic
        const user = await userService.getUserById(id);

        if (!user) {
            // Decoupled logic: the service returns null, the controller decides 404
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err: any) {
        console.error(`Error fetching user with ID ${req.params.id}:`, err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createUserController = async (req: Request, res: Response) => {
    try {
        // Map password_hash from body to 'password' for the service 
        const { password_hash: password, ...userData } = req.body;
        const newUser = await userService.createUser({ ...userData, password });
        res.status(201).json(newUser);
    } catch (err: any) {
        console.error('Error creating user:', err.message);

        // Handle unique constraint violation (PostgreSQL error 23505) 
        if (err.code === '23505') {
            return res.status(409).json({ error: 'User with this email already exists' });
        }
        res.status(500).json({ error: `Internal server error: ${err.message}` });
    }
}


export const deleteUserController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const deleteManager = req.query.deleteManager === 'true';

        const success = await userService.deleteUser(id, { deleteManager });

        if (!success) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err: any) {
        console.error(`Error deleting user with ID ${req.params.id}:`, err.message);

        // Handle custom errors thrown in the service
        if (err.message.includes("Cannot delete Manager")) {
            return res.status(409).json({ error: err.message });
        }

        // Check for Foreign Key violation (PostgreSQL error 23503)
        if (err.code === '23503') {
            return res.status(409).json({ error: 'Cannot delete user because they have associated records (e.g., lessons, enrollments).' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}


export const updateUserController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        // Map password_hash from body to 'password' for the service if present
        const { password_hash, ...rest } = req.body;
        const userData = { ...rest, ...(password_hash ? { password: password_hash } : {}) };

        const updatedUser = await userService.updateUser(id, userData);

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found or no changes made' });
        }

        res.json(updatedUser);
    } catch (err: any) {
        console.error(`Error updating user ${req.params.id}:`, err.message);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: `Internal server error: ${err.message}` });
    }
};

export const assignTeacherController = async (req: Request, res: Response) => {
    try {
        const { studentId, teacherId } = req.body;
        // Basic validation
        if (!studentId) {
            return res.status(400).json({ error: 'studentId is required' });
        }

        await userService.assignStudentTeacher(studentId, teacherId);
        res.json({ message: 'Teacher assigned successfully' });
    } catch (err: any) {
        console.error('Error assigning teacher:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createFamilyController = async (req: Request, res: Response) => {
    try {
        const familyData = req.body;

        // Basic validation
        if (!familyData.students || !Array.isArray(familyData.students)) {
            return res.status(400).json({ error: "Invalid payload: students array required" });
        }

        await userService.createFamily(familyData);
        res.status(201).json({ message: "Family registered successfully" });

    } catch (err: any) {
        console.error('Error creating family:', err.message);
        res.status(500).json({ error: `Internal server error: ${err.message}` });
    }
};

export const addStudentInstrumentController = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.params.userId as string);
        const { instrumentId } = req.body;
        if (!studentId || !instrumentId) return res.status(400).json({ error: 'studentId and instrumentId required' });
        await userService.addStudentInstrument(studentId, parseInt(instrumentId));
        res.json({ message: 'Instrument added successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const removeStudentInstrumentController = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.params.userId as string);
        const instrumentId = parseInt(req.params.instrumentId as string);
        if (!studentId || !instrumentId) return res.status(400).json({ error: 'Valid IDs required' });
        await userService.removeStudentInstrument(studentId, instrumentId);
        res.json({ message: 'Instrument removed successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const addStudentTeacherController = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.params.userId as string);
        const { teacherId } = req.body;
        if (!studentId || !teacherId) return res.status(400).json({ error: 'Valid IDs required' });
        await userService.addStudentTeacher(studentId, parseInt(teacherId));
        res.json({ message: 'Teacher added successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const removeStudentTeacherController = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.params.userId as string);
        const teacherId = parseInt(req.params.teacherId as string);
        if (!studentId || !teacherId) return res.status(400).json({ error: 'Valid IDs required' });
        await userService.removeStudentTeacher(studentId, teacherId);
        res.json({ message: 'Teacher removed successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};