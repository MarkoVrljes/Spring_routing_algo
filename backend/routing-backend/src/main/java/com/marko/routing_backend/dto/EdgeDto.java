package com.marko.routing_backend.dto;

public class EdgeDto {
    private int start;
    private int end;
    private double cost;

    public EdgeDto() {}

    public EdgeDto(int start, int end, double cost) {
        this.start = start;
        this.end = end;
        this.cost = cost;
    }

    public int getStart() { return start; }
    public void setStart(int start) { this.start = start; }

    public int getEnd() { return end; }
    public void setEnd(int end) { this.end = end; }

    public double getCost() { return cost; }
    public void setCost(double cost) { this.cost = cost; }
}
