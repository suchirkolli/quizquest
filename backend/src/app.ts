import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import questRoutes from "./routes/quest.routes";
import playRoutes from "./routes/play.routes";
import statsRoutes from "./routes/stats.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/play", playRoutes);
app.use("/api/stats", statsRoutes);

export default app;