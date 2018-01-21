'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _go = require('./go');

var _go2 = _interopRequireDefault(_go);

var _constants = require('../constants');

var _utils = require('../utils');

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

  _createClass(CaptureGo, [{
    key: 'pass',
    value: function pass() {
      return false;
    }
  }, {
    key: 'resign',
    value: function resign() {
      return false;
    }
  }, {
    key: 'rules',
    value: function rules(color, i, j) {
      if (!_get(CaptureGo.prototype.__proto__ || Object.getPrototypeOf(CaptureGo.prototype), 'rules', this).call(this, color, i, j)) {
        return false;
      }

      if (this.moves.length === 0) {
        return color === _constants.Go.COLOR.BLACK && i === Math.floor(this.info.boardsize / 2) && j === Math.floor(this.info.boardsize / 2);
      }

      var neighbors = (0, _utils.getAdjacentIntersections)(this.info.boardsize, i, j);
      for (var index = 0; index < neighbors.length; index += 1) {
        var neighbor = neighbors[index];
        var state = this.board[neighbor[0]][neighbor[1]];
        if (state !== _constants.Go.COLOR.EMPTY) {
          if (state !== (0, _utils.currentColor)(this.moves)) {
            return true;
          }

          if (state === (0, _utils.currentColor)(this.moves)) {
            var group = (0, _utils.getGroup)(this.board, neighbor[0], neighbor[1]);
            if (group.liberties === 1) {
              return true;
            }
          }
        }
      }
      return false;
    }
  }, {
    key: 'winner',
    value: function winner() {
      var lastMove = this.moves[this.moves.length - 1];
      if (lastMove && lastMove.type === 'resign') {
        return 3 ^ (0, _utils.currentColor)(lastMove.color);
      }
      if (this.captured[_constants.Go.COLOR.BLACK] >= this.info.goal) {
        return _constants.Go.COLOR.BLACK;
      } else if (this.captured[_constants.Go.COLOR.WHITE] >= this.info.goal) {
        return _constants.Go.COLOR.WHITE;
      }
      return false;
    }
  }]);

  return CaptureGo;
}(_go2.default);

exports.default = CaptureGo;
module.exports = exports['default'];