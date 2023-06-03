export function createWordSearch(words: string[], gridSize: number) {
  const grid = createEmptyGrid(gridSize);
  const wordMap = {};
  for (const word of words) {
    let placed = false;
    while (!placed) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      const direction = getRandomDirection();

      if (canPlaceWord(grid, row, col, direction, word)) {
        placeWord(grid, row, col, direction, word, wordMap);
        placed = true;
      }
    }
  }

  fillEmptySpaces(grid);
  return { grid, wordMap };
}

function getRandomDirection() {
  const directions = ["horizontal", "vertical", "diagonal"];
  const randomIndex = Math.floor(Math.random() * directions.length);
  return directions[randomIndex];
}

function canPlaceWord(grid: string[][], row: number, col: number, direction: string, word: string) {
  const gridSize = grid.length;

  for (let i = 0; i < word.length; i++) {
    let currentRow = row;
    let currentCol = col;

    if (direction === "horizontal") {
      currentCol += i;
    } else if (direction === "vertical") {
      currentRow += i;
    } else if (direction === "diagonal") {
      currentRow += i;
      currentCol += i;
    }

    if (
      currentRow < 0 ||
      currentRow >= gridSize ||
      currentCol < 0 ||
      currentCol >= gridSize ||
      (grid[currentRow][currentCol] !== " " &&
        grid[currentRow][currentCol] !== word[i])
    ) {
      return false;
    }
  }

  return true;
}

function placeWord(grid: string[][], row: number, col: number, direction: string, word: string, wordMap: { [key: string]: any }) {
  for (let i = 0; i < word.length; i++) {
    let currentRow = row;
    let currentCol = col;

    if (direction === "horizontal") {
      currentCol += i;
    } else if (direction === "vertical") {
      currentRow += i;
    } else if (direction === "diagonal") {
      currentRow += i;
      currentCol += i;
    }

    grid[currentRow][currentCol] = word[i];
    if (!wordMap[word]) wordMap[word] = { idxs: [] };
    wordMap[word]['idxs'].push([currentRow, currentCol]);
  }
}

// Rest of the code remains the same
function createEmptyGrid(gridSize: number) {
  const grid: string[][] = [];

  for (let row = 0; row < gridSize; row++) {
    grid[row] = [];
    for (let col = 0; col < gridSize; col++) {
      grid[row][col] = " ";
    }
  }

  return grid;
}

function fillEmptySpaces(grid: string[][]) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === " ") {
        grid[row][col] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }
}