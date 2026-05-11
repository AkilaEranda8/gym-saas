package com.gymapp.modules.nutrition.enums;

public enum FoodCategory {
    PROTEIN,
    CARBS,
    FATS,
    VEGETABLES,
    FRUITS,
    DAIRY,
    GRAINS,
    BEVERAGES,
    SUPPLEMENTS,
    CONDIMENTS,
    OTHER;

    public String getColor() {
        return switch (this) {
            case PROTEIN     -> "#60a5fa";
            case CARBS       -> "#f59e0b";
            case FATS        -> "#f87171";
            case VEGETABLES  -> "#34d399";
            case FRUITS      -> "#fb923c";
            case DAIRY       -> "#e2e8f0";
            case GRAINS      -> "#a855f7";
            case BEVERAGES   -> "#2dd4bf";
            case SUPPLEMENTS -> "#facc15";
            case CONDIMENTS  -> "#94a3b8";
            case OTHER       -> "#64748b";
        };
    }
}
