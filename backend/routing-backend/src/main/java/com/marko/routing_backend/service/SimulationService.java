package com.marko.routing_backend.service;

import com.marko.routing_backend.dto.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SimulationService {
    private final GraphService graphService;

    public SimulationService(GraphService graphService) {
        this.graphService = graphService;
    }

    public GraphOperationResponse simulateDijkstra(GraphOperationRequest request) {
        graphService.validateRequest(request);

        if (graphService.hasNegativeEdges(request.getEdges())) {
            return GraphOperationResponse.error("Dijkstra's algorithm cannot handle negative edges");
        }

        if (!graphService.isConnected(request.getEdges(), request.getNodes().size())) {
            return GraphOperationResponse.error("Graph must be connected for Dijkstra's algorithm");
        }

        int n = request.getNodes().size();
        int start = request.getStartNode();
        int end = request.getEndNode();

        // Build adjacency list
        Map<Integer, List<EdgeDto>> adj = new HashMap<>();
        for (int i = 0; i < n; i++) {
            adj.put(i, new ArrayList<>());
        }
        for (EdgeDto e : request.getEdges()) {
            adj.get(e.getStart()).add(e);
            // For undirected graph, add reverse edge
            adj.get(e.getEnd()).add(new EdgeDto(e.getEnd(), e.getStart(), e.getCost()));
        }

        // Initialize distances and predecessors
        double[] dist = new double[n];
        int[] prev = new int[n];
        Arrays.fill(dist, Double.POSITIVE_INFINITY);
        Arrays.fill(prev, -1);
        dist[start] = 0;

        // Priority queue for Dijkstra
        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingDouble(a -> dist[a[0]]));
        pq.offer(new int[]{start});

        List<SimulationStep> steps = new ArrayList<>();
        List<Integer> visitedEdges = new ArrayList<>();

        while (!pq.isEmpty()) {
            int u = pq.poll()[0];
            
            // Record this step
            SimulationStep step = new SimulationStep();
            step.setCurrentNode(u);
            step.setVisitedEdgeIndices(visitedEdges.stream().mapToInt(Integer::intValue).toArray());
            
            Map<Integer, Double> currentDist = new HashMap<>();
            Map<Integer, Integer> currentPrev = new HashMap<>();
            for (int i = 0; i < n; i++) {
                currentDist.put(i, dist[i]);
                currentPrev.put(i, prev[i]);
            }
            step.setDistances(currentDist);
            step.setPredecessors(currentPrev);
            steps.add(step);

            if (u == end) break;

            for (EdgeDto edge : adj.get(u)) {
                int v = edge.getEnd();
                double alt = dist[u] + edge.getCost();
                if (alt < dist[v]) {
                    dist[v] = alt;
                    prev[v] = u;
                    pq.offer(new int[]{v});
                    
                    // Find and record edge index for animation
                    int edgeIndex = request.getEdges().indexOf(
                        request.getEdges().stream()
                            .filter(e -> (e.getStart() == u && e.getEnd() == v) || 
                                       (e.getStart() == v && e.getEnd() == u))
                            .findFirst()
                            .get()
                    );
                    visitedEdges.add(edgeIndex);
                }
            }
        }

        // Build shortest path
        List<Integer> path = new ArrayList<>();
        if (dist[end] != Double.POSITIVE_INFINITY) {
            for (int at = end; at != -1; at = prev[at]) {
                path.add(0, at);
            }
        }

        // Build final response
        GraphOperationResponse response = new GraphOperationResponse();
        response.setSuccess(true);
        response.setSteps(steps);
        response.setShortestPath(path);
        response.setTotalCost(dist[end]);
        
        Map<Integer, Double> finalDist = new HashMap<>();
        for (int i = 0; i < n; i++) {
            finalDist.put(i, dist[i]);
        }
        response.setFinalDistances(finalDist);

        return response;
    }

    public GraphOperationResponse simulateBellmanFord(GraphOperationRequest request) {
        graphService.validateRequest(request);
        
        int n = request.getNodes().size();
        int start = request.getStartNode();

        // Initialize distances and predecessors
        Map<Integer, Double> distances = new HashMap<>();
        Map<Integer, Integer> predecessors = new HashMap<>();
        List<SimulationStep> steps = new ArrayList<>();
        List<Integer> visitedEdges = new ArrayList<>();

        // Initialize all distances to infinity except start
        for (int i = 0; i < n; i++) {
            distances.put(i, Double.POSITIVE_INFINITY);
            predecessors.put(i, null);
        }
        distances.put(start, 0.0);

        // Record initial state
        SimulationStep initial = new SimulationStep();
        initial.setCurrentNode(start);
        initial.setDistances(new HashMap<>(distances));
        initial.setPredecessors(new HashMap<>(predecessors));
        initial.setVisitedEdgeIndices(new int[0]);
        steps.add(initial);

        // Iterate |V|-1 times
        for (int i = 0; i < n-1; i++) {
            for (EdgeDto edge : request.getEdges()) {
                int u = edge.getStart();
                int v = edge.getEnd();
                double cost = edge.getCost();

                if (distances.get(u) + cost < distances.get(v)) {
                    distances.put(v, distances.get(u) + cost);
                    predecessors.put(v, u);
                    
                    // Record this step
                    SimulationStep step = new SimulationStep();
                    step.setCurrentNode(v);
                    visitedEdges.add(request.getEdges().indexOf(edge));
                    step.setVisitedEdgeIndices(visitedEdges.stream().mapToInt(Integer::intValue).toArray());
                    step.setDistances(new HashMap<>(distances));
                    step.setPredecessors(new HashMap<>(predecessors));
                    steps.add(step);
                }

                // For undirected graph, also try reverse
                if (distances.get(v) + cost < distances.get(u)) {
                    distances.put(u, distances.get(v) + cost);
                    predecessors.put(u, v);
                    
                    SimulationStep step = new SimulationStep();
                    step.setCurrentNode(u);
                    visitedEdges.add(request.getEdges().indexOf(edge));
                    step.setVisitedEdgeIndices(visitedEdges.stream().mapToInt(Integer::intValue).toArray());
                    step.setDistances(new HashMap<>(distances));
                    step.setPredecessors(new HashMap<>(predecessors));
                    steps.add(step);
                }
            }
        }

        // Check for negative cycles
        for (EdgeDto edge : request.getEdges()) {
            if (distances.get(edge.getStart()) + edge.getCost() < distances.get(edge.getEnd())) {
                return GraphOperationResponse.error("Graph contains negative cycles");
            }
        }

        GraphOperationResponse response = new GraphOperationResponse();
        response.setSuccess(true);
        response.setSteps(steps);
        response.setFinalDistances(distances);
        return response;
    }
}