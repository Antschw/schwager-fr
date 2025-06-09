import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import config from './config';
import apiRouter from './routes';
import {deserializeUser} from './middleware/auth.middleware';
import swaggerDocument from '../swagger.json';


const app = express();

// --- Global Middlewares ---
// Enable CORS
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (process.env.NODE_ENV === 'production') {
            if (origin.includes('schwager.fr')) {
                return callback(null, true);
            }
        } else {
            if (origin.includes('localhost')) {
                return callback(null, true);
            }
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Deserialize user from access token in cookies
app.use(deserializeUser);

// --- API Routes ---
app.use('/auth-api', apiRouter);

// --- Swagger API Docs ---
app.use('/auth-api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// --- Start Server ---
app.listen(config.port, () => {
    console.log(`Server is running at http://localhost:${config.port}`);
    console.log(`API Docs available at http://localhost:${config.port}/auth-api-docs`);
});
