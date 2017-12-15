'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _go = require('./engines/go');

var _go2 = _interopRequireDefault(_go);

var _captureGo = require('./engines/capture-go');

var _captureGo2 = _interopRequireDefault(_captureGo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = { Go: _go2.default, CaptureGo: _captureGo2.default };