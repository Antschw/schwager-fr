import {z} from 'zod';
import {Role} from '@prisma/client';

export const createUserSchema = z.object({
    body: z.object({
        email: z.string().email('A valid email is required'),
        firstName: z.string().min(2, 'First name must be at least 2 characters long'),
        lastName: z.string().min(2, 'Last name must be at least 2 characters long'),
        password: z.string().min(8, 'Password must be at least 8 characters long'),
        role: z.nativeEnum(Role).optional(),
    }),
});
