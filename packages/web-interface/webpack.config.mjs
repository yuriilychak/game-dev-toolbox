import webpack from 'webpack';
import path from 'path';

export default {
    mode: 'production',
    entry: './src/index.tsx',
    target: 'web',
    devtool: 'source-map',
    output: { filename: 'web-interface.js', path: path.resolve('../../dist') },
    externals: {
        'polygon-packer': 'polygonPacker',
        'svg-parser': 'svgParser'
    },
    resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    plugins: [new webpack.HotModuleReplacementPlugin()],
    devServer: {
        contentBase: '../../dist',
        hot: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: { loader: 'babel-loader' }
            },
            {
                test: /\.tsx?$/,
                use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
                exclude: /node_modules/
            }
        ]
    }
};
