import {Request, Response} from 'express';
import {createUser, deleteUser, findUserByEmail, getAllUsers, updateUserProfile, changeUserPassword, adminChangeUserPassword} from '../services/user.service';

/**
 * Handles the get all users request.
 */
export const getAllUsersHandler = async (_req: Request, res: Response) => {
    try {
        const users = await getAllUsers();
        return res.status(200).json({
            message: 'Users retrieved successfully',
            users,
            count: users.length,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

/**
 * Handles the user creation request.
 */
export const createUserHandler = async (req: Request, res: Response) => {
    const {email} = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        return res.status(409).json({message: 'An account with this email already exists.'});
    }

    try {
        const user = await createUser(req.body);
        return res.status(201).json({
            message: 'User created successfully',
            user,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

/**
 * Handles the user deletion request.
 */
export const deleteUserHandler = async (req: Request, res: Response) => {
    const {id} = req.params;

    // Prevent users from deleting themselves
    if (req.user?.id === id) {
        return res.status(400).json({message: 'You cannot delete your own account.'});
    }

    try {
        const deletedUser = await deleteUser(id);

        if (!deletedUser) {
            return res.status(404).json({message: 'User not found.'});
        }

        return res.status(200).json({
            message: 'User deleted successfully',
            user: deletedUser,
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

/**
 * Handles the user profile update request.
 */
export const updateUserProfileHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    try {
        const updatedUser = await updateUserProfile(userId, req.body);

        if (!updatedUser) {
            return res.status(404).json({message: 'User not found.'});
        }

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
            return res.status(409).json({message: 'An account with this email already exists.'});
        }
        console.error('Error updating user profile:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

/**
 * Handles the change password request.
 */
export const changePasswordHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    try {
        const success = await changeUserPassword(userId, req.body);

        if (!success) {
            return res.status(404).json({message: 'User not found.'});
        }

        return res.status(200).json({
            message: 'Password changed successfully',
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'INVALID_CURRENT_PASSWORD') {
            return res.status(400).json({message: 'Current password is incorrect.'});
        }
        console.error('Error changing password:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

/**
 * Handles the admin change password request.
 */
export const adminChangePasswordHandler = async (req: Request, res: Response) => {
    const {id} = req.params;

    // Prevent admins from changing their own password through this endpoint
    if (req.user?.id === id) {
        return res.status(400).json({message: 'Use the regular change password endpoint to update your own password.'});
    }

    try {
        const success = await adminChangeUserPassword(id, req.body);

        if (!success) {
            return res.status(404).json({message: 'User not found.'});
        }

        return res.status(200).json({
            message: 'User password changed successfully',
        });
    } catch (error) {
        console.error('Error changing user password:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};