var webpack = require('webpack'),
    path = require('path');

var webConfig = {
  target: "web",
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

var nodeConfig = {
  target: "node",
  context: path.resolve(__dirname, "js"),
  entry: [
    './cm-toml-mode.js'
  ],
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'cm-toml-mode.node.js'
  },
  resolve: {
    modules: [path.resolve(__dirname, "node_modules")],
    extensions: [ '.js' ]
  }
};


module.exports = [webConfig, nodeConfig];
