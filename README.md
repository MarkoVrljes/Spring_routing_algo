# Routing Algorithm Tool (Spring Boot + JavaScript)

A full-stack **routing visualization and algorithm simulation tool** that demonstrates **Dijkstra’s** and **Bellman-Ford** algorithms powered by a **Spring Boot backend**.

Originally a front-end only project, this upgraded version integrates **Java, Spring Boot REST APIs, and dynamic front-end visualization** to simulate how routing and optimization systems in financial and network environments work.

---

## 🚀 Features

### 🧠 Algorithms
- **Dijkstra’s Algorithm** – Finds the shortest path in graphs with non-negative weights.
- **Bellman-Ford Algorithm** – Handles graphs with negative edge weights.

### ⚙️ Architecture
- **Frontend:** HTML, CSS, JavaScript (Canvas-based visualization)
- **Backend:** Java + Spring Boot (REST API)
- **Communication:** Frontend sends the graph (nodes + edges) to the backend; the backend computes and returns the optimal path.

### 🌐 REST API Endpoints
| Endpoint | Method | Description |
|-----------|---------|-------------|
| `/api/routing/dijkstra` | `POST` | Computes the shortest path using Dijkstra’s algorithm |
| `/api/routing/hints` | `POST` | Returns optimization hints based on the graph (AI-style helper) |
| `/api/scenarios` | `GET / POST` | Save and retrieve graph scenarios (in-memory for now) |
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
       "start": 0,
       "end": 4,
       "nodes": [...],
       "edges": [...]
     }
     ```
   - The Spring Boot backend processes the request, runs the algorithm in Java, and returns:
     ```json
     {
       "path": [0, 1, 4],
       "totalCost": 7.5
     }
     ```

3. **Visualize the Result**
   - The returned path is highlighted in the UI.
   - The total cost is displayed below the canvas.

---

## 🏗️ Project Structure

Spring_routing_algo/
├── backend/
│ └── routing-backend/
│ ├── pom.xml
│ ├── src/
│ │ ├── main/
│ │ │ ├── java/com/marko/routing_backend/
│ │ │ │ ├── controller/      # REST endpoints
│ │ │ │ ├── service/         # Dijkstra + Bellman-Ford logic
│ │ │ │ ├── dto/             # Data Transfer Objects
│ │ │ │ └── RoutingBackendApplication.java
│ │ │ └── resources/
│ │ │ ├── static/            # Frontend served by Spring Boot
│ │ │ │ ├── index.html
│ │ │ │ ├── main.js
│ │ │ │ ├── styles.css
│ │ │ │ ├── about.html
│ │ │ │ ├── tutorial.html
│ │ │ │ └── assets/
│ │ │ └── application.properties
│ │ └── test/
│ │ └── ...
└── README.md

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

- git clone https://github.com/MarkoVrljes/Spring_routing_algo.git

### 2️⃣ Navigate into the backend project

- cd Spring_routing_algo/backend/routing-backend

### 3️⃣ Clean and Run the Spring Boot application

- mvn clean package
- mvn spring-boot:run

### ⏳ Wait for the console message:

- Started RoutingBackendApplication on port 8080

### 4️⃣ Open in your browser

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