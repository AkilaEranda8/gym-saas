package com.gymapp.modules.notification.enums;

public enum NotificationChannel {
    PUSH, WHATSAPP, SMS, EMAIL;

    public String getLabel() {
        return switch (this) {
            case PUSH      -> "Push Notification";
            case WHATSAPP  -> "WhatsApp";
            case SMS       -> "SMS";
            case EMAIL     -> "Email";
        };
    }
}
