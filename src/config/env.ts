const port = Number(process.env.PORT) || 3000;
const nodeEnv = process.env.NODE_ENV || "development";
const jwtExpiresInSeconds = Number(process.env.JWT_EXPIRES_IN) || 3600;

export { port, nodeEnv, jwtExpiresInSeconds };
