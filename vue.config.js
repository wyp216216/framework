const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')
const resolve = dir => {
  return path.join(__dirname, dir)
}
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  publicPath: './',

  /**
   * 默认情况下 babel-loader
   * 会忽略所有 node_modules 中的文件
   * 如果你想要通过 Babel 显式转译一个依赖，可以在这个选项中列出来
   */
  // transpileDependencies: ['vuex-persist'],
  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: isProduction
  },
  /**
   * 如果你不需要生产环境的 source map
   * 可以将其设置为 false 以加速生产环境构建
   */
  productionSourceMap: !isProduction,
  configureWebpack: config => {
    config.externals = {

    }
    config.plugins.push(new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }))
    config.plugins.push(new CopyWebpackPlugin([
      {
        from: resolve('static'),
        to: resolve('dist/static'),
        ignore: ['.*']
      }
    ]))
    config.plugins.push(new HardSourceWebpackPlugin({
      // cacheDirectory是在高速缓存写入。默认情况下，将缓存存储在node_modules下的目录中
      // 因此如果清除了node_modules，则缓存也是如此
      cacheDirectory: '/node_modules/.cache/hard-source/[confighash]',
      // Either an absolute path or relative to webpack's options.context.
      // Sets webpack's recordsPath if not already set.
      recordsPath: '/node_modules/.cache/hard-source/[confighash]/records.json',
      // configHash在启动webpack实例时转换webpack配置，并用于cacheDirectory为不同的webpack配
      // 置构建不同的缓存
      configHash: function(webpackConfig) {
        // node-object-hash on npm can be used to build this.
        return require('node-object-hash')({ sort: false }).hash(webpackConfig);
      },
      // 当加载器，插件，其他构建时脚本或其他动态依赖项发生更改时，hard-source需要替换缓存以确保输
      // 出正确。environmentHash被用来确定这一点。如果散列与先前的构建不同，则将使用新的缓存
      environmentHash: {
        root: process.cwd(),
        directories: [],
        files: ['package-lock.json']
      }
    }))
  },

  chainWebpack: config => {
    config.plugins.delete('prefetch')
    config.plugins.delete('preload')
    config.resolve.alias
      .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
      .set('_c', resolve('src/components'))
  },

  /**
   * 代理
   * 这里写你调用接口的基础路径，来解决跨域，如果设置了代理，那你本地开发环境的axios的baseUrl要写为 '' ，即空字符串
   */
  devServer: {
    // proxy: ''
  }
}
