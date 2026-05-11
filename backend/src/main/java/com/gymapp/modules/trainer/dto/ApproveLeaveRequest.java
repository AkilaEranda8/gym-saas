package com.gymapp.modules.trainer.dto;

import com.gymapp.modules.trainer.LeaveStatus;
import jakarta.validation.constraints.NotNull;

public record ApproveLeaveRequest(
        @NotNull LeaveStatus status,
        String notes
) {}
