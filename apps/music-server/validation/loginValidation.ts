import { z } from 'zod';

//Schema for valid user input to authenticate
export const userLoginSchema = z.object({
    email: z.string().trim().email(),
    password_hash: z.string().min(8).max(100),
});