package com.gymapp;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Duration;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:integtestdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;NON_KEYWORDS=VALUE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false",
    "spring.main.allow-bean-definition-overriding=true",
    "spring.security.oauth2.resourceserver.opaquetoken.introspection-uri=http://localhost:9099/introspect",
    "spring.security.oauth2.resourceserver.opaquetoken.client-id=gym-api",
    "spring.security.oauth2.resourceserver.opaquetoken.client-secret=test-secret",
    "keycloak.admin.server-url=http://localhost:9099",
    "keycloak.admin.realm=gym-saas",
    "keycloak.admin.client-id=gym-api",
    "keycloak.admin.client-secret=test-secret",
    "payhere.merchant-id=TEST_MERCHANT",
    "payhere.merchant-secret=TEST_SECRET",
    "payhere.sandbox=true",
    "payhere.return-url=http://localhost:3000/billing",
    "payhere.cancel-url=http://localhost:3000/billing",
    "payhere.notify-url=http://localhost:9090/api/v1/billing/payhere/notify"
})
public abstract class AbstractIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @MockBean
    protected RedisConnectionFactory redisConnectionFactory;

    @MockBean
    protected ConnectionFactory rabbitConnectionFactory;

    @MockBean
    @SuppressWarnings("unchecked")
    protected RedisTemplate<String, Object> redisTemplate;

    @SuppressWarnings("unchecked")
    protected ValueOperations<String, Object> valueOps;

    protected static final UUID TEST_GYM_ID    = UUID.fromString("00000000-0000-0000-0000-000000000001");
    protected static final UUID TEST_BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");
    protected static final UUID TEST_MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000003");

    protected static final String GYM_OWNER_TOKEN = "Bearer test-gym-owner-token";
    protected static final String MANAGER_TOKEN   = "Bearer test-manager-token";
    protected static final String MEMBER_TOKEN    = "Bearer test-member-token";

    protected static final MediaType JSON = MediaType.APPLICATION_JSON;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUpAbstract() {
        valueOps = mock(ValueOperations.class);
        given(redisTemplate.opsForValue()).willReturn(valueOps);
        given(valueOps.get(anyString())).willReturn(null);
        doNothing().when(valueOps).set(anyString(), any(), any(Duration.class));
        given(redisTemplate.delete(anyString())).willReturn(true);
    }

    @AfterEach
    void tearDownAbstract() {
        com.gymapp.multitenancy.TenantContext.clear();
    }

    protected String toJson(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }

    protected String gymHeader() {
        return TEST_GYM_ID.toString();
    }
}
