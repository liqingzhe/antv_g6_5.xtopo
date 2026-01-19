// vue.config.js
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
    transpileDependencies: true,
    // 1. 基础设置
    productionSourceMap: true,

    // 2. 开发服务器配置
    devServer: {
        hot: true,
        client: {
            overlay: true,
            progress: true
        },
        host: 'localhost',
        port: 8080,
    },

    // 3. 明确的 Webpack 配置
    configureWebpack: {
        // 总是开启 source map
        devtool: process.env.NODE_ENV === 'production'
            ? 'source-map'
            : 'eval-cheap-module-source-map',

        // 确保输出包含 sourceMappingURL
        output: {
            sourceMapFilename: '[name].[contenthash:8].js.map'
        }
    },

    // 4. CSS 也要开启 source map
    css: {
        sourceMap: true,
        loaderOptions: {
            css: {
                sourceMap: true
            },
            sass: {
                sourceMap: true
            },
            less: {
                sourceMap: true
            }
        }
    },

    // 5. 确保不与其他配置冲突
    chainWebpack: config => {
        // 不要在这里关闭 devtool
        // config.devtool(false) // ❌ 不要这样做

        // 可以添加一些调试信息
        config.plugin('define').tap(args => {
            args[0]['process.env'].DEBUG_SOURCEMAP = JSON.stringify(true)
            return args
        })
    }
})