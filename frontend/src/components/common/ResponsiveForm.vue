<!--
/**
 * ResponsiveForm.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="responsive-form" :class="formClasses">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-position="labelPosition"
      :label-width="labelWidth"
      :size="formSize"
      @submit.prevent="handleSubmit"
    >
      <!-- 表单项渲染 -->
      <template v-for="field in formFields" :key="field.prop">
        <el-form-item
          :prop="field.prop"
          :label="field.label"
          :required="field.required"
          :class="getFieldClasses(field)"
        >
          <!-- 输入框 -->
          <el-input
            v-if="field.type === 'input'"
            v-model="formData[field.prop]"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            :readonly="field.readonly"
            :maxlength="field.maxlength"
            :show-word-limit="field.showWordLimit"
            :clearable="field.clearable !== false"
            @blur="handleFieldBlur(field)"
            @change="handleFieldChange(field)"
          />

          <!-- 文本域 -->
          <el-input
            v-else-if="field.type === 'textarea'"
            v-model="formData[field.prop]"
            type="textarea"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            :readonly="field.readonly"
            :rows="field.rows || 3"
            :maxlength="field.maxlength"
            :show-word-limit="field.showWordLimit"
            @blur="handleFieldBlur(field)"
            @change="handleFieldChange(field)"
          />

          <!-- 数字输入框 -->
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="formData[field.prop]"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            :precision="field.precision"
            :controls-position="isMobile ? 'right' : 'default'"
            style="width: 100%"
            @blur="handleFieldBlur(field)"
            @change="handleFieldChange(field)"
          />

          <!-- 选择器 -->
          <el-select
            v-else-if="field.type === 'select'"
            v-model="formData[field.prop]"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            :multiple="field.multiple"
            :clearable="field.clearable !== false"
            :filterable="field.filterable"
            style="width: 100%"
            @change="handleFieldChange(field)"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
              :disabled="option.disabled"
            />
          </el-select>

          <!-- 日期选择器 -->
          <el-date-picker
            v-else-if="field.type === 'date'"
            v-model="formData[field.prop]"
            type="date"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            :clearable="field.clearable !== false"
            style="width: 100%"
            @change="handleFieldChange(field)"
          />

          <!-- 日期时间选择器 -->
          <el-date-picker
            v-else-if="field.type === 'datetime'"
            v-model="formData[field.prop]"
            type="datetime"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            :clearable="field.clearable !== false"
            style="width: 100%"
            @change="handleFieldChange(field)"
          />

          <!-- 日期范围选择器 -->
          <el-date-picker
            v-else-if="field.type === 'daterange'"
            v-model="formData[field.prop]"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :disabled="field.disabled"
            :clearable="field.clearable !== false"
            style="width: 100%"
            @change="handleFieldChange(field)"
          />

          <!-- 开关 -->
          <el-switch
            v-else-if="field.type === 'switch'"
            v-model="formData[field.prop]"
            :disabled="field.disabled"
            :active-text="field.activeText"
            :inactive-text="field.inactiveText"
            @change="handleFieldChange(field)"
          />

          <!-- 单选框组 -->
          <el-radio-group
            v-else-if="field.type === 'radio'"
            v-model="formData[field.prop]"
            :disabled="field.disabled"
            @change="handleFieldChange(field)"
          >
            <el-radio :value="option.value"
              :disabled="option.disabled"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>

          <!-- 复选框组 -->
          <el-checkbox-group
            v-else-if="field.type === 'checkbox'"
            v-model="formData[field.prop]"
            :disabled="field.disabled"
            @change="handleFieldChange(field)"
          >
            <el-checkbox
              v-for="option in field.options"
              :key="option.value"
              :label="option.value"
              :disabled="option.disabled"
            >
              {{ option.label }}
            </el-checkbox>
          </el-checkbox-group>

          <!-- 文件上传 -->
          <el-upload
            v-else-if="field.type === 'upload'"
            :action="field.action"
            :headers="field.headers"
            :data="field.data"
            :multiple="field.multiple"
            :accept="field.accept"
            :limit="field.limit"
            :file-list="formData[field.prop] || []"
            :disabled="field.disabled"
            @change="handleUploadChange(field, $event)"
            @remove="handleUploadRemove(field, $event)"
          >
            <el-button type="primary" :size="formSize">
              <el-icon><Upload /></el-icon>
              {{ field.uploadText || '选择文件' }}
            </el-button>
          </el-upload>

          <!-- 自定义插槽 -->
          <slot
            v-else-if="field.type === 'slot'"
            :name="field.slotName"
            :field="field"
            :value="formData[field.prop]"
            :formData="formData"
          />

          <!-- 帮助文本 -->
          <div v-if="field.help" class="field-help">
            {{ field.help }}
          </div>
        </el-form-item>
      </template>

      <!-- 表单操作按钮 -->
      <el-form-item v-if="showActions" class="form-actions">
        <div class="action-buttons" :class="{ 'mobile-actions': isMobile }">
          <el-button
            v-if="showCancel"
            :size="formSize"
            @click="handleCancel"
          >
            {{ cancelText }}
          </el-button>
          <el-button
            v-if="showReset"
            :size="formSize"
            @click="handleReset"
          >
            {{ resetText }}
          </el-button>
          <el-button
            type="primary"
            :size="formSize"
            :loading="loading"
            @click="handleSubmit"
          >
            {{ submitText }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Upload } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  formData: { type: Object, required: true },
  formFields: { type: Array, required: true },
  formRules: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  showActions: { type: Boolean, default: true },
  showCancel: { type: Boolean, default: true },
  showReset: { type: Boolean, default: true },
  submitText: { type: String, default: '提交' },
  cancelText: { type: String, default: '取消' },
  resetText: { type: String, default: '重置' },
  labelWidth: { type: String, default: 'auto' },
  size: { type: String, default: 'default' }
})

// Emits
const emit = defineEmits(['submit', 'cancel', 'reset', 'field-change', 'field-blur'])

// 响应式数据
const formRef = ref()
const windowWidth = ref(window.innerWidth)

// 计算属性
const isMobile = computed(() => windowWidth.value < 768)
const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)

const formClasses = computed(() => ({
  'form-mobile': isMobile.value,
  'form-tablet': isTablet.value,
  'form-desktop': !isMobile.value && !isTablet.value
}))

const labelPosition = computed(() => {
  if (isMobile.value) return 'top'
  return 'right'
})

const formSize = computed(() => {
  if (isMobile.value) return 'large'
  if (isTablet.value) return 'default'
  return props.size
})

// 方法
const getFieldClasses = (field) => ({
  'field-full-width': field.fullWidth || isMobile.value,
  'field-half-width': field.halfWidth && !isMobile.value,
  'field-required': field.required
})

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (valid) {
      emit('submit', props.formData)
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleReset = () => {
  formRef.value.resetFields()
  emit('reset')
}

const handleFieldChange = (field) => {
  emit('field-change', {
    field: field.prop,
    value: props.formData[field.prop],
    fieldConfig: field
  })
}

const handleFieldBlur = (field) => {
  emit('field-blur', {
    field: field.prop,
    value: props.formData[field.prop],
    fieldConfig: field
  })
}

const handleUploadChange = (field, fileList) => {
  props.formData[field.prop] = fileList
  handleFieldChange(field)
}

const handleUploadRemove = (field, file) => {
  const fileList = props.formData[field.prop] || []
  const index = fileList.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.splice(index, 1)
  }
  handleFieldChange(field)
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// 暴露方法
const validate = () => formRef.value.validate()
const validateField = (prop) => formRef.value.validateField(prop)
const resetFields = () => formRef.value.resetFields()
const clearValidate = () => formRef.value.clearValidate()

defineExpose({
  validate,
  validateField,
  resetFields,
  clearValidate
})

// 生命周期
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.responsive-form {
  width: 100%;
}

/* 移动端样式 */
.form-mobile :deep(.el-form-item) {
  margin-bottom: 20px;
}

.form-mobile :deep(.el-form-item__label) {
  padding-bottom: 8px;
  font-weight: 500;
}

.form-mobile :deep(.el-input),
.form-mobile :deep(.el-select),
.form-mobile :deep(.el-date-picker) {
  height: 44px;
}

.form-mobile :deep(.el-input__inner) {
  height: 44px;
  font-size: 16px; /* 防止iOS缩放 */
}

.form-mobile :deep(.el-textarea__inner) {
  font-size: 16px;
  min-height: 88px;
}

/* 平板样式 */
.form-tablet :deep(.el-form-item) {
  margin-bottom: 18px;
}

/* 桌面端样式 */
.form-desktop :deep(.el-form-item) {
  margin-bottom: 16px;
}

/* 字段宽度 */
.field-full-width {
  width: 100%;
}

.field-half-width {
  width: calc(50% - 8px);
  display: inline-block;
  margin-right: 16px;
}

.field-half-width:nth-child(even) {
  margin-right: 0;
}

/* 必填字段标识 */
.field-required :deep(.el-form-item__label::before) {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

/* 帮助文本 */
.field-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

/* 表单操作按钮 */
.form-actions {
  margin-top: 24px;
  margin-bottom: 0;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.mobile-actions {
  flex-direction: column-reverse;
  gap: 8px;
}

.mobile-actions .el-button {
  width: 100%;
  height: 44px;
}

/* 上传组件样式 */
.form-mobile :deep(.el-upload) {
  width: 100%;
}

.form-mobile :deep(.el-upload .el-button) {
  width: 100%;
  height: 44px;
}

/* 单选框和复选框组样式 */
.form-mobile :deep(.el-radio-group),
.form-mobile :deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-mobile :deep(.el-radio),
.form-mobile :deep(.el-checkbox) {
  margin-right: 0;
  height: 44px;
  display: flex;
  align-items: center;
}

/* 开关样式 */
.form-mobile :deep(.el-switch) {
  height: 44px;
  display: flex;
  align-items: center;
}

/* 响应式断点 */
@media (max-width: 767px) {
  .responsive-form {
    padding: 16px;
  }
  
  .field-half-width {
    width: 100%;
    margin-right: 0;
    margin-bottom: 16px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .responsive-form {
    padding: 20px;
  }
}

@media (min-width: 1024px) {
  .responsive-form {
    padding: 24px;
  }
}
</style>
