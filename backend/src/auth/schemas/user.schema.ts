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

export const updateUserProfileSchema = z.object({
    body: z.object({
        email: z.string().email('A valid email is required').optional(),
        firstName: z.string().min(2, 'First name must be at least 2 characters long').optional(),
        lastName: z.string().min(2, 'Last name must be at least 2 characters long').optional(),
    }).refine(data => Object.keys(data).length > 0, {
        message: "At least one field must be provided for update"
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
    }),
});

export const adminChangePasswordSchema = z.object({
    body: z.object({
        newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
    }),
    params: z.object({
        id: z.string().min(1, 'User ID is required'),
    }),
});
