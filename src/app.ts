import express from "express";

import { port } from "./config/env";
import errorHandler from "./middlewares/errorHandler";
import healthRoutes from "./routes/health.routes";
import sessionsRoutes from "./routes/sessions.routes";
import usersRoutes from "./routes/users.routes";

const app = express();

app.use(express.json());
app.use("/api", usersRoutes);
app.use("/api", sessionsRoutes);
app.use("/api", healthRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export { app };
