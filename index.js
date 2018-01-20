(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["GameEngine"] = factory();
	else
		root["GameEngine"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = __webpack_require__(3);

var _constants = __webpack_require__(1);

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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var Go = {
  COLOR: {
    BLACK: 1,
    WHITE: 2,
    EMPTY: 0
  },
  STATE: {
    BLACK_READY: 2,
    WHITE_READY: 1,
    WAITING: 0,
    PLAYING: 3,
    FINISHED: 7
  }
};

exports.default = { Go: Go };
module.exports = exports["default"];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _go = __webpack_require__(0);

var _go2 = _interopRequireDefault(_go);

var _captureGo = __webpack_require__(4);

var _captureGo2 = _interopRequireDefault(_captureGo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = { Go: _go2.default, CaptureGo: _captureGo2.default };
module.exports = exports['default'];

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.currentColor = exports.createBoard = exports.getAdjacentIntersections = exports.getGroup = undefined;

var _constants = __webpack_require__(1);

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
  var count = 0;

  var visiting = function visiting(n) {
    var state = board[n[0]][n[1]];
    if (state === _constants.Go.COLOR.EMPTY) count += 1;
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
    liberties: count,
    stones: visitedList
  };
};

exports.getGroup = getGroup;
exports.getAdjacentIntersections = getAdjacentIntersections;
exports.createBoard = createBoard;
exports.currentColor = currentColor;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _go = __webpack_require__(0);

var _go2 = _interopRequireDefault(_go);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CaptureGo = function (_Go) {
  _inherits(CaptureGo, _Go);

  function CaptureGo() {
    _classCallCheck(this, CaptureGo);

    return _possibleConstructorReturn(this, (CaptureGo.__proto__ || Object.getPrototypeOf(CaptureGo)).apply(this, arguments));
  }

  return CaptureGo;
}(_go2.default);

exports.default = CaptureGo;
module.exports = exports['default'];

/***/ })
/******/ ]);
});