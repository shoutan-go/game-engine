/* eslint-disable no-bitwise,no-use-before-define,func-names */
// private methods
const createBoard = function(size) {
  const m = [];
  for (let i = 0; i < size; i += 1) {
    m[i] = [];
    for (let j = 0; j < size; j += 1) m[i][j] = Go.COLOR.EMPTY;
  }
  return m;
};

const _currentColor = function(moves) {
  if (moves.length > 0 && moves[moves.length - 1].type === 'resign') {
    return Go.COLOR.EMPTY;
  } else if (moves.length > 1 &&
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

const Go = function(info, moves) {
  this.info = info;
  this.moves = [];
  this.board = createBoard(info.boardsize);
  this.captured = {
    0b01: 0, // color
    0b10: 0
  };
  const self = this;
  moves.forEach(move => {
    switch (move.type) {
      case 'play':
        self.play(move.color, move.position[0], move.position[1]);
        break;
      case 'pass':
        self.pass(move.color);
        break;
      case 'resign':
        self.resign(move.color);
        break;
      default:
    }
  });
};

Go.COLOR = {
  BLACK: 0b01,
  WHITE: 0b10,
  EMPTY: 0b00,
};

Go.STATE = {
  BLACK_READY: 0b10,
  WHITE_READY: 0b01,
  WAITING: 0b00,
  PLAYING: 0b11,
  FINISHED: 0b111,
};

// public methods
Go.prototype.currentColor = function() {
  return _currentColor(this.moves);
}

Go.prototype.pass = function(color) {
  if (_currentColor(this.moves) === color) {
    this.moves.push({
      color,
      type: 'pass',
    });
    return true;
  }
  return false;
};

Go.prototype.play = function(color, i, j) {
  if (_currentColor(this.moves) !== color) {
    return false;
  }
  if (this.board[i][j] !== Go.COLOR.EMPTY) return false;
  this.saved_board = JSON.parse(JSON.stringify(this.board));
  this.board[i][j] = _currentColor(this.moves);
  const captured = [];
  const neighbors = getAdjacentIntersections(this.info.boardsize, i, j);

  const self = this;
  neighbors.forEach(n => {
    const state = self.board[n[0]][n[1]];
    if (state !== Go.COLOR.EMPTY && state !== _currentColor(self.moves)) {
      const group = getGroup(self.board, n[0], n[1]);
      if (group.liberties === 0) captured.push(group);
    }
  });

  // detect suicide
  if (
    captured &&
    captured.length === 0 &&
    getGroup(this.board, i, j).liberties === 0
  ) {
    this.board[i][j] = Go.COLOR.EMPTY;
    return false;
  }

  captured.forEach(group => {
    group.stones.forEach(stone => {
      self.board[stone[0]][stone[1]] = Go.COLOR.EMPTY;
    });
  });

  if (this.last_move_hash && this.last_move_hash === this.board.toString()) {
    this.board = this.saved_board;
    return false;
  }
  this.last_move_hash = this.saved_board.toString();
  delete this.saved_board;
  this.moves.push({
    color,
    type: 'play',
    position: [i, j],
  });
  captured.forEach(group => {
    this.captured[color] += group.stones.length;
  });
  return captured.length;
};

Go.prototype.resign = function(color) {
  if (_currentColor(this.moves) === color) {
    this.moves.push({
      color,
      type: 'resign',
    });
    return true;
  }
  return false;
};

Go.prototype.toJson = function() {
  return {
    info: this.info,
    moves: this.moves,
  };
};

Go.prototype.toSgf = function() {
  let sgf = `(;FF[4]GM[1]SZ[${this.info.boardsize}]` +
  `GN[Copyright ShouTan Go]` +
  `HA[${this.info.handicap}]` +
  `KM[${this.info.komi}]` +
  `RU[${this.info.rule || 'Chinese'}]`
  this.moves.forEach((move) => {
    sgf += `;${move.color === Go.COLOR.BLACK ? 'B': 'W'}`
    switch(move.type){
      case 'play':
        sgf += `[${String.fromCharCode(97 + move.position[0]) +
        String.fromCharCode(97 + move.position[1])}]`
        break;
      case 'pass':
        sgf += '[]'
        break;
      default:
        break;
    }
  });
  sgf += ')'
  return sgf;
};

((root, factory) => {
  // AMD. Register as an anonymous module.
  // eslint-disable-next-line no-undef
  if (typeof define === 'function' && define.amd) {
    // eslint-disable-next-line no-undef
    define('Go', [], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    // eslint-disable-next-line global-require,import/no-extraneous-dependencies
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    // eslint-disable-next-line no-param-reassign
    root.Go = factory();
  }
})(this, () => Go);

