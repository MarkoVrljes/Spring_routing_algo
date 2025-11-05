package com.marko.routing_backend.service;

import com.marko.routing_backend.dto.EdgeDto;
import com.marko.routing_backend.dto.GraphOperationRequest;
import com.marko.routing_backend.dto.NodeDto;
import com.marko.routing_backend.exception.GraphValidationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
public class GraphServiceTest {

    @InjectMocks
    private GraphService graphService;

    @Test
    void whenGraphHasNegativeEdges_thenDetectCorrectly() {
        // Prepare test data
        List<EdgeDto> edges = Arrays.asList(
            new EdgeDto(0, 1, 5),
            new EdgeDto(1, 2, -3),
            new EdgeDto(2, 3, 4)
        );

        assertTrue(graphService.hasNegativeEdges(edges), "Should detect negative edge");
    }

    @Test
    void whenGraphIsNotConnected_thenDetectCorrectly() {
        // Prepare test data
        List<EdgeDto> edges = Arrays.asList(
            new EdgeDto(0, 1, 5),  // Connected component 1
            new EdgeDto(2, 3, 4)   // Connected component 2
        );

        assertFalse(graphService.isConnected(edges, 4), "Should detect disconnected graph");
    }

    @Test
    void whenGraphValidationFails_thenThrowException() {
        // Prepare invalid request
        GraphOperationRequest request = new GraphOperationRequest();
        request.setNodes(null);
        request.setEdges(null);

        assertThrows(GraphValidationException.class, () -> {
            graphService.validateRequest(request);
        });
    }

    @Test
    void whenValidGraph_thenPassValidation() {
        // Prepare valid request
        GraphOperationRequest request = new GraphOperationRequest();
        request.setNodes(Arrays.asList(
            new NodeDto(0, 0, 0, "N0"),
            new NodeDto(1, 1, 1, "N1")
        ));
        request.setEdges(Arrays.asList(
            new EdgeDto(0, 1, 5)
        ));
        request.setStartNode(0);
        request.setOperation("dijkstra");

        assertDoesNotThrow(() -> graphService.validateRequest(request));
    }
}