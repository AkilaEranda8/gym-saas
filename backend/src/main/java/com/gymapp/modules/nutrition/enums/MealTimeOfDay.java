package com.gymapp.modules.nutrition.enums;

public enum MealTimeOfDay {
    EARLY_MORNING,
    BREAKFAST,
    MID_MORNING,
    LUNCH,
    AFTERNOON_SNACK,
    PRE_WORKOUT,
    POST_WORKOUT,
    DINNER,
    BEFORE_BED;

    public String getDisplayName() {
        return switch (this) {
            case EARLY_MORNING   -> "Early Morning";
            case BREAKFAST       -> "Breakfast";
            case MID_MORNING     -> "Mid Morning";
            case LUNCH           -> "Lunch";
            case AFTERNOON_SNACK -> "Afternoon Snack";
            case PRE_WORKOUT     -> "Pre-Workout";
            case POST_WORKOUT    -> "Post-Workout";
            case DINNER          -> "Dinner";
            case BEFORE_BED      -> "Before Bed";
        };
    }
}
