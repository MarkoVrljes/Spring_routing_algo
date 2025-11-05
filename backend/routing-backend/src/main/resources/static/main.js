const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

context.font = "20pt Consolas";
let routerIcon;

const nodes = [{
        "x": 157,
        "y": 440,
        "size": 50
    },
    {
        "x": 365,
        "y": 217,
        "size": 50
    },
    {
        "x": 419,
        "y": 451,
        "size": 50
    },
    {
        "x": 539,
        "y": 256,
        "size": 50
    },
    {
        "x": 800,
        "y": 250,
        "size": 50
    },
    {
        "x": 650,
        "y": 400,
        "size": 50
    },
    {
        "x": 800,
        "y": 100,
        "size": 50
    }
];
const edges = [{
        "start": 0,
        "end": 1,
        "cost": 3,
        "color": "gray",
    },
    {
        "start": 0,
        "end": 3,
        "cost": 9,
        "color": "gray",
    },
    {
        "start": 0,
        "end": 2,
        "cost": 1,
        "color": "gray",
    },
    {
        "start": 1,
        "end": 3,
        "cost": 1,
        "color": "gray",
    },
    {
        "start": 2,
        "end": 3,
        "cost": 4,
        "color": "gray",
    },
    {
        "start": 4,
        "end": 5,
        "cost": 4,
        "color": "gray",
    },
    {
        "start": 5,
        "end": 6,
        "cost": 5,
        "color": "gray",
    },
    {
        "start": 6,
        "end": 4,
        "cost": 9,
        "color": "gray",
    },
    {
        "start": 5,
        "end": 2,
        "cost": 4,
        "color": "gray",
    },
    {
        "start": 5,
        "end": 5,
        "cost": 3,
        "color": "gray",
    },
    {
        "start": 1,
        "end": 0,
        "cost": 1,
        "color": "gray",
    },
    {
        "start": 5,
        "end": 6,
        "cost": 3,
        "color": "gray",
    }
];

const actions = [];
const addEdgeButton = document.getElementById("addEdge");
const clearButton = document.getElementById("clear");
const undoButton = document.getElementById("undo");
const decentralize = document.getElementById("run_Bellman_algorithm");
const centralize = document.getElementById("run_Dijkstra_algorithm");
const randomGraphButton = document.getElementById("randomGraph");

// Animation Buttons
const stepButton = document.getElementById("stepButton");
const exitButton = document.getElementById("exitButton");

// Animation Info Div
const animationInfoDiv = document.getElementById("infoDiv");
const infoTitle = document.getElementById("infoTitle");
const infoParameters = document.getElementById("infoParameters");
const infoTable = document.querySelector("#infoTable tbody");

// Animation globals
let animationStack = [];
let animationCallback = null;
let infoTableStacks = {};
let running = false;

// Canvas globals
let draggingNode = null;
let lastAction = null;


function getNodeIndex(x, y) {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const dx = node.x - x;
        const dy = node.y - y;
        if (dx * dx + dy * dy <= node.size * node.size) {
            return i;
        }
    }
    return -1;
}

canvas.addEventListener("mousedown", event => {
    if (running) {
        alert("Can't edit Network while animating!\nPress the \"Exit Animation\" Button to make Network editable.");
        return;
    }
    const x = event.offsetX;
    const y = event.offsetY;
    const nodeIndex = getNodeIndex(x, y);
    if (nodeIndex !== -1) {
        draggingNode = nodes[nodeIndex];
        lastAction = {
            type: "dragNode",
            data: {
                index: nodeIndex,
                x: draggingNode.x,
                y: draggingNode.y
            }
        };
        console.log("node dragged!", lastAction)
    } else {
        if (running) return;
        const node = {
            x,
            y,
            size: 50
        };
        nodes.push(node);
        DVgraph[nodes.length - 1] = {};
        lastAction = {
            type: "addNode",
            data: {
                index: nodes.length - 1
            }
        };
    }
    actions.push(lastAction);
    draw();
});

canvas.addEventListener("mousemove", event => {
    if (draggingNode) {
        const x = event.offsetX;
        const y = event.offsetY;
        draggingNode.x = x;
        draggingNode.y = y;
        // lastAction.data.x = x;
        // lastAction.data.y = y;
        draw();
    }
});

canvas.addEventListener("mouseup", event => {
    draggingNode = null;
});

randomGraphButton.addEventListener("click", async () => {
    lastAction = {
        type: "clear",
        data: {
            nodes: [...nodes],
            edges: [...edges]
        }
    };
    nodes.length = 0;
    edges.length = 0;

    actions.push(lastAction);

    const numNodes = Math.floor(Math.random() * 10 + 3)
    const minDistance = 100;
    const margin = 100;
    const innerWidth = canvas.width - margin * 2;
    const innerHeight = canvas.height - margin * 2;
    
    // Generate nodes with minimum distance between them
    for (let i = 0; i < numNodes; i++) {
        let x, y;
        do {
            x = Math.random() * innerWidth + margin;
            y = Math.random() * innerHeight + margin;

            tooClose = nodes.some(node => {
                return distanceBetweenNodes(x, y, node.x, node.y) < minDistance;
            });
        }
        while (tooClose);

        nodes.push({
            x: x,
            y: y,
            size: 50,
        });
    }

    // Generate edges
    const numEdges = Math.floor(Math.random() * ((numNodes * (numNodes - 1)) / 2));
    const maxCost = 100;
    for (let i = 0; i < numEdges; i++) {
        edges.push({
            start: Math.floor(Math.random() * numNodes),
            end: Math.floor(Math.random() * numNodes),
            cost: Math.floor(Math.random() * maxCost),
            color: "gray",
        });
    }

    // Validate the generated graph
    try {
        const graphRequest = {
            nodes: nodes.map((n, idx) => ({ id: idx, x: n.x, y: n.y, label: `N${idx}` })),
            edges: edges.map(e => ({ start: e.start, end: e.end, cost: e.cost }))
        };

        const validation = await window.api.validateGraph(graphRequest);
        if (!validation.connected) {
            // If not connected, add minimum edges to ensure connectivity
            for (let i = 1; i < numNodes; i++) {
                edges.push({
                    start: i - 1,
                    end: i,
                    cost: Math.floor(Math.random() * maxCost),
                    color: "gray"
                });
            }
        }
    } catch (err) {
        console.error('Error validating random graph:', err);
    }

    draw();
})

function distanceBetweenNodes(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}


centralize.addEventListener("click", async () => {
    const start = parseInt(prompt("Enter start node index:")?.match(/\d+/)?.[0]);
    const end = parseInt(prompt("Enter end node index:")?.match(/\d+/)?.[0]);
    if (!isNaN(start) && !isNaN(end) &&
        start >= 0 && start < nodes.length &&
        end >= 0 && end < nodes.length && start != end) {

        const graphRequest = {
            startNode: start,
            endNode: end,
            nodes: nodes.map((n, idx) => ({ id: idx, x: n.x, y: n.y, label: `N${idx}` })),
            edges: edges.map(e => ({ start: e.start, end: e.end, cost: e.cost })),
        };

        try {
            // First validate the graph
            const validation = await window.api.validateGraph(graphRequest);
            if (!validation.valid) {
                alert(validation.error);
                return;
            }

            if (validation.hasNegativeEdges) {
                alert("Dijkstra's Algorithm isn't meant for graphs with negative edges!");
                return;
            }

            if (!validation.connected) {
                alert("Please use a connected graph for Dijkstra's Algorithm");
                return;
            }

            // Call backend Dijkstra
            const result = await window.api.runDijkstra(graphRequest);
            if (!result.success) {
                alert(result.error);
                return;
            }

            // Process simulation steps
            if (!result.steps || result.steps.length === 0) {
                alert('No path found');
                return;
            }

            // Map simulation steps to animation steps
            const animationEdges = [];
            result.steps.forEach(step => {
                if (step.visitedEdgeIndices) {
                    animationEdges.push(...step.visitedEdgeIndices);
                }
            });

            infoTableStacks = {
                distanceStack: result.steps.map(step => Object.values(step.distances)).reverse(),
                predecessorStack: result.steps.map(step => Object.values(step.predecessors)).reverse()
            };

            infoTitle.innerHTML = "Dijkstra Table (BACKEND)";
            infoParameters.innerHTML = `Start: <b>N${start}</b> End: <b>N${end}</b>`;

            // Prepare animation
            animationStack = animationStack.concat(animationEdges.reverse());
            toggleAnimationMode();

            // Final callback to highlight shortest path
            animationCallback = () => {
                if (result.shortestPath && result.shortestPath.length > 1) {
                    // Color the edges in the shortest path
                    for (let i = 1; i < result.shortestPath.length; i++) {
                        const a = result.shortestPath[i - 1];
                        const b = result.shortestPath[i];
                        const ei = edges.findIndex(edge => (
                            (edge.start === a && edge.end === b) || (edge.start === b && edge.end === a)
                        ));
                        if (ei >= 0) edges[ei].color = "gold";
                    }
                    draw();
                }
            };

        } catch (err) {
            console.error('Error running Dijkstra:', err);
            alert('Backend error: ' + err.message);
        }
    }
});

decentralize.addEventListener("click", async () => {
    const start = parseInt(prompt("Enter start node index:")?.match(/\d+/)?.[0]);
    const end = parseInt(prompt("Enter end node index:")?.match(/\d+/)?.[0]);
    
    if (!isNaN(start) && !isNaN(end) &&
        start >= 0 && start < nodes.length &&
        end >= 0 && end < nodes.length) {

        const graphRequest = {
            startNode: start,
            endNode: end,
            nodes: nodes.map((n, idx) => ({ id: idx, x: n.x, y: n.y, label: `N${idx}` })),
            edges: edges.map(e => ({ start: e.start, end: e.end, cost: e.cost }))
        };

        try {
            // First validate the graph
            const validation = await window.api.validateGraph(graphRequest);
            if (!validation.valid) {
                alert(validation.error);
                return;
            }

            // Call backend Bellman-Ford
            const result = await window.api.runBellmanFord(graphRequest);
            if (!result.success) {
                alert(result.error);
                return;
            }

            // Process simulation steps
            const animationEdges = [];
            result.steps.forEach(step => {
                if (step.visitedEdgeIndices) {
                    animationEdges.push(...step.visitedEdgeIndices);
                }
            });

            animationStack = animationStack.concat(animationEdges.reverse());
            infoTableStacks = {
                distanceStack: result.steps.map(step => Object.values(step.distances)).reverse(),
                predecessorStack: result.steps.map(step => Object.values(step.predecessors)).reverse()
            };

            infoTitle.innerHTML = "Bellman-Ford Table (BACKEND)";
            infoParameters.innerHTML = `Start: <b>N${start}</b> End: <b>N${end}</b>`;
            toggleAnimationMode();

            animationCallback = () => {
                const finalDistances = result.finalDistances;
                nodes.forEach((node, i) => {
                    context.fillStyle = "rgba(255, 255, 255, 0.7)";
                    context.fillRect(node.x - 35, node.y, 140, 50);
                    context.fillStyle = "black";
                    context.textAlign = 'center';
                    context.fillText("Cost: " + finalDistances[i], node.x + 35, node.y + 35);
                });
            };
        } catch (err) {
            console.error('Error running Bellman-Ford:', err);
            alert('Backend error: ' + err.message);
        }
    }
})

function toggleAnimationMode() {
    running = !running;
    addEdgeButton.disabled = running;
    clearButton.disabled = running;
    undoButton.disabled = running;
    decentralize.disabled = running;
    centralize.disabled = running;
    randomGraphButton.disabled = running;

    if (running) {
        stepButton.style.display = "inline-block";
        stepButton.disabled = false;
        exitButton.style.display = "inline-block";
        animationInfoDiv.style.display = "inline-block";

        initializeInfoTable();
    } else {
        stepButton.style.display = "none";
        exitButton.style.display = "none";
        animationInfoDiv.style.display = "none";
    }
}

function finishAnimation() {
    stepButton.disabled = true;
    if (typeof animationCallback === "function") animationCallback();
    animationCallback = null;
}

function animateEdge() {
    if (animationStack.length == 0) {
        finishAnimation();
        return;
    }
    edges[animationStack.pop()].color = "rgba(146,55,55,1)";
    draw();
}

function initializeInfoTable() {
    console.log("pred, dist");
    console.log([...infoTableStacks.predecessorStack]);
    console.log([...infoTableStacks.distanceStack]);
    document.querySelector("#infoTable tbody").innerHTML = "";
    firstDistances = infoTableStacks.distanceStack.pop();
    firstPredecessors = infoTableStacks.predecessorStack.pop();
    const numRows = nodes.length;
    for (let i = 0; i < numRows; i++) {
        const row = infoTable.insertRow();
        const vertexCell = row.insertCell();
        const distanceCell = row.insertCell();
        const predecessorCell = row.insertCell();

        distanceCell.className = "distance";
        distanceCell.setAttribute("last", firstDistances[i]);
        predecessorCell.className = "predecessor";
        if (firstPredecessors[i] !== null) {
            predecessorCell.setAttribute("last", firstPredecessors[i]);
        } else {
            predecessorCell.setAttribute("last", "null");
        }

        vertexCell.textContent = "N" + i;
        distanceCell.textContent = firstDistances[i];
        predecessorCell.textContent = "null";
    }
}

function updateInfoTable() {
    if (infoTableStacks.distanceStack.length === 0) return;
    nextDistances = infoTableStacks.distanceStack.pop();
    nextPredecessors = infoTableStacks.predecessorStack.pop();

    const tableBody = document.querySelector("#infoTable tbody");

    const numRows = nodes.length;
    for (let i = 0; i < numRows; i++) {
        const distanceCell = tableBody.rows[i].cells[1];
        const predecessorCell = tableBody.rows[i].cells[2];


        if (Number(distanceCell.getAttribute("last")) !== nextDistances[i]) {
            distanceCell.innerHTML = "<strike>" + distanceCell.innerHTML + "</strike> " + nextDistances[i];
            distanceCell.setAttribute("last", nextDistances[i]);
        }

        if (parseInt(predecessorCell.getAttribute("last")) !== parseInt(nextPredecessors[i])) {
            if (nextPredecessors[i] !== null && predecessorCell.getAttribute("last") === "null") {
                predecessorCell.innerHTML = "<strike>" + predecessorCell.innerHTML + "</strike> N" + nextPredecessors[i];
            } else if (nextPredecessors[i] !== null) {
                predecessorCell.innerHTML = "<strike>" + predecessorCell.innerHTML + "</strike> N" + nextPredecessors[i];
            }
            predecessorCell.setAttribute("last", nextPredecessors[i]);
        }

    }

}

stepButton.addEventListener("click", () => {
    animateEdge();
    updateInfoTable();
})

exitButton.addEventListener("click", () => {
    toggleAnimationMode();
    edges.forEach(edge => edge.color = "gray");
    draw();
})



addEdgeButton.addEventListener("click", () => {
    const start = parseInt(prompt("Enter start node index:")?.match(/\d+/)?.[0]);
    const end = parseInt(prompt("Enter end node index:")?.match(/\d+/)?.[0]);
    const cost = parseInt(prompt("Enter edge cost:"));

    if (!isNaN(start) && !isNaN(end) && !isNaN(cost) &&
        start >= 0 && start < nodes.length && end >= 0 && end < nodes.length) {
        const edge = {
            start,
            end,
            cost,
            color: "gray",
        };
        edges.push(edge);
        lastAction = {
            type: "addEdge",
            data: {
                index: edges.length - 1,
                start: start,
                end: end
            }
        };
        actions.push(lastAction);
        draw();
    }
});

clearButton.addEventListener("click", () => {
    lastAction = {
        type: "clear",
        data: {
            nodes: [...nodes],
            edges: [...edges]
        }
    };
    nodes.length = 0;
    edges.length = 0;

    actions.push(lastAction);
    draw();
});

undoButton.addEventListener("click", () => {
    if (actions.length > 0) {
        const action = actions.pop();
        console.log(action);
        switch (action.type) {
            case "addNode":
                nodes.splice(action.data.index, 1);
                break;
            case "addEdge":
                edges.splice(action.data.index, 1);
                break;
            case "dragNode":
                const node = nodes[action.data.index];
                node.x = action.data.x;
                node.y = action.data.y;
                break;
            case "clear":
                nodes.splice(0, nodes.length, ...action.data.nodes);
                edges.splice(0, edges.length, ...action.data.edges);
                break;
        }
        lastAction = null;
        draw();
    }
});

document.addEventListener("keydown", event => {
    if (event.ctrlKey && (event.keyCode === 90) || event.keyCode === "KeyZ") {
        if (actions.length > 0) {
            const action = actions.pop();
            console.log(action);
            switch (action.type) {
                case "addNode":
                    nodes.splice(action.data.index, 1);
                    break;
                case "addEdge":
                    edges.splice(action.data.index, 1);
                    break;
                case "dragNode":
                    const node = nodes[action.data.index];
                    node.x = action.data.x;
                    node.y = action.data.y;
                    break;
                case "clear":
                    nodes.splice(0, nodes.length, ...action.data.nodes);
                    edges.splice(0, edges.length, ...action.data.edges);
                    break;
            }
            lastAction = null;
            draw();
        }
    }
})

function drawNode(node) {
    context.lineWidth = 1;
    // context.beginPath();
    // context.arc(node.x, node.y, node.size / 2, 0, 2 * Math.PI);
    // context.fillStyle = "white";
    // context.fill();
    // context.strokeStyle = "black";
    // context.stroke();

    context.shadowOffsetX = 5;
    context.shadowOffsetY = 5;
    context.shadowBlur = 25;
    context.shadowColor = 'rgba(0, 0, 0, 0.5)';
    context.drawImage(routerIcon, node.x - 50, node.y - 50, 100, 100);

    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;

    context.fillStyle = "white";
    context.textAlign = 'center'
    context.fillText("N" + nodes.indexOf(node), node.x, node.y + node.size / 6);

}

function drawEdge(edge) {
    edge.color != "gray" ? context.lineWidth = 8 : context.lineWidth = 5;
    context.strokeStyle = edge.color;
    const start = nodes[edge.start];
    const end = nodes[edge.end];
    context.beginPath();
    context.moveTo(start.x, start.y);

    // Can be multiple edges between two nodes (or even multiple self edges)
    index = edges.filter((e) => (e.start === edge.start && e.end === edge.end) || (e.start === edge.end && e.end === edge.start)).indexOf(edge);
    // Normal Edge
    if (edge.start !== edge.end) {
        const controlX = (start.x + end.x) / (2 + index);
        const controlY = (start.y + end.y) / (2 + index);
        context.quadraticCurveTo(controlX, controlY, end.x, end.y);
        context.stroke();


        const text = edge.cost;
        const textWidth = context.measureText(text).width - 15;
        const t = 0.5; // Set t value to midpoint of curve
        const midX = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * controlX + t * t * end.x;
        const midY = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * controlY + t * t * end.y;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const slope = -dx / dy; // Calculate slope of tangent
        //const angle = Math.atan(slope); // Calculate angle of rotation
        context.save();
        context.translate(midX, midY);
        //context.rotate(angle);
        context.fillStyle = "white";
        context.fillRect(-textWidth / 2 - 10, -10, 20, 20);
        context.fillStyle = "gray";
        context.fillText(text, -textWidth / 2, 7);
        context.restore();

    }
    // Self Edge
    else {
        context.fillStyle = "gray";
        context.beginPath();
        context.ellipse(start.x + 25, start.y + 25, 30 + 15 * index, 25 + 15 * index, Math.PI / 4, 0, Math.PI * 2);
        context.stroke();
        context.fillText(edge.cost, start.x + 60 + 15 * index, start.y + 60 + 15 * index);
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    edges.forEach(drawEdge);
    nodes.forEach(drawNode);
}

// Helper function to find minimum cost between two nodes (used for UI purposes)
function minCost(n1, n2) {
    if (n1 === n2) return 0;
    min = Infinity;
    edges.forEach((edge) => {
        if ((edge.start === n1 && edge.end === n2) || (edge.start === n2 && edge.end === n1)) {
            if (edge.cost < min) min = edge.cost;
        }
    })
    return min;
}

function isConnected() {
    // Create an adjacency list from the edges array
    const adjacencyList = {};
    for (const node of Object.keys(nodes)) {
        adjacencyList[parseInt(node)] = [];
    }
    for (const edge of edges) {
        adjacencyList[edge.start].push(edge.end);
        adjacencyList[edge.end].push(edge.start);
    }

    // Perform a DFS traversal starting from any node
    const visited = {};
    for (const node of nodes) {
        visited[node] = false;
    }
    dfs(Object.keys(nodes)[0], visited, adjacencyList);

    // Check if all nodes were visited
    for (const node of Object.keys(nodes)) {
        if (!visited[node]) {
            return false;
        }
    }
    return true;
}

function dfs(node, visited, adjacencyList) {
    visited[node] = true;
    for (const neighbor of adjacencyList[node]) {
        if (!visited[neighbor]) {
            dfs(neighbor, visited, adjacencyList);
        }
    }
}

function negativeEdges() {
    let found = false;
    edges.forEach(edge => {
        if (edge.cost < 0) found = true;
    })

    return found;
}


// These functions have been replaced by backend services

function setup() {
    draw();
}

function init() {
    routerIcon = new Image();
    routerIcon.src = "assets/router.png";
    routerIcon.onload = function () {
        setup();
    }
}
init();