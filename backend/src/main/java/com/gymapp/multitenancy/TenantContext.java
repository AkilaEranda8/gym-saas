package com.gymapp.multitenancy;

import java.util.UUID;

public final class TenantContext {

    private static final ThreadLocal<UUID> GYM_ID    = new ThreadLocal<>();
    private static final ThreadLocal<UUID> BRANCH_ID = new ThreadLocal<>();

    private TenantContext() {}

    public static void setGymId(String gymId) {
        if (gymId != null && !gymId.isBlank()) {
            GYM_ID.set(UUID.fromString(gymId));
        }
    }

    public static void setGymId(UUID gymId) {
        GYM_ID.set(gymId);
    }

    public static UUID getGymId() {
        return GYM_ID.get();
    }

    public static void setBranchId(String branchId) {
        if (branchId != null && !branchId.isBlank()) {
            try {
                BRANCH_ID.set(UUID.fromString(branchId));
            } catch (IllegalArgumentException ignored) {}
        }
    }

    public static UUID getBranchId() {
        return BRANCH_ID.get();
    }

    public static void clear() {
        GYM_ID.remove();
        BRANCH_ID.remove();
    }

    public static boolean hasGymId() {
        return GYM_ID.get() != null;
    }
}
