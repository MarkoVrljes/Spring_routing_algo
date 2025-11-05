package com.marko.routing_backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "routing.algorithm")
@Data
public class RoutingProperties {
    private int maxNodes = 100;
    private int maxEdges = 500;
    private int timeoutSeconds = 30;
}