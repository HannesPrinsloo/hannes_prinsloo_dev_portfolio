import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

export const validateRequest = (schema: ZodType) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: 'Validation error',
                    errors: error.issues,
                });
            }
            next(error);
        }
    };