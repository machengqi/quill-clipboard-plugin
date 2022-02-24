// import path from "path";
const path = require("path");

const isProd = process.argv.includes("production");

module.exports = [
  {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, ''),
      },
      extensions: ['.ts', '.js'],
    },
    watchOptions: {
      ignored: "**/node_modules",
    },
    entry: {
      "quill.clipboard": "./core/quill.clipboard.ts",
      demo: "./examples/index.ts",
    },
    output: {
      filename: "[name].min.js",
      path: path.resolve(__dirname, "dist"),
      libraryTarget: "umd",
      publicPath: "/dist/",
    },
    devServer: {
      contentBase: "./examples",
    },
    externals: {
      quill: {
          commonjs: 'quill',
          commonjs2: 'quill',
          amd: 'quill',
          root: 'Quill',
      },
  },
    devtool: isProd ? undefined : "inline-source-map",
    module: {
      rules: [
        { 
          test: /\.ts$/, 
          use: {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                declaration: false,
                module: 'es6',
                sourceMap: true,
                target: 'es6',
              },
              transpileOnly: true,
              reportFiles: ['!**/*.{ts,tsx}'],
            },
          }, 
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
      ],
    },
  },
];
