var webpack = require('webpack'),
    path = require('path');


var config = {
  context: path.resolve(__dirname, "js"),
  entry: [
    './cm-toml-mode.js'
  ],
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'cm-toml-mode.js',
    library: 'CmTomlMode'
  },
  resolve: {
    modules: [path.resolve(__dirname, "node_modules")],
    extensions: [ '.js' ]
  }
};

module.exports = config;
