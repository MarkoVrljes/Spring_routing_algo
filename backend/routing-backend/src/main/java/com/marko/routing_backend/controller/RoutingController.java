package com.marko.routing_backend.controller;

import com.marko.routing_backend.dto.DijkstraResult;
import com.marko.routing_backend.dto.GraphRequest;
import com.marko.routing_backend.service.RoutingService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // so your index.html running from file:// or GitHub Pages can hit it
public class RoutingController {

    private final RoutingService routingService;

    // in-memory scenarios just to show persistence
    private final Map<String, GraphRequest> scenarios = new HashMap<>();

    public RoutingController(RoutingService routingService) {
        this.routingService = routingService;
    }

    @PostMapping("/routing/dijkstra")
    public DijkstraResult runDijkstra(@RequestBody GraphRequest request) {
        return routingService.runDijkstra(request);
    }

    @PostMapping("/scenarios")
    public Map<String, String> saveScenario(@RequestBody GraphRequest request) {
        String name = request.getScenarioName();
        if (name == null || name.isBlank()) {
            name = "scenario-" + System.currentTimeMillis();
        }
        scenarios.put(name, request);
        return Map.of("status", "saved", "name", name);
    }

    @GetMapping("/scenarios")
    public Collection<String> listScenarios() {
        return scenarios.keySet();
    }

    @GetMapping("/scenarios/{name}")
    public GraphRequest getScenario(@PathVariable String name) {
        return scenarios.get(name);
    }

    @PostMapping("/routing/hints")
    public List<String> getHints(@RequestBody GraphRequest request) {
        return routingService.generateHints(request);
    }
}
