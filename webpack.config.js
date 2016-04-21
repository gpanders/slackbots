var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var path = require('path');

module.exports = {
    entry: [
        'bootstrap-loader',
        './app/index.js'
    ],
    output: {
        path: path.join(__dirname, 'public', 'assets'),
        filename: 'app.js',
        publicPath: '/assets/'
    },
    resolve: {
        extensions: ['', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'ng-annotate!babel?presets[]=es2015!jshint',
                exclude: /node_modules|bower_components/
            }, {
                test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url?limit=10000"
            }, {
                test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
                loader: 'file'
            },
            { test: /\.html$/, loader: 'html' },
            { test: /\.css$/, loader: 'style!css!postcss' },
            { test: /\.scss$/, loader: 'style!css!postcss!sass' },
            { test: /bootstrap-sass\/assets\/javascripts\//, loader: 'imports?jQuery=jquery' },
        ]
    },

    postcss: [ autoprefixer ]
};
