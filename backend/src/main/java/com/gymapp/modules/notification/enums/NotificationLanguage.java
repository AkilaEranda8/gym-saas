package com.gymapp.modules.notification.enums;

public enum NotificationLanguage {
    EN("en", "English"),
    SI("si", "Sinhala"),
    TA("ta", "Tamil");

    private final String code;
    private final String label;

    NotificationLanguage(String code, String label) {
        this.code  = code;
        this.label = label;
    }

    public String getCode()  { return code; }
    public String getLabel() { return label; }

    public static NotificationLanguage fromCode(String code) {
        for (NotificationLanguage l : values()) {
            if (l.code.equalsIgnoreCase(code)) return l;
        }
        return EN;
    }
}
