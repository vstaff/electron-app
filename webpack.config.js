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
        // CSS Modules: файлы *.module.css
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                // можно задать формат имён, например:
                localIdentName: '[name]__[local]__[hash:base64:5]',
              }
            }
          }
        ]
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
