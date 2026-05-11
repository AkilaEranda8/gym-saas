package com.gymapp.modules.classes.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record WeekScheduleDTO(
    LocalDate weekStart,
    LocalDate weekEnd,
    Map<String, List<ClassSessionDTO>> days
) {}
