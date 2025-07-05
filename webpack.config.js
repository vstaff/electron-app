const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: path.resolve(__dirname, 'src', 'main.tsx'),   // точка входа вашего React/TS
  output: {
    filename: 'bundle.js',                              // итоговый файл
    path: path.resolve(__dirname, 'dist'),              // куда собрать
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],         // какие расширения резолвить
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,                                // для .ts/.tsx
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,                                 // для CSS
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devtool: 'source-map',
  target: 'electron-renderer',                          // чтобы Webpack учёл окружение Electron
};
