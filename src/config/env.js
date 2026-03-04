const port = Number(process.env.PORT) || 3000;

module.exports = {
  port,
  nodeEnv: process.env.NODE_ENV || "development",
};
