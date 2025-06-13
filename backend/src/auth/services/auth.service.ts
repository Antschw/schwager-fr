import jwt from 'jsonwebtoken';
import config from '../../shared/config';

/**
 * Generates an access token for a user.
 * @param userId - The ID of the user.
 * @returns The generated access token.
 */
export function generateAccessToken(userId: string): string {
    return jwt.sign(
        {userId},
        config.jwt.accessTokenSecret as string,
        {expiresIn: config.jwt.accessTokenExpiresIn} as jwt.SignOptions
    );
}

/**
 * Generates a refresh token for a user.
 * @param userId - The ID of the user.
 * @returns The generated refresh token.
 */
export function generateRefreshToken(userId: string): string {
    return jwt.sign(
        {userId},
        config.jwt.refreshTokenSecret as string,
        {expiresIn: config.jwt.refreshTokenExpiresIn} as jwt.SignOptions
    );
}

/**
 * Verifies a JWT token.
 * @param token - The token to verify.
 * @param secret - The secret key to use for verification.
 * @returns The decoded payload if verification is successful, otherwise null.
 */
export function verifyToken<T>(token: string, secret: string): (T & { userId: string }) | null {
    try {
        return jwt.verify(token, secret) as (T & { userId: string });
    } catch (error) {
        return null;
    }
}
