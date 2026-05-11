package com.gymapp.modules.gym;

import com.gymapp.modules.gym.dto.GymResponse;
import com.gymapp.modules.gym.dto.UpdateGymRequest;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/gym")
@RequiredArgsConstructor
public class GymController {

    private final GymService gymService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<GymResponse>> getMyGym() {
        return ResponseEntity.ok(ApiResponse.ok(gymService.getMyGym()));
    }

    @PutMapping
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<GymResponse>> updateGym(
            @Valid @RequestBody UpdateGymRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Gym updated", gymService.updateGym(request)));
    }
}
