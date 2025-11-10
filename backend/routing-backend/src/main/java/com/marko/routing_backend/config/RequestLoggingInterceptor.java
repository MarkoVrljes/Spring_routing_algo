package com.marko.routing_backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        long startTime = System.currentTimeMillis();
        request.setAttribute("startTime", startTime);
        
        log.info("Request URL: {} | Method: {} | Client IP: {}", 
            request.getRequestURL(), 
            request.getMethod(),
            request.getRemoteAddr()
        );
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, @Nullable Exception ex) {
        long startTime = (Long) request.getAttribute("startTime");
        long endTime = System.currentTimeMillis();
        
        log.info("Response Status: {} | Time Taken: {}ms | URL: {}", 
            response.getStatus(),
            (endTime - startTime),
            request.getRequestURL()
        );
        
        if (ex != null) {
            log.error("Error processing request: {}", ex.getMessage());
        }
    }
}