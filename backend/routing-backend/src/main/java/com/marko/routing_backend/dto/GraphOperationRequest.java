package com.marko.routing_backend.dto;

import java.util.List;

public class GraphOperationRequest {
    private List<NodeDto> nodes;
    private List<EdgeDto> edges;
    private String operation; // "validate", "dijkstra", "bellman-ford"
    private Integer startNode;
    private Integer endNode;
    private String scenarioName;

    public List<NodeDto> getNodes() { return nodes; }
    public void setNodes(List<NodeDto> nodes) { this.nodes = nodes; }

    public List<EdgeDto> getEdges() { return edges; }
    public void setEdges(List<EdgeDto> edges) { this.edges = edges; }

    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }

    public Integer getStartNode() { return startNode; }
    public void setStartNode(Integer startNode) { this.startNode = startNode; }

    public Integer getEndNode() { return endNode; }
    public void setEndNode(Integer endNode) { this.endNode = endNode; }

    public String getScenarioName() { return scenarioName; }
    public void setScenarioName(String scenarioName) { this.scenarioName = scenarioName; }
}