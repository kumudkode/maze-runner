Maze Runner: Live here https://kumudkode.github.io/maze-runner/
🪄🔮
Interactive Maze Generator & Solver with Algorithm Visualization
Maze Runner is a fully interactive web application that generates random mazes and visualizes pathfinding algorithms in real-time. Built with vanilla JavaScript, CSS, and HTML, this project demonstrates advanced front-end techniques without relying on any external libraries or frameworks.

🌟 Features
Dynamic Maze Generation: Creates random perfect mazes using recursive backtracking algorithm
Intelligent Pathfinding: Visualizes A* algorithm solving the maze in real-time
Interactive Navigation: Use arrow keys to manually navigate through the maze
Customizable Complexity: Adjust maze size with an intuitive slider
Performance Metrics: Track generation and solving times
Visual Effects:
Dynamic lighting that follows cursor movement
Particle animations at start and end points
Trail effects when moving through the maze
Victory celebration with confetti animation
Dark/Light Mode: Toggle between themes with smooth transitions
Mobile Responsive: Fully playable on devices of all sizes


🖼️ Screenshots


Light Mode	Dark Mode	Solving Visualization
☀️🌑

🔧 Technologies Used
HTML5
CSS3 (with advanced animations and transitions)
Vanilla JavaScript (ES6+)
No external libraries or frameworks
🚀 Live Demo
Check out the live demo: Maze Runner Demo

⚙️ Installation
Clone this repository:
=========================================================
git clone https://github.com/kumudkode/maze-runner.git
=========================================================

Navigate to the project directory:

================
cd maze-runner
================

Open index.html in your browser 

🎮 How to Play
Generate a Maze: Click the "Generate New Maze" button to create a random maze
Manual Navigation: Use arrow keys to move through the maze
Automatic Solving: Click "Solve Maze" to visualize the A* algorithm finding the optimal path
Adjust Difficulty: Use the size slider to create smaller or larger mazes
Toggle Theme: Switch between light and dark mode

🧠 How It Works
Maze Generation Algorithm
The maze is generated using a recursive backtracking algorithm:

Start at a random cell and mark it as visited
Randomly select an unvisited neighbor
Remove the wall between the current cell and the selected neighbor
Move to the selected neighbor and repeat until there are no unvisited neighbors
Backtrack to the last cell with unvisited neighbors and continue
This creates a "perfect" maze, meaning there is exactly one path between any two points in the maze.

A* Pathfinding Algorithm
The maze is solved using the A* pathfinding algorithm:

Start at the beginning of the maze
Calculate scores for each possible move based on:
Distance traveled from start
Estimated distance to goal (Manhattan distance)
Select the move with the lowest score
Continue until reaching the end of the maze
The algorithm is visualized in real-time with color-coded cells showing the exploration process.

🚧 Future Improvements
Multiple maze generation algorithms (Prim's, Kruskal's, etc.)
Additional pathfinding algorithms for comparison (Dijkstra's, BFS, DFS)
Multiplayer race mode
Custom maze editor
Ability to save/share specific mazes

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

📧 Contact
Feel free to reach out with questions, feedback, or improvement ideas!

Kumud | GitHub/Kumudkode | LinkedIn/Kumudkode

Made with ❤️ by KumudKode
