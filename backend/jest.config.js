module.exports = {
    // 测试环境
    testEnvironment: 'node',

    // 测试文件匹配规则
    testMatch: [
        '**/tests/**/*.test.js',
        '**/tests/**/*.spec.js'
    ],

    // 覆盖率收集
    collectCoverageFrom: [
        'src/services/**/*.js',
        '!src/services/business/**', // 暂不覆盖业务子目录
        '!**/node_modules/**'
    ],

    // 覆盖率输出目录
    coverageDirectory: 'coverage',

    // 模块路径映射
    moduleDirectories: ['node_modules', 'src'],

    // 测试超时时间(毫秒)
    testTimeout: 10000,

    // 忽略路径
    testPathIgnorePatterns: ['/node_modules/'],

    // 在每个测试文件运行前清除mock
    clearMocks: true,
    restoreMocks: true
};
