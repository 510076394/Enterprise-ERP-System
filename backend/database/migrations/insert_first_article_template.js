const { DATABASE_CONFIG } = require('../../src/config/database-config');
const mysql = require('mysql2/promise');

async function insertTemplate() {
    const connection = await mysql.createConnection(DATABASE_CONFIG);

    const templateContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>首件检验报告</title>
  <style>
    body { font-family: "Microsoft YaHei", Arial, sans-serif; margin: 20px; font-size: 14px; }
    h1 { text-align: center; margin-bottom: 5px; font-size: 22px; }
    .sub-title { text-align: center; color: #666; margin-bottom: 20px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #333; padding: 8px; text-align: left; }
    th { background-color: #f0f0f0; font-weight: bold; }
    .info-table td:first-child { width: 100px; font-weight: bold; background-color: #f9f9f9; }
    .section-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px; border-bottom: 2px solid #409EFF; padding-bottom: 5px; }
    .signature { margin-top: 40px; display: flex; justify-content: space-between; }
    .signature div { width: 30%; }
    .signature-line { border-bottom: 1px solid #333; margin-top: 30px; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
    @media print { body { margin: 10px; } }
  </style>
</head>
<body>
  <h1>首件检验报告</h1>
  <div class="sub-title">检验单号: {{inspection_no}}</div>
  
  <table class="info-table">
    <tr><td>检验单号</td><td>{{inspection_no}}</td><td>工单号</td><td>{{reference_no}}</td></tr>
    <tr><td>产品名称</td><td>{{product_name}}</td><td>产品编码</td><td>{{product_code}}</td></tr>
    <tr><td>批次号</td><td>{{batch_no}}</td><td>检验数量</td><td>{{quantity}} {{unit}}</td></tr>
    <tr><td>检验标准</td><td>{{standard_no}}</td><td>检验日期</td><td>{{inspection_date}}</td></tr>
    <tr><td>检验结果</td><td colspan="3">{{result}}</td></tr>
  </table>
  
  <div class="section-title">检验项目</div>
  <table>
    <thead>
      <tr><th>序号</th><th>检验项目</th><th>检验标准</th><th>检验类型</th><th>实测值</th><th>结果</th><th>备注</th></tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{@index+1}}</td>
        <td>{{item_name}}</td>
        <td>{{standard}}</td>
        <td>{{type}}</td>
        <td>{{actual_value}}</td>
        <td>{{result}}</td>
        <td>{{remarks}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  
  <div class="signature">
    <div>检验员: {{inspector_name}}<div class="signature-line"></div></div>
    <div>质检主管: <div class="signature-line"></div></div>
    <div>日期: {{print_date}}<div class="signature-line"></div></div>
  </div>
  
  <div class="footer">备注: {{note}}</div>
</body>
</html>`;

    try {
        // Check if template already exists
        const [existing] = await connection.execute(
            'SELECT id FROM print_templates WHERE template_type = ? AND is_default = 1',
            ['first_article_inspection']
        );

        if (existing.length > 0) {
            console.log('默认模板已存在，ID:', existing[0].id);
            await connection.end();
            return;
        }

        // Insert new template
        const [result] = await connection.execute(
            `INSERT INTO print_templates (name, module, template_type, content, paper_size, orientation, margin_top, margin_right, margin_bottom, margin_left, is_default, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                '首件检验报告',
                'quality',
                'first_article_inspection',
                templateContent,
                'A4',
                'portrait',
                10, 10, 10, 10,
                1,
                1
            ]
        );

        console.log('模板插入成功！ID:', result.insertId);
    } catch (error) {
        console.error('插入模板失败:', error.message);
    } finally {
        await connection.end();
    }
}

insertTemplate();
