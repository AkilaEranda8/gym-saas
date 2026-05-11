package com.gymapp.modules.billing;

import com.gymapp.modules.billing.dto.InitiatePayhereRequest;
import com.gymapp.modules.billing.dto.PayhereInitDTO;
import com.gymapp.modules.billing.dto.PayhereNotifyRequest;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/billing/payhere")
@RequiredArgsConstructor
public class BillingPayhereController {

    private final PayhereService payhereService;

    @PostMapping("/initiate")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'MEMBER')")
    public ResponseEntity<ApiResponse<PayhereInitDTO>> initiate(
            @Valid @RequestBody InitiatePayhereRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(payhereService.initiatePayment(req)));
    }

    @PostMapping("/notify")
    public ResponseEntity<String> notify(@RequestBody PayhereNotifyRequest request) {
        try {
            payhereService.handleNotification(request);
        } catch (Exception e) {
            log.error("PayHere notify error: {}", e.getMessage());
        }
        return ResponseEntity.ok("OK");
    }
}
