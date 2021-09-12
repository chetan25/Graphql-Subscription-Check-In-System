const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./webpack.base');
var path = require('path');

const devConfig = {
    mode: 'development',
    output: {
        publicPath: 'http://localhost:8081/'
    },
    devServer: {
        port: 8081,
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        historyApiFallback: true,
        // historyApiFallback: {
        //     index: 'index.html'
        // }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        }),
    ]
}

// devConfig overrides the baseConfig, if there is common attributes
module.exports = merge(baseConfig, devConfig);