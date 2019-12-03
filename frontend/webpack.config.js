const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        game: './src/entrypoints/game.ts',
        controller: './src/entrypoints/controller.ts'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin.CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Frontend test',
            filename: 'game.html',
            template: './src/index.html',
            chunks: ['game']
        }),
        new HtmlWebpackPlugin(({
            title: 'Controller',
            filename: 'controller.html',
            template: './src/controller.html',
            chunks: ['controller']
        })),
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ],
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.scss', '.ts']
    }
};
