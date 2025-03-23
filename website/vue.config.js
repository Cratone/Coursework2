const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    entry: {
      app: './main.js'
    }
  },
  lintOnSave: false,
  outputDir: 'dist'
})
