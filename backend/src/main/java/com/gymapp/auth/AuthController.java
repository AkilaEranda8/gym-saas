package com.gymapp.auth;

import com.gymapp.auth.dto.GymRegistrationRequest;
import com.gymapp.auth.dto.GymRegistrationResponse;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final GymRegistrationService registrationService;

    @PostMapping("/register-gym")
    public ResponseEntity<ApiResponse<GymRegistrationResponse>> registerGym(
            @Valid @RequestBody GymRegistrationRequest request) {
        GymRegistrationResponse response = registrationService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(response));
    }
}
