package com.gymapp.modules.notification.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class NotificationLanguageConverter implements AttributeConverter<NotificationLanguage, String> {

    @Override
    public String convertToDatabaseColumn(NotificationLanguage attribute) {
        return attribute == null ? null : attribute.getCode();
    }

    @Override
    public NotificationLanguage convertToEntityAttribute(String dbData) {
        return dbData == null ? null : NotificationLanguage.fromCode(dbData);
    }
}
