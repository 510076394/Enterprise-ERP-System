-- 添加付款凭证打印模板
INSERT INTO print_templates (
    name, 
    module, 
    template_type, 
    content, 
    paper_size, 
    orientation, 
    is_default, 
    status, 
    created_at, 
    updated_at
) VALUES (
    '付款凭证默认模板',
    'finance',
    'ap_payment',
    '<!DOCTYPE html>
<html>
<head>
  <title>付款凭证 - {{payment_number}}</title>
  <meta charset="utf-8">
  <style>
    @page {
      size: 240mm 140mm; /* 用户指定规格 */
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: "SimSun", "Songti SC", serif;
      margin: 0;
      padding: 0;
    }
    .bill-container {
      width: 100%;
      border: 0;
      padding: 10px;
    }
    .bill-title {
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      letter-spacing: 5px;
      position: relative;
    }
    .bill-title::after {
      content: "";
      display: block;
      width: 200px;
      height: 2px;
      background: #000;
      margin: 5px auto 3px;
    }
    .bill-title::before {
      content: "";
      display: block;
      width: 200px;
      height: 1px;
      background: #000;
      margin: 0 auto;
      position: absolute;
      bottom: -6px;
      left: 0;
      right: 0;
    }
    .bill-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .bill-table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid #000;
    }
    .bill-table td {
      border: 1px solid #000;
      padding: 10px 8px;
      font-size: 14px;
      vertical-align: middle;
    }
    .label {
      text-align: center;
      color: #880000; /* 传统财务凭证常使用深红色字体用于表头，此处用兼容色 */
      font-weight: bold;
      width: 100px;
    }
    .content {
      color: #000;
    }
    .amount-cell {
      position: relative;
    }
    .money-symbol {
      position: absolute;
      left: 5px;
      top: 50%;
      transform: translateY(-50%);
    }
    .bill-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="bill-container">
    <div class="bill-title">付款凭证</div>
    
    <div class="bill-header">
      <div>入账日期：{{payment_date}}</div>
      <div>单据编号：{{payment_number}}</div>
    </div>

    <table class="bill-table">
      <tr>
        <td class="label">收款单位</td>
        <td class="content" colspan="3">{{supplier_name}}</td>
      </tr>
      <tr>
        <td class="label">付款方式</td>
        <td class="content">{{payment_method}}</td>
        <td class="label">付款账户</td>
        <td class="content">{{bank_account_name}} {{bank_account_number}}</td>
      </tr>
      <tr>
        <td class="label">付款事由</td>
        <td class="content" colspan="3" style="height: 40px; vertical-align: top;">
          <div>{{notes}}</div>
          <div style="margin-top: 4px; font-size: 12px; color: #666;">(关联发票: {{invoice_number}})</div>
        </td>
      </tr>
      <tr>
        <td class="label">金额(大写)</td>
        <td class="content" colspan="3">
          <span style="font-weight: bold; font-size: 16px;">{{amount_upper}}</span>
          <span style="float: right;">￥ {{amount}}</span>
        </td>
      </tr>
    </table>

    <div class="bill-footer">
      <div>审核：________________</div>
      <div>会计：________________</div>
      <div>出纳：________________</div>
      <div>经办人：{{operator}}</div>
      <div>制单时间：{{print_time}}</div>
    </div>
  </div>
</body>
</html>',
    '240mm 140mm',
    'landscape',
    1,
    1,
    NOW(),
    NOW()
);
