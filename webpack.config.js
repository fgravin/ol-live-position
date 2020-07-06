const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    disableHostCheck: true,
    overlay: true,
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
  },
  plugins: [new HtmlWebpackPlugin({
    template: 'index.html'
  })]
};
