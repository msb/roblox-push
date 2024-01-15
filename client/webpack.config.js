'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env) => {

  return {
    mode: 'development',
    devtool: 'eval-source-map',
    entry: {
      'app': './src/js/main.js',
      'service-worker': './src/js/service.js',
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    devServer: {
      port: 8080,
      hot: true
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        templateParameters: env,
      })
    ],
    resolve: {
      alias: {
        config: path.join(__dirname, 'config', `${env.config || 'local'}.js`)
      }
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ]
    }
  };
}
