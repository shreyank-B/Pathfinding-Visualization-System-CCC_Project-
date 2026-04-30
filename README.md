# 🗺️ City Route Planner — Dijkstra's Algorithm Visualizer

A professional pathfinding application built for university evaluation (CCC). This project demonstrates the implementation and visualization of **Dijkstra's Shortest Path Algorithm** (a Greedy approach) to find the most efficient routes between major Indian cities.

## 🚀 Overview
The **City Route Planner** is an interactive web-based tool that calculates the shortest distance between 10 major cities in India. It provides a visual representation of the city network (graph) and animates the algorithm's progress as it "relaxes" edges to find the optimal path.

## 🧠 Algorithm: Dijkstra's (Greedy)
We implemented **Dijkstra's Algorithm** using a **Priority Queue (Min-Heap)**. 
- **Greedy Strategy**: At every step, the algorithm selects the unvisited city with the smallest known distance from the source.
- **Complexity**: $O((V + E) \log V)$, where $V$ is the number of cities and $E$ is the number of roads.
- **Relatability**: This is the foundational algorithm used by GPS systems and Google Maps for routing.

## 🛠️ Technology Stack
- **Frontend**: HTML5, Vanilla CSS3 (Custom Dark Theme), JavaScript (SVG for Graph Rendering).
- **Backend**: Python (Flask) for the web server and algorithm logic.
- **Logic Version**: A standalone **C++** implementation (`dijkstra.cpp`) is included for academic explanation.
- **Data**: A weighted graph representing real-world distances between cities like Mumbai, Delhi, Bangalore, etc.

## ✨ Key Features
- **Interactive SVG Map**: Click cities on the graph to set source and destination.
- **Real-time Animation**: Neon path highlighting and step-by-step "visited" node indicators.
- **Route Breakdown**: A detailed sidebar showing the distance for each segment of the journey.
- **Educational Panel**: Built-in "How it Works" section for easy presentation to professors.

## 📊 Results
The project successfully:
1.  **Calculates** the absolute shortest path between any two cities in the network.
2.  **Visualizes** complex graph data in a user-friendly way.
3.  **Proves** the efficiency of Greedy algorithms in solving real-world optimization problems.

## 📂 Project Structure
- `app.py`: Flask server and Python Dijkstra implementation.
- `dijkstra.cpp`: Standalone C++ code for CLI-based algorithm demo.
- `index.html / style.css / script.js`: The animated UI frontend.
- `README.md`: Project documentation.

---
**Author**: [Your Team Name]  
**Course**: 2nd Year University Project (CCC)  
**Date**: April 30th, 2026
