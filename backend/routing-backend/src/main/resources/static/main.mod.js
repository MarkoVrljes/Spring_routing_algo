import { nodes, edges, actions, DVgraph, getNodeIndex, distanceBetweenNodes, minCost, isConnected, negativeEdges } from './js/graphModel.js';
import { drawAll, initRenderer, getContext } from './js/renderer.js';

// Animation and UI state
let animationStack = [];
let animationCallback = null;
let infoTableStacks = { distanceStack: [], predecessorStack: [] };
let running = false;
let draggingNode = null;
let lastAction = null;

// Debug logging
function logDebug(msg) {
    console.log(`[DEBUG] ${msg}`);
}

// Lightweight orchestrator: wires UI to modules and provides small helpers.
window.addEventListener('DOMContentLoaded', () => {
    logDebug('DOM Content Loaded');
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    logDebug('Canvas found, initializing renderer...');
    initRenderer(() => {
        logDebug('Renderer initialized, drawing initial state...');
        drawAll(nodes, edges);
    });
    wireUi();
});

function wireUi() {
    const randomGraphBtn = document.getElementById('randomGraph');
    const addEdgeBtn = document.getElementById('addEdge');
    const undoBtn = document.getElementById('undo');
    const clearBtn = document.getElementById('clear');
    const runDijBtn = document.getElementById('run_Dijkstra_algorithm');
    const runBellBtn = document.getElementById('run_Bellman_algorithm');
    // backend-only toggle removed; frontend will always use backend APIs
    const stepButton = document.getElementById('stepButton');
    const exitButton = document.getElementById('exitButton');
    const canvas = document.getElementById('canvas');

    // Graph editing buttons
    randomGraphBtn?.addEventListener('click', async () => {
        if (running) return;
        const lastAction = {
            type: 'clear',
            data: { nodes: [...nodes], edges: [...edges] }
        };
        nodes.length = 0;
        edges.length = 0;
        actions.push(lastAction);

        const numNodes = Math.floor(Math.random() * 10 + 3);
        const minDistance = 100;
        const margin = 100;
        const canvasEl = document.getElementById('canvas');
        const innerWidth = canvasEl.width - margin * 2;
        const innerHeight = canvasEl.height - margin * 2;
        
        // Generate nodes with minimum distance
        for (let i = 0; i < numNodes; i++) {
            let x, y;
            do {
                x = Math.random() * innerWidth + margin;
                y = Math.random() * innerHeight + margin;
                var tooClose = nodes.some(node => 
                    distanceBetweenNodes(x, y, node.x, node.y) < minDistance);
            } while (tooClose);

            nodes.push({ x, y, size: 50 });
        }

        // Generate edges
        const numEdges = Math.floor(Math.random() * ((numNodes * (numNodes - 1)) / 2));
        const maxCost = 100;
        for (let i = 0; i < numEdges; i++) {
            edges.push({
                start: Math.floor(Math.random() * numNodes),
                end: Math.floor(Math.random() * numNodes),
                cost: Math.floor(Math.random() * maxCost),
                color: 'gray'
            });
        }

        // Ensure connectivity locally (avoid backend 500 on /graph/validate)
        if (!isConnected()) {
            for (let i = 1; i < numNodes; i++) {
                edges.push({
                    start: i - 1,
                    end: i,
                    cost: Math.floor(Math.random() * maxCost),
                    color: 'gray'
                });
            }
        }

        drawAll(nodes, edges);
    });

    addEdgeBtn?.addEventListener('click', () => {
        if (running) return;
        promptAddEdge();
        drawAll(nodes, edges);
    });

    undoBtn?.addEventListener('click', () => {
        if (running) return;
        undo();
        drawAll(nodes, edges);
    });

    clearBtn?.addEventListener('click', () => {
        if (running) return;
        clearGraph();
        drawAll(nodes, edges);
    });

    // Animation control buttons
    stepButton?.addEventListener('click', () => {
        animateEdge();
        updateInfoTable();
    });

    exitButton?.addEventListener('click', () => {
        toggleAnimationMode();
        edges.forEach(edge => edge.color = 'gray');
        drawAll(nodes, edges);
    });

    runDijBtn?.addEventListener('click', async () => {
        try {
            const start = parseIndexInput('Enter start node index (0..' + (nodes.length - 1) + ')');
            const end = parseIndexInput('Enter end node index (0..' + (nodes.length - 1) + ')');
            if (start === end) return alert('Start and end must be different');

            const request = { nodes, edges, startNode: start, endNode: end };
            const result = await window.api.runDijkstra(request);
            applySimulationResult(result, start, end, 'Dijkstra Table');
        } catch (err) {
            console.error(err);
            alert(err.message || err);
        }
    });

    runBellBtn?.addEventListener('click', async () => {
        try {
            const start = parseIndexInput('Enter start node index (0..' + (nodes.length - 1) + ')');
            const end = parseIndexInput('Enter end node index (0..' + (nodes.length - 1) + ')');
            if (start === end) return alert('Start and end must be different');

            const request = { nodes, edges, startNode: start, endNode: end };
            const result = await window.api.runBellmanFord(request);
            applySimulationResult(result, start, end, 'Bellman-Ford Table');
        } catch (err) {
            console.error(err);
            alert(err.message || err);
        }
    });

        // simple canvas click handler to add nodes by clicking
    const canvasEl = document.getElementById('canvas');
    // single-click to add node (restored original behavior)
    canvasEl?.addEventListener('click', (ev) => {
        if (running) return;
        const rect = canvasEl.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        nodes.push({ x, y, size: 50 });
        DVgraph[nodes.length - 1] = {};
        actions.push({ type: 'addNode', data: { index: nodes.length - 1 } });
        drawAll(nodes, edges);
    });

    // Node dragging
    let draggedNode = null;
    canvas?.addEventListener('mousedown', (ev) => {
        if (running) {
            alert("Can't edit Network while animating!\nPress the \"Exit Animation\" Button to make Network editable.");
            return;
        }
        const rect = canvas.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const nodeIndex = getNodeIndex(x, y);
        if (nodeIndex !== -1) {
            draggedNode = nodes[nodeIndex];
            lastAction = { type: 'dragNode', data: { index: nodeIndex, x: draggedNode.x, y: draggedNode.y } };
            actions.push(lastAction);
        }
        drawAll(nodes, edges);
    });

    canvas?.addEventListener('mousemove', (ev) => {
        if (draggedNode) {
            const rect = canvas.getBoundingClientRect();
            draggedNode.x = ev.clientX - rect.left;
            draggedNode.y = ev.clientY - rect.top;
            drawAll(nodes, edges);
        }
    });

    canvas?.addEventListener('mouseup', () => {
        draggedNode = null;
    });
}

function parseIndexInput(promptText) {
    const raw = prompt(promptText);
    if (!raw) throw new Error('Input cancelled');
    const n = parseInt(raw.match(/\d+/)?.[0]);
    if (Number.isNaN(n) || n < 0 || n >= nodes.length) throw new Error('Invalid node index');
    return n;
}

function promptAddEdge() {
    const raw = prompt('Enter edge as start,end,cost (e.g. 0,1,3)');
    if (!raw) return;
    const parts = raw.split(',').map(s => s.trim());
    if (parts.length < 3) return alert('Please provide start,end,cost');
    const s = parseInt(parts[0], 10);
    const e = parseInt(parts[1], 10);
    const c = parseFloat(parts[2]);
    if ([s, e, c].some(v => v === undefined || v === null || Number.isNaN(v))) return alert('Invalid numbers');
    edges.push({ start: s, end: e, cost: c, color: 'gray' });
    actions.push({ type: 'addEdge' });
}

function undo() {
    const last = actions.pop();
    if (!last) return;
    if (last.type === 'addNode') nodes.pop();
    if (last.type === 'addEdge') edges.pop();
}

function toggleAnimationMode() {
    running = !running;
    const addEdgeBtn = document.getElementById('addEdge');
    const clearBtn = document.getElementById('clear');
    const undoBtn = document.getElementById('undo');
    const runBellBtn = document.getElementById('run_Bellman_algorithm');
    const runDijBtn = document.getElementById('run_Dijkstra_algorithm');
    const randomBtn = document.getElementById('randomGraph');
    const stepBtn = document.getElementById('stepButton');
    const exitBtn = document.getElementById('exitButton');
    const infoDiv = document.getElementById('infoDiv');

    [addEdgeBtn, clearBtn, undoBtn, runBellBtn, runDijBtn, randomBtn].forEach(btn => {
        if (btn) btn.disabled = running;
    });

    if (running) {
        stepBtn.style.display = 'inline-block';
        stepBtn.disabled = false;
        exitBtn.style.display = 'inline-block';
        infoDiv.style.display = 'block';
        initializeInfoTable();
    } else {
        stepBtn.style.display = 'none';
        exitBtn.style.display = 'none';
        infoDiv.style.display = 'none';
    }
}

function initializeInfoTable() {
    const infoTable = document.querySelector('#infoTable tbody');
    if (!infoTable) return;

    infoTable.innerHTML = '';
    const firstDistances = infoTableStacks.distanceStack.pop();
    const firstPredecessors = infoTableStacks.predecessorStack.pop();
    if (!firstDistances || !firstPredecessors) return;

    for (let i = 0; i < nodes.length; i++) {
        const row = infoTable.insertRow();
        const vertexCell = row.insertCell();
        const distanceCell = row.insertCell();
        const predecessorCell = row.insertCell();

        distanceCell.className = 'distance';
        distanceCell.setAttribute('last', firstDistances[i]);
        predecessorCell.className = 'predecessor';
        predecessorCell.setAttribute('last', firstPredecessors[i] === null ? 'null' : firstPredecessors[i]);

        vertexCell.textContent = 'N' + i;
        distanceCell.textContent = firstDistances[i];
        predecessorCell.textContent = 'null';
    }
}

function updateInfoTable() {
    if (infoTableStacks.distanceStack.length === 0) return;
    
    const nextDistances = infoTableStacks.distanceStack.pop();
    const nextPredecessors = infoTableStacks.predecessorStack.pop();
    const tableBody = document.querySelector('#infoTable tbody');
    if (!tableBody || !nextDistances || !nextPredecessors) return;

    for (let i = 0; i < nodes.length; i++) {
        const distanceCell = tableBody.rows[i].cells[1];
        const predecessorCell = tableBody.rows[i].cells[2];

        if (Number(distanceCell.getAttribute('last')) !== nextDistances[i]) {
            distanceCell.innerHTML = '<strike>' + distanceCell.innerHTML + '</strike> ' + nextDistances[i];
            distanceCell.setAttribute('last', nextDistances[i]);
        }

        const lastPred = predecessorCell.getAttribute('last');
        const newPred = nextPredecessors[i];
        if (lastPred !== String(newPred)) {
            if (newPred !== null) {
                predecessorCell.innerHTML = '<strike>' + predecessorCell.innerHTML + '</strike> N' + newPred;
            }
            predecessorCell.setAttribute('last', newPred === null ? 'null' : newPred);
        }
    }
}

function finishAnimation() {
    const stepBtn = document.getElementById('stepButton');
    if (stepBtn) stepBtn.disabled = true;
    if (typeof animationCallback === 'function') animationCallback();
    animationCallback = null;
}

function animateEdge() {
    if (animationStack.length === 0) {
        finishAnimation();
        return;
    }
    const edgeIndex = animationStack.pop();
    if (edgeIndex >= 0 && edgeIndex < edges.length) {
        edges[edgeIndex].color = 'rgba(146,55,55,1)';
        drawAll(nodes, edges);
    }
}

function clearGraph() {
    const lastAction = {
        type: 'clear',
        data: { nodes: [...nodes], edges: [...edges] }
    };
    nodes.length = 0;
    edges.length = 0;
    actions.push(lastAction);
}

function randomizeGraph() {
    // move existing nodes randomly, or create a small random graph if empty
    if (nodes.length === 0) {
        const count = 6;
        for (let i = 0; i < count; i++) {
            nodes.push({ x: 100 + Math.random() * 700, y: 100 + Math.random() * 400, size: 50 });
        }
        for (let i = 0; i < count - 1; i++) {
            edges.push({ start: i, end: i + 1, cost: Math.ceil(Math.random() * 9), color: 'gray' });
        }
    } else {
        nodes.forEach(n => {
            n.x += (Math.random() - 0.5) * 100;
            n.y += (Math.random() - 0.5) * 100;
        });
        edges.forEach(e => {
            e.cost = Math.max(1, Math.round(e.cost + (Math.random() - 0.5) * 4));
        });
    }
}

function applySimulationResult(result, start, end, title) {
    if (running) {
        alert("Algorithm is already running! Press the 'Exit Animation' button to stop.");
        return;
    }

    const infoDiv = document.getElementById('infoDiv');
    const infoTitle = document.getElementById('infoTitle');
    const infoParameters = document.getElementById('infoParameters');

    if (!result) {
        alert('No result returned from algorithm');
        return;
    }

    if (!result.success) {
        alert(result.error || 'Algorithm failed');
        return;
    }

    // Set up animation state
    const animationEdges = [];
    if (result.steps && result.steps.length) {
        result.steps.forEach(step => {
            if (step.visitedEdgeIndices) {
                animationEdges.push(...step.visitedEdgeIndices);
            }
        });

        infoTableStacks = {
            distanceStack: result.steps.map(step => Object.values(step.distances)).reverse(),
            predecessorStack: result.steps.map(step => Object.values(step.predecessors)).reverse()
        };
    } else {
        infoTableStacks = { distanceStack: [], predecessorStack: [] };
    }

    // Update info panel
    infoDiv.style.display = 'block';
    infoTitle.innerHTML = title;
    const params = ['Start: <b>N' + start + '</b>'];
    if (end != null) params.push('End: <b>N' + end + '</b>');
    infoParameters.innerHTML = params.join(' ');

    // Prepare animation
    animationStack = animationStack.concat(animationEdges.reverse());
    toggleAnimationMode();

    // Set up final callback
    animationCallback = () => {
        if (result.shortestPath && result.shortestPath.length > 1) {
            edges.forEach(e => e.color = 'gray');
            for (let i = 1; i < result.shortestPath.length; i++) {
                const a = result.shortestPath[i - 1];
                const b = result.shortestPath[i];
                const edge = edges.find(e =>
                    (e.start === a && e.end === b) ||
                    (e.start === b && e.end === a));
                if (edge) edge.color = 'gold';
            }
            drawAll(nodes, edges);
        }

        if (result.finalDistances) {
            const context = getContext();
            nodes.forEach((node, i) => {
                context.fillStyle = 'rgba(255, 255, 255, 0.7)';
                context.fillRect(node.x - 35, node.y, 140, 50);
                context.fillStyle = 'black';
                context.textAlign = 'center';
                context.fillText('Cost: ' + (result.finalDistances[i] === Infinity ? '∞' : result.finalDistances[i]),
                    node.x + 35, node.y + 35);
            });
        }
    };
}
