import * as argon2 from 'argon2';
import prisma from '../utils/prisma';
import {z} from 'zod';
import {createUserSchema} from '../schemas/user.schema';

// Type for user creation data, derived from the Zod schema
type CreateUserInput = z.infer<typeof createUserSchema>['body'];

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
