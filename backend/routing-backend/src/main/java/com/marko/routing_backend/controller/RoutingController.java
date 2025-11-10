package com.marko.routing_backend.controller;

import com.marko.routing_backend.dto.*;
import com.marko.routing_backend.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RoutingController {

    private final GraphService graphService;
    private final SimulationService simulationService;
    private final Map<String, GraphOperationRequest> scenarios = new HashMap<>();

    public RoutingController(GraphService graphService, SimulationService simulationService) {
        this.graphService = graphService;
        this.simulationService = simulationService;
    }

    @PostMapping("/graph/validate")
    public ResponseEntity<?> validateGraph(@RequestBody GraphOperationRequest request) {
        try {
            graphService.validateRequest(request);
            boolean isConnected = graphService.isConnected(request.getEdges(), request.getNodes().size());
            boolean hasNegativeEdges = graphService.hasNegativeEdges(request.getEdges());

            return ResponseEntity.ok(Map.of(
                "valid", true,
                "connected", isConnected,
                "hasNegativeEdges", hasNegativeEdges
            ));
        } catch (com.marko.routing_backend.exception.GraphValidationException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "valid", false,
                "error", e.getMessage(),
                "field", e.getField()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "valid", false,
                "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/routing/dijkstra")
    public ResponseEntity<GraphOperationResponse> runDijkstra(@RequestBody GraphOperationRequest request) {
        if (request.getStartNode() == null || request.getEndNode() == null) {
            return ResponseEntity.badRequest().body(
                GraphOperationResponse.error("Start node and end node are required")
            );
        }
        try {
            request.setOperation("dijkstra");
            GraphOperationResponse response = simulationService.simulateDijkstra(request);
            if (response == null) {
                return ResponseEntity.status(500).body(GraphOperationResponse.error("Internal server error"));
            }
            if (!response.isSuccess()) {
                String err = response.getError() == null ? "" : response.getError().toLowerCase();
                // Negative-edge errors are considered client bad requests; disconnected graphs are valid responses
                if (err.contains("negative")) {
                    return ResponseEntity.badRequest().body(response);
                }
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                GraphOperationResponse.error(e.getMessage())
            );
        }
    }

    @PostMapping("/routing/bellman-ford")
    public ResponseEntity<GraphOperationResponse> runBellmanFord(@RequestBody GraphOperationRequest request) {
        if (request.getStartNode() == null || request.getEndNode() == null) {
            return ResponseEntity.badRequest().body(
                GraphOperationResponse.error("Start node and end node are required")
            );
        }
        try {
            request.setOperation("bellman-ford");
            GraphOperationResponse response = simulationService.simulateBellmanFord(request);
            if (response == null) {
                return ResponseEntity.status(500).body(GraphOperationResponse.error("Internal server error"));
            }
            if (!response.isSuccess()) {
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                GraphOperationResponse.error(e.getMessage())
            );
        }
    }

    @PostMapping("/scenarios")
    public ResponseEntity<Map<String, String>> saveScenario(@RequestBody GraphOperationRequest request) {
        String name = request.getScenarioName();
        if (name == null || name.isBlank()) {
            name = "scenario-" + System.currentTimeMillis();
        }
        scenarios.put(name, request);
        return ResponseEntity.ok(Map.of("status", "saved", "name", name));
    }

    @GetMapping("/scenarios")
    public ResponseEntity<Collection<String>> listScenarios() {
        return ResponseEntity.ok(scenarios.keySet());
    }

    @GetMapping("/scenarios/{name}")
    public ResponseEntity<GraphOperationRequest> getScenario(@PathVariable String name) {
        GraphOperationRequest scenario = scenarios.get(name);
        if (scenario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(scenario);
    }
}
