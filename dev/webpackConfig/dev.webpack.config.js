const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const commonConfig = require('./common.webpack.config')
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'body',
})
const config = {
  devtool: 'inline-source-map',
  entry: {
    app:["babel-polyfill", './src/index.js'],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    path: path.resolve('./dev-dist')
  },
  devServer: {
    headers: { "Access-Control-Allow-Origin": "*" },
    historyApiFallback: true,
    port: 3000
  },
  plugins: [
    HtmlWebpackPluginConfig,
  
  ]
}
module.exports = {...config,...commonConfig}