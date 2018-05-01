const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test : /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      }, {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true,
            }
          }
        ]
      }, {
        test: /\.(css|scss|sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          // {
          //   loader: "style-loader"
          // },
          {
            loader: 'css-loader',
            options: {
                // modules: true,
                // localIdentName: "[name]_[local]_[hash:base64]",
                importLoaders: 2,
                sourceMap: true,
                minimize: true,
            }
          },
          {
            loader: 'postcss-loader',
            options: {
                plugins: () => [
                    require('autoprefixer')
                ],
                sourceMap: true,
            }
          },
          {
            loader: 'sass-loader',
            options: {
                sourceMap: true,
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: './img/[name].[ext]',
              limit: 10000,
            }
          },
          {
            loader: 'img-loader',
          }
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'main',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        }
      }
    },
  },
  plugins: [
    new CopyWebpackPlugin([{from: './src/img', to: 'img'}, {from: './src/js/sw/index.js', to: 'sw.js'}]),
    new HtmlWebPackPlugin({template: './src/index.html', filename: './index.html'}),
    new HtmlWebPackPlugin({template: './src/restaurant.html', filename: './restaurant.html'}),
    new MiniCssExtractPlugin({filename: 'css/[name].css', chunkFilename: '[id].css'}),
  ]
};
