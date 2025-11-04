package com.marko.routing_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Routing Backend is running. Try /api/routing/dijkstra or /api/scenarios";
    }
}
