const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            src: path.resolve('./src')
        }
    },
    output: {
        filename: 'wizard-of-demo.js',
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        }]
    },
    plugins: [
        new HtmlPlugin()
    ]
};
