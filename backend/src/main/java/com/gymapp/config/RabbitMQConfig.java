package com.gymapp.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ── Exchange ──────────────────────────────────────────────────────────────
    public static final String NOTIFICATION_EXCHANGE   = "gym.notifications";
    public static final String DLX_EXCHANGE            = "gym.dlx";

    // ── Routing keys (new — canonical) ────────────────────────────────────────
    public static final String PUSH_HIGH_KEY           = "notify.push.high";
    public static final String PUSH_NORMAL_KEY         = "notify.push.normal";
    public static final String WHATSAPP_HIGH_KEY       = "notify.whatsapp.high";
    public static final String WHATSAPP_NORMAL_KEY     = "notify.whatsapp.normal";
    public static final String SMS_KEY                 = "notify.sms";
    public static final String EMAIL_KEY               = "notify.email";
    public static final String BULK_KEY                = "notify.bulk";

    // ── Legacy routing key aliases (kept for backward compat) ─────────────────
    public static final String EMAIL_ROUTING_KEY       = "notification.email";
    public static final String PUSH_ROUTING_KEY        = "notification.push";

    // ── Queue names ───────────────────────────────────────────────────────────
    public static final String PUSH_HIGH_QUEUE         = "gym.push.high";
    public static final String PUSH_NORMAL_QUEUE       = "gym.push.normal";
    public static final String WHATSAPP_HIGH_QUEUE     = "gym.whatsapp.high";
    public static final String WHATSAPP_NORMAL_QUEUE   = "gym.whatsapp.normal";
    public static final String SMS_QUEUE               = "gym.sms";
    public static final String EMAIL_QUEUE             = "gym.email";
    public static final String PUSH_QUEUE              = "gym.push";
    public static final String BULK_QUEUE              = "gym.bulk";

    // ── DLQ names ─────────────────────────────────────────────────────────────
    public static final String DLQ_QUEUE               = "gym.dlq";
    public static final String PUSH_DLQ                = "gym.push.dlq";
    public static final String WHATSAPP_DLQ            = "gym.whatsapp.dlq";
    public static final String SMS_DLQ                 = "gym.sms.dlq";
    public static final String EMAIL_DLQ               = "gym.email.dlq";

    private static final long MSG_TTL_MS               = 86_400_000L; // 24 hours

    // ── Exchange beans ────────────────────────────────────────────────────────
    @Bean
    public TopicExchange notificationExchange() {
        return ExchangeBuilder.topicExchange(NOTIFICATION_EXCHANGE).durable(true).build();
    }

    @Bean
    public FanoutExchange deadLetterExchange() {
        return ExchangeBuilder.fanoutExchange(DLX_EXCHANGE).durable(true).build();
    }

    // ── Queue beans ───────────────────────────────────────────────────────────
    @Bean public Queue pushHighQueue() {
        return QueueBuilder.durable(PUSH_HIGH_QUEUE)
            .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
            .withArgument("x-message-ttl", MSG_TTL_MS)
            .build();
    }

    @Bean public Queue pushNormalQueue() {
        return QueueBuilder.durable(PUSH_NORMAL_QUEUE)
            .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
            .withArgument("x-message-ttl", MSG_TTL_MS)
            .build();
    }

    @Bean public Queue whatsappHighQueue() {
        return QueueBuilder.durable(WHATSAPP_HIGH_QUEUE)
            .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
            .withArgument("x-message-ttl", MSG_TTL_MS)
            .build();
    }

    @Bean public Queue whatsappNormalQueue() {
        return QueueBuilder.durable(WHATSAPP_NORMAL_QUEUE)
            .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
            .withArgument("x-message-ttl", MSG_TTL_MS)
            .build();
    }

    @Bean public Queue smsQueue() {
        return QueueBuilder.durable(SMS_QUEUE)
            .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
            .withArgument("x-message-ttl", MSG_TTL_MS)
            .build();
    }

    @Bean public Queue emailQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE)
            .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
            .withArgument("x-message-ttl", MSG_TTL_MS)
            .build();
    }

    @Bean public Queue pushLegacyQueue() {
        return QueueBuilder.durable(PUSH_QUEUE)
            .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
            .build();
    }

    @Bean public Queue bulkQueue() {
        return QueueBuilder.durable(BULK_QUEUE)
            .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
            .build();
    }

    // ── DLQ beans ─────────────────────────────────────────────────────────────
    @Bean public Queue deadLetterQueue()   { return QueueBuilder.durable(DLQ_QUEUE).build(); }
    @Bean public Queue pushDlq()           { return QueueBuilder.durable(PUSH_DLQ).build(); }
    @Bean public Queue whatsappDlq()       { return QueueBuilder.durable(WHATSAPP_DLQ).build(); }
    @Bean public Queue smsDlq()            { return QueueBuilder.durable(SMS_DLQ).build(); }
    @Bean public Queue emailDlq()          { return QueueBuilder.durable(EMAIL_DLQ).build(); }

    // ── Binding beans ─────────────────────────────────────────────────────────
    @Bean public Binding pushHighBinding(Queue pushHighQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(pushHighQueue).to(notificationExchange).with(PUSH_HIGH_KEY);
    }
    @Bean public Binding pushNormalBinding(Queue pushNormalQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(pushNormalQueue).to(notificationExchange).with(PUSH_NORMAL_KEY);
    }
    @Bean public Binding whatsappHighBinding(Queue whatsappHighQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(whatsappHighQueue).to(notificationExchange).with(WHATSAPP_HIGH_KEY);
    }
    @Bean public Binding whatsappNormalBinding(Queue whatsappNormalQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(whatsappNormalQueue).to(notificationExchange).with(WHATSAPP_NORMAL_KEY);
    }
    @Bean public Binding smsBinding(Queue smsQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(smsQueue).to(notificationExchange).with(SMS_KEY);
    }
    @Bean public Binding emailBinding(Queue emailQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(emailQueue).to(notificationExchange).with(EMAIL_KEY);
    }
    @Bean public Binding emailLegacyBinding(Queue emailQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(emailQueue).to(notificationExchange).with(EMAIL_ROUTING_KEY);
    }
    @Bean public Binding pushLegacyBinding(Queue pushLegacyQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(pushLegacyQueue).to(notificationExchange).with(PUSH_ROUTING_KEY);
    }
    @Bean public Binding pushLegacyWildcardBinding(Queue pushLegacyQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(pushLegacyQueue).to(notificationExchange).with("notification.#");
    }
    @Bean public Binding bulkBinding(Queue bulkQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(bulkQueue).to(notificationExchange).with(BULK_KEY);
    }
    @Bean public Binding dlqBinding(Queue deadLetterQueue, FanoutExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(deadLetterExchange);
    }

    // ── Converter + Template ──────────────────────────────────────────────────
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        RabbitAdmin admin = new RabbitAdmin(connectionFactory);
        admin.setAutoStartup(true);
        return admin;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter());
        factory.setMissingQueuesFatal(false);
        return factory;
    }
}
