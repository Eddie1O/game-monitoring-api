import bodyParser from "body-parser";
import express from "express";
import { authenticate } from "./middleware/auth";
import healthcheckRoutes from "./routes/healthcheck";
import requestRoutes from "./routes/request";
import sessionRoutes from "./routes/session";
import teamRoutes from "./routes/team";
import userRoutes from "./routes/user";

const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.use("/healthcheck", healthcheckRoutes);
app.use("/api/v1/auth", sessionRoutes);
app.use("/api/v1/user", authenticate, userRoutes);
app.use("/api/v1/team", authenticate, teamRoutes);
app.use("/api/v1/request", authenticate, requestRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
