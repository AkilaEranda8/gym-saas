package com.gymapp.modules.notification;

import com.gymapp.modules.notification.enums.NotificationType;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<Notification>>> list(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getMyNotifications(pageable)));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> unreadCount() {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUnreadCount()));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Notification>> markRead(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.markRead(id)));
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Notification>> send(@RequestBody Map<String, String> body) {
        UUID gymId = TenantContext.getGymId();
        Notification n = notificationService.send(
            gymId,
            body.get("userId"),
            body.get("title"),
            body.get("message"),
            NotificationType.valueOf(body.getOrDefault("type", "GENERAL")),
            body.get("actionUrl")
        );
        return ResponseEntity.ok(ApiResponse.ok("Notification sent", n));
    }

    @PostMapping("/broadcast")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> broadcast(@RequestBody Map<String, String> body) {
        notificationService.broadcastToGym(
            TenantContext.getGymId(),
            body.get("title"),
            body.get("message"),
            NotificationType.valueOf(body.getOrDefault("type", "GENERAL"))
        );
        return ResponseEntity.ok(ApiResponse.ok("Broadcast queued", null));
    }
}
