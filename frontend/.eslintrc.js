module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // 安全相关规则 - 防止调试信息泄露
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-alert': 'warn',
    
    // 禁止在生产环境使用console.log
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.object.name='console'][callee.property.name='log']",
        message: '生产环境禁止使用console.log，请使用logger工具'
      },
      {
        selector: "CallExpression[callee.object.name='console'][callee.property.name='debug']",
        message: '生产环境禁止使用console.debug，请使用logger工具'
      },
      {
        selector: "CallExpression[callee.object.name='console'][callee.property.name='info']",
        message: '生产环境禁止使用console.info，请使用logger工具'
      }
    ],
    
    // Vue相关规则
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'warn',
    
    // 代码质量规则
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'prefer-const': 'warn',
    'no-var': 'error'
  },
  
  // 开发环境特殊配置
  overrides: [
    {
      files: ['**/*.dev.js', '**/*.dev.vue', '**/dev/**/*'],
      rules: {
        'no-console': 'off',
        'no-debugger': 'off'
      }
    }
  ],
  
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  }
};
