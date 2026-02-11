"""
Performance risk analysis: missed milestones, low activity, negative feedback
"""
import sys
import json

def performance_risk(data):
    missed = int(data.get('missedMilestones', 0))
    failed_reviews = int(data.get('failedReviews', 0))
    activity_count = int(data.get('activityCount', 0))
    total_reviews = int(data.get('totalReviews', 0))

    score = 0
    if missed > 0:
        score += missed * 25
    if failed_reviews > 0:
        score += failed_reviews * 20
    if activity_count < 2 and total_reviews > 0:
        score += 15
    if total_reviews > 0 and failed_reviews / total_reviews > 0.5:
        score += 20

    if score >= 50:
        risk = 'high'
        message = 'High performance risk - multiple issues detected'
    elif score >= 25:
        risk = 'medium'
        message = 'Medium risk - address delays and feedback'
    else:
        risk = 'low'
        message = 'Performance on track'

    return {'risk': risk, 'score': min(100, score), 'message': message}
