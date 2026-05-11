package com.gymapp;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.flyway.enabled=false",
    "spring.security.oauth2.resourceserver.opaquetoken.introspection-uri=http://localhost:8080/realms/gym-saas/protocol/openid-connect/token/introspect",
    "spring.security.oauth2.resourceserver.opaquetoken.client-id=gym-api",
    "spring.security.oauth2.resourceserver.opaquetoken.client-secret=test-secret",
    "spring.data.redis.host=localhost",
    "spring.data.redis.port=6379",
    "spring.rabbitmq.host=localhost",
    "keycloak.admin.server-url=http://localhost:8080",
    "keycloak.admin.realm=gym-saas",
    "keycloak.admin.client-id=gym-api",
    "keycloak.admin.client-secret=test-secret",
    "spring.main.allow-bean-definition-overriding=true",
    "spring.autoconfigure.exclude=" +
        "org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration," +
        "org.springframework.boot.actuate.autoconfigure.data.redis.RedisReactiveHealthContributorAutoConfiguration," +
        "org.springframework.boot.actuate.autoconfigure.amqp.RabbitHealthContributorAutoConfiguration," +
        "org.springframework.boot.actuate.autoconfigure.mail.MailHealthContributorAutoConfiguration"
})
class GymApplicationTests {

    @MockBean
    RedisConnectionFactory redisConnectionFactory;

    @MockBean
    ConnectionFactory rabbitConnectionFactory;

    @Test
    void contextLoads() {
    }
}
