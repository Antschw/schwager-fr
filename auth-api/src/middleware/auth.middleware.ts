import {NextFunction, Request, Response} from 'express';
import {Role} from '@prisma/client';
import {verifyToken} from '../services/auth.service';
import {findUserById} from '../services/user.service';
import config from '../config';

/**
 * Middleware to deserialize the user from the access token.
 * It checks for an access token in the cookies and verifies it.
 * If valid, it attaches the user object (without password) to the request.
 */
export const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return next();
    }

    const payload = verifyToken(accessToken, config.jwt.accessTokenSecret);

    if (payload) {
        const user = await findUserById(payload.userId);
        if (user) {
            req.user = user;
        }
    }

    next();
};


/**
 * Middleware to ensure the user is authenticated.
 * It must be used after `deserializeUser`.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    next();
};

/**
 * Creates a middleware to check if the authenticated user has a specific role.
 * @param requiredRole - The role required to access the route.
 * @returns An Express middleware function.
 */
export const requireRole = (requiredRole: Role) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== requiredRole) {
        return res.status(403).json({message: 'Forbidden: Insufficient permissions'});
    }
    next();
};
