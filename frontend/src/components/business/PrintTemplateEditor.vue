<!--
/**
 * PrintTemplateEditor.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="print-template-editor">
    <div class="editor-toolbar">
      <el-button-group>
        <el-tooltip content="加粗">
          <el-button @click="insertTag('strong')">
            <el-icon><Bold /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="斜体">
          <el-button @click="insertTag('em')">
            <el-icon><Italic /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="下划线">
          <el-button @click="insertTag('u')">
            <el-icon><TextUnderline /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>
      
      <el-divider direction="vertical" />
      
      <el-button-group>
        <el-tooltip content="标题1">
          <el-button @click="insertTag('h1')">H1</el-button>
        </el-tooltip>
        <el-tooltip content="标题2">
          <el-button @click="insertTag('h2')">H2</el-button>
        </el-tooltip>
        <el-tooltip content="标题3">
          <el-button @click="insertTag('h3')">H3</el-button>
        </el-tooltip>
      </el-button-group>
      
      <el-divider direction="vertical" />
      
      <el-button-group>
        <el-tooltip content="左对齐">
          <el-button @click="insertStyle('text-align: left;')">
            <el-icon><AlignLeft /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="居中对齐">
          <el-button @click="insertStyle('text-align: center;')">
            <el-icon><AlignCenter /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="右对齐">
          <el-button @click="insertStyle('text-align: right;')">
            <el-icon><AlignRight /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>
      
      <el-divider direction="vertical" />
      
      <el-button-group>
        <el-tooltip content="插入表格">
          <el-button @click="insertTable">
            <el-icon><Grid /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="插入图片">
          <el-button @click="insertImage">
            <el-icon><Picture /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="插入分页符">
          <el-button @click="insertPageBreak">
            <el-icon><Files /></el-icon>
          </el-button>
        </el-tooltip>
      </el-button-group>
      
      <el-divider direction="vertical" />
      
      <el-tooltip content="插入变量">
        <el-button @click="showVariableDialog">
          <el-icon><Pointer /></el-icon>
          插入变量
        </el-button>
      </el-tooltip>
    </div>
    
    <div class="editor-container">
      <el-input 
        v-model="content" 
        type="textarea" 
        :rows="15"
        placeholder="请输入模板内容，支持HTML和变量占位符"
        @input="updateContent"
      />
    </div>
    
    <div class="preview-container">
      <div class="preview-header">
        <h3>预览</h3>
        <el-button size="small" @click="refreshPreview">刷新预览</el-button>
      </div>
      <div class="preview-content" v-html="previewContent"></div>
    </div>
    
    <!-- 变量选择对话框 -->
    <el-dialog v-model="variableDialogVisible" title="插入变量" width="500px">
      <el-tabs v-model="activeVarTab">
        <el-tab-pane v-for="category in variableCategories" :key="category.key" :label="category.label" :name="category.key">
          <div class="variable-list">
            <el-button 
              v-for="variable in category.variables" 
              :key="variable.key"
              size="small"
              @click="insertVariable(variable.key)"
            >
              {{ variable.label }}
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="variableDialogVisible = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 表格插入对话框 -->
    <el-dialog v-model="tableDialogVisible" title="插入表格" width="500px">
      <el-form :model="tableForm" label-width="100px">
        <el-form-item label="行数">
          <el-input-number v-model="tableForm.rows" :min="1" :max="20" />
        </el-form-item>
        <el-form-item label="列数">
          <el-input-number v-model="tableForm.cols" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="表格宽度">
          <el-input v-model="tableForm.width">
            <template #append>%</template>
          </el-input>
        </el-form-item>
        <el-form-item label="包含表头">
          <el-switch v-model="tableForm.header" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="tableDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmInsertTable">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 图片插入对话框 -->
    <el-dialog v-model="imageDialogVisible" title="插入图片" width="500px">
      <el-form :model="imageForm" label-width="100px">
        <el-form-item label="图片URL">
          <el-input v-model="imageForm.url" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="宽度">
          <el-input v-model="imageForm.width">
            <template #append>px</template>
          </el-input>
        </el-form-item>
        <el-form-item label="高度">
          <el-input v-model="imageForm.height">
            <template #append>px</template>
          </el-input>
        </el-form-item>
        <el-form-item label="对齐方式">
          <el-radio-group v-model="imageForm.align">
            <el-radio value="left">左对齐</el-radio>
            <el-radio value="center">居中</el-radio>
            <el-radio value="right">右对齐</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="imageDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmInsertImage">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { 
  Bold, Italic, TextUnderline, AlignLeft, AlignCenter, AlignRight,
  Grid, Picture, Files, Pointer
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// 编辑器内容
const content = ref(props.modelValue)

// 预览内容
const previewContent = ref('')

// 变量对话框
const variableDialogVisible = ref(false)
const activeVarTab = ref('base')

// 表格对话框
const tableDialogVisible = ref(false)
const tableForm = ref({
  rows: 3,
  cols: 3,
  width: '100',
  header: true
})

// 图片对话框
const imageDialogVisible = ref(false)
const imageForm = ref({
  url: '',
  width: '200',
  height: '150',
  align: 'center'
})

// 变量分类
const variableCategories = [
  {
    key: 'base',
    label: '基础信息',
    variables: [
      { key: 'company_name', label: '公司名称' },
      { key: 'company_address', label: '公司地址' },
      { key: 'company_phone', label: '公司电话' },
      { key: 'company_email', label: '公司邮箱' },
      { key: 'current_date', label: '当前日期' },
      { key: 'current_time', label: '当前时间' },
      { key: 'page_number', label: '页码' },
      { key: 'total_pages', label: '总页数' }
    ]
  },
  {
    key: 'order',
    label: '订单信息',
    variables: [
      { key: 'order_no', label: '订单编号' },
      { key: 'order_date', label: '订单日期' },
      { key: 'customer_name', label: '客户名称' },
      { key: 'customer_contact', label: '客户联系人' },
      { key: 'customer_phone', label: '客户电话' },
      { key: 'customer_address', label: '客户地址' },
      { key: 'order_amount', label: '订单金额' },
      { key: 'order_status', label: '订单状态' }
    ]
  },
  {
    key: 'product',
    label: '产品信息',
    variables: [
      { key: 'product_name', label: '产品名称' },
      { key: 'product_code', label: '产品编码' },
      { key: 'product_spec', label: '产品规格' },
      { key: 'product_unit', label: '产品单位' },
      { key: 'product_price', label: '产品单价' },
      { key: 'product_quantity', label: '产品数量' },
      { key: 'product_amount', label: '产品金额' }
    ]
  }
]

// 监听props变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== content.value) {
    content.value = newVal
    refreshPreview()
  }
})

// 更新内容
const updateContent = (val) => {
  emit('update:modelValue', val)
  refreshPreview()
}

// 刷新预览
const refreshPreview = () => {
  // 简单处理一下变量占位符，用于预览
  let preview = content.value || ''
  
  // 替换所有变量占位符为示例值
  preview = preview.replace(/{{[\s\S]*?}}/g, (match) => {
    const varName = match.replace(/[{}\s]/g, '')
    return `<span class="preview-variable">${varName}</span>`
  })
  
  previewContent.value = preview
}

// 插入HTML标签
const insertTag = (tag) => {
  const textarea = document.querySelector('.print-template-editor textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  
  const newText = `<${tag}>${selectedText}</${tag}>`
  
  const newContent = content.value.substring(0, start) + newText + content.value.substring(end)
  content.value = newContent
  emit('update:modelValue', newContent)
  
  // 设置光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + tag.length + 2 + selectedText.length, start + tag.length + 2 + selectedText.length)
  }, 0)
  
  refreshPreview()
}

// 插入样式
const insertStyle = (style) => {
  const textarea = document.querySelector('.print-template-editor textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  
  const newText = `<div style="${style}">${selectedText}</div>`
  
  const newContent = content.value.substring(0, start) + newText + content.value.substring(end)
  content.value = newContent
  emit('update:modelValue', newContent)
  
  refreshPreview()
}

// 显示变量对话框
const showVariableDialog = () => {
  variableDialogVisible.value = true
}

// 插入变量
const insertVariable = (key) => {
  const textarea = document.querySelector('.print-template-editor textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const variable = `{{ ${key} }}`
  
  const newContent = content.value.substring(0, start) + variable + content.value.substring(start)
  content.value = newContent
  emit('update:modelValue', newContent)
  
  // 设置光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + variable.length, start + variable.length)
  }, 0)
  
  variableDialogVisible.value = false
  refreshPreview()
}

// 插入表格
const insertTable = () => {
  tableDialogVisible.value = true
}

// 确认插入表格
const confirmInsertTable = () => {
  const { rows, cols, width, header } = tableForm.value
  
  let tableHtml = `<table style="width: ${width}%; border-collapse: collapse; margin: 10px 0;">
    ${header ? '<thead>\n    <tr>\n' + Array(cols).fill().map((_, i) => `      <th>标题 ${i + 1}</th>`).join('\n') + '\n    </tr>\n  </thead>' : ''}
    <tbody>
${Array(rows).fill().map((_, i) => {
  return `    <tr>\n${Array(cols).fill().map((_, j) => `      <td>内容 ${i + 1}-${j + 1}</td>`).join('\n')}\n    </tr>`
}).join('\n')}
    </tbody>
  </table>`
  
  const textarea = document.querySelector('.print-template-editor textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  
  const newContent = content.value.substring(0, start) + tableHtml + content.value.substring(start)
  content.value = newContent
  emit('update:modelValue', newContent)
  
  tableDialogVisible.value = false
  refreshPreview()
}

// 插入图片
const insertImage = () => {
  imageDialogVisible.value = true
}

// 确认插入图片
const confirmInsertImage = () => {
  const { url, width, height, align } = imageForm.value
  
  let alignStyle = ''
  if (align === 'center') {
    alignStyle = 'display: block; margin-left: auto; margin-right: auto;'
  } else {
    alignStyle = `float: ${align};`
  }
  
  const imageHtml = `<img src="${url}" width="${width}" height="${height}" style="${alignStyle}" alt="图片" />`
  
  const textarea = document.querySelector('.print-template-editor textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  
  const newContent = content.value.substring(0, start) + imageHtml + content.value.substring(start)
  content.value = newContent
  emit('update:modelValue', newContent)
  
  imageDialogVisible.value = false
  refreshPreview()
}

// 插入分页符
const insertPageBreak = () => {
  const textarea = document.querySelector('.print-template-editor textarea')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const pageBreak = '<div class="page-break"></div>'
  
  const newContent = content.value.substring(0, start) + pageBreak + content.value.substring(start)
  content.value = newContent
  emit('update:modelValue', newContent)
  
  refreshPreview()
}

// 初始化预览
refreshPreview()
</script>

<style scoped>
.print-template-editor {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.editor-toolbar {
  display: flex;
  gap: 5px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  align-items: center;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.preview-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.preview-content {
  min-height: 300px;
  padding: 10px;
  border: 1px solid #ebeef5;
  background-color: white;
}

.variable-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

:deep(.preview-variable) {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: monospace;
}
</style>
