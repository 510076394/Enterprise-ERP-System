/**
 * PrintTemplateService.js
 * @description 打印模板服务 - 处理模板渲染、变量替换、数据格式化等
 * @date 2025-10-21
 * @version 1.0.0
 */

const { logger } = require('../utils/logger');

class PrintTemplateService {
  /**
   * 处理模板变量替换
   * @param {String} template - 模板内容
   * @param {Object} data - 替换数据
   * @returns {String} - 替换后的内容
   */
  static replaceVariables(template, data) {
    try {
      let content = template;

      if (!data || typeof data !== 'object') {
        return content;
      }

      // 替换所有简单变量 {{variable}}
      Object.keys(data).forEach((key) => {
        if (typeof data[key] !== 'object' || data[key] === null) {
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          const value = data[key] !== undefined ? data[key] : '';
          content = content.replace(regex, value);
        }
      });

      return content;
    } catch (error) {
      logger.error('变量替换失败:', error);
      throw error;
    }
  }

  /**
   * 处理循环块 - 支持多种格式
   * @param {String} template - 模板内容
   * @param {String} loopKey - 循环键名
   * @param {Array} items - 循环数据
   * @returns {String} - 处理后的内容
   */
  static processLoop(template, loopKey, items) {
    try {
      let content = template;

      if (!Array.isArray(items) || items.length === 0) {
        // 移除循环块
        content = this.removeLoopBlock(content, loopKey);
        return content;
      }

      // 尝试匹配 {{#each loopKey}}...{{/each}}
      let loopContent = this.extractLoopContent(content, `{{#each\\s+${loopKey}}}`, '{{/each}}');

      if (!loopContent) {
        // 尝试匹配 {{#loopKey}}...{{/loopKey}}
        loopContent = this.extractLoopContent(content, `{{#${loopKey}}}`, `{{/${loopKey}}}`);
      }

      if (loopContent) {
        // 生成循环内容
        const renderedItems = items
          .map((item, index) => {
            let itemContent = loopContent;

            // 替换 @index 为序号
            itemContent = itemContent.replace(/{{@index}}/g, index + 1);
            itemContent = itemContent.replace(/{{@number}}/g, index + 1);

            // 替换项目变量
            Object.keys(item).forEach((key) => {
              const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
              const value = item[key] !== undefined ? item[key] : '';
              itemContent = itemContent.replace(regex, value);
            });

            return itemContent;
          })
          .join('');

        // 替换循环块
        content = content.replace(
          new RegExp(`{{#each\\s+${loopKey}}}[\\s\\S]*?{{/each}}`, 'g'),
          renderedItems
        );
        content = content.replace(
          new RegExp(`{{#${loopKey}}}[\\s\\S]*?{{/${loopKey}}}`, 'g'),
          renderedItems
        );
      }

      return content;
    } catch (error) {
      logger.error('循环处理失败:', error);
      throw error;
    }
  }

  /**
   * 提取循环内容
   * @private
   */
  static extractLoopContent(template, startPattern, endPattern) {
    const startRegex = new RegExp(startPattern);
    const startMatch = template.match(startRegex);

    if (!startMatch) return null;

    const startIndex = startMatch.index + startMatch[0].length;
    const endRegex = new RegExp(endPattern);
    const endMatch = template.substring(startIndex).match(endRegex);

    if (!endMatch) return null;

    return template.substring(startIndex, startIndex + endMatch.index);
  }

  /**
   * 移除循环块
   * @private
   */
  static removeLoopBlock(template, loopKey) {
    let content = template;
    content = content.replace(new RegExp(`{{#each\\s+${loopKey}}}[\\s\\S]*?{{/each}}`, 'g'), '');
    content = content.replace(new RegExp(`{{#${loopKey}}}[\\s\\S]*?{{/${loopKey}}}`, 'g'), '');
    return content;
  }

  /**
   * 格式化数字
   * @param {Number} value - 数值
   * @param {Number} decimals - 小数位数
   * @returns {String} - 格式化后的字符串
   */
  static formatNumber(value, decimals = 2) {
    if (value === null || value === undefined) return '0.00';
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  }

  /**
   * 格式化日期
   * @param {String|Date} date - 日期
   * @param {String} format - 格式 (yyyy-MM-dd, yyyy/MM/dd 等)
   * @returns {String} - 格式化后的日期
   */
  static formatDate(date, format = 'yyyy-MM-dd') {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('yyyy', year)
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * 完整的模板渲染
   * @param {String} template - 模板内容
   * @param {Object} data - 数据对象
   * @returns {String} - 渲染后的内容
   */
  static render(template, data = {}) {
    try {
      let content = template;

      // 处理循环块
      if (data.items && Array.isArray(data.items)) {
        content = this.processLoop(content, 'items', data.items);
      }

      // 替换所有变量
      content = this.replaceVariables(content, data);

      // 清理未替换的变量
      content = content.replace(/{{[^}]*}}/g, '');

      return content;
    } catch (error) {
      logger.error('模板渲染失败:', error);
      throw error;
    }
  }

  /**
   * 生成打印HTML
   * @param {String} content - 内容
   * @param {Object} options - 选项
   * @returns {String} - 完整的HTML
   */
  static generatePrintHTML(content, options = {}) {
    const {
      title = '打印文档',
      paperSize = 'A4',
      orientation = 'portrait',
      marginTop = 10,
      marginRight = 10,
      marginBottom = 10,
      marginLeft = 10,
    } = options;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @page {
      size: ${paperSize} ${orientation};
      margin: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: "SimSun", "Microsoft YaHei", Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #000;
      padding: 5px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
      text-align: center;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
  }
}

module.exports = PrintTemplateService;
