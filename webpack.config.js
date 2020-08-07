const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

const configModel = {
  rules: [
    {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    },
    {
      test: /\.(png|svg|jpg|gif)$/,
      use: ['file-loader']
    },
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  chrome: '49'
                }
              }
            ]
          ]
        }
      }
    }
  ]
}

const configResolve = {
  alias: {
    '@': path.resolve('src') // 这样配置后 @ 可以指向 src 目录
  }
}

const jsHtmlConfig = {
  mode: 'production',
  entry: {
    popup: ['babel-polyfill', './src/popup/index.js']
  },
  output: {
    filename: '[name].js'
  },
  resolve: configResolve,
  module: configModel,
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: './src/index.html',
      inject: true,
      title: '这个是Extension弹出页面',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true
      }
    }),
    new CopyWebpackPlugin([
      {
        from: __dirname + '/src/static',
        to: __dirname + '/dist/static',
        force: true,
        ignore: ['.*']
      },
      {
        from: __dirname + '/src/manifest/manifest.json',
        to: __dirname + '/dist/manifest.json',
        force: true,
        ignore: ['.*']
      }
    ]),
    new webpack.DefinePlugin({
      PLUGIN_TYPE: JSON.stringify(process.env.PLUGIN_TYPE)
    })
  ]
}

let jsEntry = {}

// 获取需要编译的js文件
// 组装入口配置
fs.readdirSync(path.join(__dirname, 'src/content')).forEach(name => {
  if (!/^\./.test(name)) {
    jsEntry[name] = [
      'babel-polyfill',
      path.join(__dirname, `src/content/${name}/index.js`)
    ]
  }
})

jsEntry.background = [
  'babel-polyfill',
  path.join(__dirname, 'src/background/index.js')
]

const jsConfig = {
  mode: 'production',
  entry: {
    ...jsEntry
  },
  output: {
    filename: '[name].js'
  },
  resolve: configResolve,
  module: configModel,
  plugins: [
    new webpack.DefinePlugin({
      PLUGIN_TYPE: JSON.stringify(process.env.PLUGIN_TYPE)
    })
  ]
}

module.exports = [jsHtmlConfig, jsConfig]
