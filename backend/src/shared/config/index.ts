import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT || 4000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
        refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET as string,
        accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
        refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
    },
};

// Ensure JWT secrets are defined
if (!config.jwt.accessTokenSecret || !config.jwt.refreshTokenSecret) {
    console.error("FATAL ERROR: JWT secrets are not defined in environment variables.");
    process.exit(1);
}

if (config.jwt.accessTokenSecret.length < 32) {
    console.error("FATAL ERROR: JWT Access Token Secret too short (minimum 32 characters)");
    process.exit(1);
}

if (config.jwt.refreshTokenSecret.length < 32) {
    console.error("FATAL ERROR: JWT Refresh Token Secret too short (minimum 32 characters)");
    process.exit(1);
}

export default config;
