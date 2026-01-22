# Spring Routing Algo

Full-stack routing visualizer for Dijkstra and Bellman-Ford algorithms. The Spring Boot backend computes paths, while the modular JavaScript frontend renders the graph and results.

## Highlights

- Dijkstra and Bellman-Ford routing with clear visual feedback
- Spring Boot REST API for computation and validation
- Modular JS frontend with Canvas-based visualization
- Simple local run flow

## Quickstart

1) Run the backend:

```powershell
cd backend/routing-backend
./mvnw.cmd spring-boot:run
```

2) Open in your browser:

- Landing page: http://localhost:8080/
- Visualizer: http://localhost:8080/routing.html

## API Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/routing/dijkstra` | `POST` | Compute shortest path with Dijkstra |
| `/api/routing/bellman-ford` | `POST` | Compute shortest paths with Bellman-Ford |
| `/api/graph/validate` | `POST` | Validate graph connectivity and weights |
| `/api/scenarios` | `GET` / `POST` | Save and retrieve graph scenarios |
| `/` | `GET` | Serve the frontend UI |

## Project Structure

```text
Spring_routing_algo/
  backend/routing-backend/
    src/main/java/com/marko/routing_backend/
      controller/
      service/
      dto/
    src/main/resources/static/
      index.html
      routing.html
      tutorial.html
      styles.css
      main.mod.js
      js/
```

## Notes

- The frontend handles UI and visualization only; algorithms run in the backend.
- For full separation, the frontend could be extracted into its own project.
