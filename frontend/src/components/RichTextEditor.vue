<!--
/**
 * RichTextEditor.vue
 * @description 富文本编辑器组件（基于Quill）
 * @date 2025-11-04
 */
-->
<template>
  <div class="rich-text-editor">
    <QuillEditor
      v-model:content="content"
      content-type="html"
      :options="editorOptions"
      @ready="onEditorReady"
      @update:content="handleUpdate"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import DOMPurify from 'dompurify';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  minHeight: {
    type: String,
    default: '400px'
  }
});

const emit = defineEmits(['update:modelValue']);

const content = ref(props.modelValue);

const editorOptions = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // 加粗、斜体、下划线、删除线
      ['blockquote', 'code-block'],                     // 引用、代码块
      [{ 'header': 1 }, { 'header': 2 }],               // 标题
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],     // 有序列表、无序列表
      [{ 'script': 'sub'}, { 'script': 'super' }],      // 下标、上标
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // 缩进
      [{ 'direction': 'rtl' }],                         // 文本方向
      [{ 'size': ['small', false, 'large', 'huge'] }],  // 字体大小
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],        // 标题级别
      [{ 'color': [] }, { 'background': [] }],          // 字体颜色、背景颜色
      [{ 'font': [] }],                                 // 字体
      [{ 'align': [] }],                                // 对齐方式
      ['link', 'image', 'video'],                       // 链接、图片、视频
      ['clean']                                         // 清除格式
    ]
  },
  placeholder: props.placeholder,
  theme: 'snow'
};

const onEditorReady = (quill) => {
  // 编辑器准备就绪
};

const handleUpdate = (value) => {
  // 使用 DOMPurify 清理 HTML 内容，防止 XSS 攻击
  const cleanValue = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'pre', 'code',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ol', 'ul', 'li',
      'a', 'img', 'video',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'style',
      'controls', 'frameborder'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  });
  emit('update:modelValue', cleanValue);
};

watch(() => props.modelValue, (newVal) => {
  if (newVal !== content.value) {
    content.value = newVal;
  }
});
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.rich-text-editor :deep(.ql-container) {
  min-height: v-bind(minHeight);
  font-size: 14px;
}

.rich-text-editor :deep(.ql-editor) {
  min-height: v-bind(minHeight);
  line-height: 1.6;
}

.rich-text-editor :deep(.ql-toolbar) {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  background-color: #f5f7fa;
}

.rich-text-editor :deep(.ql-container) {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* 代码块样式 */
.rich-text-editor :deep(.ql-syntax) {
  background-color: #f5f7fa;
  color: #333;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

/* 引用样式 */
.rich-text-editor :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 16px;
  margin: 10px 0;
  color: #666;
}

/* 链接样式 */
.rich-text-editor :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.rich-text-editor :deep(a:hover) {
  text-decoration: underline;
}

/* 图片样式 */
.rich-text-editor :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 10px 0;
}

/* 表格样式 */
.rich-text-editor :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.rich-text-editor :deep(table td),
.rich-text-editor :deep(table th) {
  border: 1px solid #dcdfe6;
  padding: 8px;
}

.rich-text-editor :deep(table th) {
  background-color: #f5f7fa;
  font-weight: bold;
}
</style>

