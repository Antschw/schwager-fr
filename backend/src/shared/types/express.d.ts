import { User as PrismaUser } from '@prisma/client';

declare global {
    namespace Express {
        // Exclude password from the User object attached to the request
        type SanitizedUser = Omit<PrismaUser, 'password'>;

        export interface Request {
            user?: SanitizedUser;
        }
    }
}
