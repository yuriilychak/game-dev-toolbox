import webpack from "webpack";
import path from "path";

export default {
  mode: "production",
  entry: "./src/index.ts",
  target: "web",
  devtool: "source-map",
  output: {
    library: "workerUtils",
    libraryTarget: "umd",
    umdNamedDefine: true,
    filename: "worker-utils.js",
    path: path.resolve("../../dist"),
  },
  resolve: { extensions: [".ts"] },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: "../../dist",
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: [{ loader: "ts-loader", options: { transpileOnly: true } }],
        exclude: /node_modules/,
      },
    ],
  },
};
