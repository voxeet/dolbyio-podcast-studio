const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    entry: './producer/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist', 'producer'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: './tsconfig.producer.json',
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /.less$/,
                use: ['style-loader', 'css-loader', 'less-loader'],
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: './producer/public/index.html',
            js: [],
        }),
    ],
};
