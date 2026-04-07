const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'views');

const replacements = [
  {
    fileMatch: /DeliveryStats\.vue$/,
    regex: /<el-option\s+label="全部"\s+value=""\s*\/>\s*<el-option\s+label="已发货"\s+value="shipped"\s*\/>\s*<el-option\s+label="部分发货"\s+value="partial"\s*\/>\s*<el-option\s+label="未发货"\s+value="unshipped"\s*\/>/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('delivery_status')" :key="item.value" :label="item.label" :value="item.value" />`
  },
  {
    fileMatch: /ReworkTasks\.vue$/,
    regex: /<el-option\s+label="待处理"\s+value="pending"\s*\/>\s*<el-option\s+label="进行中"\s+value="in_progress"\s*\/>\s*<el-option\s+label="已完成"\s+value="completed"\s*\/>\s*<el-option\s+label="已取消"\s+value="cancelled"\s*\/>/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('rework_status')" :key="item.value" :label="item.label" :value="item.value" />`
  },
  {
    fileMatch: /ReplacementOrders\.vue$/,
    regex: /<el-option\s+label="待收货"\s+value="pending"\s*\/>\s*<el-option\s+label="部分收货"\s+value="partial"\s*\/>\s*<el-option\s+label="已完成"\s+value="completed"\s*\/>\s*<el-option\s+label="已取消"\s+value="cancelled"\s*\/>/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('replacement_status')" :key="item.value" :label="item.label" :value="item.value" />`
  },
  {
    fileMatch: /SupplierQualityScorecard\.vue$/,
    regex: /<el-option\s+label="A 级 \(优秀\)"\s+value="A"\s*\/>\s*<el-option\s+label="B 级 \(良好\)"\s+value="B"\s*\/>\s*<el-option\s+label="C 级 \(一般\)"\s+value="C"\s*\/>\s*<el-option\s+label="D 级 \(不合格\)"\s+value="D"\s*\/>/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('supplier_quality_grade')" :key="item.value" :label="item.label" :value="item.value" />`
  },
  {
    fileMatch: /ScrapRecords\.vue$/,
    regex: /<el-option\s+label="待审批"\s+value="pending"\s*\/>\s*<el-option\s+label="已审批"\s+value="approved"\s*\/>\s*<el-option\s+label="已完成"\s+value="completed"\s*\/>/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('scrap_status')" :key="item.value" :label="item.label" :value="item.value" />`
  },
  {
    fileMatch: /TechnicalCommunication\.vue$/,
    regex: /<el-option\s+label="更新日志"\s+value="update"\s*\/>\s*<el-option\s+label="操作指南"\s+value="guide"\s*\/>\s*<el-option\s+label="技术规范"\s+value="specification"\s*\/>\s*<el-option\s+label="公告"\s+value="announcement"\s*\/>/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('communication_category')" :key="item.value" :label="item.label" :value="item.value" />`
  },
  {
    fileMatch: /TechnicalCommunication\.vue$/,
    regex: /<el-option\s+label="已发布"\s+value="published"\s*\/>\s*<el-option\s+label="草稿"\s+value="draft"\s*\/>\s*<el-option\s+label="已归档"\s+value="archived"\s*\/>/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('communication_status')" :key="item.value" :label="item.label" :value="item.value" />`
  },
  {
    fileMatch: /BudgetEdit\.vue$|BudgetList\.vue$/,
    regex: /<el-option\s+label="年度预算"\s+value="年度预算"\s*\/>\s*<el-option\s+label="季度预算"\s+value="季度预算"\s*\/>\s*<el-option\s+label="月度预算"\s+value="月度预算"\s*\/>\s*<el-option\s+label="项目预算"\s+value="项目预算"\s*\/>/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('budget_type')" :key="item.value" :label="item.label" :value="item.value" />`
  },
  {
    fileMatch: /BudgetList\.vue$/,
    regex: /<el-option\s+label="草稿"\s+value="draft"\s*\/>\s*<el-option\s+label="待审批"\s+value="pending_approval"\s*\/>\s*<el-option\s+label="已审批"\s+value="approved"\s*\/>\s*<el-option\s+label="执行中"\s+value="executing"\s*\/>\s*<el-option\s+label="已完成"\s+value="completed"\s*\/>\s*<el-option\s+label="已关闭"\s+value="closed"\s*\/>/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('budget_status')" :key="item.value" :label="item.label" :value="item.value" />`
  },
  {
    fileMatch: /BankAccounts\.vue$/,
    regex: /<el-option\s+label="正常"\s+value="normal"\s*\/>\s*<el-option\s+label="冻结"\s+value="frozen"\s*\/>\s*<el-option\s+label="已注销"\s+value="closed"\s*\/>/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('bank_account_status')" :key="item.value" :label="item.label" :value="item.value" />`
  },
  {
    fileMatch: /CashTransactions\.vue$/,
    regex: /<el-option\s+label="收入"\s+value="income"\s*\/>\s*<el-option\s+label="支出"\s+value="expense"\s*\/>/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('cash_transaction_category')" :key="item.value" :label="item.label" :value="item.value" />`
  },
  {
    fileMatch: /TaxInvoices\.vue$/,
    regex: /<el-option\s+label="进项"\s+value="input"\s*\/>\s*<el-option\s+label="销项"\s+value="output"\s*\/>/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('tax_invoice_type')" :key="item.value" :label="item.label" :value="item.value" />`
  },
  {
    fileMatch: /BankAccounts\.vue$|FinanceSettings\.vue$/,
    regex: /<el-option\s+label="人民币(\s*\(CNY\))?"\s+value="CNY"\s*\/>\s*<el-option\s+label="美元(\s*\(USD\))?"\s+value="USD"\s*\/>\s*<el-option\s+label="欧元(\s*\(EUR\))?"\s+value="EUR"\s*\/>(\s*<el-option\s+label="日元"\s+value="JPY"\s*\/>\s*<el-option\s+label="英镑"\s+value="GBP"\s*\/>)?/g,
    replaceString: `<el-option v-for="item in $dict.getOptions('currency_type')" :key="item.value" :label="item.label" :value="item.value" />`
  }
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.vue')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const rep of replacements) {
        if (rep.fileMatch.test(file)) {
          const newContent = content.replace(rep.regex, rep.replaceString);
          if (newContent !== content) {
            content = newContent;
            changed = true;
          }
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Updated ${file}`);
      }
    }
  }
}

processDir(srcDir);
