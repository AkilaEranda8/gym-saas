package com.gymapp.modules.settings.enums;

public enum FeatureKey {
    SHOP_POS,
    CLASS_BOOKING,
    WORKOUT_PLANS,
    NUTRITION_PLANS,
    TRAINER_PORTAL,
    MEMBER_PORTAL,
    LEAD_MANAGEMENT,
    CHAT,
    QR_CHECKIN,
    MULTI_BRANCH,
    ADVANCED_REPORTS,
    API_ACCESS;

    public String getRequiredPlan() {
        return switch (this) {
            case SHOP_POS, MULTI_BRANCH, ADVANCED_REPORTS -> "PRO";
            case API_ACCESS -> "ENTERPRISE";
            default -> "STARTER";
        };
    }

    public String getLabel() {
        return switch (this) {
            case SHOP_POS -> "Shop & POS";
            case CLASS_BOOKING -> "Class Booking";
            case WORKOUT_PLANS -> "Workout Plans";
            case NUTRITION_PLANS -> "Nutrition Plans";
            case TRAINER_PORTAL -> "Trainer Portal";
            case MEMBER_PORTAL -> "Member Portal";
            case LEAD_MANAGEMENT -> "Lead Management";
            case CHAT -> "Chat";
            case QR_CHECKIN -> "QR Check-in";
            case MULTI_BRANCH -> "Multi-Branch";
            case ADVANCED_REPORTS -> "Advanced Reports";
            case API_ACCESS -> "API Access";
        };
    }

    public String getDescription() {
        return switch (this) {
            case SHOP_POS -> "Point of sale for gym merchandise and supplements";
            case CLASS_BOOKING -> "Online class scheduling and booking for members";
            case WORKOUT_PLANS -> "Trainer-assigned workout plans for members";
            case NUTRITION_PLANS -> "Personalized nutrition and diet planning";
            case TRAINER_PORTAL -> "Dedicated portal for trainers to manage clients";
            case MEMBER_PORTAL -> "Self-service portal for members";
            case LEAD_MANAGEMENT -> "CRM for managing potential members";
            case CHAT -> "In-app messaging between staff and members";
            case QR_CHECKIN -> "QR code based attendance check-in";
            case MULTI_BRANCH -> "Manage multiple gym branches from one account";
            case ADVANCED_REPORTS -> "Detailed analytics and custom report builder";
            case API_ACCESS -> "REST API access for third-party integrations";
        };
    }
}
