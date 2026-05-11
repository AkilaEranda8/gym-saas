package com.gymapp.modules.equipment.enums;

public enum EquipmentCondition {
    EXCELLENT, GOOD, FAIR, POOR;

    public String getColor() {
        return switch (this) {
            case EXCELLENT -> "#34d399";
            case GOOD      -> "#60a5fa";
            case FAIR      -> "#f59e0b";
            case POOR      -> "#f87171";
        };
    }

    public int getStars() {
        return switch (this) {
            case EXCELLENT -> 5;
            case GOOD      -> 4;
            case FAIR      -> 3;
            case POOR      -> 2;
        };
    }
}
