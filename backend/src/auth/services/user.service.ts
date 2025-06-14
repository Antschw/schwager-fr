import * as argon2 from 'argon2';
import prisma from '../../shared/utils/prisma';
import {z} from 'zod';
import {createUserSchema, updateUserProfileSchema, changePasswordSchema, adminChangePasswordSchema} from '../schemas/user.schema';

// Type for user creation data, derived from the Zod schema
type CreateUserInput = z.infer<typeof createUserSchema>['body'];
type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>['body'];
type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
type AdminChangePasswordInput = z.infer<typeof adminChangePasswordSchema>['body'];

/**
 * Creates a new user in the database.
 * @param input - The user data (email, password, etc.).
 * @returns The newly created user object, without the password.
 */
export async function createUser(input: CreateUserInput) {
    const {password, ...rest} = input;
    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
        data: {
            ...rest,
            password: hashedPassword,
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password: _, ...userWithoutPassword} = user;
    return userWithoutPassword;
}

/**
 * Deletes a user by their ID.
 * @param id - The ID of the user to delete.
 * @returns The deleted user object without the password, or null if user not found.
 */
export async function deleteUser(id: string) {
    try {
        const user = await prisma.user.delete({
            where: {id},
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {password: _, ...userWithoutPassword} = user;
        return userWithoutPassword;
    } catch (error) {
        // If user doesn't exist, Prisma throws an error
        return null;
    }
}

/**
 * Finds a user by their email address.
 * @param email - The email of the user to find.
 * @returns The user object if found, otherwise null.
 */
export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: {email},
    });
}

/**
 * Finds a user by their ID.
 * @param id - The ID of the user to find.
 * @returns The user object without the password if found, otherwise null.
 */
export async function findUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: {id},
    });

    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password, ...userWithoutPassword} = user;
    return userWithoutPassword;
}

/**
 * Gets all users from the database.
 * @returns Array of user objects without passwords.
 */
export async function getAllUsers() {
    const users = await prisma.user.findMany({
        orderBy: {
            createdAt: 'desc', // Most recent first
        },
    });

    // Remove passwords from all users
    return users.map(user => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {password, ...userWithoutPassword} = user;
        return userWithoutPassword;
    });
}

/**
 * Updates a user's profile information.
 * @param id - The ID of the user to update.
 * @param input - The updated user data.
 * @returns The updated user object without password, or null if user not found.
 */
export async function updateUserProfile(id: string, input: UpdateUserProfileInput) {
    try {
        // Check if email is being updated and if it's already taken by another user
        if (input.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: input.email },
            });
            
            if (existingUser && existingUser.id !== id) {
                throw new Error('EMAIL_ALREADY_EXISTS');
            }
        }

        const user = await prisma.user.update({
            where: { id },
            data: input,
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {password: _, ...userWithoutPassword} = user;
        return userWithoutPassword;
    } catch (error) {
        if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
            throw error;
        }
        // If user doesn't exist, Prisma throws an error
        return null;
    }
}

/**
 * Changes a user's password after verifying their current password.
 * @param id - The ID of the user.
 * @param input - The current and new password.
 * @returns Boolean indicating success.
 */
export async function changeUserPassword(id: string, input: ChangePasswordInput) {
    try {
        // Get user with password for verification
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return false;
        }

        // Verify current password
        const isCurrentPasswordValid = await argon2.verify(user.password, input.currentPassword);
        if (!isCurrentPasswordValid) {
            throw new Error('INVALID_CURRENT_PASSWORD');
        }

        // Hash new password
        const hashedNewPassword = await argon2.hash(input.newPassword);

        // Update password
        await prisma.user.update({
            where: { id },
            data: { password: hashedNewPassword },
        });

        return true;
    } catch (error) {
        if (error instanceof Error && error.message === 'INVALID_CURRENT_PASSWORD') {
            throw error;
        }
        return false;
    }
}

/**
 * Changes a user's password (admin only - no current password verification).
 * @param id - The ID of the user whose password to change.
 * @param input - The new password.
 * @returns Boolean indicating success.
 */
export async function adminChangeUserPassword(id: string, input: AdminChangePasswordInput) {
    try {
        // Hash new password
        const hashedNewPassword = await argon2.hash(input.newPassword);

        // Update password
        await prisma.user.update({
            where: { id },
            data: { password: hashedNewPassword },
        });

        return true;
    } catch (error) {
        // If user doesn't exist, Prisma throws an error
        return false;
    }
}
