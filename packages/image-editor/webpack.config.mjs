import webpack from 'webpack';
import path from 'path';

export default {
  mode: 'production',
  entry: './src/index.ts',
  target: 'web',
  devtool: 'source-map',
  output: {
    library: 'imageEditor',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    filename: 'image-editor.js',
    path: path.resolve('../../dist')
  },
  externals: {
    'worker-utils': 'workerUtils'
  },
  resolve: { extensions: ['.ts', '.js'] },
  devServer: { contentBase: '../../dist', hot: true },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  module: {
    rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ }]
  }
};
