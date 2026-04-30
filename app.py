from flask import Flask, request, jsonify, send_from_directory
import heapq
import os

app = Flask(__name__, static_folder='.', static_url_path='')

# ============================================================
#   CITY ROUTE PLANNER - Backend (Python / Flask)
#   Algorithm: Dijkstra's Shortest Path (Greedy + Min-Heap)
# ============================================================

CITIES = [
    {"id": 0, "name": "Mumbai", "x": 155, "y": 395},
    {"id": 1, "name": "Delhi", "x": 320, "y": 120},
    {"id": 2, "name": "Bangalore", "x": 280, "y": 510},
    {"id": 3, "name": "Chennai", "x": 380, "y": 510},
    {"id": 4, "name": "Kolkata", "x": 620, "y": 280},
    {"id": 5, "name": "Hyderabad", "x": 330, "y": 410},
    {"id": 6, "name": "Pune", "x": 175, "y": 420},
    {"id": 7, "name": "Jaipur", "x": 250, "y": 190},
    {"id": 8, "name": "Ahmedabad", "x": 140, "y": 280},
    {"id": 9, "name": "Bhopal", "x": 320, "y": 300},
    {"id": 10, "name": "Lucknow", "x": 400, "y": 190},
    {"id": 11, "name": "Patna", "x": 550, "y": 210},
    {"id": 12, "name": "Chandigarh", "x": 310, "y": 80},
    {"id": 13, "name": "Guwahati", "x": 720, "y": 210},
    {"id": 14, "name": "Kochi", "x": 260, "y": 580},
    {"id": 15, "name": "Visakhapatnam", "x": 450, "y": 420},
    {"id": 16, "name": "Surat", "x": 145, "y": 320},
    {"id": 17, "name": "Indore", "x": 260, "y": 310},
    {"id": 18, "name": "Nagpur", "x": 360, "y": 340},
    {"id": 19, "name": "Bhubaneswar", "x": 540, "y": 350},
    {"id": 20, "name": "Dehradun", "x": 350, "y": 85},
    {"id": 21, "name": "Srinagar", "x": 280, "y": 30},
    {"id": 22, "name": "Ranchi", "x": 530, "y": 280},
    {"id": 23, "name": "Raipur", "x": 440, "y": 330},
    {"id": 24, "name": "Thiruvananthapuram", "x": 270, "y": 630},
    {"id": 25, "name": "Agra", "x": 340, "y": 160},
    {"id": 26, "name": "Varanasi", "x": 470, "y": 200},
    {"id": 27, "name": "Madurai", "x": 330, "y": 580},
    {"id": 28, "name": "Coimbatore", "x": 280, "y": 550},
    {"id": 29, "name": "Vijayawada", "x": 390, "y": 440},
    {"id": 30, "name": "Jodhpur", "x": 180, "y": 200},
    {"id": 31, "name": "Amritsar", "x": 270, "y": 70},
    {"id": 32, "name": "Shimla", "x": 330, "y": 65},
    {"id": 33, "name": "Panaji", "x": 180, "y": 490},
    {"id": 34, "name": "Gwalior", "x": 330, "y": 220},
    {"id": 35, "name": "Jabalpur", "x": 380, "y": 310},
    {"id": 36, "name": "Nashik", "x": 170, "y": 360},
    {"id": 37, "name": "Vadodara", "x": 160, "y": 295},
    {"id": 38, "name": "Rajkot", "x": 100, "y": 290},
    {"id": 39, "name": "Aurangabad", "x": 220, "y": 380},
    {"id": 40, "name": "Solapur", "x": 230, "y": 440},
    {"id": 41, "name": "Mysore", "x": 260, "y": 535},
    {"id": 42, "name": "Hubli", "x": 210, "y": 490},
    {"id": 43, "name": "Pondicherry", "x": 390, "y": 535},
    {"id": 44, "name": "Tiruchirappalli", "x": 340, "y": 555},
    {"id": 45, "name": "Gaya", "x": 530, "y": 225},
    {"id": 46, "name": "Shillong", "x": 730, "y": 230},
    {"id": 47, "name": "Imphal", "x": 760, "y": 240},
    {"id": 48, "name": "Agartala", "x": 710, "y": 270},
    {"id": 49, "name": "Jammu", "x": 275, "y": 50},
    {"id": 50, "name": "Mangalore", "x": 225, "y": 540},
    {"id": 51, "name": "Gangtok", "x": 600, "y": 200},
]

EDGES = [
    [21, 49, 300], [49, 31, 200], [31, 12, 230], [12, 32, 110], [32, 20, 160],
    [12, 1, 250], [20, 1, 240], [1, 25, 200], [25, 34, 120], [34, 17, 340],
    [1, 7, 270], [7, 30, 330], [30, 8, 450], [8, 38, 220], [38, 16, 260],
    [8, 16, 260], [16, 0, 280], [0, 6, 150], [6, 39, 230], [39, 18, 500],
    [17, 9, 190], [9, 35, 300], [35, 23, 330], [23, 19, 450], [19, 4, 440],
    [4, 13, 1150], [13, 46, 100], [46, 47, 260], [47, 48, 400], [11, 45, 100],
    [45, 22, 250], [22, 19, 420], [10, 26, 320], [26, 45, 250], [25, 10, 330],
    [9, 5, 780], [5, 15, 620], [15, 19, 440], [5, 2, 570], [2, 41, 150],
    [41, 14, 400], [14, 24, 210], [24, 27, 260], [27, 44, 140], [44, 3, 330],
    [3, 43, 160], [2, 3, 350], [2, 50, 350], [50, 14, 400], [33, 42, 180],
    [42, 2, 410], [0, 33, 580], [6, 40, 250], [40, 5, 400], [34, 9, 350],
    [17, 18, 440], [18, 5, 500], [26, 11, 250], [7, 1, 280], [37, 8, 110],
    [37, 16, 150], [36, 0, 170], [36, 6, 210], [51, 13, 500]
]

def dijkstra(src, dest):
    n = len(CITIES)
    adj = [[] for _ in range(n)]
    for u, v, w in EDGES:
        adj[u].append((v, w))
        adj[v].append((u, w))

    dist = [float('inf')] * n
    prev = [-1] * n
    visited_order = []  # Track which cities were explored

    dist[src] = 0
    pq = [(0, src)]  # (distance, city)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        visited_order.append(u)
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                prev[v] = u
                heapq.heappush(pq, (dist[v], v))

    if dist[dest] == float('inf'):
        return None

    # Reconstruct shortest path
    path = []
    at = dest
    while at != -1:
        path.append(at)
        at = prev[at]
    path.reverse()

    return {
        'distance': dist[dest],
        'path': path,
        'visited': visited_order,
        'all_distances': [d if d != float('inf') else -1 for d in dist]
    }

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/graph')
def get_graph():
    return jsonify({'cities': CITIES, 'edges': EDGES})

@app.route('/api/find-path', methods=['POST'])
def find_path():
    data = request.get_json()
    print(f"DEBUG: Received data: {data}")
    if not data:
        return jsonify({'error': 'No data received'}), 400
    
    try:
        # Safely get values and provide defaults if None
        src_val = data.get('source')
        dest_val = data.get('destination')
        
        src = int(src_val) if src_val is not None else 0
        dest = int(dest_val) if dest_val is not None else 1
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid city ID format'}), 400

    if src == dest:
        return jsonify({'error': 'Source and destination cannot be the same!'})

    result = dijkstra(src, dest)
    if result is None:
        return jsonify({'error': 'No path found between these cities.'})

    return jsonify(result)

if __name__ == '__main__':
    print("\n" + "="*45)
    print("  City Route Planner - CCC Project")
    print("  Algorithm: Dijkstra's (Greedy + Heap)")
    print("="*45)
    print("  Running at: http://localhost:5001")
    print("="*45 + "\n")
    app.run(debug=True, port=5001)
