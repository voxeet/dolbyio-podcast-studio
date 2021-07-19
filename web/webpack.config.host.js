const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    entry: './host/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist', 'host'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        plugins: [
            new TsconfigPathsPlugin({
                configFile: './tsconfig.host.json',
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
                use: [
                    {
                        loader: 'babel-loader',
                    } /*,{
                    loader: 'ts-loader',
                    options: {
                        configFile: "tsconfig.host.json"
                    }
                }*/,
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: './host/public/index.html',
            js: [],
        }),
    ],
};
