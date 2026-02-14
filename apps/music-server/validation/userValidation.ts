import { z } from 'zod';


//Define acceptable role IDs for which email/phone are NOT required
const STUDENT_ROLE_ID = 4;

//Schema for creating a new user (POST /api/users)
//TODO: Only accepts numbers with country codes - either change this validation, or remember this and clean the number in the Frontend Logic
export const createUserSchema = z.object({
    role_id: z.number().int().min(1),
    first_name: z.string().trim().min(2).max(50),
    last_name: z.string().trim().min(2).max(50),
    email: z.string().trim().email().optional(), //Start as optional
    phone_number: z.string().trim().max(20).regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im).or(z.string().regex(/^\d{10,15}$/)).optional(), //Relaxed validation
    password_hash: z.string().min(8).max(100), //Frontend sends plaintext password here
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").transform((str) => new Date(str)), //Validate string, transform to Date Object
    is_active: z.boolean(),
}).superRefine((data, ctx) => { //Use superRefine for conditional validation
    if (data.role_id !== STUDENT_ROLE_ID) {
        //For non-students, email is required
        if (!data.email || data.email.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Email is required for this role.",
                path: ['email'],
            });
        }
        if (!data.phone_number || data.phone_number.trim() === '') {
            ctx.addIssue({
                code: "custom",
                message: "Phone number is required for this role.",
                path: ['phone_number'],
            });
        }
    }
});

// Schema for updating an existing user (PUT /api/users/:id)
export const updateUserSchema = z.object({

})
