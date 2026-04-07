<!--
/**
 * PrintDialog.vue
 * @description 通用打印预览对话框
 * @date 2026-01-17
 */
-->
<template>
  <el-dialog
    v-model="visible"
    :title="title || '打印预览'"
    width="920px"
    :close-on-click-modal="false"
    destroy-on-close
    @opened="onOpened"
  >
    <div class="print-preview-container" v-loading="loading">
      <div v-if="error" class="error-message">
        <el-alert :title="error" type="error" show-icon :closable="false" />
      </div>
      
      <div v-else class="preview-content">
        <iframe
          ref="previewIframe"
          class="preview-iframe"
          :srcdoc="previewHtml"
        ></iframe>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handlePrint" :disabled="loading || error || !previewHtml">
          打印
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import { api } from '@/services/api';

import { processTemplate, createDefaultTemplateData } from '@/utils/helpers/templateUtils';

const props = defineProps({
  modelValue: Boolean,
  title: String,
  templateType: {
    type: String,
    required: true
  },
  module: {
    type: String,
    default: 'finance'
  },
  data: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

// 对话框可见性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const loading = ref(false);
const error = ref('');
const previewHtml = ref('');
const previewIframe = ref(null);
const currentTemplate = ref(null);

// 获取打印模板
const fetchTemplate = async () => {
  loading.value = true;
  error.value = '';
  previewHtml.value = '';
  
  try {
    // 查询启用的、指定类型的模板
    // 优先使用默认模板
    const params = {
      module: props.module,
      template_type: props.templateType,
      status: 1,
      page: 1,
      limit: 100 // 获取列表，然后在前端筛选默认项
    };
    
    const response = await api.get('/print/templates', { params });
    const list = response.data?.list || response.data?.data || (Array.isArray(response.data) ? response.data : []);
    
    // 找到默认模板，如果没有默认的，就取第一个，如果列表为空，使用系统默认硬编码模板
    let template = list.find(t => t.is_default === 1);
    if (!template && list.length > 0) {
      template = list[0];
    }
    
    if (!template) {
      // 如果没有找到数据库模板，使用系统默认模板
      template = createDefaultTemplateData(props.templateType, props.module);
    }
    
    currentTemplate.value = template;
    generatePreview();
    
  } catch (err) {
    console.error('获取打印模板失败:', err);
    error.value = '获取打印模板失败，请检查网络或联系管理员';
  } finally {
    loading.value = false;
  }
};

// 生成预览HTML
const generatePreview = () => {
  if (!currentTemplate.value || !props.data) return;
  
  try {
    // 注入公司信息等全局变量（如果有）
    // 这里假设 props.data 已经包含了所需的所有数据
    // 实际应用中可能需要在这里合并一些全局配置
    
    const html = processTemplate(currentTemplate.value.content, props.data);
    previewHtml.value = html;
  } catch (err) {
    console.error('生成预览失败:', err);
    error.value = '生成打印预览失败';
  }
};

// 打印
const handlePrint = () => {
  if (previewIframe.value && previewIframe.value.contentWindow) {
    previewIframe.value.contentWindow.print();
  }
};

// 监听打开事件
const onOpened = () => {
  fetchTemplate();
};

// 监听数据变化，重新生成预览（如果对话框已打开）
watch(() => props.data, () => {
  if (visible.value && currentTemplate.value) {
    generatePreview();
  }
}, { deep: true });

</script>

<style scoped>
.print-preview-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.preview-content {
  flex: 1;
  border: 1px solid #dcdfe6;
  background-color: #f5f7fa;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.preview-iframe {
  width: 100%;
  height: 600px; /* 或者根据内容自适应 */
  background-color: white;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.error-message {
  padding: 20px;
}
</style>
