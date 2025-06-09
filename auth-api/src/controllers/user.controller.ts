import {Request, Response} from 'express';
import {createUser, findUserByEmail} from '../services/user.service';

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
