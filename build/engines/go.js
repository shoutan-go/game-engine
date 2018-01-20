'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require('../utils');

var _constants = require('../constants');

var Go = function Go(info, moves) {
  this.info = info;
  this.moves = [];
  this.board = (0, _utils.createBoard)(info.boardsize);
  this.boardMoves = (0, _utils.createBoard)(info.boardsize);
  this.captured = {
    1: 0,
    2: 0
  };
  var self = this;
  moves.forEach(function (move) {
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

Go.COLOR = _constants.Go.COLOR;

Go.STATE = _constants.Go.STATE;

Go.prototype.currentColor = function () {
  return (0, _utils.currentColor)(this.moves);
};

Go.prototype.pass = function (color) {
  if ((0, _utils.currentColor)(this.moves) === color) {
    this.moves.push({
      color: color,
      type: 'pass'
    });
    return true;
  }
  return false;
};

Go.prototype.rules = function (color, i, j) {
  if ((0, _utils.currentColor)(this.moves) !== color) {
    return false;
  }

  if (this.board[i][j] !== Go.COLOR.EMPTY) return false;

  var simulate_board = JSON.parse(JSON.stringify(this.board));
  simulate_board[i][j] = (0, _utils.currentColor)(this.moves);
  var captured = [];
  var neighbors = (0, _utils.getAdjacentIntersections)(this.info.boardsize, i, j);
  var self = this;
  neighbors.forEach(function (n) {
    var state = simulate_board[n[0]][n[1]];
    if (state !== Go.COLOR.EMPTY && state !== (0, _utils.currentColor)(self.moves)) {
      var group = (0, _utils.getGroup)(simulate_board, n[0], n[1]);
      if (group.liberties === 0) captured.push(group);
    }
  });

  if (captured && captured.length === 0 && (0, _utils.getGroup)(simulate_board, i, j).liberties === 0) {
    return false;
  }

  if (this.last_move_hash && this.last_move_hash === simulate_board.toString()) {
    return false;
  }
  return true;
};

Go.prototype.play = function (color, i, j) {
  var _this = this;

  if (this.rules(color, i, j)) {
    this.last_move_hash = this.board.toString();
    this.board[i][j] = (0, _utils.currentColor)(this.moves);
    var captured = [];
    var neighbors = (0, _utils.getAdjacentIntersections)(this.info.boardsize, i, j);
    var self = this;
    neighbors.forEach(function (n) {
      var state = self.board[n[0]][n[1]];
      if (state !== Go.COLOR.EMPTY && state !== (0, _utils.currentColor)(self.moves)) {
        var group = (0, _utils.getGroup)(self.board, n[0], n[1]);
        if (group.liberties === 0) captured.push(group);
      }
    });
    captured.forEach(function (group) {
      group.stones.forEach(function (stone) {
        self.board[stone[0]][stone[1]] = Go.COLOR.EMPTY;
        self.boardMoves[stone[0]][stone[1]] = Go.COLOR.EMPTY;
      });
    });
    this.moves.push({
      color: color,
      type: 'play',
      position: [i, j]
    });
    this.boardMoves[i][j] = this.moves.length;
    captured.forEach(function (group) {
      _this.captured[color] += group.stones.length;
    });
    return captured.length;
  }
  return false;
};

Go.prototype.resign = function (color) {
  if ((0, _utils.currentColor)(this.moves) === color) {
    this.moves.push({
      color: color,
      type: 'resign'
    });
    return true;
  }
  return false;
};

Go.prototype.toJson = function () {
  return {
    info: this.info,
    moves: this.moves
  };
};

Go.prototype.toSgf = function () {
  var sgf = '(;FF[4]GM[1]SZ[' + this.info.boardsize + ']' + 'GN[Copyright ShouTan Go]' + ('HA[' + this.info.handicap + ']') + ('KM[' + this.info.komi + ']') + ('RU[' + (this.info.rule || 'Chinese') + ']');
  this.moves.forEach(function (move) {
    sgf += ';' + (move.color === Go.COLOR.BLACK ? 'B' : 'W');
    switch (move.type) {
      case 'play':
        sgf += '[' + (String.fromCharCode(97 + move.position[0]) + String.fromCharCode(97 + move.position[1])) + ']';
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

exports.default = Go;
module.exports = exports['default'];