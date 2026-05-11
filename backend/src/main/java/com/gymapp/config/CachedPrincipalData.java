package com.gymapp.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CachedPrincipalData implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String name;
    private Map<String, Object> attributes;
    private List<String> authorities;
}
