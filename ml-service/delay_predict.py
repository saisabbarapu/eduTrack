"""
Delay risk prediction: On Track / Might be delayed / High risk
Inputs: progress %, milestones completed, days remaining, review frequency
"""

import sys
import json


def predict_delay(data):
    progress = float(data.get("progressPercent", 0))
    milestones_done = int(data.get("milestonesCompleted", 0))
    total_milestones = max(1, int(data.get("totalMilestones", 4)))
    days_remaining = float(data.get("daysRemaining", 90))
    review_count = int(data.get("reviewCount", 0))
    approved_reviews = int(data.get("approvedReviews", 0))

    # Simple rule-based risk (can be replaced by trained model)
    expected_progress = (milestones_done / total_milestones) * 100
    gap = expected_progress - progress
    days_per_milestone = max(
        1, days_remaining / max(1, total_milestones - milestones_done)
    )

    if progress >= 75 and gap <= 10:
        risk = "low"
        message = "On track"
    elif progress >= 40 and gap <= 25 and days_remaining > 30:
        risk = "medium"
        message = "Might be delayed - increase pace"
    else:
        risk = "high"
        message = "High risk delay - immediate attention needed"

    if approved_reviews < review_count * 0.5 and review_count > 0:
        risk = "high" if risk != "low" else "medium"

    return {"risk": risk, "message": message, "progressGap": round(gap, 2)}
