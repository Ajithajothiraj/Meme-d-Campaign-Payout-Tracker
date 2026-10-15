
import { Router, Response } from "express";
import mongoose from "mongoose";
import Submission from "../models/Submission";
import Campaign from "../models/Campaign";
import { AuthRequest, protect, allowRoles } from "../middleware/auth";
import { calculatePayout } from "../utils/payout";

const router = Router();

// Creator submits a post to a campaign
router.post(
  "/",
  protect,
  allowRoles("creator"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { campaignId, postUrl } = req.body;

      if (
        typeof campaignId !== "string" ||
        !mongoose.isValidObjectId(campaignId) ||
        typeof postUrl !== "string" ||
        !postUrl.trim()
      ) {
        res.status(400).json({
          message: "A valid campaignId and postUrl are required"
        });
        return;
      }

      let parsedUrl: URL;

      try {
        parsedUrl = new URL(postUrl.trim());
      } catch {
        res.status(400).json({ message: "Invalid post URL" });
        return;
      }

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        res.status(400).json({ message: "Post URL must use HTTP or HTTPS" });
        return;
      }

      const campaign = await Campaign.findOne({
        _id: campaignId,
        status: "active"
      });

      if (!campaign) {
        res.status(404).json({
          message: "Active campaign not found"
        });
        return;
      }

      const submission = await Submission.create({
        campaignId: campaign._id,
        creatorId: new mongoose.Types.ObjectId(req.user!.userId),
        postUrl: parsedUrl.toString(),
        views: 0,
        earnedAmount: 0,
        paidAmount: 0,
        status: "pending"
      });

      res.status(201).json({
        message: "Post submitted successfully",
        submission
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        res.status(409).json({
          message: "You have already submitted this post to this campaign"
        });
        return;
      }

      console.error("Submit post error:", error);
      res.status(500).json({ message: "Unable to submit post" });
    }
  }
);

// Creator views their own submissions
router.get(
  "/mine",
  protect,
  allowRoles("creator"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const submissions = await Submission.find({
        creatorId: req.user!.userId
      })
        .populate("campaignId", "title budget status")
        .sort({ createdAt: -1 });

      res.json({ submissions });
    } catch (error) {
      console.error("Fetch submissions error:", error);
      res.status(500).json({ message: "Unable to fetch submissions" });
    }
  }
);

router.patch(
  "/:id/views",
  protect,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { views } = req.body;

      if (
        !mongoose.isValidObjectId(id) ||
        !Number.isSafeInteger(views) ||
        views < 0
      ) {
        res.status(400).json({
          message: "A valid submission ID and non-negative integer views are required"
        });
        return;
      }

      const submission = await Submission.findById(id);

      if (!submission) {
        res.status(404).json({ message: "Submission not found" });
        return;
      }

      const campaign = await Campaign.findById(submission.campaignId);

      if (!campaign) {
        res.status(404).json({ message: "Campaign not found" });
        return;
      }

      // Only the creator who owns this submission or the campaign's
      // brand owner may update the simulated view count.
      const isCreator = submission.creatorId.toString() === req.user!.userId;
      const isBrandOwner = campaign.brandId.toString() === req.user!.userId;

      if (
        !isCreator && !isBrandOwner
      ) {
        res.status(403).json({
          message: "You cannot update this submission"
        });
        return;
      }

      // Views must never decrease.
      if (views < submission.views) {
        res.status(400).json({
          message: "New view count cannot be lower than the current count"
        });
        return;
      }

      const desiredPayout = calculatePayout(views, campaign.milestones);

      // Use the atomic budget update below so concurrent requests
      // cannot spend more than the campaign's available budget.
      const additionalPayout = Math.max(
        0,
        desiredPayout - submission.paidAmount
      );

      let paidAmount = submission.paidAmount;

      if (additionalPayout > 0) {
        const updatedCampaign = await Campaign.findOneAndUpdate(
          {
            _id: campaign._id,
            remainingBudget: { $gte: additionalPayout }
          },
          {
            $inc: {
              spent: additionalPayout,
              remainingBudget: -additionalPayout
            }
          },
          { new: true }
        );

        if (updatedCampaign) {
          paidAmount += additionalPayout;
        }
      }

      submission.views = views;
      submission.earnedAmount = desiredPayout;
      submission.paidAmount = paidAmount;

      if (paidAmount >= desiredPayout && desiredPayout > 0) {
        submission.status = "paid";
      } else {
        submission.status = "pending";
      }

      await submission.save();

      res.json({
        message: "Views updated successfully",
        submission,
        payout: {
          earnedAmount: desiredPayout,
          paidAmount,
          unpaidAmount: desiredPayout - paidAmount
        },
        campaignBudget: {
          spent: (await Campaign.findById(campaign._id))?.spent,
          remainingBudget: (await Campaign.findById(campaign._id))?.remainingBudget
        }
      });
    } catch (error) {
      console.error("Update views error:", error);
      res.status(500).json({
        message: "Unable to update views"
      });
    }
  }
);


export default router;
