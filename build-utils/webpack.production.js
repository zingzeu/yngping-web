const CompressionWebpackPlugin = require("compression-webpack-plugin");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env) => ({
  plugins: [
    new UglifyJSPlugin({
        sourceMap: false
    }),
    new CompressionWebpackPlugin()
  ]
});