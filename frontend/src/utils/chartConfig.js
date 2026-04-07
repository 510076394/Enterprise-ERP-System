/**
 * 图表配置工具函数
 */

import { formatCurrency, formatPercentage } from './dashboardUtils';

/**
 * 基础图表配置
 */
export const baseChartConfig = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: true,
      intersect: false,
      mode: 'index'
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  }
};

/**
 * 柱状图配置
 */
export const barChartConfig = {
  ...baseChartConfig,
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        lineWidth: 1
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  }
};

/**
 * 线性图配置
 */
export const lineChartConfig = {
  ...baseChartConfig,
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2
    },
    point: {
      radius: 4,
      hoverRadius: 6,
      borderWidth: 2
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        lineWidth: 1
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  }
};

/**
 * 饼图配置
 */
export const pieChartConfig = {
  ...baseChartConfig,
  plugins: {
    ...baseChartConfig.plugins,
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12
        }
      }
    }
  }
};

/**
 * 环形图配置
 */
export const doughnutChartConfig = {
  ...pieChartConfig,
  cutout: '60%'
};

/**
 * 颜色配置
 */
export const chartColors = {
  primary: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399'],
  success: ['#67C23A', '#85CE61', '#A4DA89', '#C2E7B0', '#E1F3D8'],
  warning: ['#E6A23C', '#EEBE77', '#F3D19E', '#F8E3C5', '#FCF6EC'],
  danger: ['#F56C6C', '#F78989', '#F9A7A7', '#FBC4C4', '#FDE2E2'],
  info: ['#909399', '#A6A9AD', '#B8BBC0', '#C8CCD0', '#DCDFE6'],
  gradient: [
    'rgba(64, 158, 255, 0.8)',
    'rgba(103, 194, 58, 0.8)',
    'rgba(230, 162, 60, 0.8)',
    'rgba(245, 108, 108, 0.8)',
    'rgba(144, 147, 153, 0.8)'
  ]
};

/**
 * 创建柱状图配置
 * @param {Object} options - 配置选项
 * @returns {Object} 图表配置
 */
export function createBarChartConfig(options = {}) {
  const config = JSON.parse(JSON.stringify(barChartConfig));
  
  // 自定义Y轴格式化
  if (options.yAxisFormatter) {
    config.scales.y.ticks.callback = options.yAxisFormatter;
  }
  
  // 自定义工具提示
  if (options.tooltipFormatter) {
    config.plugins.tooltip.callbacks = {
      label: options.tooltipFormatter
    };
  }
  
  // 自定义颜色
  if (options.colors) {
    config.backgroundColor = options.colors;
    config.borderColor = options.colors;
  }
  
  return config;
}

/**
 * 创建线性图配置
 * @param {Object} options - 配置选项
 * @returns {Object} 图表配置
 */
export function createLineChartConfig(options = {}) {
  const config = JSON.parse(JSON.stringify(lineChartConfig));
  
  // 自定义Y轴格式化
  if (options.yAxisFormatter) {
    config.scales.y.ticks.callback = options.yAxisFormatter;
  }
  
  // 自定义工具提示
  if (options.tooltipFormatter) {
    config.plugins.tooltip.callbacks = {
      label: options.tooltipFormatter
    };
  }
  
  // 填充区域
  if (options.fill) {
    config.elements.line.fill = true;
    config.elements.line.backgroundColor = options.fillColor || 'rgba(64, 158, 255, 0.1)';
  }
  
  return config;
}

/**
 * 创建饼图配置
 * @param {Object} options - 配置选项
 * @returns {Object} 图表配置
 */
export function createPieChartConfig(options = {}) {
  const config = JSON.parse(JSON.stringify(pieChartConfig));
  
  // 自定义工具提示
  if (options.tooltipFormatter) {
    config.plugins.tooltip.callbacks = {
      label: options.tooltipFormatter
    };
  } else {
    // 默认百分比显示
    config.plugins.tooltip.callbacks = {
      label: function(context) {
        const label = context.label || '';
        const value = context.raw || 0;
        const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
        const percentage = Math.round((value / total) * 100);
        return `${label}: ${percentage}%`;
      }
    };
  }
  
  return config;
}

/**
 * 创建混合图表配置（柱状图+线性图）
 * @param {Object} options - 配置选项
 * @returns {Object} 图表配置
 */
export function createMixedChartConfig(options = {}) {
  const config = JSON.parse(JSON.stringify(barChartConfig));
  
  // 添加右侧Y轴
  config.scales.y1 = {
    type: 'linear',
    display: true,
    position: 'right',
    beginAtZero: true,
    grid: {
      drawOnChartArea: false,
    },
    ticks: {
      font: {
        size: 11
      }
    }
  };
  
  // 自定义工具提示
  if (options.tooltipFormatter) {
    config.plugins.tooltip.callbacks = {
      label: options.tooltipFormatter
    };
  }
  
  return config;
}

/**
 * 财务图表专用配置
 */
export const financeChartConfig = {
  currency: {
    yAxisFormatter: (value) => formatCurrency(value),
    tooltipFormatter: (context) => {
      let label = context.dataset.label || '';
      if (label) {
        label += ': ';
      }
      label += formatCurrency(context.raw);
      return label;
    }
  },
  percentage: {
    yAxisFormatter: (value) => value + '%',
    tooltipFormatter: (context) => {
      let label = context.dataset.label || '';
      if (label) {
        label += ': ';
      }
      label += formatPercentage(context.raw);
      return label;
    }
  }
};

/**
 * 生产图表专用配置
 */
export const productionChartConfig = {
  quantity: {
    yAxisFormatter: (value) => value.toLocaleString('zh-CN'),
    tooltipFormatter: (context) => {
      let label = context.dataset.label || '';
      if (label) {
        label += ': ';
      }
      label += context.raw.toLocaleString('zh-CN') + '件';
      return label;
    }
  },
  rate: {
    yAxisFormatter: (value) => value + '%',
    tooltipFormatter: (context) => {
      let label = context.dataset.label || '';
      if (label) {
        label += ': ';
      }
      label += context.raw + '%';
      return label;
    }
  }
};

/**
 * 响应式图表配置
 * @param {string} breakpoint - 断点 ('mobile', 'tablet', 'desktop')
 * @returns {Object} 响应式配置
 */
export function getResponsiveConfig(breakpoint) {
  const configs = {
    mobile: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 10,
            font: {
              size: 10
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            font: {
              size: 9
            }
          }
        },
        y: {
          ticks: {
            font: {
              size: 9
            }
          }
        }
      }
    },
    tablet: {
      plugins: {
        legend: {
          labels: {
            font: {
              size: 11
            }
          }
        }
      }
    },
    desktop: {}
  };
  
  return configs[breakpoint] || configs.desktop;
}

/**
 * 图表主题配置
 */
export const chartThemes = {
  light: {
    backgroundColor: '#ffffff',
    textColor: '#303133',
    gridColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(0, 0, 0, 0.2)'
  },
  dark: {
    backgroundColor: '#1d1e1f',
    textColor: '#ffffff',
    gridColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)'
  }
};

/**
 * 应用主题到图表配置
 * @param {Object} config - 图表配置
 * @param {string} theme - 主题名称
 * @returns {Object} 应用主题后的配置
 */
export function applyTheme(config, theme = 'light') {
  const themeConfig = chartThemes[theme];
  if (!themeConfig) return config;
  
  const themedConfig = JSON.parse(JSON.stringify(config));
  
  // 应用网格颜色
  if (themedConfig.scales) {
    Object.keys(themedConfig.scales).forEach(scaleKey => {
      if (themedConfig.scales[scaleKey].grid) {
        themedConfig.scales[scaleKey].grid.color = themeConfig.gridColor;
      }
      if (themedConfig.scales[scaleKey].ticks) {
        themedConfig.scales[scaleKey].ticks.color = themeConfig.textColor;
      }
    });
  }
  
  // 应用图例颜色
  if (themedConfig.plugins?.legend?.labels) {
    themedConfig.plugins.legend.labels.color = themeConfig.textColor;
  }
  
  return themedConfig;
}
