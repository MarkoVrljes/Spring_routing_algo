package com.marko.routing_backend.dto;

import java.util.List;

public class GraphRequest {
    private List<NodeDto> nodes;
    private List<EdgeDto> edges;
    private int start;
    private int end;
    private String scenarioName; // optional – for saving

    public List<NodeDto> getNodes() { return nodes; }
    public void setNodes(List<NodeDto> nodes) { this.nodes = nodes; }

    public List<EdgeDto> getEdges() { return edges; }
    public void setEdges(List<EdgeDto> edges) { this.edges = edges; }

    public int getStart() { return start; }
    public void setStart(int start) { this.start = start; }

    public int getEnd() { return end; }
    public void setEnd(int end) { this.end = end; }

    public String getScenarioName() { return scenarioName; }
    public void setScenarioName(String scenarioName) { this.scenarioName = scenarioName; }
}
