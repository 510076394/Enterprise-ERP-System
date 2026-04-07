module.exports = {
  // 基本配置
  printWidth: 100, // 每行最大字符数
  tabWidth: 2, // 缩进空格数
  useTabs: false, // 使用空格而不是tab
  semi: true, // 语句末尾添加分号
  singleQuote: true, // 使用单引号
  quoteProps: 'as-needed', // 仅在需要时给对象属性加引号
  
  // JSX配置
  jsxSingleQuote: false, // JSX中使用双引号
  
  // 尾随逗号
  trailingComma: 'es5', // 多行时尽可能添加尾随逗号
  
  // 括号空格
  bracketSpacing: true, // 对象字面量的括号之间打印空格
  bracketSameLine: false, // 将>放在最后一行的末尾而不是单独一行
  
  // 箭头函数参数
  arrowParens: 'always', // 箭头函数参数始终使用括号
  
  // 换行符
  endOfLine: 'lf', // 使用LF换行符
  
  // 其他
  embeddedLanguageFormatting: 'auto', // 格式化嵌入的代码
};

