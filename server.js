const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const filePath = path.join(__dirname, "distances.txt");


function parseGraph() {
  const data = fs.readFileSync(filePath, "utf-8");
  const lines = data.trim().split("\n");
  const graph = {};

  lines.forEach((line) => {
    const [city1, city2, distance] = line.split(",");
    if (!graph[city1]) graph[city1] = [];
    if (!graph[city2]) graph[city2] = [];
    graph[city1].push({ node: city2, distance: parseFloat(distance) });
    graph[city2].push({ node: city1, distance: parseFloat(distance) });
  });

  return graph;
}


function dijkstra(graph, startNode, endNode) {
  const distances = {};
  const visited = new Set();
  const pq = [[0, startNode]];
  const previous = {};

  for (let node in graph) {
    distances[node] = Infinity;
  }
  distances[startNode] = 0;

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [currentDistance, currentNode] = pq.shift();

    if (visited.has(currentNode)) continue;
    visited.add(currentNode);

    for (let neighbor of graph[currentNode]) {
      const distance = currentDistance + neighbor.distance;
      if (distance < distances[neighbor.node]) {
        distances[neighbor.node] = distance;
        previous[neighbor.node] = currentNode;
        pq.push([distance, neighbor.node]);
      }
    }
  }

  const path = [];
  let current = endNode;
  while (current) {
    path.unshift(current);
    current = previous[current];
  }

  return { path, distance: distances[endNode] };
}

app.get("/shortest-path", (req, res) => {
  const { start, end } = req.query;
  const graph = parseGraph();
  const result = dijkstra(graph, start, end);
  res.json(result);
});

app.listen(5000, () => console.log("Server running on port 5000"));


function getCities() {
  const graph = parseGraph();
  return Object.keys(graph);
}

app.get("/cities", (req, res) => {
  const cities = getCities();
  res.json(cities);
});
