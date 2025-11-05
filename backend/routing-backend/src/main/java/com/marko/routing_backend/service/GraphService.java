package com.marko.routing_backend.service;

import com.marko.routing_backend.dto.EdgeDto;
import com.marko.routing_backend.dto.GraphOperationRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GraphService {
    
    public boolean hasNegativeEdges(List<EdgeDto> edges) {
        return edges.stream().anyMatch(e -> e.getCost() < 0);
    }

    public boolean isConnected(List<EdgeDto> edges, int nodeCount) {
        // Create adjacency list
        Map<Integer, List<Integer>> adj = new HashMap<>();
        for (int i = 0; i < nodeCount; i++) {
            adj.put(i, new ArrayList<>());
        }

        // Build undirected graph (both directions for each edge)
        for (EdgeDto e : edges) {
            adj.get(e.getStart()).add(e.getEnd());
            adj.get(e.getEnd()).add(e.getStart());
        }

        // Run DFS from first node
        Set<Integer> visited = new HashSet<>();
        dfs(0, visited, adj);

        // Graph is connected if we visited all nodes
        return visited.size() == nodeCount;
    }

    private void dfs(int node, Set<Integer> visited, Map<Integer, List<Integer>> adj) {
        visited.add(node);
        for (int neighbor : adj.get(node)) {
            if (!visited.contains(neighbor)) {
                dfs(neighbor, visited, adj);
            }
        }
    }

    public double getMinimumCost(int node1, int node2, List<EdgeDto> edges) {
        return edges.stream()
            .filter(e -> (e.getStart() == node1 && e.getEnd() == node2) || 
                        (e.getStart() == node2 && e.getEnd() == node1))
            .mapToDouble(EdgeDto::getCost)
            .min()
            .orElse(Double.POSITIVE_INFINITY);
    }

    public void validateRequest(GraphOperationRequest request) {
        if (request.getNodes() == null || request.getNodes().isEmpty()) {
            throw new IllegalArgumentException("Graph must have nodes");
        }
        if (request.getEdges() == null) {
            throw new IllegalArgumentException("Edges list cannot be null");
        }
        if (request.getStartNode() == null) {
            throw new IllegalArgumentException("Start node is required");
        }
        if (request.getStartNode() < 0 || request.getStartNode() >= request.getNodes().size()) {
            throw new IllegalArgumentException("Invalid start node index");
        }
    if ("dijkstra".equals(request.getOperation())) {
            if (request.getEndNode() == null) {
                throw new IllegalArgumentException("End node is required for Dijkstra");
            }
            if (request.getEndNode() < 0 || request.getEndNode() >= request.getNodes().size()) {
                throw new IllegalArgumentException("Invalid end node index");
            }
            if (request.getEndNode().equals(request.getStartNode())) {
                throw new IllegalArgumentException("Start and end nodes must be different");
            }
        }
        // Validate edges reference existing node indices
        int nodeCount = request.getNodes().size();
        for (EdgeDto e : request.getEdges()) {
            if (e == null) {
                throw new IllegalArgumentException("Edge entry cannot be null");
            }
            if (e.getStart() < 0 || e.getStart() >= nodeCount || e.getEnd() < 0 || e.getEnd() >= nodeCount) {
                throw new IllegalArgumentException("Edge references invalid node index: start=" + e.getStart() + ", end=" + e.getEnd());
            }
        }
    }
}