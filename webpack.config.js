const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    library: 'GameEngine',
    filename: 'index.js',
    libraryTarget: 'umd',
    path: path.resolve(__dirname),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['es2015', { modules: false }]],
          },
        },
      },
    ],
  },
};
