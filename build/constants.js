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