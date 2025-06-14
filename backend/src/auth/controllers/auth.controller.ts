import {Request, Response} from 'express';
import * as argon2 from 'argon2';
import {findUserByEmail} from '../services/user.service';
import {generateAccessToken, generateRefreshToken} from '../services/auth.service';
import config from '../../shared/config';

/**
 * Handles the login request.
 * Verifies credentials and sends back tokens in secure cookies.
 */
export const loginHandler = async (req: Request, res: Response) => {
    const {email, password} = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
        return res.status(401).json({message: 'Invalid email or password'});
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
        return res.status(401).json({message: 'Invalid email or password'});
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Set cookies
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS obligatoire en prod
        sameSite: 'strict',
        maxAge: config.jwt.accessTokenExpiresIn === '5m' ? 5 * 60 * 1000 : 15 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? '.schwager.fr' : undefined
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: config.jwt.refreshTokenExpiresIn === '1d' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === 'production' ? '.schwager.fr' : undefined
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password: _, ...userWithoutPassword} = user;


    return res.status(200).json({
        message: 'Login successful',
        user: userWithoutPassword
    });
};

/**
 * Handles the logout request.
 * Clears the authentication cookies.
 */
export const logoutHandler = (_req: Request, res: Response) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        domain: process.env.NODE_ENV === 'production' ? '.schwager.fr' : undefined
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        domain: process.env.NODE_ENV === 'production' ? '.schwager.fr' : undefined
    });

    return res.status(200).json({message: 'Logout successful'});
};

/**
 * Gets the currently authenticated user.
 */
export const getMeHandler = (req: Request, res: Response) => {
    return res.status(200).json({user: req.user});
};
