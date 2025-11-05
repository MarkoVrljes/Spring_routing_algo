# Routing Algorithm Visualizer (Spring_routing_algo)

This is an educational interactive tool designed to help students better understand routing algorithms. 
With our tool, users can create a network and explore two distinct routing algorithms ( Centralized and Decentralized Algorithms). 
Our user-friendly interface provides students with an improved visualization experience, allowing them to gain a deeper understanding of routing algorithm concepts.


This repository contains an interactive routing algorithm visualizer (Dijkstra + Bellman-Ford) with a Spring Boot backend. The backend provides REST endpoints, OpenAPI documentation, server-side validation, and an H2-backed persistence layer for scenarios.

## Quick overview

- Frontend static UI: `backend/routing-backend/src/main/resources/static/` (includes `index.html`, `routing.html`, `main.js`, `styles.css`).
- Backend: `backend/routing-backend/src/main/java/com/marko/routing_backend/` (controllers, services, DTOs, config).
- OpenAPI/Swagger UI: `/swagger-ui.html` (interactive API docs) and `/api-docs` (OpenAPI JSON).

## Notable features (recent updates)

- Root `/` forwards to the `index.html` landing page.
- Server-side validation for incoming graph payloads (node/edge index checks, negative edges handling).
- Global exception handling returns structured JSON errors. Validation problems return HTTP 400 with a helpful message.
- H2 embedded database is enabled (persists scenarios) and H2 console available at `/h2-console`.
- Improved logging for unexpected errors (stacktraces are written to server logs).

## REST endpoints

- POST `/api/graph/validate` — validate incoming graph payloads
- POST `/api/routing/dijkstra` — run Dijkstra (returns simulation steps and final result)
- POST `/api/routing/bellman-ford` — run Bellman-Ford
- GET `/api/scenarios` — list saved scenarios
- POST `/api/scenarios` — save a named scenario

Error responses use a consistent JSON envelope: `{ status, error, message, field, timestamp }`.

## Run the application (Windows PowerShell)

1. Build and run the backend:

```powershell
cd C:\Users\Marko\Desktop\Projects\Spring_routing_algo\backend\routing-backend
.\mvnw.cmd clean package
.\mvnw.cmd spring-boot:run
```

2. Open in browser:

- Landing page: `http://localhost:8080/` (for `index.html`)
- Visualizer: `http://localhost:8080/routing.html`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 console: `http://localhost:8080/h2-console`

3. Run tests:

```powershell
.\mvnw.cmd test
```

If the H2 DB file is locked on startup, stop other Java processes or start Spring Boot after killing java.exe processes. The H2 DB file lives in `backend/routing-backend/data/` by default.

## Debugging tips

- If `/api-docs` or Swagger UI fails with a 500, check the server logs for stacktraces related to OpenAPI and ensure `OpenApiConfig` is valid.
- If `/api/routing/dijkstra` returns 500, open browser DevTools → Network and inspect the request payload (Payload tab) and response body. Validation errors should now return 400 with a message.
- To see server-side stacktraces, watch the terminal running `mvnw.cmd spring-boot:run` — unexpected errors are logged there.

## Development notes

- Server-side validation was added in `GraphService.validateRequest` to ensure edges reference valid node indices and that operation strings are handled null-safely.
- `GlobalExceptionHandler` now handles `IllegalArgumentException` and logs unexpected exceptions for easier debugging.