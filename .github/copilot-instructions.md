# AI Agent Instructions for Spring Routing Algorithm Project

This project is an educational interactive tool for visualizing and understanding network routing algorithms (Dijkstra and Bellman-Ford). The tool provides a web-based interface for creating network graphs and visualizing how different routing algorithms work.

## Project Structure

- `main.js`: Core application logic containing graph manipulation and algorithm implementations
- `index.html`: Landing page with algorithm explanations
- `routing.html`: Interactive sandbox for algorithm visualization
- `tutorial.html`: Step-by-step guide for using the tool
```markdown
# AI Agent instructions — Spring_routing_algo (concise)

This repository is an educational routing-algorithm sandbox (Dijkstra + Bellman-Ford) with a small Spring Boot backend. The UI is plain HTML/JS (canvas) and lives under the app's static resources.

Key facts an AI agent should know (quick):
- Frontend UI: `src/main/resources/static/` (also `routing.html`, `index.html`, `tutorial.html`, `styles.css`, `assets/`). The interactive logic is in `main.js` (canvas, nodes/edges, animation).
- Algorithms are implemented client-side in `main.js`:
  - RunDijkstra(start,end): uses `Dijsktra` array, `unprocessedNodes`, returns {searching, distanceHistory, predecessorHistory, answer}.
  - DvAlgorithm(source): uses `DVgraph` (adjacency map built by `initializeDv()`), returns {distances, distanceHistory, predecessorHistory, searching}.
- Data shapes you will encounter:
  - nodes: [{x:number,y:number,size:number}]
  - edges: [{start:int,end:int,cost:number,color:string}] (multiple edges and self-loops allowed)
  - DVgraph: { nodeIndex: { neighborIndex: cost, ... }, ... }

How to run & debug (Windows PowerShell):
1. Backend (Spring Boot, Maven wrapper):
   - Open a shell at `backend\routing-backend` and run:
```powershell
cd backend\routing-backend
.\mvnw.cmd clean package
.\mvnw.cmd spring-boot:run
```
   - The app serves static files from `src/main/resources/static` on port 8080 by default. If you see a Spring "Whitelabel Error Page", check the backend logs for stack traces and that `routing.html` exists under `src/main/resources/static`.
2. Frontend: static files are server-served. With the backend running, open `http://localhost:8080/routing.html` (or `index.html`) in a browser.

Build & tests:
- Run unit tests from `backend\routing-backend` with `.\mvnw.cmd test`.

Project-specific conventions & gotchas (do not change assumptions silently):
- Dijkstra is implemented to refuse negative edges: callers call `negativeEdges()` before `RunDijkstra()`.
- Animation & table stacks use LIFO: code often pushes reversed histories and uses `pop()` in the UI; when modifying, keep push/pop ordering consistent (`animationStack`, `infoTableStacks.distanceStack` / `predecessorStack`).
- UI input uses `prompt()` and regex parsing (e.g., `prompt(...).match(/\d+/)[0]`) — validate inputs if you change flows.
- Edges can be duplicated and self-loop costs are supported; `minCost(n1,n2)` is used to pick the edge cost when multiple edges connect the same pair.

Where to edit for common tasks:
- Add/change visualization or algorithm steps: edit `main.js` (top-level functions: `RunDijkstra`, `DvAlgorithm`, `initializeDv`, `animateEdge`, `updateInfoTable`).
- Change static UI or CSS: `src/main/resources/static/*.html`, `styles.css`.
- Add a backend endpoint or change server behavior: `backend/routing-backend/src/main/java/com/marko/routing_backend/controller/RoutingController.java` and `service/RoutingService.java`.

Troubleshooting tips (observed issues):
- "Whitelabel Error Page": backend returned an error; check `backend\routing-backend` logs and ensure static files are present in `src/main/resources/static` and that `application.properties` didn't change the servlet mappings.
- If animation doesn't start: ensure `animationStack` is not empty and `running` flag is managed via `toggleAnimationMode()`.

When editing: keep changes small and run the backend tests; for frontend JS edits, open the page in the browser and use devtools console — many behaviors are driven by runtime prompts and DOM element IDs (see top of `main.js` for element ids: `addEdge`, `run_Bellman_algorithm`, `run_Dijkstra_algorithm`, etc.).

If something's unclear, ask for the specific file or behavior to inspect; include small diffs and a quick runtime reproduction (browser console logs + backend logs) so a human can validate.
``` 