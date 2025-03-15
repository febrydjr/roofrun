class GameManager {
  grid: string[][]
  gridSize: number
  colors: string[] = ["#C22022", "#7CA24A", "#4882A3"] // Red, Green, Blue

  constructor(gridSize: number) {
    this.gridSize = gridSize
    this.grid = this.generateGrid()
  }

  // Generate a random grid with the specified colors
  generateGrid(): string[][] {
    const grid: string[][] = []

    for (let i = 0; i < this.gridSize; i++) {
      const row: string[] = []
      for (let j = 0; j < this.gridSize; j++) {
        const randomIndex = Math.floor(Math.random() * this.colors.length)
        row.push(this.colors[randomIndex])
      }
      grid.push(row)
    }

    // Ensure there's at least one valid move
    if (!this.hasValidMoves(grid)) {
      return this.generateGrid()
    }

    return grid
  }

  // Check if there are any valid moves in the grid
  hasValidMoves(grid: string[][]): boolean {
    // Get all non-empty positions
    const positions: [number, number][] = []
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (grid[i][j]) {
          positions.push([i, j])
        }
      }
    }

    // For each position, check if it has any matching neighbors
    for (const [row, col] of positions) {
      const color = grid[row][col]
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ] // up, down, left, right

      for (const [dx, dy] of directions) {
        const newRow = row + dx
        const newCol = col + dy

        if (
          newRow >= 0 &&
          newRow < this.gridSize &&
          newCol >= 0 &&
          newCol < this.gridSize &&
          grid[newRow][newCol] === color
        ) {
          return true // Found at least one valid move
        }
      }
    }

    return false // No valid moves found
  }

  // Handle click on a square
  handleClick(row: number, col: number): { validMove: boolean; removedCount: number } {
    const color = this.grid[row][col]
    if (!color) return { validMove: false, removedCount: 0 }

    // Find all adjacent cells with the same color
    const adjacentCells = this.findAdjacentSameColorCells(this.grid, row, col, color, new Set())

    // If there are at least 2 adjacent cells (including the clicked one), remove them
    if (adjacentCells.size >= 2) {
      for (const cell of adjacentCells) {
        const [r, c] = cell.split(",").map(Number)
        this.grid[r][c] = ""
      }

      // Apply gravity
      this.applyGravity()

      return { validMove: true, removedCount: adjacentCells.size }
    }

    return { validMove: false, removedCount: 0 }
  }

  // Find all adjacent cells with the same color using flood fill algorithm
  findAdjacentSameColorCells(
    grid: string[][],
    row: number,
    col: number,
    color: string,
    visited: Set<string>,
  ): Set<string> {
    const key = `${row},${col}`

    // If out of bounds, already visited, or different color, return
    if (
      row < 0 ||
      row >= this.gridSize ||
      col < 0 ||
      col >= this.gridSize ||
      visited.has(key) ||
      grid[row][col] !== color
    ) {
      return visited
    }

    // Add current cell to visited
    visited.add(key)

    // Check adjacent cells (up, right, down, left)
    this.findAdjacentSameColorCells(grid, row - 1, col, color, visited)
    this.findAdjacentSameColorCells(grid, row, col + 1, color, visited)
    this.findAdjacentSameColorCells(grid, row + 1, col, color, visited)
    this.findAdjacentSameColorCells(grid, row, col - 1, color, visited)

    return visited
  }

  // Apply gravity to make squares fall down and left
  applyGravity() {
    // First, make squares fall down in each column
    for (let col = 0; col < this.gridSize; col++) {
      let emptyRow = this.gridSize - 1

      for (let row = this.gridSize - 1; row >= 0; row--) {
        if (this.grid[row][col]) {
          if (row !== emptyRow) {
            this.grid[emptyRow][col] = this.grid[row][col]
            this.grid[row][col] = ""
          }
          emptyRow--
        }
      }
    }

    // Then, shift columns to the left if a column is completely empty
    for (let col = 0; col < this.gridSize - 1; col++) {
      // Check if column is empty
      let isEmpty = true
      for (let row = 0; row < this.gridSize; row++) {
        if (this.grid[row][col]) {
          isEmpty = false
          break
        }
      }

      if (isEmpty) {
        // Find the next non-empty column
        let nextNonEmptyCol = -1
        for (let j = col + 1; j < this.gridSize; j++) {
          let hasContent = false
          for (let row = 0; row < this.gridSize; row++) {
            if (this.grid[row][j]) {
              hasContent = true
              break
            }
          }

          if (hasContent) {
            nextNonEmptyCol = j
            break
          }
        }

        // If found, shift that column to the current empty column
        if (nextNonEmptyCol !== -1) {
          for (let row = 0; row < this.gridSize; row++) {
            this.grid[row][col] = this.grid[row][nextNonEmptyCol]
            this.grid[row][nextNonEmptyCol] = ""
          }
        }
      }
    }
  }

  // Check if the game is won (all squares cleared)
  checkWinCondition(): boolean {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col]) {
          return false
        }
      }
    }
    return true
  }

  // Check if there are no more valid moves
  checkLoseCondition(): boolean {
    // First check if there are any squares left
    let hasSquares = false
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col]) {
          hasSquares = true
          break
        }
      }
      if (hasSquares) break
    }

    // If there are squares but no valid moves, it's a loss
    return hasSquares && !this.hasValidMoves(this.grid)
  }
}

export default GameManager

