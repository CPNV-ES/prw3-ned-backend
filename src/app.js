const express = require("express");
const healthRoutes = require("./routes/health.routes");
const errorHandler = require("./middlewares/errorHandler");
const { port } = require("./config/env");

const app = express();

app.use(express.json());
app.use("/api", healthRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
