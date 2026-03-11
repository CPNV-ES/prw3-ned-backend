import express from "express";

import { port } from "./config/env";
import errorHandler from "./middlewares/errorHandler";
import healthRoutes from "./routes/health.routes";
import projectsRoutes from "./routes/projects.routes";

const app = express();

app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api", projectsRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export { app };
