package com.gymapp.modules.trainer;

public enum TrainerSpecialty {
    YOGA, HIIT, ZUMBA, PILATES, BOXING,
    SPINNING, STRENGTH, NUTRITION,
    CARDIO, CROSSFIT, REHABILITATION,
    PERSONAL_TRAINING, OTHER;

    public String getEmoji() {
        return switch (this) {
            case YOGA           -> "🧘";
            case HIIT           -> "🔥";
            case ZUMBA          -> "💃";
            case PILATES        -> "🤸";
            case BOXING         -> "🥊";
            case SPINNING       -> "🚴";
            case STRENGTH       -> "🏋️";
            case NUTRITION      -> "🥗";
            case CARDIO         -> "🏃";
            case CROSSFIT       -> "⚡";
            case REHABILITATION -> "🩺";
            case PERSONAL_TRAINING -> "👤";
            case OTHER          -> "🎯";
        };
    }
}
