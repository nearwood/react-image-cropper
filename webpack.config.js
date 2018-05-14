var path = require('path');
var webpack = require('webpack');
var publicPath = process.env.NODE_ENV === 'dev' ? '/dist/' : '';

module.exports = {
    entry: "./demo/demo.js",
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'app.js',
        publicPath: publicPath,
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
    ],
    //devtool: 'source-map',
    module: {
        loaders: [
            { 
                test: /\.less$/,
                loader: "style!css!less" 
            }, { 
                test: /\.css$/,
                loader: "style!css" 
            },  { 
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel",
                query: {
                    optional: ['runtime'],
                    stage: 0
                }
            }
        ]
    },
    
};