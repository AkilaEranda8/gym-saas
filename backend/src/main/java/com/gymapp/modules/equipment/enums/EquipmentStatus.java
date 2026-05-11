package com.gymapp.modules.equipment.enums;

public enum EquipmentStatus {
    OPERATIONAL, MAINTENANCE, OUT_OF_ORDER, RETIRED, UNDER_INSPECTION;

    public String getColor() {
        return switch (this) {
            case OPERATIONAL      -> "#34d399";
            case MAINTENANCE      -> "#f59e0b";
            case OUT_OF_ORDER     -> "#f87171";
            case RETIRED          -> "#475569";
            case UNDER_INSPECTION -> "#60a5fa";
        };
    }

    public String getLabel() {
        return switch (this) {
            case OPERATIONAL      -> "Operational";
            case MAINTENANCE      -> "Maintenance";
            case OUT_OF_ORDER     -> "Out of Order";
            case RETIRED          -> "Retired";
            case UNDER_INSPECTION -> "Under Inspection";
        };
    }
}
