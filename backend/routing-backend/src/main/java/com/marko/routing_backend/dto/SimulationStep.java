package com.marko.routing_backend.dto;

import java.util.Map;

public class SimulationStep {
    private int currentNode;
    private int[] visitedEdgeIndices;
    private Map<Integer, Double> distances;
    private Map<Integer, Integer> predecessors;

    public int getCurrentNode() { return currentNode; }
    public void setCurrentNode(int currentNode) { this.currentNode = currentNode; }

    public int[] getVisitedEdgeIndices() { return visitedEdgeIndices; }
    public void setVisitedEdgeIndices(int[] visitedEdgeIndices) { this.visitedEdgeIndices = visitedEdgeIndices; }

    public Map<Integer, Double> getDistances() { return distances; }
    public void setDistances(Map<Integer, Double> distances) { this.distances = distances; }

    public Map<Integer, Integer> getPredecessors() { return predecessors; }
    public void setPredecessors(Map<Integer, Integer> predecessors) { this.predecessors = predecessors; }
}