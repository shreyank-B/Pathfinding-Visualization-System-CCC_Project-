#include <iostream>
#include <vector>
#include <queue>
#include <climits>
#include <algorithm>
#include <string>

using namespace std;

// ============================================================
//   CITY ROUTE PLANNER - Dijkstra's Shortest Path Algorithm
//   CCC Project | Algorithm: Greedy (Dijkstra) + Priority Queue
// ============================================================

string cities[] = {
    "Mumbai", "Delhi", "Bangalore", "Chennai",
    "Kolkata", "Hyderabad", "Pune", "Jaipur",
    "Ahmedabad", "Bhopal"
};

int main() {
    int n = 10; // Total cities
    vector<vector<pair<int,int>>> adj(n);

    // Add bidirectional road between two cities
    auto addEdge = [&](int u, int v, int w) {
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    };

    // Roads (city1, city2, distance in km)
    addEdge(0, 6, 150);   // Mumbai   - Pune
    addEdge(0, 8, 530);   // Mumbai   - Ahmedabad
    addEdge(0, 5, 711);   // Mumbai   - Hyderabad
    addEdge(6, 5, 560);   // Pune     - Hyderabad
    addEdge(6, 2, 840);   // Pune     - Bangalore
    addEdge(1, 7, 280);   // Delhi    - Jaipur
    addEdge(1, 9, 775);   // Delhi    - Bhopal
    addEdge(1, 4, 1475);  // Delhi    - Kolkata
    addEdge(7, 8, 665);   // Jaipur   - Ahmedabad
    addEdge(7, 9, 605);   // Jaipur   - Bhopal
    addEdge(8, 9, 570);   // Ahmedabad- Bhopal
    addEdge(9, 5, 700);   // Bhopal   - Hyderabad
    addEdge(9, 4, 1170);  // Bhopal   - Kolkata
    addEdge(5, 2, 570);   // Hyderabad- Bangalore
    addEdge(5, 3, 625);   // Hyderabad- Chennai
    addEdge(2, 3, 350);   // Bangalore- Chennai

    cout << "\n========================================\n";
    cout << "   CITY ROUTE PLANNER (Dijkstra's)\n";
    cout << "========================================\n\n";
    cout << "Available Cities:\n";
    for (int i = 0; i < n; i++)
        cout << "  [" << i << "] " << cities[i] << "\n";

    int src, dest;
    cout << "\nEnter source city number (0-9): ";
    cin >> src;
    cout << "Enter destination city number (0-9): ";
    cin >> dest;

    if (src < 0 || src >= n || dest < 0 || dest >= n) {
        cout << "\nInvalid city number! Please enter 0-9.\n";
        return 1;
    }

    // --- Dijkstra's Algorithm ---
    vector<int> dist(n, INT_MAX);
    vector<int> prev(n, -1);
    // Min-heap: (distance, city)
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;

    dist[src] = 0;
    pq.push({0, src});

    cout << "\n--- Running Dijkstra's Algorithm ---\n";

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue; // Skip outdated entry

        cout << "Visiting: " << cities[u] << "  (current shortest: " << d << " km)\n";

        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                prev[v] = u;
                pq.push({dist[v], v});
                cout << "   Updated " << cities[v] << ": " << dist[v] << " km\n";
            }
        }
    }

    // --- Output Result ---
    cout << "\n========================================\n";
    cout << "   RESULT\n";
    cout << "========================================\n";

    if (dist[dest] == INT_MAX) {
        cout << "No path found from " << cities[src] << " to " << cities[dest] << "\n";
        return 0;
    }

    cout << "From       : " << cities[src] << "\n";
    cout << "To         : " << cities[dest] << "\n";
    cout << "Distance   : " << dist[dest] << " km\n";

    // Reconstruct path
    vector<int> path;
    for (int at = dest; at != -1; at = prev[at])
        path.push_back(at);
    reverse(path.begin(), path.end());

    cout << "Route      : ";
    for (int i = 0; i < (int)path.size(); i++) {
        if (i > 0) cout << " -> ";
        cout << cities[path[i]];
    }
    cout << "\n========================================\n";

    return 0;
}
