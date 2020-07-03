const path = require('path');
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const commonConfig = require('./common.webpack.config')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: '../index.html',
  inject: 'body'
})
const config = {
  entry: {
    'index': ["babel-polyfill", './src/index.js'],
    'vendor': ['react', 'moment', 'lodash/core']
  },
  output: {
    path: path.resolve('./dist'),
    publicPath: "/"
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      automaticNameMaxLength: 30,
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [

              HtmlWebpackPluginConfig,
              new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
          ]

}

module.exports = {...config,...commonConfig}