// Graph model and helpers (ES module)
export const nodes = [
    { x: 157, y: 440, size: 50 },
    { x: 365, y: 217, size: 50 },
    { x: 419, y: 451, size: 50 },
    { x: 539, y: 256, size: 50 },
    { x: 800, y: 250, size: 50 },
    { x: 650, y: 400, size: 50 },
    { x: 800, y: 100, size: 50 }
];

export const edges = [
    { start: 0, end: 1, cost: 3, color: 'gray' },
    { start: 0, end: 3, cost: 9, color: 'gray' },
    { start: 0, end: 2, cost: 1, color: 'gray' },
    { start: 1, end: 3, cost: 1, color: 'gray' },
    { start: 2, end: 3, cost: 4, color: 'gray' },
    { start: 4, end: 5, cost: 4, color: 'gray' },
    { start: 5, end: 6, cost: 5, color: 'gray' },
    { start: 6, end: 4, cost: 9, color: 'gray' },
    { start: 5, end: 2, cost: 4, color: 'gray' },
    { start: 5, end: 5, cost: 3, color: 'gray' },
    { start: 1, end: 0, cost: 1, color: 'gray' },
    { start: 5, end: 6, cost: 3, color: 'gray' }
];

export const actions = [];
export let DVgraph = {};

export function getNodeIndex(x, y) {
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

export function distanceBetweenNodes(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function minCost(n1, n2) {
    if (n1 === n2) return 0;
    let min = Infinity;
    edges.forEach((edge) => {
        if ((edge.start === n1 && edge.end === n2) || (edge.start === n2 && edge.end === n1)) {
            if (edge.cost < min) min = edge.cost;
        }
    });
    return min;
}

export function dfs(node, visited, adj) {
    visited[node] = true;
    for (const neighbor of adj[node]) {
        if (!visited[neighbor]) dfs(neighbor, visited, adj);
    }
}

export function isConnected() {
    const adjacencyList = {};
    for (let i = 0; i < nodes.length; i++) adjacencyList[i] = [];
    for (const edge of edges) {
        adjacencyList[edge.start].push(edge.end);
        adjacencyList[edge.end].push(edge.start);
    }

    const visited = {};
    for (let i = 0; i < nodes.length; i++) visited[i] = false;
    if (nodes.length === 0) return false;
    dfs(0, visited, adjacencyList);

    for (let i = 0; i < nodes.length; i++) if (!visited[i]) return false;
    return true;
}

export function negativeEdges() {
    return edges.some(e => e.cost < 0);
}
