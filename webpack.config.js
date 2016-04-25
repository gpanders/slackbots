var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var path = require('path');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

var isProd = process.env.NODE_ENV === 'production';

module.exports = (function() {
    var config = {};

    config.entry = {
        vendor: './app/vendor.js',
        app: './app/index.js'
    };

    config.output = {
        path: path.join(__dirname, 'dist/public', 'assets'),
        filename: '[name].js',
        publicPath: '/assets/'
    };

    config.resolve = {
        extensions: ['', '.js', '.scss']
    };

    config.module = {
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
            {
                test: /\.css$/,
                loader: 'style!css!postcss'
            }, {
                test: /\.scss$/,
                loader: 'style!css!postcss!sass'
            },
            { test: /bootstrap-sass\/assets\/javascripts\//, loader: 'imports?jQuery=jquery' },
        ]
    };

    config.postcss = [ autoprefixer ];

    config.plugins = [
        new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'vendor.bundle.js'),
    ];

    if (isProd) {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    }

    return config;
})();
