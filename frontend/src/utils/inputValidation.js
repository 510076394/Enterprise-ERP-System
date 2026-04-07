/**
 * 输入验证工具
 * 防止XSS攻击和恶意输入
 */

/**
 * 清理HTML内容，防止XSS攻击
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';
  
  // 移除script标签和事件处理器
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');
}

/**
 * 清理文本内容
 */
export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

/**
 * 验证用户名
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: '用户名不能为空' };
  }

  const sanitized = sanitizeText(username);
  
  if (sanitized.length < 3) {
    return { valid: false, message: '用户名长度不能少于3个字符' };
  }
  
  if (sanitized.length > 50) {
    return { valid: false, message: '用户名长度不能超过50个字符' };
  }
  
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(sanitized)) {
    return { valid: false, message: '用户名只能包含字母、数字、下划线和中文' };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * 验证密码强度
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: '密码不能为空' };
  }

  if (password.length < 8) {
    return { valid: false, message: '密码长度不能少于8个字符' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: '密码长度不能超过128个字符' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个大写字母' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个小写字母' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个数字' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个特殊字符' };
  }
  
  return { valid: true, value: password };
}

/**
 * 验证邮箱地址
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: '邮箱地址不能为空' };
  }

  const sanitized = sanitizeText(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return { valid: false, message: '邮箱地址格式不正确' };
  }
  
  if (sanitized.length > 254) {
    return { valid: false, message: '邮箱地址长度不能超过254个字符' };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * 验证表单数据
 */
export function validateForm(formData, rules) {
  const errors = {};
  const sanitizedData = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];
    
    switch (rule.type) {
      case 'username':
        const usernameResult = validateUsername(value);
        if (!usernameResult.valid) {
          errors[field] = usernameResult.message;
        } else {
          sanitizedData[field] = usernameResult.value;
        }
        break;
        
      case 'password':
        const passwordResult = validatePassword(value);
        if (!passwordResult.valid) {
          errors[field] = passwordResult.message;
        } else {
          sanitizedData[field] = passwordResult.value;
        }
        break;
        
      case 'email':
        const emailResult = validateEmail(value);
        if (!emailResult.valid) {
          errors[field] = emailResult.message;
        } else {
          sanitizedData[field] = emailResult.value;
        }
        break;
        
      case 'text':
      default:
        const sanitized = sanitizeText(value);
        if (rule.required && !sanitized) {
          errors[field] = `${rule.label || field}不能为空`;
        } else if (sanitized && rule.minLength && sanitized.length < rule.minLength) {
          errors[field] = `${rule.label || field}长度不能少于${rule.minLength}个字符`;
        } else if (sanitized && rule.maxLength && sanitized.length > rule.maxLength) {
          errors[field] = `${rule.label || field}长度不能超过${rule.maxLength}个字符`;
        } else {
          sanitizedData[field] = sanitized;
        }
        break;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: sanitizedData
  };
}

export default {
  sanitizeHtml,
  sanitizeText,
  validateUsername,
  validatePassword,
  validateEmail,
  validateForm
}; 