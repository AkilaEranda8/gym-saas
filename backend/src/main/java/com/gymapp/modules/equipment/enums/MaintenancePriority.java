package com.gymapp.modules.equipment.enums;

public enum MaintenancePriority {
    LOW, MEDIUM, HIGH, CRITICAL;

    public String getColor() {
        return switch (this) {
            case LOW      -> "#64748b";
            case MEDIUM   -> "#f59e0b";
            case HIGH     -> "#fb923c";
            case CRITICAL -> "#f87171";
        };
    }
}
