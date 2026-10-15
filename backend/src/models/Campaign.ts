
import mongoose, { Document, Schema } from "mongoose";

export interface IPayoutMilestone {
  views: number;
  payout: number;
}

export interface ICampaign extends Document {
  title: string;
  description: string;
  budget: number;
  spent: number;
  remainingBudget: number;
  milestones: IPayoutMilestone[];
  brandId: mongoose.Types.ObjectId;
  status: "active" | "completed";
}

const payoutMilestoneSchema = new Schema<IPayoutMilestone>(
  {
    views: { type: Number, required: true, min: 1 },
    payout: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const campaignSchema = new Schema<ICampaign>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true, min: 0 },
    spent: { type: Number, default: 0, min: 0 },
    remainingBudget: { type: Number, required: true, min: 0 },
    milestones: {
      type: [payoutMilestoneSchema],
      required: true
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active"
    }
  },
  { timestamps: true }
);

export default mongoose.model<ICampaign>(
  "Campaign",
  campaignSchema
);
