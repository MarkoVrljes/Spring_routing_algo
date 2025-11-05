package com.marko.routing_backend.dto;

import java.util.List;
import java.util.Map;

public class GraphOperationResponse {
    private boolean success;
    private String error;
    private List<SimulationStep> steps;
    private List<Integer> shortestPath;
    private Map<Integer, Double> finalDistances;
    private double totalCost;

    public GraphOperationResponse() {}

    public GraphOperationResponse(boolean success, String error) {
        this.success = success;
        this.error = error;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public List<SimulationStep> getSteps() { return steps; }
    public void setSteps(List<SimulationStep> steps) { this.steps = steps; }

    public List<Integer> getShortestPath() { return shortestPath; }
    public void setShortestPath(List<Integer> shortestPath) { this.shortestPath = shortestPath; }

    public Map<Integer, Double> getFinalDistances() { return finalDistances; }
    public void setFinalDistances(Map<Integer, Double> finalDistances) { this.finalDistances = finalDistances; }

    public double getTotalCost() { return totalCost; }
    public void setTotalCost(double totalCost) { this.totalCost = totalCost; }

    public static GraphOperationResponse error(String message) {
        return new GraphOperationResponse(false, message);
    }
}