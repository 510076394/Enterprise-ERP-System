<!--
/**
 * PurchaseReceiptForm.vue
 * @description Vue组件文件
  * @date 2025-08-27
 * @version 1.0.0
 */
-->
<template>
  <!-- 组件模板 -->
</template>

<script>
import { ref } from 'vue'

import { ElMessage } from 'element-plus';
import purchaseApi from '../../services/purchaseApi';

export default {
  props: {
    id: {
      type: Number,
      default: null
    }
  },
  setup(props, { emit }) {
    const formRef = ref(null);
    const loading = ref(false);
    const submitLoading = ref(false);
    const editMode = ref(!!props.id);

    // 在handleSubmit方法中添加自动生成追溯的代码
    const handleSubmit = async () => {
      // 表单验证成功后继续
      await formRef.value.validate();
      
      try {
        loading.value = true;
        submitLoading.value = true;
        
        // 构建提交数据
        const submitData = buildSubmitData();
        let result;
        if (editMode.value) {
          // 编辑模式，调用更新API
          result = await purchaseApi.updateReceipt(props.id, submitData);
        } else {
          // 新建模式，调用创建API
          result = await purchaseApi.createReceipt(submitData);
        }
        
        // 尝试自动生成追溯记录
        try {
          // 方法1：尝试直接为每个物料生成追溯记录
          if (submitData.items && submitData.items.length > 0) {
            // 遍历每个物料项
            for (const item of submitData.items) {
              if (!item.batch_number) {
                continue;
              }
              
              try {
                // 为每个物料项创建追溯记录
                const traceData = {
                  receipt_id: result.data.id,
                  material_id: item.material_id,
                  batch_number: item.batch_number
                };
                
                await purchaseApi.createTraceability('purchase', traceData);
              } catch (materialError) {
                console.error(`为物料 ${item.material_id} 创建追溯失败:`, materialError);
              }
            }
          }
          
          // 方法2：尝试触发批量生成所有追溯记录
          try {
            await purchaseApi.generateAllTraceability();
          } catch (batchError) {
            console.error('批量生成追溯记录失败:', batchError);
          }
          
        } catch (traceError) {
          console.error('生成追溯记录失败:', traceError);
          // 不影响入库成功提示
        }
        
        // 显示成功提示
        ElMessage.success(editMode.value ? '入库单更新成功' : '入库单创建成功');
        
        // 重置表单或返回列表
        if (!editMode.value) {
          resetForm();
        }
        
        // 触发保存成功事件
        emit('on-success', result.data);
      } catch (error) {
        console.error('入库单提交失败:', error);
        ElMessage.error('操作失败: ' + (error.message || '未知错误'));
      } finally {
        loading.value = false;
        submitLoading.value = false;
      }
    };

    return {
      formRef,
      loading,
      submitLoading,
      editMode,
      handleSubmit
    };
  }
};
</script>