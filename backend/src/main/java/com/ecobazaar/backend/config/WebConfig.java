package com.ecobazaar.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig
 * Configures Cross-Origin Resource Sharing (CORS) for local frontend development.
 * Allows requests from local origins where the frontend may be hosted
 * (VS Code Live Server on 5500, Python server on 8000, React/Vite dev servers on 3000, etc.).
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5500",
                        "http://127.0.0.1:5500",
                        "http://localhost:8000",
                        "http://127.0.0.1:8000",
                        "http://localhost:3000",
                        "http://127.0.0.1:3000",
                        "http://localhost:8080"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}
