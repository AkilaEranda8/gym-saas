package com.gymapp.modules.notification.enums;

public enum NotificationType {
    MEMBERSHIP_EXPIRY,
    PAYMENT_DUE,
    PAYMENT_RECEIVED,
    PAYMENT_FAILED,
    CLASS_BOOKING,
    CLASS_CANCELLED,
    CLASS_REMINDER,
    WORKOUT_ASSIGNED,
    NUTRITION_ASSIGNED,
    TRAINER_ASSIGNED,
    PT_SESSION,
    MAINTENANCE_ALERT,
    SERVICE_DUE,
    LOW_STOCK,
    ANNOUNCEMENT,
    LEAD_FOLLOWUP,
    GENERAL;

    public String getCategory() {
        return switch (this) {
            case PAYMENT_DUE, PAYMENT_RECEIVED, PAYMENT_FAILED -> "FINANCIAL";
            case MEMBERSHIP_EXPIRY                              -> "MEMBERSHIP";
            case CLASS_BOOKING, CLASS_CANCELLED, CLASS_REMINDER -> "CLASSES";
            case WORKOUT_ASSIGNED, NUTRITION_ASSIGNED,
                 TRAINER_ASSIGNED, PT_SESSION               -> "FITNESS";
            case MAINTENANCE_ALERT, SERVICE_DUE, LOW_STOCK     -> "OPERATIONS";
            case ANNOUNCEMENT, LEAD_FOLLOWUP, GENERAL          -> "GENERAL";
        };
    }

    public String getLabel() {
        return switch (this) {
            case MEMBERSHIP_EXPIRY  -> "Membership Expiry";
            case PAYMENT_DUE        -> "Payment Due";
            case PAYMENT_RECEIVED   -> "Payment Received";
            case PAYMENT_FAILED     -> "Payment Failed";
            case CLASS_BOOKING      -> "Class Booking";
            case CLASS_CANCELLED    -> "Class Cancelled";
            case CLASS_REMINDER     -> "Class Reminder";
            case WORKOUT_ASSIGNED   -> "Workout Assigned";
            case NUTRITION_ASSIGNED -> "Nutrition Assigned";
            case TRAINER_ASSIGNED   -> "Trainer Assigned";
            case PT_SESSION         -> "PT Session";
            case MAINTENANCE_ALERT  -> "Maintenance Alert";
            case SERVICE_DUE        -> "Service Due";
            case LOW_STOCK          -> "Low Stock";
            case ANNOUNCEMENT       -> "Announcement";
            case LEAD_FOLLOWUP      -> "Lead Follow-up";
            case GENERAL            -> "General";
        };
    }

    public boolean isCritical() {
        return this == PAYMENT_FAILED || this == MAINTENANCE_ALERT || this == SERVICE_DUE;
    }
}
