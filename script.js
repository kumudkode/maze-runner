document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const mazeElement = document.getElementById('maze');
    const mazeWrapper = document.getElementById('maze-wrapper');
    const generateBtn = document.getElementById('generate-btn');
    const solveBtn = document.getElementById('solve-btn');
    const sizeSlider = document.getElementById('size-slider');
    const sizeValue = document.getElementById('size-value');
    const genTimeElement = document.getElementById('gen-time');
    const solveTimeElement = document.getElementById('solve-time');
    const bestScoreElement = document.getElementById('best-score');
    const toggleViewBtn = document.getElementById('toggle-view-btn');
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Maze configuration
    let maze = [];
    let size = parseInt(sizeSlider.value);
    let playerPosition = { x: 0, y: 0 };
    let endPosition = { x: 0, y: 0 };
    let solving = false;
    let moveCount = 0;
    let bestMoves = localStorage.getItem('mazeBestMoves') ? parseInt(localStorage.getItem('mazeBestMoves')) : Infinity;

    // Update best score display
    bestScoreElement.textContent = bestMoves === Infinity ? '-' : bestMoves;

    // Add move counter to maze container
    const moveCounter = document.createElement('div');
    moveCounter.className = 'move-counter';
    moveCounter.textContent = 'Moves: 0';
    document.querySelector('.maze-container').appendChild(moveCounter);
    
    // Initialize the maze
    updateSizeDisplay();
    generateMaze();
    
    // Event listeners
    generateBtn.addEventListener('click', generateMaze);
    solveBtn.addEventListener('click', solveMaze);
    sizeSlider.addEventListener('input', updateSizeDisplay);
    sizeSlider.addEventListener('change', generateMaze);
    document.addEventListener('keydown', handleKeyPress);
    toggleViewBtn.addEventListener('click', toggleView);
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Toggle between 2D and 3D view
    function toggleView() {
        document.body.classList.toggle('view-3d');
        if (document.body.classList.contains('view-3d')) {
            toggleViewBtn.textContent = 'Switch to 2D';
        } else {
            toggleViewBtn.textContent = 'Switch to 3D';
        }
    }
    
    // Toggle between light and dark theme
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            themeToggleBtn.textContent = 'Switch to Light Mode';
        } else {
            themeToggleBtn.textContent = 'Switch to Dark Mode';
        }
    }

    // Updates the size display and CSS variables
    function updateSizeDisplay() {
        size = parseInt(sizeSlider.value);
        sizeValue.textContent = `${size}×${size}`;
        
        // Update CSS variables for responsive sizing
        document.documentElement.style.setProperty('--maze-size', size);
        
        // Adjust cell size based on maze size for better visibility
        const baseCellSize = Math.max(10, Math.min(30, Math.floor(500 / size)));
        document.documentElement.style.setProperty('--base-cell-size', `${baseCellSize}px`);
    }
    
    // Generate a new maze
    function generateMaze() {
        const startTime = performance.now();
        
        // Reset maze data
        maze = [];
        moveCount = 0;
        moveCounter.textContent = 'Moves: 0';
        
        // Initialize the grid with walls
        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
                row.push({
                    x,
                    y, 
                    walls: { top: true, right: true, bottom: true, left: true },
                    visited: false,
                    g: Infinity,
                    f: Infinity,
                    parent: null
                });
            }
            maze.push(row);
        }
        
        // Random start and end positions (always on opposite sides)
        const startSide = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        
        switch(startSide) {
            case 0: // top
                playerPosition = { x: Math.floor(Math.random() * size), y: 0 };
                endPosition = { x: Math.floor(Math.random() * size), y: size - 1 };
                break;
            case 1: // right
                playerPosition = { x: size - 1, y: Math.floor(Math.random() * size) };
                endPosition = { x: 0, y: Math.floor(Math.random() * size) };
                break;
            case 2: // bottom
                playerPosition = { x: Math.floor(Math.random() * size), y: size - 1 };
                endPosition = { x: Math.floor(Math.random() * size), y: 0 };
                break;
            case 3: // left
                playerPosition = { x: 0, y: Math.floor(Math.random() * size) };
                endPosition = { x: size - 1, y: Math.floor(Math.random() * size) };
                break;
        }
        
        // Generate the maze using recursive backtracking
        recursiveBacktracking(playerPosition.x, playerPosition.y);
        
        // Record generation time
        const endTime = performance.now();
        genTimeElement.textContent = `${((endTime - startTime) / 1000).toFixed(2)}s`;
        
        // Render the maze
        renderMaze();

        // Initialize mobile experience
        initializeMobileExperience();
    }
    
    // Recursive backtracking algorithm for maze generation
    function recursiveBacktracking(x, y) {
        maze[y][x].visited = true;
        
        // Define possible directions (dx, dy)
        const directions = [
            [0, -1, 'top', 'bottom'], // top
            [1, 0, 'right', 'left'],  // right
            [0, 1, 'bottom', 'top'],  // bottom
            [-1, 0, 'left', 'right']  // left
        ];
        
        // Shuffle directions for randomness
        shuffleArray(directions);
        
        // Try each direction
        for (const [dx, dy, wall1, wall2] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            
            // Check if the new position is valid and not visited
            if (newX >= 0 && newX < size && newY >= 0 && newY < size && !maze[newY][newX].visited) {
                // Remove walls between current cell and new cell
                maze[y][x].walls[wall1] = false;
                maze[newY][newX].walls[wall2] = false;
                
                // Recurse with the new position
                recursiveBacktracking(newX, newY);
            }
        }
    }
    
    // Render the maze in the DOM
    function renderMaze() {
        // Clear the maze element
        mazeElement.innerHTML = '';
        
        // Set the grid template
        mazeElement.style.gridTemplateColumns = `repeat(${size}, var(--cell-size))`;
        mazeElement.style.gridTemplateRows = `repeat(${size}, var(--cell-size))`;
        
        // Create cells
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Apply walls as classes
                if (maze[y][x].walls.top) cell.classList.add('wall-top');
                if (maze[y][x].walls.right) cell.classList.add('wall-right');
                if (maze[y][x].walls.bottom) cell.classList.add('wall-bottom');
                if (maze[y][x].walls.left) cell.classList.add('wall-left');
                
                // Mark start and end
                if (x === playerPosition.x && y === playerPosition.y) {
                    cell.classList.add('start');
                    cell.classList.add('current');
                    
                    const player = document.createElement('div');
                    player.classList.add('player');
                    cell.appendChild(player);
                }
                
                if (x === endPosition.x && y === endPosition.y) {
                    cell.classList.add('end');
                }
                
                mazeElement.appendChild(cell);
            }
        }
    }
    
    // Solve the maze using A* algorithm
    async function solveMaze() {
        if (solving) return;
        solving = true;
        solveBtn.disabled = true;
        
        const startTime = performance.now();
        
        // Reset visited state for solving
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                maze[y][x].visited = false;
                maze[y][x].parent = null;
                maze[y][x].g = Infinity;
                maze[y][x].f = Infinity;
            }
        }
        
        // A* algorithm
        const openSet = [];
        const closedSet = [];
        
        // Start with player position
        const startNode = maze[playerPosition.y][playerPosition.x];
        startNode.g = 0;
        startNode.f = heuristic(playerPosition, endPosition);
        openSet.push(startNode);
        
        // Animation delay
        const delay = time => new Promise(resolve => setTimeout(resolve, time));
        
        let solution = false;
        
        while (openSet.length > 0) {
            // Find node with lowest f value
            let currentIndex = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[currentIndex].f) {
                    currentIndex = i;
                }
            }
            
            const current = openSet[currentIndex];
            
            // Check if we've reached the end
            if (current.x === endPosition.x && current.y === endPosition.y) {
                solution = true;
                break;
            }
            
            // Remove current from openSet and add to closedSet
            openSet.splice(currentIndex, 1);
            closedSet.push(current);
            
            // Mark as visited in UI
            if (!(current.x === playerPosition.x && current.y === playerPosition.y) && 
                !(current.x === endPosition.x && current.y === endPosition.y)) {
                const cellElement = getCellElement(current.x, current.y);
                cellElement.classList.add('visited');
            }
            
            // For visualization, add a small delay
            await delay(10);
            
            // Get neighbors
            const neighbors = getValidNeighbors(current);
            
            for (const neighbor of neighbors) {
                // Skip if neighbor is in closedSet
                if (closedSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                    continue;
                }
                
                // Calculate g score
                const tentativeG = current.g + 1;
                
                // Check if this path is better
                const inOpenSet = openSet.some(node => node.x === neighbor.x && node.y === neighbor.y);
                if (!inOpenSet || tentativeG < neighbor.g) {
                    // Update neighbor
                    neighbor.parent = current;
                    neighbor.g = tentativeG;
                    neighbor.f = tentativeG + heuristic({x: neighbor.x, y: neighbor.y}, endPosition);
                    
                    if (!inOpenSet) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        // Record solving time
        const endTime = performance.now();
        solveTimeElement.textContent = `${((endTime - startTime) / 1000).toFixed(2)}s`;
        
        // Trace the path if solution found
        if (solution) {
            let current = maze[endPosition.y][endPosition.x];
            const path = [];
            
            while (current.parent) {
                path.push(current);
                current = current.parent;
            }
            
            // Animate the path
            for (let i = path.length - 1; i >= 0; i--) {
                const node = path[i];
                if (!(node.x === endPosition.x && node.y === endPosition.y)) {
                    const cellElement = getCellElement(node.x, node.y);
                    cellElement.classList.add('path');
                    
                    await delay(50);
                }
            }
        } else {
            alert('No solution found!');
        }
        
        solving = false;
        solveBtn.disabled = false;
    }
    
    // Get valid neighbors based on walls
    function getValidNeighbors(cell) {
        const neighbors = [];
        
        // Check each direction
        if (!cell.walls.top && cell.y > 0) {
            neighbors.push(maze[cell.y - 1][cell.x]);
        }
        if (!cell.walls.right && cell.x < size - 1) {
            neighbors.push(maze[cell.y][cell.x + 1]);
        }
        if (!cell.walls.bottom && cell.y < size - 1) {
            neighbors.push(maze[cell.y + 1][cell.x]);
        }
        if (!cell.walls.left && cell.x > 0) {
            neighbors.push(maze[cell.y][cell.x - 1]);
        }
        
        return neighbors;
    }
    
    // Manhattan distance heuristic
    function heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    
    // Mobile touch controls
    const mazeContainer = document.querySelector('.maze-container');
    const dButtons = document.querySelectorAll('.d-btn');
    
    // Define touch variables
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const minSwipeDistance = 40; // Minimum distance for a swipe to register
    
    // Add event listeners for the on-screen d-pad buttons
    dButtons.forEach(button => {
        button.addEventListener('click', () => {
            const direction = button.dataset.direction;
            handleDirectionalInput(direction);
        });
        
        // Add tactile feedback
        button.addEventListener('touchstart', () => {
            button.classList.add('pressed');
        });
        
        button.addEventListener('touchend', () => {
            button.classList.remove('pressed');
        });
    });
    
    // Add touch event listeners for swipe detection
    mazeElement.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: false });
    
    mazeElement.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: false });
    
    // Prevent default touchmove behavior to avoid scrolling while trying to swipe
    mazeElement.addEventListener('touchmove', (e) => {
        if (Math.abs(e.changedTouches[0].screenY - touchStartY) > 10) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Handle swipe gestures
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Check if the swipe is long enough
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            return; // Not a swipe, probably a tap
        }
        
        // Determine swipe direction (use the largest delta)
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
                handleDirectionalInput('right');
            } else {
                handleDirectionalInput('left');
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                handleDirectionalInput('down');
            } else {
                handleDirectionalInput('up');
            }
        }
    }
    
    // Process directional input from either keyboard, swipe, or buttons
    function handleDirectionalInput(direction) {
        if (solving) return;
        
        let newX = playerPosition.x;
        let newY = playerPosition.y;
        
        switch (direction) {
            case 'up':
                if (!maze[playerPosition.y][playerPosition.x].walls.top) newY--;
                break;
            case 'right':
                if (!maze[playerPosition.y][playerPosition.x].walls.right) newX++;
                break;
            case 'down':
                if (!maze[playerPosition.y][playerPosition.x].walls.bottom) newY++;
                break;
            case 'left':
                if (!maze[playerPosition.y][playerPosition.x].walls.left) newX--;
                break;
            default:
                return;
        }
        
        // Check if valid move and update player position
        if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
            moveCount++;
            moveCounter.textContent = `Moves: ${moveCount}`;
            
            // Enhanced trail effect
            createEnhancedTrail(playerPosition.x, playerPosition.y);
            
            // Clear current position
            const oldCell = getCellElement(playerPosition.x, playerPosition.y);
            oldCell.classList.remove('current');
            
            // Update player position
            playerPosition.x = newX;
            playerPosition.y = newY;
            
            // Update new position
            const newCell = getCellElement(playerPosition.x, playerPosition.y);
            newCell.classList.add('current');
            
            // Move the player marker
            if (oldCell.querySelector('.player')) {
                const player = oldCell.querySelector('.player');
                oldCell.removeChild(player);
                newCell.appendChild(player);
            }
            
            // Check if reached the end
            if (playerPosition.x === endPosition.x && playerPosition.y === endPosition.y) {
                setTimeout(() => {
                    celebrateVictory();
                }, 300);
            }
        }
    }
    
    // Handle keyboard navigation
    function handleKeyPress(e) {
        if (solving) return;
        
        // Prevent default scrolling behavior
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
            e.preventDefault();
        }
        
        switch (e.key) {
            case 'ArrowUp':
                handleDirectionalInput('up');
                break;
            case 'ArrowRight':
                handleDirectionalInput('right');
                break;
            case 'ArrowDown':
                handleDirectionalInput('down');
                break;
            case 'ArrowLeft':
                handleDirectionalInput('left');
                break;
            case ' ': // Space bar
                solveMaze();
                break;
            case 'r':
            case 'R':
                generateMaze();
                break;
            case 'v':
            case 'V':
                toggleView();
                break;
            case 't':
            case 'T':
                toggleTheme();
                break;
            default:
                return;
        }
    }
    
    // Create victory celebration
    function celebrateVictory() {
        // Create confetti
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            
            // Random colors and positions
            const colors = ['--primary', '--secondary', '--success', '#FFD700', '#FF4500'];
            confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.width = `${5 + Math.random() * 10}px`;
            confetti.style.height = `${5 + Math.random() * 10}px`;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            // Animation
            confetti.style.animation = `confetti ${1 + Math.random() * 2}s forwards`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            
            document.querySelector('.maze-container').appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
        
        // Display victory message
        alert('Congratulations! You solved the maze!');
        
        // Update best score
        if (moveCount < bestMoves) {
            bestMoves = moveCount;
            localStorage.setItem('mazeBestMoves', bestMoves);
            bestScoreElement.textContent = bestMoves;
            
            const announcement = document.createElement('div');
            announcement.textContent = 'New Best Score!';
            announcement.style.position = 'absolute';
            announcement.style.top = '40%';
            announcement.style.left = '50%';
            announcement.style.transform = 'translate(-50%, -50%)';
            announcement.style.background = 'white';
            announcement.style.padding = '1rem 2rem';
            announcement.style.borderRadius = '8px';
            announcement.style.fontWeight = 'bold';
            announcement.style.color = 'var(--success)';
            announcement.style.zIndex = '100';
            announcement.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            
            document.querySelector('.maze-container').appendChild(announcement);
            setTimeout(() => announcement.remove(), 3000);
        }
        
        // Generate new maze after celebration
        setTimeout(() => {
            generateMaze();
        }, 1500);
    }
    
    // Enhanced trail effect
    function createEnhancedTrail(x, y) {
        const oldCell = getCellElement(x, y);
        
        // Create main trail
        const trail = document.createElement('div');
        trail.className = 'trail';
        oldCell.appendChild(trail);
        
        // Create a couple more smaller particles
        for (let i = 0; i < 3; i++) {
            const particle = document.createElement('div');
            particle.className = 'trail';
            particle.style.width = `${10 + Math.random() * 10}%`;
            particle.style.height = `${10 + Math.random() * 10}%`;
            particle.style.left = `${30 + Math.random() * 40}%`;
            particle.style.top = `${30 + Math.random() * 40}%`;
            particle.style.opacity = '0.7';
            
            oldCell.appendChild(particle);
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 600 + Math.random() * 200);
        }
        
        setTimeout(() => {
            if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        }, 1000);
    }
    
    // Helper function to get cell element by coordinates
    function getCellElement(x, y) {
        return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    }
    
    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Mobile experience initialization
    function initializeMobileExperience() {
        // Check if on mobile
        const isMobile = ('ontouchstart' in window) || window.matchMedia('(max-width: 768px)').matches;
        
        if (isMobile) {
            // Show touch controls
            document.querySelector('.mobile-controls').style.display = 'block';
            
            // Show swipe hint for first-time users
            showSwipeHint();
            
            // Make sure we start in 2D mode on mobile for better initial experience
            document.body.classList.remove('view-3d');
        }
    }
    
    // First-time user swipe hint
    function showSwipeHint() {
        if (!localStorage.getItem('swipeHintShown')) {
            const hint = document.createElement('div');
            hint.className = 'swipe-hint';
            document.querySelector('#maze-wrapper').appendChild(hint);
            
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 3000);
            
            localStorage.setItem('swipeHintShown', 'true');
        }
    }
});
