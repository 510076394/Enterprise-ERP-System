/**
 * precision.js
 * @description 高精度计算工具模块
 * @date 2026-01-27
 * @version 1.0.0
 *
 * 使用 decimal.js 进行精确的财务计算，避免 JavaScript 浮点数精度问题。
 * 例如：952.00 + 0.06 + 0.03 应该精确等于 952.09，而非 952.10
 */

const Decimal = require('decimal.js');

// 配置 Decimal.js
Decimal.set({
  precision: 20, // 计算精度
  rounding: Decimal.ROUND_HALF_UP, // 四舍五入
  toExpNeg: -9, // 科学计数法阈值
  toExpPos: 21,
});

/**
 * 精度计算工具类
 */
class Precision {
  /**
   * 加法（支持多个参数）
   * @param {...number} numbers 要相加的数字
   * @returns {number} 结果
   * @example Precision.add(952, 0.06, 0.03) => 952.09
   */
  static add(...numbers) {
    return numbers
      .reduce((sum, n) => new Decimal(sum).plus(new Decimal(n || 0)), new Decimal(0))
      .toNumber();
  }

  /**
   * 减法
   * @param {number} a 被减数
   * @param {number} b 减数
   * @returns {number} 结果
   */
  static sub(a, b) {
    return new Decimal(a || 0).minus(new Decimal(b || 0)).toNumber();
  }

  /**
   * 乘法
   * @param {number} a 乘数1
   * @param {number} b 乘数2
   * @returns {number} 结果
   */
  static mul(a, b) {
    return new Decimal(a || 0).mul(new Decimal(b || 0)).toNumber();
  }

  /**
   * 除法
   * @param {number} a 被除数
   * @param {number} b 除数
   * @returns {number} 结果
   */
  static div(a, b) {
    if (!b || b === 0) return 0;
    return new Decimal(a || 0).div(new Decimal(b)).toNumber();
  }

  /**
   * 四舍五入到指定小数位（默认2位，即分）
   * @param {number} n 数字
   * @param {number} decimals 小数位数，默认2
   * @returns {number} 结果
   */
  static round(n, decimals = 2) {
    return new Decimal(n || 0).toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP).toNumber();
  }

  /**
   * 四舍五入到分（2位小数）
   * @param {number} n 数字
   * @returns {number} 结果
   */
  static round2(n) {
    return this.round(n, 2);
  }

  /**
   * 求和并四舍五入到分
   * @param {...number} numbers 要相加的数字
   * @returns {number} 结果
   */
  static sumRound2(...numbers) {
    return this.round2(this.add(...numbers));
  }

  /**
   * 尾差调整：确保分项合计严格等于总额
   * 将差额"挤"到金额最大的项中
   *
   * @param {Array<Object>} items 分项数组
   * @param {number} totalAmount 期望的总额
   * @param {string} amountKey 金额字段名，默认 'amount'
   * @returns {Array<Object>} 调整后的分项数组
   *
   * @example
   * const items = [
   *   { name: '材料', amount: 952.00 },
   *   { name: '人工', amount: 0.06 },
   *   { name: '费用', amount: 0.03 }
   * ];
   * Precision.adjustTail(items, 952.09, 'amount');
   * // 如果分项合计为952.09，则不调整
   * // 如果分项合计为952.10，则将-0.01调整到'材料'项
   */
  static adjustTail(items, totalAmount, amountKey = 'amount') {
    if (!items || items.length === 0) return items;

    // 计算当前合计
    const sum = items.reduce(
      (s, item) => new Decimal(s).plus(new Decimal(item[amountKey] || 0)),
      new Decimal(0)
    );

    // 计算差额
    const diff = new Decimal(totalAmount).minus(sum);
    const diffNum = diff.toNumber();

    // 如果差额超过阈值（0.001），进行调整
    if (Math.abs(diffNum) > 0.001) {
      // 找到金额绝对值最大的项
      let maxIdx = 0;
      let maxAmt = 0;
      items.forEach((item, idx) => {
        const absAmt = Math.abs(item[amountKey] || 0);
        if (absAmt > maxAmt) {
          maxAmt = absAmt;
          maxIdx = idx;
        }
      });

      // 将差额挤入该项
      items[maxIdx][amountKey] = new Decimal(items[maxIdx][amountKey])
        .plus(diff)
        .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
        .toNumber();
    }

    return items;
  }

  /**
   * 确保借贷平衡：调整贷方金额使其与借方相等
   *
   * @param {number} debitTotal 借方总额
   * @param {Array<Object>} creditItems 贷方分项数组
   * @param {string} amountKey 金额字段名，默认 'credit_amount'
   * @returns {Array<Object>} 调整后的贷方数组
   */
  static balanceDebitCredit(debitTotal, creditItems, amountKey = 'credit_amount') {
    return this.adjustTail(creditItems, debitTotal, amountKey);
  }

  /**
   * 比较两个数字是否相等（在精度范围内）
   * @param {number} a 数字1
   * @param {number} b 数字2
   * @param {number} tolerance 允许的误差，默认0.001
   * @returns {boolean} 是否相等
   */
  static equals(a, b, tolerance = 0.001) {
    return Math.abs(new Decimal(a || 0).minus(new Decimal(b || 0)).toNumber()) <= tolerance;
  }

  /**
   * 获取 Decimal 实例（用于复杂计算）
   * @param {number} n 数字
   * @returns {Decimal} Decimal实例
   */
  static decimal(n) {
    return new Decimal(n || 0);
  }
}

module.exports = Precision;
