module.exports = {
    plugins: [
      require('postcss-easy-import'),
      require('postcss-color-mod-function'),
      require('autoprefixer'),
      require('cssnano')
    ]
  }