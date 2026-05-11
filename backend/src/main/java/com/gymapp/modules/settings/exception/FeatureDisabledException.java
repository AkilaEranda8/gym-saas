package com.gymapp.modules.settings.exception;

public class FeatureDisabledException extends RuntimeException {
    public FeatureDisabledException(String featureName) {
        super(featureName + " is not enabled for your gym. Please contact support to upgrade.");
    }
}
