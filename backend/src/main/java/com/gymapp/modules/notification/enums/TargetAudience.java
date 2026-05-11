package com.gymapp.modules.notification.enums;

public enum TargetAudience {
    ALL_MEMBERS, ACTIVE_MEMBERS, EXPIRING_MEMBERS,
    SPECIFIC_PLAN, ALL_TRAINERS, ALL_STAFF, CUSTOM_LIST;

    public String getLabel() {
        return switch (this) {
            case ALL_MEMBERS      -> "All Members";
            case ACTIVE_MEMBERS   -> "Active Members";
            case EXPIRING_MEMBERS -> "Expiring Members (7 days)";
            case SPECIFIC_PLAN    -> "Specific Plan";
            case ALL_TRAINERS     -> "All Trainers";
            case ALL_STAFF        -> "All Staff";
            case CUSTOM_LIST      -> "Custom List";
        };
    }
}
