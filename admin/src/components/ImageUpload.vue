<template>
  <div class="image-upload" :class="{ compact }">
    <div v-if="!compact" class="upload-header">
      <el-radio-group v-model="uploadMode" size="small" class="mode-switcher">
        <el-radio-button value="file">本地上传</el-radio-button>
        <el-radio-button value="url">URL 链接</el-radio-button>
      </el-radio-group>
    </div>

    <div class="upload-body">
      <!-- URL Mode -->
      <template v-if="uploadMode === 'url'">
        <div class="url-input-group">
          <el-input
            :model-value="modelValue"
            placeholder="粘贴图片链接..."
            size="default"
            @update:model-value="$emit('update:modelValue', $event)"
          >
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
          <div v-if="modelValue" class="url-preview-card">
            <el-image :src="modelValue" fit="cover" class="preview-img">
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>无效链接</span>
                </div>
              </template>
            </el-image>
            <div class="remove-overlay" @click="$emit('update:modelValue', '')">
              <el-icon><Delete /></el-icon>
            </div>
          </div>
        </div>
      </template>

      <!-- File Mode -->
      <template v-else>
        <el-upload
          class="file-uploader"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :http-request="handleUpload"
          accept="image/*"
        >
          <div v-if="modelValue" class="preview-wrapper">
            <el-image :src="modelValue" fit="cover" class="preview-image" />
            <div class="preview-actions">
              <div class="action-btn" @click.stop="handleClear">
                <el-icon><Delete /></el-icon>
                <span>删除</span>
              </div>
            </div>
          </div>
          <div v-else class="upload-trigger" :class="{ 'compact-trigger': compact }">
            <el-icon class="upload-icon"><Plus v-if="compact" /><UploadFilled v-else /></el-icon>
            <template v-if="!compact">
              <span class="upload-text">点击或拖拽上传</span>
              <span class="upload-tip">支持 JPG/PNG/WebP，小于 5MB</span>
            </template>
            <template v-else>
              <span class="compact-text">上传</span>
            </template>
          </div>
        </el-upload>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Link, Plus, Delete, Picture, UploadFilled } from '@element-plus/icons-vue'
import { uploadFile } from '@/api/modules/admin-console'

const props = defineProps<{
  modelValue: string
  bizType: string
  compact?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uploadMode = ref<'url' | 'file'>('file')

// If a URL is pasted, we stay in URL mode, but default to file for new uploads
watch(() => props.modelValue, (val) => {
  if (val && val.startsWith('http') && uploadMode.value === 'file' && !val.includes('blob:')) {
    // Keep current mode unless explicitly changed
  }
})

function beforeUpload(file: File) {
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

async function handleUpload(options: { file: File }) {
  try {
    const res = await uploadFile(options.file, props.bizType)
    emit('update:modelValue', res.data.url)
    ElMessage.success('上传成功')
  } catch {
    ElMessage.error('上传失败')
  }
}

function handleClear() {
  emit('update:modelValue', '')
}
</script>

<style scoped lang="scss">
.image-upload {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &.compact {
    gap: 0;
    width: auto;
  }
}

.upload-header {
  display: flex;
  justify-content: flex-start;
}

.mode-switcher {
  :deep(.el-radio-button__inner) {
    border-radius: 4px !important;
    border: 1px solid #dcdfe6 !important;
    margin-right: 8px;
    padding: 6px 12px;
    background: #f5f7fa;
    color: #606266;
    box-shadow: none !important;
  }
  
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: #111827 !important;
    border-color: #111827 !important;
    color: #fff !important;
  }
}

.upload-body {
  width: 100%;
  .compact & {
    height: 100%;
  }
}

/* URL Mode Styling */
.url-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.url-preview-card {
  position: relative;
  width: 180px;
  height: 120px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background: #f9fafb;

  .preview-img {
    width: 100%;
    height: 100%;
  }

  .remove-overlay {
    position: absolute;
    top: 0;
    right: 0;
    padding: 6px;
    background: rgba(0,0,0,0.5);
    color: #fff;
    cursor: pointer;
    border-bottom-left-radius: 8px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover .remove-overlay {
    opacity: 1;
  }
}

/* File Mode Styling */
.file-uploader {
  height: 100%;
  :deep(.el-upload) {
    width: 100%;
    height: 100%;
    border: 2px dashed #e5e7eb;
    border-radius: 8px;
    transition: all 0.3s;
    background: #f9fafb;

    &:hover {
      border-color: #111827;
      background: #f3f4f6;
    }
  }
}

.upload-trigger {
  width: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;

  &.compact-trigger {
    width: 100px;
    height: 100px;
    min-height: auto;
    padding: 0;
  }

  .upload-icon {
    font-size: 32px;
    color: #9ca3af;
    margin-bottom: 8px;
  }

  .upload-text {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }

  .upload-tip {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
  }

  .compact-text {
    font-size: 12px;
    color: #6b7280;
  }
}

.preview-wrapper {
  position: relative;
  width: 100%;
  height: 160px;
  border-radius: 6px;
  overflow: hidden;

  .preview-image {
    width: 100%;
    height: 100%;
  }

  .preview-actions {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: #fff;
      font-size: 14px;
      
      .el-icon {
        font-size: 24px;
      }

      &:hover {
        color: #f87171;
      }
    }
  }

  &:hover .preview-actions {
    opacity: 1;
  }
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  font-size: 12px;
  gap: 4px;

  .el-icon {
    font-size: 24px;
  }
}
</style>
