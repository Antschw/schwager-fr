import {Request, Response} from 'express';
import {createUser, deleteUser, findUserByEmail} from '../services/user.service';

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