import { Router } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { createUserSchema, updateUserSchema } from '../validation/userValidation';
import * as userController from '../controllers/userController';

const router = Router();

// GET all users
router.get('/', userController.getUsers);

// Route definition: GET /api/users/:id
router.get('/:id', userController.getUser);

// POST new user with validation middleware 
router.post('/', validateRequest(createUserSchema), userController.createUserController);

// POST family registration (Transaction)
router.post('/family', userController.createFamilyController);

// POST assign teacher
router.post('/assign-teacher', userController.assignTeacherController);

// DELETE user
router.delete('/:id', userController.deleteUserController);

// UPDATE user
router.put('/:id', validateRequest(updateUserSchema), userController.updateUserController);

// --- Instrument Assignments ---
router.post('/:userId/instruments', userController.addStudentInstrumentController);
router.delete('/:userId/instruments/:instrumentId', userController.removeStudentInstrumentController);

// --- Teacher Assignments ---
router.post('/:userId/teachers', userController.addStudentTeacherController);
router.delete('/:userId/teachers/:teacherId', userController.removeStudentTeacherController);

export default router;