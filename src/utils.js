/* eslint-disable no-bitwise */

import { Go } from './constants';

const createBoard = function(size) {
  const m = [];
  for (let i = 0; i < size; i += 1) {
    m[i] = [];
    for (let j = 0; j < size; j += 1) m[i][j] = Go.COLOR.EMPTY;
  }
  return m;
};

const currentColor = function(moves) {
  if (moves.length > 0 && moves[moves.length - 1].type === 'resign') {
    return Go.COLOR.EMPTY;
  } else if (
    moves.length > 1 &&
    moves[moves.length - 1].type === 'pass' &&
    moves[moves.length - 2].type === 'pass'
  ) {
    return Go.COLOR.EMPTY;
  } else if (moves[moves.length - 1]) {
    return moves[moves.length - 1].color ^ 0b11;
  }
  return Go.COLOR.BLACK;
};

const getAdjacentIntersections = function(size, i, j) {
  const neighbors = [];
  if (i > 0) neighbors.push([i - 1, j]);
  if (j < size - 1) neighbors.push([i, j + 1]);
  if (i < size - 1) neighbors.push([i + 1, j]);
  if (j > 0) neighbors.push([i, j - 1]);
  return neighbors;
};

const getGroup = function(board, i, j) {
  const color = board[i][j];
  if (color === Go.COLOR.EMPTY) return null;

  const visited = {}; // for O(1) lookups
  const visitedList = []; // for returning
  const queue = [[i, j]];
  let count = 0;

  const visiting = n => {
    const state = board[n[0]][n[1]];
    if (state === Go.COLOR.EMPTY) count += 1;
    if (state === color) queue.push([n[0], n[1]]);
  };
  while (queue.length > 0) {
    const stone = queue.pop();
    if (!visited[stone]) {
      const neighbors = getAdjacentIntersections(
        board.length,
        stone[0],
        stone[1],
      );
      neighbors.forEach(visiting);
      visited[stone] = true;
      visitedList.push(stone);
    }
  }

  return {
    liberties: count,
    stones: visitedList,
  };
};

export { getGroup, getAdjacentIntersections, createBoard, currentColor };
