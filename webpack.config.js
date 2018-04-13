var webpack = require('webpack'),
    path = require('path');

var webConfig = {
  target: "web",
  context: path.resolve(__dirname, "dist"),
  entry: [
    './cm-toml-mode.js'
  ],
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'cm-toml-mode.web.js',
    library: 'CmTomlMode'
  },
  resolve: {
    modules: [path.resolve(__dirname, "node_modules")],
    extensions: [ '.js' ]
  }
};

module.exports = [webConfig];
