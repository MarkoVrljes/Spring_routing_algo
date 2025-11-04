package com.marko.routing_backend.dto;

public class NodeDto {
    private int id;
    private double x;
    private double y;
    private String label;

    public NodeDto() {}

    public NodeDto(int id, double x, double y, String label) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.label = label;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public double getX() { return x; }
    public void setX(double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
}
