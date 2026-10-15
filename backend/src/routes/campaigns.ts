
import { Router, Response } from "express";
import mongoose from "mongoose";
import Campaign from "../models/Campaign";
import { AuthRequest, protect, allowRoles } from "../middleware/auth";

const router = Router();

// Create a campaign (brands only)
router.post(
  "/",
  protect,
  allowRoles("brand"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, description, budget, milestones } = req.body;

      if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof description !== "string" ||
        !description.trim() ||
        typeof budget !== "number" ||
        !Number.isFinite(budget) ||
        budget <= 0 ||
        !Array.isArray(milestones) ||
        milestones.length === 0
      ) {
        res.status(400).json({ message: "Invalid campaign details" });
        return;
      }

      const validMilestones = milestones.every(
        (milestone: { views: number; payout: number }) =>
          Number.isInteger(milestone.views) &&
          milestone.views > 0 &&
          typeof milestone.payout === "number" &&
          Number.isFinite(milestone.payout) &&
          milestone.payout >= 0
      );

      if (!validMilestones) {
        res.status(400).json({
          message: "Each milestone needs positive views and a non-negative payout"
        });
        return;
      }

      const sortedMilestones = [...milestones].sort(
        (a, b) => a.views - b.views
      );

      const duplicateThresholds = sortedMilestones.some(
        (milestone, index) =>
          index > 0 && milestone.views === sortedMilestones[index - 1].views
      );

      if (duplicateThresholds) {
        res.status(400).json({
          message: "Milestone view thresholds must be unique"
        });
        return;
      }

      const campaign = await Campaign.create({
        title: title.trim(),
        description: description.trim(),
        budget,
        spent: 0,
        remainingBudget: budget,
        milestones: sortedMilestones,
        brandId: new mongoose.Types.ObjectId(req.user!.userId),
        status: "active"
      });

      res.status(201).json({
        message: "Campaign created successfully",
        campaign
      });
    } catch (error) {
      console.error("Create campaign error:", error);
      res.status(500).json({ message: "Unable to create campaign" });
    }
  }
);

// List active campaigns (creators only)
router.get(
  "/",
  protect,
  allowRoles("creator"),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const campaigns = await Campaign.find({ status: "active" })
        .select("-__v")
        .sort({ createdAt: -1 });

      res.json({ campaigns });
    } catch (error) {
      console.error("List campaigns error:", error);
      res.status(500).json({ message: "Unable to fetch campaigns" });
    }
  }
);

// Get campaigns owned by the logged-in brand
router.get(
  "/mine",
  protect,
  allowRoles("brand"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const campaigns = await Campaign.find({ brandId: req.user!.userId })
        .sort({ createdAt: -1 });

      res.json({ campaigns });
    } catch (error) {
      console.error("Fetch brand campaigns error:", error);
      res.status(500).json({ message: "Unable to fetch your campaigns" });
    }
  }
);

export default router;
