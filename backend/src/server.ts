
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import { protect, AuthRequest, allowRoles } from "./middleware/auth";
import campaignRoutes from "./routes/campaigns";
import submissionRoutes from "./routes/submissions";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/submissions", submissionRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Meme'd Campaign Payout Tracker API is running!",
  });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "Backend is healthy",
  });
});



app.get(
  "/api/brand-test",
  protect,
  allowRoles("brand"),
  (req: AuthRequest, res: Response) => {
    res.json({ message: "Brand access granted" });
  }
);

app.get(
  "/api/creator-test",
  protect,
  allowRoles("creator"),
  (req: AuthRequest, res: Response) => {
    res.json({ message: "Creator access granted" });
  }
);



async function startServer(): Promise<void> {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

void startServer();
