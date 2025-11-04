package com.marko.routing_backend.service;

import com.marko.routing_backend.dto.DijkstraResult;
import com.marko.routing_backend.dto.EdgeDto;
import com.marko.routing_backend.dto.GraphRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RoutingService {

    public DijkstraResult runDijkstra(GraphRequest request) {
        int n = request.getNodes().size();
        List<EdgeDto> edges = request.getEdges();
        int start = request.getStart();
        int end = request.getEnd();

        // adjacency list: node -> list of (neighbor, cost)
        Map<Integer, List<EdgeDto>> adj = new HashMap<>();
        for (int i = 0; i < n; i++) {
            adj.put(i, new ArrayList<>());
        }
        for (EdgeDto e : edges) {
            adj.get(e.getStart()).add(e);
            // if graph is undirected, also add reverse
            // adj.get(e.getEnd()).add(new EdgeDto(e.getEnd(), e.getStart(), e.getCost()));
        }

        double[] dist = new double[n];
        int[] prev = new int[n];
        Arrays.fill(dist, Double.POSITIVE_INFINITY);
        Arrays.fill(prev, -1);
        dist[start] = 0.0;

        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingDouble(a -> dist[a[0]]));
        pq.offer(new int[]{start});

        while (!pq.isEmpty()) {
            int u = pq.poll()[0];
            if (u == end) break;

            for (EdgeDto edge : adj.get(u)) {
                int v = edge.getEnd();
                double alt = dist[u] + edge.getCost();
                if (alt < dist[v]) {
                    dist[v] = alt;
                    prev[v] = u;
                    pq.offer(new int[]{v});
                }
            }
        }

        // rebuild path
        List<Integer> path = new ArrayList<>();
        if (dist[end] != Double.POSITIVE_INFINITY) {
            for (int at = end; at != -1; at = prev[at]) {
                path.add(at);
            }
            Collections.reverse(path);
        }

        // put distances into map
        Map<Integer, Double> distanceMap = new HashMap<>();
        for (int i = 0; i < n; i++) {
            distanceMap.put(i, dist[i]);
        }

        return new DijkstraResult(path, dist[end], distanceMap);
    }

    /**
     * Tiny "AI" helper – for the interview you can say:
     * "I added an endpoint that gives optimization hints based on the current graph."
     */
    public List<String> generateHints(GraphRequest request) {
        List<String> hints = new ArrayList<>();
        if (request.getEdges().size() > request.getNodes().size() * 2) {
            hints.add("Network is quite dense – consider pruning high-cost links.");
        }
        if (request.getEdges().stream().anyMatch(e -> e.getCost() > 100)) {
            hints.add("There are very expensive links – try alternative routes.");
        }
        if (hints.isEmpty()) {
            hints.add("Topology looks good – costs are balanced.");
        }
        return hints;
    }
}
