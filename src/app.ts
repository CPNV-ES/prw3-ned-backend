import express from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";

import { port } from "./config/env";
import errorHandler from "./middlewares/errorHandler";
import {
  ensureProjectImagesDirectoryExists,
  ASSETS_ROOT,
  STORAGE_ROOT,
} from "./utils/project-images";
import healthRoutes from "./routes/health.routes";
import projectsRoutes from "./routes/projects.routes";
import openApiSpec from "./docs/openapi";
import sessionsRoutes from "./routes/sessions.routes";
import usersRoutes from "./routes/users.routes";

const app = express();
ensureProjectImagesDirectoryExists();
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(ASSETS_ROOT)));
app.use("/storages", express.static(STORAGE_ROOT));
app.use("/api", usersRoutes);
app.use("/api", sessionsRoutes);
app.use("/api", healthRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use("/api", projectsRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

export { app };
