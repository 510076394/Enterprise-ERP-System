module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // 代码质量
    'no-console': 'warn', // 警告使用console
    'no-debugger': 'error', // 禁止debugger
    'no-alert': 'error', // 禁止alert
    'no-var': 'error', // 禁止使用var
    'prefer-const': 'error', // 优先使用const
    'prefer-arrow-callback': 'warn', // 优先使用箭头函数
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],

    // 代码风格
    'semi': ['error', 'always'], // 要求分号
    'quotes': ['error', 'single', { avoidEscape: true }], // 单引号
    'indent': ['error', 2, { SwitchCase: 1 }], // 2空格缩进
    'comma-dangle': ['error', 'only-multiline'], // 多行时允许尾随逗号
    'object-curly-spacing': ['error', 'always'], // 对象花括号内空格
    'array-bracket-spacing': ['error', 'never'], // 数组方括号内无空格
    'arrow-spacing': 'error', // 箭头函数空格
    'keyword-spacing': 'error', // 关键字空格
    'space-before-blocks': 'error', // 块前空格
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],

    // 最佳实践
    'eqeqeq': ['error', 'always'], // 使用===
    'no-eval': 'error', // 禁止eval
    'no-implied-eval': 'error', // 禁止隐式eval
    'no-with': 'error', // 禁止with
    'no-loop-func': 'error', // 禁止循环中的函数
    'no-return-await': 'error', // 禁止不必要的return await
    'require-await': 'warn', // async函数必须有await
    'no-throw-literal': 'error', // 禁止抛出字面量
    'prefer-promise-reject-errors': 'error', // Promise.reject使用Error对象

    // 安全性
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // Node.js特定
    'no-path-concat': 'error', // 禁止路径拼接
    'handle-callback-err': 'error', // 处理回调错误
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};

