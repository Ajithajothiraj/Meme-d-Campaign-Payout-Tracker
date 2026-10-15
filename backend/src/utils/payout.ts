
import { IPayoutMilestone } from "../models/Campaign";

export function calculatePayout(
  views: number,
  milestones: IPayoutMilestone[]
): number {
  if (!Number.isFinite(views) || views < 0) {
    throw new Error("Views must be a non-negative number");
  }

  const eligibleMilestones = milestones.filter(
    (milestone) => views >= milestone.views
  );

  if (eligibleMilestones.length === 0) {
    return 0;
  }

  const highestMilestone = eligibleMilestones.reduce(
    (highest, current) =>
      current.views > highest.views ? current : highest
  );

  return highestMilestone.payout;
}
