package com.gymapp.modules.equipment.enums;

public enum ServiceType {
    ROUTINE, DEEP_CLEAN, CALIBRATION, INSPECTION, PARTS_REPLACEMENT, OTHER;

    public String getLabel() {
        return switch (this) {
            case ROUTINE           -> "Routine Service";
            case DEEP_CLEAN        -> "Deep Clean";
            case CALIBRATION       -> "Calibration";
            case INSPECTION        -> "Inspection";
            case PARTS_REPLACEMENT -> "Parts Replacement";
            case OTHER             -> "Other";
        };
    }
}
