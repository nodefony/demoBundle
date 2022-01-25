const path = require("path");
//const webpack = require('webpack');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const context = path.resolve(__dirname, "..", "public");
const public = path.resolve(__dirname, "..", "public", "assets");
const bundleName = path.basename(path.resolve(__dirname, "..", ".."));
const publicPath = `/${bundleName}/assets/`;

let config = null;
if (kernel.environment === "dev") {
  config = require("./webpack/webpack.dev.config.js");
} else {
  config = require("./webpack/webpack.prod.config.js");
}


module.exports = merge({
  context: context,
  target: "web",
  //watch: false,
  entry: {
    layout: "./js/layout.js",
    demo: "./js/index.js",
    finder: "./js/finder/finder.js",
    login: "./js/login.js",
    audio: "./webaudio/js/mix2.js"
  },
  output: {
    path: public,
    publicPath: publicPath,
    filename: "./js/[name].js",
    library: "[name]",
    hashFunction: "xxhash64",
    libraryTarget: "umd"
  },
  externals: {
    "jquery": "jQuery"
  },
  module: {
    rules: [{
      // BABEL TRANSCODE
      test: new RegExp("\.es6$|\.js$"),
      exclude: new RegExp("node_modules"),
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }]
    }, {
      // CSS EXTRACT
      test: new RegExp("\.(less|css)$"),
      use: [
         MiniCssExtractPlugin.loader,
         "css-loader",
         'less-loader'
      ]
    }, {
      // SASS
      test: new RegExp(".scss$"),
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader'
      }, {
        loader: 'sass-loader'
      }]
    }, {
      test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      type: 'asset/inline'
    }, {
      // IMAGES
      test: /\.(gif|png|jpe?g|svg)$/i,
      type: 'asset/resource',
      generator: {
         filename: "images/[name][ext][query]",
       }
    }]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./css/[name].css"
    })
  ]
}, config);
