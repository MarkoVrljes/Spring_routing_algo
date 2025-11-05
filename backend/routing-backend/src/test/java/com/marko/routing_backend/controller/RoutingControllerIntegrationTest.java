package com.marko.routing_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marko.routing_backend.dto.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Objects;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class RoutingControllerIntegrationTest {

    private static final MediaType APPLICATION_JSON_UTF8 = MediaType.APPLICATION_JSON;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;
    
    @NonNull
    private String toJson(@NonNull Object obj) {
        try {
            String json = objectMapper.writeValueAsString(obj);
            return Objects.requireNonNull(json, "JSON serialization resulted in null");
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert object to JSON", e);
        }
    }

    @Test
    void whenValidDijkstraRequest_thenReturnsValidResponse() throws Exception {
        // Prepare test data
        GraphOperationRequest request = new GraphOperationRequest();
        request.setNodes(Arrays.asList(
            new NodeDto(0, 0, 0, "N0"),
            new NodeDto(1, 100, 100, "N1"),
            new NodeDto(2, 200, 200, "N2")
        ));
        request.setEdges(Arrays.asList(
            new EdgeDto(0, 1, 5),
            new EdgeDto(1, 2, 3)
        ));
        request.setStartNode(0);
        request.setEndNode(2);
        request.setOperation("dijkstra");

        // Perform request and validate response
        mockMvc.perform(post("/api/routing/dijkstra")
                .contentType(Objects.requireNonNull(APPLICATION_JSON_UTF8))
                .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.shortestPath").isArray())
                .andExpect(jsonPath("$.steps").isArray())
                .andExpect(jsonPath("$.totalCost").isNumber());
    }

    @Test
    void whenInvalidRequest_thenReturnsBadRequest() throws Exception {
        GraphOperationRequest request = new GraphOperationRequest();
        // Missing required fields

        mockMvc.perform(post("/api/routing/dijkstra")
                .contentType(Objects.requireNonNull(APPLICATION_JSON_UTF8))
                .content(toJson(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void whenNegativeEdgesInDijkstra_thenReturnsBadRequest() throws Exception {
        GraphOperationRequest request = new GraphOperationRequest();
        request.setNodes(Arrays.asList(
            new NodeDto(0, 0, 0, "N0"),
            new NodeDto(1, 100, 100, "N1")
        ));
        request.setEdges(Arrays.asList(
            new EdgeDto(0, 1, -5)  // Negative edge
        ));
        request.setStartNode(0);
        request.setEndNode(1);
        request.setOperation("dijkstra");

        mockMvc.perform(post("/api/routing/dijkstra")
                .contentType(Objects.requireNonNull(APPLICATION_JSON_UTF8))
                .content(toJson(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }
    
    @Test
    void whenDisconnectedGraphInDijkstra_thenReturnsError() throws Exception {
        GraphOperationRequest request = new GraphOperationRequest();
        request.setNodes(Arrays.asList(
            new NodeDto(0, 0, 0, "N0"),
            new NodeDto(1, 100, 100, "N1"),
            new NodeDto(2, 200, 200, "N2")
        ));
        request.setEdges(Arrays.asList(
            new EdgeDto(0, 1, 5) // No path to node 2
        ));
        request.setStartNode(0);
        request.setEndNode(2);
        request.setOperation("dijkstra");

        mockMvc.perform(post("/api/routing/dijkstra")
                .contentType(Objects.requireNonNull(APPLICATION_JSON_UTF8))
                .content(toJson(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("No path exists between the selected nodes"));
    }
}