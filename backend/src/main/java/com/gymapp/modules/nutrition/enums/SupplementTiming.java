package com.gymapp.modules.nutrition.enums;

public enum SupplementTiming {
    MORNING,
    PRE_WORKOUT,
    POST_WORKOUT,
    WITH_MEAL,
    BEFORE_BED,
    OTHER;

    public String getDisplayName() {
        return switch (this) {
            case MORNING      -> "Morning";
            case PRE_WORKOUT  -> "Pre-Workout";
            case POST_WORKOUT -> "Post-Workout";
            case WITH_MEAL    -> "With Meal";
            case BEFORE_BED   -> "Before Bed";
            case OTHER        -> "Other";
        };
    }
}
