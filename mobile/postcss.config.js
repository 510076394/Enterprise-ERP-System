module.exports = {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      viewportWidth: 375, // 视窗的宽度，对应设计稿的宽度
      viewportHeight: 667, // 视窗的高度，对应设计稿的高度
      unitPrecision: 5, // 指定`px`转换为视窗单位值的小数位数
      viewportUnit: 'vw', // 指定需要转换成的视窗单位，建议使用vw
      selectorBlackList: ['.ignore', '.hairlines'], // 指定不转换为视窗单位的类
      minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位
      mediaQuery: false, // 允许在媒体查询中转换`px`
      exclude: [/node_modules/], // 忽略node_modules目录下的文件
    },
  }
}; 