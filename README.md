# Routing Algorithm Tool (Spring Boot + Modular JavaScript)

A full-stack **routing visualization and algorithm simulation tool** for **Dijkstra’s** and **Bellman-Ford** algorithms, powered by a **Spring Boot backend** and a modular JavaScript frontend.

The project now features a clean separation: all algorithm computation is performed in the backend, while the frontend is responsible for UI, visualization, and user interaction. The frontend code is fully modular and no longer contains any algorithm logic.

---

## 🚀 Features

### 🧠 Algorithms
- **Dijkstra’s Algorithm** – Finds the shortest path in graphs with non-negative weights.
- **Bellman-Ford Algorithm** – Handles graphs with negative edge weights.

### ⚙️ Architecture
- **Frontend:** HTML, CSS, Modular JavaScript (Canvas-based visualization, UI only)
- **Backend:** Java + Spring Boot (REST API, all algorithm logic)
- **Communication:** Frontend sends the graph (nodes + edges) to the backend; backend computes and returns results for visualization.

### 🌐 REST API Endpoints
| Endpoint | Method | Description |
|-----------|---------|-------------|
| `/api/routing/dijkstra` | `POST` | Computes the shortest path using Dijkstra’s algorithm |
| `/api/routing/bellman-ford` | `POST` | Computes shortest paths using Bellman-Ford |
| `/api/graph/validate` | `POST` | Validates graph connectivity and edge weights |
| `/api/scenarios` | `GET / POST` | Save and retrieve graph scenarios (in-memory) |
| `/` | `GET` | Serves the main frontend UI |

---

## 🧩 How It Works

1. **Visualize**
   - Create nodes and edges interactively on the canvas UI.
   - Assign weights to each edge.

2. **Compute**
   - Choose either **Dijkstra** or **Bellman-Ford**.
   - The frontend sends the network graph to the backend:
     ```json
     {
       "startNode": 0,
       "endNode": 4,
       "nodes": [...],
       "edges": [...]
     }
     ```
   - The Spring Boot backend processes the request, runs the algorithm in Java, and returns:
     ```json
     {
       "shortestPath": [0, 1, 4],
       "totalCost": 7.5
     }
     ```

3. **Visualize the Result**
   - The returned path is highlighted in the UI.
   - The total cost is displayed visually on the canvas.

---

## 🏗️ Project Structure

```text
Spring_routing_algo/
├── backend/
│   └── routing-backend/
│       ├── pom.xml
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/marko/routing_backend/
│       │   │   │   ├── controller/              # REST endpoints
│       │   │   │   ├── service/                 # Dijkstra + Bellman-Ford logic
│       │   │   │   ├── dto/                     # Data Transfer Objects
│       │   │   │   └── RoutingBackendApplication.java
│       │   │   └── resources/
│       │   │       ├── static/                  # Frontend served by Spring Boot
│       │   │       │   ├── index.html
│       │   │       │   ├── routing.html
│       │   │       │   ├── tutorial.html
│       │   │       │   ├── styles.css
│       │   │       │   ├── main.mod.js
│       │   │       │   ├── js/
│       │   │       │   │   ├── graphModel.js
│       │   │       │   │   ├── renderer.js
│       │   │       │   │   ├── api.js
│       │   │       │   └── assets/
│       │   │       └── application.properties
│       │   └── test/
│       │       └── ...
└── README.md
```

---

## 🧰 Prerequisites

Before running, make sure you have:

| Tool | Version | Download |
|------|----------|-----------|
| **Java** | 17 or newer | [Download JDK](https://adoptium.net/) |
| **Maven** | 3.9+ | [Download Maven](https://maven.apache.org/download.cgi) |
| **Git** | Latest | [Download Git](https://git-scm.com/downloads) |
| *(Optional)* **VS Code / IntelliJ IDEA** | — | For editing and running the project |

---

## 🚀 Run the Application Locally

### 1️⃣ Clone the repository

```powershell
git clone https://github.com/MarkoVrljes/Spring_routing_algo.git
```
### 2️⃣ Navigate into the backend project

```powershell
cd Spring_routing_algo/backend/routing-backend
```

### 3️⃣ Clean and Run the Spring Boot application

```powershell
./mvnw.cmd clean package
./mvnw.cmd spring-boot:run
```

### ⏳ Wait for the console message:

```
Started RoutingBackendApplication on port 8080
```

### 4️⃣ Open in your browser

- Landing page: `http://localhost:8080/` (for `index.html`)
- Visualizer: `http://localhost:8080/routing.html`

#### Optional - Run tests:

```powershell
./mvnw.cmd test
```

## Debugging tips

- If `/api/routing/dijkstra` or `/api/routing/bellman-ford` returns 400/500, check the browser DevTools → Network tab for request/response details. Validation errors return 400 with a message.
- To see server-side stacktraces, watch the terminal running `./mvnw.cmd spring-boot:run` — unexpected errors are logged there.

---

## Notes

- The frontend is now fully modular and contains only UI/UX and visualization logic. All algorithm computation is performed in the backend.
- For a full enterprise separation, consider splitting frontend and backend into separate projects in the future.