<!--
/**
 * TraceabilityGenerateButton.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <div class="traceability-generate-button">
    <el-button type="primary" :loading="loading" @click="handleGenerate">
      <el-icon><Refresh /></el-icon>
      {{ $t('质量.追溯.自动生成追溯') }}
    </el-button>
  </div>
</template>

<script>
import { Refresh } from '@element-plus/icons-vue';
import { defineComponent, ref } from 'vue';
import { ElMessage } from 'element-plus';

export default defineComponent({
  name: 'TraceabilityGenerateButton',
  components: {
    Refresh
  },
  props: {
    redirectAfterGenerate: {
      type: Boolean,
      default: false
    }
  },
  emits: ['generated'],
  setup(props, { emit }) {
    const loading = ref(false);

    const handleGenerate = async () => {
      try {
        loading.value = true;
        
        const response = await fetch('/api/quality/traceability/auto-generate-all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });
        
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`服务器响应错误: ${response.status} ${text}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          const count = result.data?.count || 0;
          ElMessage.success(`成功生成 ${count} 条追溯记录!`);
          
          // 触发生成完成事件
          emit('generated', { count });
          
          // 根据配置决定是否重定向
          if (props.redirectAfterGenerate && count > 0) {
            // 重定向到追溯管理页面
            window.location.href = '/#/quality/traceability';
          }
        } else {
          ElMessage.error(result.message || '自动生成追溯记录失败');
        }
      } catch (error) {
        console.error('自动生成追溯记录时出错:', error);
        ElMessage.error(`自动生成追溯记录失败: ${error.message}`);
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      handleGenerate
    };
  }
});
</script>

<style scoped>
.traceability-generate-button {
  display: inline-block;
}
</style> 