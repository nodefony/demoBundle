const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// wait new webpack release for use webpack.optimize.UglifyJsPlugin  ( es6 minimify )
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  plugins: [
    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: {
        discardComments: {
          removeAll: true
        }
      },
      canPrint: true
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        warnings: true,
        compress: true
      },
      parallel: true
    })
  ]
};
