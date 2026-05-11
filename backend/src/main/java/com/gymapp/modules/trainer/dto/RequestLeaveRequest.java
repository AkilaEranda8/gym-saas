package com.gymapp.modules.trainer.dto;

import com.gymapp.modules.trainer.LeaveType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record RequestLeaveRequest(
        @NotNull LeaveType leaveType,
        @NotNull @Future LocalDate fromDate,
        @NotNull LocalDate toDate,
        String reason
) {}
