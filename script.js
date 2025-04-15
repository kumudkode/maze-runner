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
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Add these variables to your existing script
    let gameMode = 'standard';
    let level = 1;
    let timer = null;
    let timeElapsed = 0;
    let isPaused = false;
    let soundEnabled = true;
    let musicEnabled = true;

    // Elements
    const standardModeBtn = document.getElementById('standard-mode');
    const timeDisplay = document.getElementById('time-display');
    const soundToggleBtn = document.getElementById('sound-toggle');
    const musicToggleBtn = document.getElementById('music-toggle');
    const pauseMenu = document.getElementById('pause-menu');
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtn = document.getElementById('restart-btn');
    const helpBtn = document.getElementById('help-btn');

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
    themeToggleBtn.addEventListener('click', toggleTheme);

    standardModeBtn.addEventListener('click', () => setGameMode('standard'));
    soundToggleBtn.addEventListener('click', toggleSound);
    musicToggleBtn.addEventListener('click', toggleMusic);
    resumeBtn.addEventListener('click', resumeGame);
    restartBtn.addEventListener('click', restartGame);
    helpBtn.addEventListener('click', showHelp);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isPaused) {
                resumeGame();
            } else {
                pauseGame();
            }
        }
    });
    
    // Make sure this is called when the page loads
    window.addEventListener('load', () => {
        updateSizeDisplay();
        generateMaze();
    });

    // Also make sure event listeners are properly set up
    sizeSlider.addEventListener('change', () => {
        updateSizeDisplay();
        generateMaze();
    });
    
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
        const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.6);
        const baseCellSize = Math.max(10, Math.min(30, Math.floor(maxSize / size)));
        document.documentElement.style.setProperty('--cell-size', `${baseCellSize}px`);
    }
    
    // Simplify the game setup - remove difficulty levels and keep only size option
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
    
    // Render the maze in the DOM - fixed function
    function renderMaze() {
        // Clear the maze element
        mazeElement.innerHTML = '';
        
        // Set CSS variables for maze dimensions
        document.documentElement.style.setProperty('--maze-size', size);
        
        // Set the grid template explicitly
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
                
                // Mark start point
                if (x === playerPosition.x && y === playerPosition.y) {
                    cell.classList.add('current');
                    
                    // Create player
                    const player = document.createElement('div');
                    player.classList.add('player');
                    cell.appendChild(player);
                }
                
                // Mark end point
                if (x === endPosition.x && y === endPosition.y) {
                    cell.classList.add('end');
                    
                    // Create end marker
                    const endMarker = document.createElement('div');
                    endMarker.classList.add('end-marker');
                    cell.appendChild(endMarker);
                }
                
                mazeElement.appendChild(cell);
            }
        }
        
        // Update move counter position to ensure it's not overlapping
        moveCounter.textContent = `Moves: ${moveCount}`;
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
    
    // Simplified victory celebration with just confetti
    function celebrateVictory() {
        // Create confetti
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            
            // Random shapes
            if (i % 10 === 0) {
                confetti.style.borderRadius = '0';
            } else if (i % 7 === 0) {
                confetti.style.borderRadius = '50%';
            }
            
            // Random colors
            const colors = [
                'var(--primary)', 'var(--secondary)', 'var(--success)', 
                '#FFD700', '#FF4500'
            ];
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Random positions
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animation = `confetti ${1 + Math.random() * 2}s forwards`;
            
            document.querySelector('.maze-container').appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
        
        // Update best score
        if (moveCount < bestMoves) {
            bestMoves = moveCount;
            localStorage.setItem('mazeBestMoves', bestMoves);
            bestScoreElement.textContent = bestMoves;
        }
        
        // Show a congratulation message
        const congratsMessage = document.createElement('div');
        congratsMessage.className = 'congrats-message';
        congratsMessage.textContent = 'Congratulations!';
        document.querySelector('.maze-container').appendChild(congratsMessage);
        
        // Generate a new maze after a short delay
        setTimeout(() => {
            // Remove the congratulation message
            if (congratsMessage.parentNode) {
                congratsMessage.parentNode.removeChild(congratsMessage);
            }
            
            // Generate new maze
            generateMaze();
        }, 3000);
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
            const mobileControls = document.querySelector('.mobile-controls');
            mobileControls.style.display = 'block';
            
            // Create D-pad if it doesn't exist
            if (!mobileControls.querySelector('.d-pad')) {
                const dPad = document.createElement('div');
                dPad.className = 'd-pad';
                
                // Create D-pad buttons
                const directions = [
                    { dir: 'up', text: '↑', class: 'up-btn' },
                    { dir: 'right', text: '→', class: 'right-btn' },
                    { dir: 'down', text: '↓', class: 'down-btn' },
                    { dir: 'left', text: '←', class: 'left-btn' }
                ];
                
                directions.forEach(d => {
                    const btn = document.createElement('button');
                    btn.className = `d-btn ${d.class}`;
                    btn.dataset.direction = d.dir;
                    
                    const span = document.createElement('span');
                    span.textContent = d.text;
                    btn.appendChild(span);
                    
                    dPad.appendChild(btn);
                });
                
                mobileControls.appendChild(dPad);
            }
            
            // Show swipe hint for first-time users
            showSwipeHint();
        }
        
        // Add debounced event listeners for mobile d-pad
        const dPad = document.querySelector('.d-pad');
        if (dPad) {
            // Remove existing listeners first to prevent duplicates
            const buttons = dPad.querySelectorAll('.d-btn');
            buttons.forEach(btn => {
                btn.replaceWith(btn.cloneNode(true));
            });
            
            // Add new listeners with mobile-specific handling
            const newButtons = dPad.querySelectorAll('.d-btn');
            
            // Track if we're currently processing a move
            let isMoving = false;
            
            newButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (isMoving || solving || isPaused) return;
                    
                    isMoving = true;
                    const direction = btn.dataset.direction;
                    
                    // Add visual feedback
                    btn.classList.add('pressed');
                    setTimeout(() => btn.classList.remove('pressed'), 200);
                    
                    switch (direction) {
                        case 'up':
                            movePlayerMobile(0, -1, 'top');
                            break;
                        case 'right':
                            movePlayerMobile(1, 0, 'right');
                            break;
                        case 'down':
                            movePlayerMobile(0, 1, 'bottom');
                            break;
                        case 'left':
                            movePlayerMobile(-1, 0, 'left');
                            break;
                    }
                    
                    // Reset the moving state after a delay
                    setTimeout(() => {
                        isMoving = false;
                    }, 300);
                });
            });
        }
    }

    // Create a mobile-specific version of movePlayer that uses more direct DOM manipulation
    function movePlayerMobile(dx, dy, wallDirection) {
        // Check if there's a wall in the direction we want to move
        if (maze[playerPosition.y][playerPosition.x].walls[wallDirection]) {
            return; // Can't move through walls
        }
        
        // Calculate new position
        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;
        
        // Check if valid position
        if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
            // Update move counter
            moveCount++;
            moveCounter.textContent = `Moves: ${moveCount}`;
            
            // Remove player from current cell
            const currentCell = document.querySelector(`.cell[data-x="${playerPosition.x}"][data-y="${playerPosition.y}"]`);
            if (currentCell) {
                currentCell.classList.remove('current');
                const player = currentCell.querySelector('.player');
                if (player) player.remove();
            }
            
            // Update player position
            playerPosition.x = newX;
            playerPosition.y = newY;
            
            // Find the new cell
            const newCell = document.querySelector(`.cell[data-x="${newX}"][data-y="${newY}"]`);
            
            if (newCell) {
                // Make it the current cell
                newCell.classList.add('current');
                
                // Add player to the new cell
                const newPlayer = document.createElement('div');
                newPlayer.classList.add('player');
                newCell.appendChild(newPlayer);
                
                // Check if we've reached the goal
                checkVictory();
            }
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

    // Setup game mode and functions
    function setGameMode(mode) {
        gameMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        
        switch(mode) {
            case 'standard':
                standardModeBtn.classList.add('active');
                break;
        }
        
        generateMaze();
    }

    // Timer functions
    function startTimer() {
        if (timer) clearInterval(timer);
        timeElapsed = 0;
        updateTimerDisplay();
        
        timer = setInterval(() => {
            timeElapsed++;
            updateTimerDisplay();
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeElapsed / 60).toString().padStart(2, '0');
        const seconds = (timeElapsed % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${minutes}:${seconds}`;
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    // Game state functions
    function pauseGame() {
        if (isPaused) return;
        
        isPaused = true;
        stopTimer();
        pauseMenu.classList.remove('hidden');
    }

    function resumeGame() {
        isPaused = false;
        startTimer();
        pauseMenu.classList.add('hidden');
    }

    function restartGame() {
        pauseMenu.classList.add('hidden');
        isPaused = false;
        generateMaze();
    }

    function showHelp() {
        alert(`
            Maze Runner Controls:
            
            - Arrow keys to move
            - ESC to pause/resume
            - Space to solve automatically
        `);
    }

    // Victory check update
    function checkVictory() {
        if (playerPosition.x === endPosition.x && playerPosition.y === endPosition.y) {
            setTimeout(() => {
                celebrateVictory();
            }, 300);
            return true;
        }
        return false;
    }

    // Handle keyboard navigation
    function handleKeyPress(e) {
        if (solving || isPaused) return;
        
        // Prevent default scrolling behavior
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.key)) {
            e.preventDefault();
        }
        
        switch (e.key) {
            case 'ArrowUp':
                movePlayer(0, -1, 'top');
                break;
            case 'ArrowRight':
                movePlayer(1, 0, 'right');
                break;
            case 'ArrowDown':
                movePlayer(0, 1, 'bottom');
                break;
            case 'ArrowLeft':
                movePlayer(-1, 0, 'left');
                break;
            case ' ': // Space bar
                solveMaze();
                break;
            case 'r':
            case 'R':
                generateMaze();
                break;
            case 't':
            case 'T':
                toggleTheme();
                break;
            case 'Escape':
                if (isPaused) {
                    resumeGame();
                } else {
                    pauseGame();
                }
                break;
        }
    }

    // Move player based on direction
    function movePlayer(dx, dy, wallDirection) {
        // Check if there's a wall in the direction we want to move
        if (maze[playerPosition.y][playerPosition.x].walls[wallDirection]) {
            return; // Can't move through walls
        }
        
        // Calculate new position
        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;
        
        // Check if valid position
        if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
            // Create trail effect
            createTrail(playerPosition.x, playerPosition.y);
            
            // Update move counter
            moveCount++;
            moveCounter.textContent = `Moves: ${moveCount}`;
            
            // Remove player from current cell
            const currentCell = getCellElement(playerPosition.x, playerPosition.y);
            currentCell.classList.remove('current');
            const player = currentCell.querySelector('.player');
            if (player) {
                currentCell.removeChild(player);
            }
            
            // Update player position
            playerPosition.x = newX;
            playerPosition.y = newY;
            
            // Update new cell
            const newCell = getCellElement(newX, newY);
            newCell.classList.add('current');
            
            // Add player to new cell
            const newPlayer = document.createElement('div');
            newPlayer.classList.add('player');
            newCell.appendChild(newPlayer);
            
            // Check if we've reached the end
            checkVictory();
        }
    }

    // Create trail effect
    function createTrail(x, y) {
        const cell = getCellElement(x, y);
        const trail = document.createElement('div');
        trail.className = 'trail';
        cell.appendChild(trail);
        
        // Remove trail after animation completes
        setTimeout(() => {
            if (trail.parentNode) {
                trail.parentNode.removeChild(trail);
            }
        }, 1000);
    }
});
