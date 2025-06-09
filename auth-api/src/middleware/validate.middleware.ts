import {NextFunction, Request, Response} from 'express';
import {AnyZodObject, ZodError} from 'zod';

/**
 * Creates a middleware function to validate request data against a Zod schema.
 * @param schema - The Zod schema to validate against.
 * @returns An Express middleware function.
 */
const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors,
            });
        }
        // Forward other errors
        next(error);
    }
};

export default validate;
