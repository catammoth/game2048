class Game2048 {
    constructor() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.gameBoard = document.getElementById('game-board');
        this.scoreDisplay = document.getElementById('score');
        this.init();
    }

    init() {
        // Add initial tiles
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();

        // Add event listeners
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('new-game').addEventListener('click', () => {
            this.reset();
        });
    }

    reset() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    getPositionFromIndex(i, j) {
        return {
            x: j * 90 + 10,
            y: i * 90 + 10
        };
    }

    updateDisplay() {
        // Store existing tiles and their positions
        const existingTiles = Array.from(this.gameBoard.getElementsByClassName('tile'));
        const tileMap = new Map();
        
        existingTiles.forEach(tile => {
            const value = parseInt(tile.getAttribute('data-value'));
            const row = parseInt(tile.getAttribute('data-row'));
            const col = parseInt(tile.getAttribute('data-col'));
            tileMap.set(`${row}-${col}`, tile);
        });

        this.gameBoard.innerHTML = '';
        
        // Create grid cells (background)
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const gridCell = document.createElement('div');
                gridCell.className = 'grid-cell';
                const pos = this.getPositionFromIndex(i, j);
                gridCell.style.left = pos.x + 'px';
                gridCell.style.top = pos.y + 'px';
                this.gameBoard.appendChild(gridCell);
            }
        }

        // Update tiles with animation
        requestAnimationFrame(() => {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    const value = this.board[i][j];
                    if (value !== 0) {
                        let tile = tileMap.get(`${i}-${j}`);
                        const pos = this.getPositionFromIndex(i, j);

                        if (!tile) {
                            // Create new tile
                            tile = document.createElement('div');
                            tile.className = 'tile new-tile';
                        } else {
                            tile.className = 'tile';
                            tileMap.delete(`${i}-${j}`);
                        }

                        tile.textContent = value;
                        tile.setAttribute('data-value', value);
                        tile.setAttribute('data-row', i);
                        tile.setAttribute('data-col', j);
                        
                        // Set initial position
                        if (tile.className === 'tile new-tile') {
                            tile.style.left = pos.x + 'px';
                            tile.style.top = pos.y + 'px';
                        }
                        
                        this.gameBoard.appendChild(tile);
                        
                        // Animate to new position
                        requestAnimationFrame(() => {
                            tile.style.left = pos.x + 'px';
                            tile.style.top = pos.y + 'px';
                        });
                    }
                }
            }

            // Remove old tiles
            tileMap.forEach(tile => {
                tile.remove();
            });
        });

        this.scoreDisplay.textContent = this.score;
    }

    handleKeyPress(event) {
        let moved = false;
        const oldBoard = JSON.stringify(this.board);

        switch(event.key) {
            case 'ArrowUp':
                moved = this.moveUp();
                break;
            case 'ArrowDown':
                moved = this.moveDown();
                break;
            case 'ArrowLeft':
                moved = this.moveLeft();
                break;
            case 'ArrowRight':
                moved = this.moveRight();
                break;
            default:
                return;
        }

        if (moved) {
            this.addRandomTile();
            this.updateDisplay();
            
            if (this.isGameOver()) {
                alert('Game Over! Your score: ' + this.score);
                this.reset();
            }
        }
    }

    moveRow(row) {
        let newRow = row.filter(cell => cell !== 0);
        for (let i = 0; i < newRow.length - 1; i++) {
            if (newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                this.score += newRow[i];
                newRow.splice(i + 1, 1);
            }
        }
        while (newRow.length < 4) {
            newRow.push(0);
        }
        return newRow;
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const oldRow = [...this.board[i]];
            this.board[i] = this.moveRow(this.board[i]);
            if (JSON.stringify(oldRow) !== JSON.stringify(this.board[i])) {
                moved = true;
            }
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const oldRow = [...this.board[i]];
            this.board[i] = this.moveRow([...this.board[i].reverse()]).reverse();
            if (JSON.stringify(oldRow) !== JSON.stringify(this.board[i])) {
                moved = true;
            }
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            const column = this.board.map(row => row[j]);
            const oldColumn = [...column];
            const newColumn = this.moveRow(column);
            
            for (let i = 0; i < 4; i++) {
                this.board[i][j] = newColumn[i];
            }
            
            if (JSON.stringify(oldColumn) !== JSON.stringify(newColumn)) {
                moved = true;
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            const column = this.board.map(row => row[j]).reverse();
            const oldColumn = [...column];
            const newColumn = this.moveRow(column).reverse();
            
            for (let i = 0; i < 4; i++) {
                this.board[i][j] = newColumn[i];
            }
            
            if (JSON.stringify(oldColumn) !== JSON.stringify(newColumn)) {
                moved = true;
            }
        }
        return moved;
    }

    isGameOver() {
        // Check for empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) return false;
            }
        }

        // Check for possible merges
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (
                    (i < 3 && this.board[i][j] === this.board[i + 1][j]) ||
                    (j < 3 && this.board[i][j] === this.board[i][j + 1])
                ) {
                    return false;
                }
            }
        }
        return true;
    }
}

// Start the game
new Game2048(); 