// Renderer module: draws nodes/edges and manages router icon
let canvas = null;
let context = null;
let routerIcon = null;

// Debug logging
function logDebug(msg) {
    console.log(`[Renderer] ${msg}`);
}

// Initialize canvas size
function initCanvasSize() {
    canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Canvas element not found in initCanvasSize!');
        return false;
    }
    context = canvas.getContext('2d');
    if (!context) {
        console.error('Could not get 2D context!');
        return false;
    }
    logDebug('Canvas initialized');

    // Get container dimensions
    const container = canvas.parentElement;
    const containerWidth = container ? container.clientWidth : window.innerWidth;
    const containerHeight = container ? container.clientHeight : window.innerHeight;

    // Set canvas dimensions
    canvas.width = Math.min(1000, containerWidth - 40);  // 20px padding on each side
    canvas.height = Math.min(600, containerHeight - 100);  // Leave room for controls
    canvas.style.backgroundColor = '#ffffff';  // Ensure white background
    
    // Adjust for responsive design if needed
    function resize() {
        const parent = canvas.parentElement;
        if (parent) {
            const rect = parent.getBoundingClientRect();
            canvas.width = Math.min(1000, rect.width - 20);  // 20px padding
            canvas.height = Math.min(600, window.innerHeight - 200);  // Room for UI
        }
    }
    
    resize();
    window.addEventListener('resize', resize);
    return true;
}

export function getContext() { return context; }

export function drawNode(node, nodes) {
    // Prefer drawing router icon image (original visual). If missing, fallback to circle.
    context.lineWidth = 1;
    context.shadowOffsetX = 5;
    context.shadowOffsetY = 5;
    context.shadowBlur = 25;
    context.shadowColor = 'rgba(0, 0, 0, 0.5)';

    if (routerIcon) {
        try {
            context.drawImage(routerIcon, node.x - 50, node.y - 50, 100, 100);
        } catch (err) {
            console.warn('Failed to draw router icon, falling back to circle:', err);
            context.beginPath();
            context.arc(node.x, node.y, node.size / 2, 0, Math.PI * 2);
            context.fillStyle = '#ffffff';
            context.fill();
            context.strokeStyle = '#000000';
            context.stroke();
        }
    } else {
        context.beginPath();
        context.arc(node.x, node.y, node.size / 2, 0, Math.PI * 2);
        context.fillStyle = '#ffffff';
        context.fill();
        context.strokeStyle = '#000000';
        context.stroke();
    }

    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText('N' + nodes.indexOf(node), node.x, node.y + node.size / 6);
}

export function drawEdge(edge, nodes, edges) {
    edge.color != 'gray' ? context.lineWidth = 8 : context.lineWidth = 5;
    context.strokeStyle = edge.color;
    const start = nodes[edge.start];
    const end = nodes[edge.end];
    context.beginPath();
    context.moveTo(start.x, start.y);
    const index = edges.filter((e) => (e.start === edge.start && e.end === edge.end) || (e.start === edge.end && e.end === edge.start)).indexOf(edge);

    if (edge.start !== edge.end) {
        const controlX = (start.x + end.x) / (2 + index);
        const controlY = (start.y + end.y) / (2 + index);
        context.quadraticCurveTo(controlX, controlY, end.x, end.y);
        context.stroke();
        const text = edge.cost;
        const textWidth = context.measureText(text).width - 15;
        const t = 0.5;
        const midX = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * controlX + t * t * end.x;
        const midY = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * controlY + t * t * end.y;
        context.save();
        context.translate(midX, midY);
        context.fillStyle = 'white';
        context.fillRect(-textWidth / 2 - 10, -10, 20, 20);
        context.fillStyle = 'gray';
        context.fillText(text, -textWidth / 2, 7);
        context.restore();
    } else {
        context.fillStyle = 'gray';
        context.beginPath();
        context.ellipse(start.x + 25, start.y + 25, 30 + 15 * index, 25 + 15 * index, Math.PI / 4, 0, Math.PI * 2);
        context.stroke();
        context.fillText(edge.cost, start.x + 60 + 15 * index, start.y + 60 + 15 * index);
    }
}

export function drawAll(nodes, edges) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    edges.forEach(e => drawEdge(e, nodes, edges));
    nodes.forEach(n => drawNode(n, nodes));
}

export function initRenderer(onReady) {
    logDebug('Initializing renderer...');
    if (!initCanvasSize()) {
        console.error('Failed to initialize canvas!');
        return;
    }
    
    // Set up context properties
    context.font = '20pt Consolas';
    logDebug('Context configured');

    // Draw initial blank canvas before loading router icon
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawAll([], []);

    // Load router icon (optional)
    routerIcon = new Image();
    routerIcon.src = 'assets/router.png';
    routerIcon.onload = () => {
        logDebug('Router icon loaded');
        if (typeof onReady === 'function') onReady();
    };
    routerIcon.onerror = (err) => {
        console.warn('Router icon failed to load - continuing without it:', err);
        routerIcon = null;  // Clear the failed image
        if (typeof onReady === 'function') onReady();
    };
}
