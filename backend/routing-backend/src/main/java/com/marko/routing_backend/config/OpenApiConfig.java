package com.marko.routing_backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI routingAlgorithmAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Routing Algorithm API")
                .description("REST API for graph-based routing algorithms including Dijkstra and Bellman-Ford")
                .version("1.0.0")
                .license(new License()
                    .name("MIT")
                    .url("https://opensource.org/licenses/MIT")));
    }
}