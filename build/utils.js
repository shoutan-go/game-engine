'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.currentColor = exports.createBoard = exports.getAdjacentIntersections = exports.getGroup = undefined;

var _constants = require('./constants');

var createBoard = function createBoard(size) {
  var m = [];
  for (var i = 0; i < size; i += 1) {
    m[i] = [];
    for (var j = 0; j < size; j += 1) {
      m[i][j] = _constants.Go.COLOR.EMPTY;
    }
  }
  return m;
};

var currentColor = function currentColor(moves) {
  if (moves.length > 0 && moves[moves.length - 1].type === 'resign') {
    return _constants.Go.COLOR.EMPTY;
  } else if (moves.length > 1 && moves[moves.length - 1].type === 'pass' && moves[moves.length - 2].type === 'pass') {
    return _constants.Go.COLOR.EMPTY;
  } else if (moves[moves.length - 1]) {
    return moves[moves.length - 1].color ^ 3;
  }
  return _constants.Go.COLOR.BLACK;
};

var getAdjacentIntersections = function getAdjacentIntersections(size, i, j) {
  var neighbors = [];
  if (i > 0) neighbors.push([i - 1, j]);
  if (j < size - 1) neighbors.push([i, j + 1]);
  if (i < size - 1) neighbors.push([i + 1, j]);
  if (j > 0) neighbors.push([i, j - 1]);
  return neighbors;
};

var getGroup = function getGroup(board, i, j) {
  var color = board[i][j];
  if (color === _constants.Go.COLOR.EMPTY) return null;

  var visited = {};
  var visitedList = [];
  var queue = [[i, j]];

  var liberties = new Set();
  var visiting = function visiting(n) {
    var state = board[n[0]][n[1]];
    if (state === _constants.Go.COLOR.EMPTY) liberties.add(JSON.stringify(n));
    if (state === color) queue.push([n[0], n[1]]);
  };
  while (queue.length > 0) {
    var stone = queue.pop();
    if (!visited[stone]) {
      var neighbors = getAdjacentIntersections(board.length, stone[0], stone[1]);
      neighbors.forEach(visiting);
      visited[stone] = true;
      visitedList.push(stone);
    }
  }

  return {
    liberties: liberties.size,
    stones: visitedList
  };
};

exports.getGroup = getGroup;
exports.getAdjacentIntersections = getAdjacentIntersections;
exports.createBoard = createBoard;
exports.currentColor = currentColor;