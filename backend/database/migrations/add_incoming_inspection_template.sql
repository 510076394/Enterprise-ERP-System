-- 来料检验报告默认打印模板
INSERT INTO `print_templates` (
  `name`, 
  `module`, 
  `template_type`, 
  `content`, 
  `paper_size`, 
  `orientation`, 
  `margin_top`, 
  `margin_right`, 
  `margin_bottom`, 
  `margin_left`, 
  `is_default`, 
  `status`,
  `created_at`, 
  `updated_at`
) VALUES (
  '来料检验报告默认模板',
  'quality',
  'incoming_inspection',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>来料检验报告</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .report-header { text-align: center; margin-bottom: 20px; }
    .report-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .report-no { color: #606266; font-size: 16px; }
    .report-info { display: flex; flex-wrap: wrap; margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; }
    .report-info-item { width: 33.33%; margin-bottom: 10px; }
    .report-info-label { font-weight: bold; margin-right: 8px; }
    
    .report-items { margin-bottom: 20px; }
    .report-items h3 { margin-bottom: 10px; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    
    .report-result { margin-top: 20px; border: 1px solid #ddd; padding: 10px; }
    .report-conclusion h3 { margin-bottom: 10px; }
    
    .report-signature { margin-top: 40px; display: flex; justify-content: space-between; }
    .signature-item { width: 45%; }
    
    .tag-passed { color: #67C23A; background-color: #F0F9EB; border: 1px solid #E1F3D8; padding: 2px 6px; border-radius: 3px; }
    .tag-failed { color: #F56C6C; background-color: #FEF0F0; border: 1px solid #FDE2E2; padding: 2px 6px; border-radius: 3px; }
    .tag-partial { color: #E6A23C; background-color: #FDF6EC; border: 1px solid #FAECD8; padding: 2px 6px; border-radius: 3px; }
    .tag-critical { color: #F56C6C; background-color: #FEF0F0; border: 1px solid #FDE2E2; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="report-header">
    <div class="report-title">来料检验报告</div>
    <div class="report-no">No. {{inspection_no}}</div>
  </div>
  
  <div class="report-info">
    <div class="report-info-item">
      <span class="report-info-label">物料名称:</span>
      <span>{{material_name}}</span>
    </div>
    <div class="report-info-item">
      <span class="report-info-label">产品型号:</span>
      <span>{{specs}}{{#unless specs}}{{product_code}}{{/unless}}{{#unless specs}}{{#unless product_code}}{{material_specs}}{{/unless}}{{/unless}}{{#unless specs}}{{#unless product_code}}{{#unless material_specs}}{{specification}}{{/unless}}{{/unless}}{{/unless}}</span>
    </div>
    <div class="report-info-item">
      <span class="report-info-label">供应商:</span>
      <span>{{supplier_name}}</span>
    </div>
    <div class="report-info-item">
      <span class="report-info-label">采购单号:</span>
      <span>{{reference_no}}</span>
    </div>
    <div class="report-info-item">
      <span class="report-info-label">批次号:</span>
      <span>{{batch_no}}</span>
    </div>
    <div class="report-info-item">
      <span class="report-info-label">检验数量:</span>
      <span>{{quantity}} {{unit}}</span>
    </div>
    <div class="report-info-item">
      <span class="report-info-label">检验日期:</span>
      <span>{{inspection_date}}</span>
    </div>
    <div class="report-info-item">
      <span class="report-info-label">检验员:</span>
      <span>{{inspector_name}}</span>
    </div>
    <div class="report-info-item">
      <span class="report-info-label">检验结果:</span>
      <span class="tag-{{status}}">{{status_text}}</span>
    </div>
  </div>
  
  <div class="report-items">
    <h3>检验项目</h3>
    <table>
      <thead>
        <tr>
          <th width="150">检验项目</th>
          <th width="150">检验标准</th>
          <th width="100">检验类型</th>
          <th width="80">关键项</th>
          <th width="120">实际值</th>
          <th width="100">结果</th>
          <th>备注</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>{{item_name}}</td>
          <td>{{standard}}</td>
          <td>{{type_text}}</td>
          <td>{{#if is_critical}}是{{else}}否{{/if}}</td>
          <td>{{actual_value}}</td>
          <td>
            <span class="tag-{{result}}">
              {{#if result_is_passed}}合格{{else}}不合格{{/if}}
            </span>
          </td>
          <td>{{remarks}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
  
  <div class="report-result">
    <div class="report-conclusion">
      <h3>检验结论</h3>
      <p>根据检验结果，本批次物料 <span class="tag-{{status}}">{{status_text}}</span></p>
      <p>备注: {{note}}</p>
    </div>
  </div>
  
  <div class="report-signature">
    <div class="signature-item">
      <p>检验员: {{inspector_name}}</p>
      <p>日期: {{inspection_date}}</p>
    </div>
    <div class="signature-item">
      <p>审核人: ____________</p>
      <p>日期: ____________</p>
    </div>
  </div>
</body>
</html>',
  'A4',
  'portrait',
  20,
  20,
  20,
  20,
  1,
  1,
  NOW(),
  NOW()
); 