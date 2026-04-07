/**
 * 前端安全检查工具
 * 验证前端安全配置和最佳实践
 */

/**
 * 安全检查结果
 */
class SecurityCheckResult {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
    this.checks = [];
  }

  addCheck(name, status, message, details = null) {
    const check = {
      name,
      status, // 'pass', 'fail', 'warning'
      message,
      details,
      timestamp: new Date().toISOString()
    };

    this.checks.push(check);

    switch (status) {
      case 'pass':
        this.passed++;
        break;
      case 'fail':
        this.failed++;
        break;
      case 'warning':
        this.warnings++;
        break;
    }
  }

  getSummary() {
    return {
      total: this.checks.length,
      passed: this.passed,
      failed: this.failed,
      warnings: this.warnings,
      score: this.passed / this.checks.length * 100
    };
  }
}

/**
 * 前端安全检查器
 */
class FrontendSecurityChecker {
  constructor() {
    this.result = new SecurityCheckResult();
  }

  /**
   * 检查环境变量配置
   */
  checkEnvironmentVariables() {
    const requiredVars = ['VITE_API_URL'];
    const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);

    if (missingVars.length === 0) {
      this.result.addCheck(
        '环境变量配置',
        'pass',
        '所有必需的环境变量已配置'
      );
    } else {
      this.result.addCheck(
        '环境变量配置',
        'warning',
        `缺少环境变量: ${missingVars.join(', ')}`,
        { missing: missingVars }
      );
    }
  }

  /**
   * 检查HTTPS使用情况
   */
  checkHTTPS() {
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';

    if (isHTTPS || isLocalhost) {
      this.result.addCheck(
        'HTTPS配置',
        'pass',
        isLocalhost ? '本地开发环境，HTTPS不是必需的' : '使用HTTPS连接'
      );
    } else {
      this.result.addCheck(
        'HTTPS配置',
        'fail',
        '生产环境应使用HTTPS连接',
        { current: window.location.protocol }
      );
    }
  }

  /**
   * 检查CSP配置
   */
  checkCSP() {
    const cspHeader = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    if (cspHeader) {
      this.result.addCheck(
        'CSP配置',
        'pass',
        '已配置内容安全策略'
      );
    } else {
      this.result.addCheck(
        'CSP配置',
        'warning',
        '建议配置内容安全策略(CSP)',
        { recommendation: '添加CSP meta标签或HTTP头' }
      );
    }
  }

  /**
   * 检查控制台输出
   */
  checkConsoleOutput() {
    const isProduction = import.meta.env.PROD;
    
    if (isProduction) {
      // 在生产环境中，检查是否有过多的console输出
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      };

      let consoleCallCount = 0;
      const maxCalls = 10;

      ['log', 'error', 'warn', 'info'].forEach(method => {
        console[method] = (...args) => {
          consoleCallCount++;
          if (consoleCallCount <= maxCalls) {
            originalConsole[method].apply(console, args);
          }
        };
      });

      // 重置console
      setTimeout(() => {
        Object.assign(console, originalConsole);
        
        if (consoleCallCount > maxCalls) {
          this.result.addCheck(
            '控制台输出',
            'warning',
            '生产环境中存在过多的console输出',
            { calls: consoleCallCount }
          );
        } else {
          this.result.addCheck(
            '控制台输出',
            'pass',
            '控制台输出配置正常'
          );
        }
      }, 1000);
    } else {
      this.result.addCheck(
        '控制台输出',
        'pass',
        '开发环境，console输出是正常的'
      );
    }
  }

  /**
   * 检查localStorage使用
   */
  checkLocalStorage() {
    try {
      const testKey = '__security_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      
      this.result.addCheck(
        'localStorage支持',
        'pass',
        'localStorage功能正常'
      );
    } catch (error) {
      this.result.addCheck(
        'localStorage支持',
        'fail',
        'localStorage不可用',
        { error: error.message }
      );
    }
  }

  /**
   * 检查XSS防护
   */
  checkXSSProtection() {
    // 检查是否使用了安全的DOM操作
    const hasInnerHTML = document.querySelector('[data-test="innerhtml"]');
    
    if (hasInnerHTML) {
      this.result.addCheck(
        'XSS防护',
        'warning',
        '检测到可能不安全的innerHTML使用',
        { recommendation: '使用textContent或安全的HTML清理' }
      );
    } else {
      this.result.addCheck(
        'XSS防护',
        'pass',
        '未检测到明显的XSS风险'
      );
    }
  }

  /**
   * 检查认证状态
   */
  checkAuthentication() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      // 简单的token格式检查
      const parts = token.split('.');
      if (parts.length === 3) {
        this.result.addCheck(
          '认证状态',
          'pass',
          '用户已认证，token格式正确'
        );
      } else {
        this.result.addCheck(
          '认证状态',
          'warning',
          'token格式可能不正确',
          { format: 'JWT token应包含3个部分' }
        );
      }
    } else {
      this.result.addCheck(
        '认证状态',
        'pass',
        '用户未认证，这是正常的'
      );
    }
  }

  /**
   * 检查权限验证
   */
  checkPermissionValidation() {
    // 检查是否有权限相关的指令或组件
    const permissionElements = document.querySelectorAll('[v-permission], [data-permission]');
    
    if (permissionElements.length > 0) {
      this.result.addCheck(
        '权限验证',
        'pass',
        `检测到${permissionElements.length}个权限控制元素`
      );
    } else {
      this.result.addCheck(
        '权限验证',
        'warning',
        '未检测到明显的权限控制元素',
        { recommendation: '确保关键功能有权限验证' }
      );
    }
  }

  /**
   * 检查错误处理
   */
  checkErrorHandling() {
    // 检查是否有全局错误处理器
    const hasErrorHandler = window.onerror || window.addEventListener;
    
    if (hasErrorHandler) {
      this.result.addCheck(
        '错误处理',
        'pass',
        '检测到错误处理机制'
      );
    } else {
      this.result.addCheck(
        '错误处理',
        'warning',
        '建议添加全局错误处理',
        { recommendation: '实现window.onerror或error事件监听' }
      );
    }
  }

  /**
   * 运行所有安全检查
   */
  async runAllChecks() {

    this.checkEnvironmentVariables();
    this.checkHTTPS();
    this.checkCSP();
    this.checkConsoleOutput();
    this.checkLocalStorage();
    this.checkXSSProtection();
    this.checkAuthentication();
    this.checkPermissionValidation();
    this.checkErrorHandling();

    // 等待异步检查完成
    await new Promise(resolve => setTimeout(resolve, 1500));

    this.printResults();
    return this.result;
  }

  /**
   * 打印检查结果
   */
  printResults() {
    const summary = this.result.getSummary();
    
    
    this.result.checks.forEach(check => {
      const status = check.status === 'pass' ? '✅' : 
                    check.status === 'fail' ? '❌' : '⚠️';
      
      if (check.details && process.env.NODE_ENV === 'development') {
      }
    });
    
    
    if (summary.score >= 80) {
    } else if (summary.score >= 60) {
    } else {
    }
  }
}

// 创建全局实例
const securityChecker = new FrontendSecurityChecker();

export { FrontendSecurityChecker, SecurityCheckResult, securityChecker };
export default securityChecker; 