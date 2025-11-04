package com.marko.routing_backend.dto;

import java.util.List;
import java.util.Map;

public class DijkstraResult {
    private List<Integer> path;
    private double totalCost;
    private Map<Integer, Double> distances;

    public DijkstraResult(List<Integer> path, double totalCost, Map<Integer, Double> distances) {
        this.path = path;
        this.totalCost = totalCost;
        this.distances = distances;
    }

    public List<Integer> getPath() { return path; }
    public double getTotalCost() { return totalCost; }
    public Map<Integer, Double> getDistances() { return distances; }
}
