'use strict';

const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const path = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

const PUBLIC_PATH = 'js';
const DIST_PATH = path.join(__dirname, 'dist');
const BUILD_PATH = path.join(DIST_PATH, 'public');
const ASSETS_PATH = path.join(BUILD_PATH, PUBLIC_PATH);

let config = {};

config.entry = {
    vendor: './app/vendor',
    app: './app/app'
};

config.output = {
    path: ASSETS_PATH,
    filename: '[name]' + (isProd ? '.[hash]' : '') + '.js',
    publicPath: `/${PUBLIC_PATH}/`
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
            loader: 'url?limit=10000'
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
    new webpack.optimize.CommonsChunkPlugin(
        /* chunkName= */'vendor',
        /* filename= */'vendor' + (isProd ? '.[hash]' : '') + '.js'),

    new CleanPlugin(BUILD_PATH),

    new AssetsPlugin({
        filename: 'webpack.assets.json',
        path: DIST_PATH,
        prettyPrint: true
    })
];

if (isProd) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        },
        output: {
            comments: false
        }
    }));
}

if (!isProd) {
    config.cache = true;
    config.devtool = 'eval';
    config.watch = true;
}

module.exports = config;
