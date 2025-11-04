# AI Agent Instructions for Spring Routing Algorithm Project

This project is an educational interactive tool for visualizing and understanding network routing algorithms (Dijkstra and Bellman-Ford). The tool provides a web-based interface for creating network graphs and visualizing how different routing algorithms work.

## Project Structure

- `main.js`: Core application logic containing graph manipulation and algorithm implementations
- `index.html`: Landing page with algorithm explanations
- `routing.html`: Interactive sandbox for algorithm visualization
- `tutorial.html`: Step-by-step guide for using the tool
- `styles.css`: Application styling
- `assets/`: Contains images and icons (e.g., router.png)

## Key Components

### Graph Visualization and Interaction
- Canvas-based network graph rendering in `main.js`
- Node representation: Router icons with node IDs
- Edge representation: Lines with cost labels
- Interactive features: Node dragging, edge creation, graph clearing

### Algorithm Implementation
1. Dijkstra's Algorithm (Centralized)
   - Implementation in `RunDijkstra()` function
   - Handles positive edge costs only
   - Animation sequence stored in `searchPath`
   - State tracking in `Dijsktra` array

2. Bellman-Ford Algorithm (Decentralized)
   - Implementation in `DvAlgorithm()` function
   - Handles both positive and negative edge costs
   - Network state stored in `DVgraph` object
   - Distance/predecessor history for visualization

### Animation System
- Step-by-step visualization using `animationStack`
- Table updates through `infoTableStacks`
- Color coding: gray (default), rgba(146,55,55,1) (searching), gold (final path)

## Common Operations

1. Adding new graph features:
   ```javascript
   // Add to nodes array
   nodes.push({x: xPos, y: yPos, size: 50});
   // Add to edges array
   edges.push({start: startNode, end: endNode, cost: cost, color: "gray"});
   ```

2. Algorithm visualization updates:
   - Update animation stacks (`animationStack`, `infoTableStacks`)
   - Call `draw()` to refresh canvas
   - Use `updateInfoTable()` for step display

## Project Conventions

1. Edge handling:
   - Bidirectional edges automatically created
   - Multiple edges between same nodes supported
   - Self-loops drawn as ellipses

2. Graph validation:
   - `isConnected()` checks graph connectivity
   - `negativeEdges()` validates for Dijkstra's algorithm

3. Error handling:
   - Validate node indices before operations
   - Check graph connectivity before algorithm execution
   - Block edits during animation playback

## Common Issues & Solutions

1. Graph Connectivity:
   - Always validate with `isConnected()` before running algorithms
   - Ensure all nodes have at least one edge

2. Algorithm Limitations:
   - Dijkstra's algorithm fails with negative edges
   - Animation state must be reset between runs