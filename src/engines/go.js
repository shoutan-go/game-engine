import {
  createBoard,
  currentColor,
  getAdjacentIntersections,
  getGroup,
} from '../utils';

import { Go as GoConstants } from '../constants';

const Go = function(info, moves) {
  this.info = info;
  this.moves = [];
  this.board = createBoard(info.boardsize);
  this.captured = {
    0b01: 0, // color
    0b10: 0,
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

Go.COLOR = GoConstants.COLOR;

Go.STATE = GoConstants.STATE;

// public methods
Go.prototype.currentColor = function() {
  return currentColor(this.moves);
};

Go.prototype.pass = function(color) {
  if (currentColor(this.moves) === color) {
    this.moves.push({
      color,
      type: 'pass',
    });
    return true;
  }
  return false;
};

Go.prototype.rules = function(color, i, j) {
  // color
  if (currentColor(this.moves) !== color) {
    return false;
  }
  // stone
  if (this.board[i][j] !== Go.COLOR.EMPTY) return false;
  // simulate move
  // eslint-disable-next-line camelcase
  const simulate_board = JSON.parse(JSON.stringify(this.board));
  simulate_board[i][j] = currentColor(this.moves);
  const captured = [];
  const neighbors = getAdjacentIntersections(this.info.boardsize, i, j);
  const self = this;
  neighbors.forEach(n => {
    const state = simulate_board[n[0]][n[1]];
    if (state !== Go.COLOR.EMPTY && state !== currentColor(self.moves)) {
      const group = getGroup(simulate_board, n[0], n[1]);
      if (group.liberties === 0) captured.push(group);
    }
  });
  // detect suicide on simulate board
  if (
    captured &&
    captured.length === 0 &&
    getGroup(simulate_board, i, j).liberties === 0
  ) {
    return false;
  }
  // ko fight on simulate board
  if (
    this.last_move_hash &&
    this.last_move_hash === simulate_board.toString()
  ) {
    return false;
  }
  return true;
};

Go.prototype.play = function(color, i, j) {
  if (this.rules(color, i, j)) {
    this.last_move_hash = this.board.toString();
    this.board[i][j] = currentColor(this.moves);
    const captured = [];
    const neighbors = getAdjacentIntersections(this.info.boardsize, i, j);
    const self = this;
    neighbors.forEach(n => {
      const state = self.board[n[0]][n[1]];
      if (state !== Go.COLOR.EMPTY && state !== currentColor(self.moves)) {
        const group = getGroup(self.board, n[0], n[1]);
        if (group.liberties === 0) captured.push(group);
      }
    });
    captured.forEach(group => {
      group.stones.forEach(stone => {
        self.board[stone[0]][stone[1]] = Go.COLOR.EMPTY;
      });
    });
    this.moves.push({
      color,
      type: 'play',
      position: [i, j],
    });
    captured.forEach(group => {
      this.captured[color] += group.stones.length;
    });
    return captured.length;
  }
  return false;
};

Go.prototype.resign = function(color) {
  if (currentColor(this.moves) === color) {
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
  let sgf =
    `(;FF[4]GM[1]SZ[${this.info.boardsize}]` +
    `GN[Copyright ShouTan Go]` +
    `HA[${this.info.handicap}]` +
    `KM[${this.info.komi}]` +
    `RU[${this.info.rule || 'Chinese'}]`;
  this.moves.forEach(move => {
    sgf += `;${move.color === Go.COLOR.BLACK ? 'B' : 'W'}`;
    switch (move.type) {
      case 'play':
        sgf += `[${String.fromCharCode(97 + move.position[0]) +
          String.fromCharCode(97 + move.position[1])}]`;
        break;
      case 'pass':
        sgf += '[]';
        break;
      default:
        break;
    }
  });
  sgf += ')';
  return sgf;
};

export default Go;
