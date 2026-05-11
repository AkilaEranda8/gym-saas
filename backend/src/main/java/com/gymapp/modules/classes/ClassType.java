package com.gymapp.modules.classes;

public enum ClassType {
    YOGA, HIIT, ZUMBA, PILATES, BOXING,
    SPINNING, STRENGTH, MEDITATION,
    DANCE, CARDIO, CROSSFIT, OTHER;

    public String getColor() {
        return switch (this) {
            case YOGA       -> "#34d399";
            case HIIT       -> "#f87171";
            case ZUMBA      -> "#fb923c";
            case PILATES    -> "#a855f7";
            case BOXING     -> "#f43f5e";
            case SPINNING   -> "#facc15";
            case STRENGTH   -> "#60a5fa";
            case MEDITATION -> "#2dd4bf";
            case DANCE      -> "#f472b6";
            case CARDIO     -> "#fb7185";
            case CROSSFIT   -> "#f59e0b";
            case OTHER      -> "#64748b";
        };
    }

    public String getEmoji() {
        return switch (this) {
            case YOGA       -> "🧘";
            case HIIT       -> "🔥";
            case ZUMBA      -> "💃";
            case PILATES    -> "🤸";
            case BOXING     -> "🥊";
            case SPINNING   -> "🚴";
            case STRENGTH   -> "🏋️";
            case MEDITATION -> "🧘‍♀️";
            case DANCE      -> "🕺";
            case CARDIO     -> "❤️";
            case CROSSFIT   -> "⚡";
            case OTHER      -> "🏃";
        };
    }
}
