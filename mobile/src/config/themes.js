/**
 * 主题配置系统
 * @description 支持多主题切换的配置文件
 * @date 2025-12-27
 * @version 1.0.0
 */

// Glassmorphism 主题（当前默认主题）
export const glassmorphismTheme = {
  name: 'glassmorphism',
  label: 'Glassmorphism',
  colors: {
    // 背景色
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    
    // 玻璃效果
    glassLight: 'rgba(255, 255, 255, 0.05)',
    glassMedium: 'rgba(255, 255, 255, 0.1)',
    glassHeavy: 'rgba(255, 255, 255, 0.15)',
    
    // 边框
    borderLight: 'rgba(255, 255, 255, 0.1)',
    borderMedium: 'rgba(255, 255, 255, 0.2)',
    
    // 文字颜色
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    textTertiary: '#64748b',
    
    // 主题色（渐变）
    primary: '#a855f7',
    primaryDark: '#9333ea',
    secondary: '#ec4899',
    secondaryDark: '#db2777',
    
    // 状态色
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3b82f6',
    
    // 渐变色
    gradientPrimary: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    gradientSuccess: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    gradientWarning: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    gradientError: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    gradientInfo: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
  effects: {
    blur: '16px',
    blurHeavy: '24px',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    shadowHeavy: '0 8px 32px rgba(0, 0, 0, 0.25)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    xxl: '2rem',
  },
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  }
}

// 简约主题（备用）
export const minimalTheme = {
  name: 'minimal',
  label: '简约',
  colors: {
    bgPrimary: '#ffffff',
    bgSecondary: '#f8fafc',
    
    glassLight: 'rgba(0, 0, 0, 0.02)',
    glassMedium: 'rgba(0, 0, 0, 0.04)',
    glassHeavy: 'rgba(0, 0, 0, 0.06)',
    
    borderLight: 'rgba(0, 0, 0, 0.08)',
    borderMedium: 'rgba(0, 0, 0, 0.12)',
    
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#94a3b8',
    
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    secondary: '#8b5cf6',
    secondaryDark: '#7c3aed',
    
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    
    gradientPrimary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    gradientSuccess: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    gradientWarning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    gradientError: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    gradientInfo: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
  effects: {
    blur: '0px',
    blurHeavy: '0px',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    shadowHeavy: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    xxl: '2rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  }
}

// 暗黑主题（备用）
export const darkTheme = {
  name: 'dark',
  label: '暗黑',
  colors: {
    bgPrimary: '#000000',
    bgSecondary: '#111111',
    
    glassLight: 'rgba(255, 255, 255, 0.03)',
    glassMedium: 'rgba(255, 255, 255, 0.06)',
    glassHeavy: 'rgba(255, 255, 255, 0.09)',
    
    borderLight: 'rgba(255, 255, 255, 0.06)',
    borderMedium: 'rgba(255, 255, 255, 0.12)',
    
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    textTertiary: '#71717a',
    
    primary: '#8b5cf6',
    primaryDark: '#7c3aed',
    secondary: '#ec4899',
    secondaryDark: '#db2777',
    
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3b82f6',
    
    gradientPrimary: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    gradientSuccess: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    gradientWarning: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    gradientError: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    gradientInfo: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
  effects: {
    blur: '12px',
    blurHeavy: '20px',
    shadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
    shadowHeavy: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    xxl: '2rem',
  },
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  }
}

// 所有可用主题
export const themes = {
  glassmorphism: glassmorphismTheme,
  minimal: minimalTheme,
  dark: darkTheme
}

// 默认主题
export const defaultTheme = glassmorphismTheme

