// API client for backend endpoints
const API = {
  // Helper function for API calls
  async callApi(endpoint, method = 'POST', body = null) {
    const resp = await fetch(`/api/${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : null
    });
    if (!resp.ok) throw new Error('Server error: ' + resp.status);
    return resp.json();
  },

  // Graph validation endpoint
  async validateGraph(graphRequest) {
    return this.callApi('graph/validate', 'POST', graphRequest);
  },

  // Dijkstra algorithm endpoint
  async runDijkstra(graphRequest) {
    return this.callApi('routing/dijkstra', 'POST', graphRequest);
  },

  // Bellman-Ford algorithm endpoint
  async runBellmanFord(graphRequest) {
    return this.callApi('routing/bellman-ford', 'POST', graphRequest);
  },

  // Scenario management endpoints
  async saveScenario(graphRequest) {
    return this.callApi('scenarios', 'POST', graphRequest);
  },

  async listScenarios() {
    return this.callApi('scenarios', 'GET');
  },

  async getScenario(name) {
    return this.callApi(`scenarios/${name}`, 'GET');
  }
};

// expose to global for simple usage in static page
window.api = API;
