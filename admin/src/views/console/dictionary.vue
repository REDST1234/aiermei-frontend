<template>
  <div class="console-page">
    <div class="page-header">
      <h1 class="page-title">字典管理</h1>
      <div class="header-actions">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索标签名称/编码"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button type="success" @click="handleAdd">添加标签</el-button>
      </div>
    </div>

    <div class="card console-panel panel">
      <el-table 
        :data="tags" 
        v-loading="loading" 
        style="width: 100%"
        header-cell-class-name="table-header-cell"
        row-class-name="table-row"
      >
        <el-table-column prop="tagCode" label="标签编码" min-width="160">
          <template #default="{ row }">
            <code class="tag-code">{{ row.tagCode }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="tagName" label="标签名称" min-width="150">
          <template #default="{ row }">
            <span class="tag-name-text">{{ row.tagName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="description-text">{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="useCount" label="使用次数" width="160" align="left" sortable>
          <template #default="{ row }">
            <el-statistic :value="row.useCount" :value-style="{ fontSize: '14px', fontWeight: '600', textAlign: 'left' }" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="150">
          <template #default="{ row }">
            <div class="status-indicator" :class="row.status === 'ACTIVE' ? 'active' : 'inactive'">
              <span class="dot"></span>
              <span class="text">{{ row.status === 'ACTIVE' ? '已启用' : '已禁用' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <div class="op-actions">
              <el-button link type="primary" @click="handleEdit(row)" class="edit-btn">编辑</el-button>
              <el-popconfirm title="确定删除该标签吗？" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button link type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑/新增弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑标签' : '添加标签'" width="520px" destroy-on-close class="custom-dialog">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" label-position="left">
        <el-form-item label="标签编码" prop="tagCode">
          <el-input v-model="form.tagCode" :disabled="isEdit" :placeholder="isEdit ? '' : '建议使用英文下划线格式'" class="disabled-input" />
        </el-form-item>
        <el-form-item label="标签名称" prop="tagName">
          <el-input v-model="form.tagName" :disabled="isEdit" placeholder="请输入标签显示名称" class="disabled-input" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入标签的详细业务描述..." 
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="排序" v-if="!isEdit">
          <el-input-number v-model="form.sortNo" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-segmented 
            v-model="form.status" 
            :options="[{ label: '启用', value: 'ACTIVE' }, { label: '禁用', value: 'INACTIVE' }]" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" round>取消</el-button>
          <el-button type="primary" :loading="saving" @click="handleSubmit" round class="submit-btn">
            {{ isEdit ? '提交更新' : '立即创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getTagDictionary, updateTagDictionary, createTagDictionary, deleteTagDictionary } from '@/api/modules/admin-console'
import type { AdminTagDictItem } from '@/types'

const loading = ref(false)
const saving = ref(false)
const tags = ref<AdminTagDictItem[]>([])
const queryParams = reactive({
  keyword: '',
  status: ''
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  tagCode: '',
  tagName: '',
  description: '',
  status: 'ACTIVE',
  sortNo: 0
})

const rules = {
  tagCode: [{ required: true, message: '请输入标签编码', trigger: 'blur' }],
  tagName: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
}

async function fetchTags() {
  loading.value = true
  try {
    const res = await getTagDictionary(queryParams)
    tags.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    ElMessage.error('获取标签字典失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  fetchTags()
}

function handleAdd() {
  isEdit.value = false
  form.tagCode = ''
  form.tagName = ''
  form.description = ''
  form.status = 'ACTIVE'
  form.sortNo = 10
  dialogVisible.value = true
}

function handleEdit(row: AdminTagDictItem) {
  isEdit.value = true
  form.tagCode = row.tagCode
  form.tagName = row.tagName
  form.description = row.description || ''
  form.status = row.status || 'ACTIVE'
  dialogVisible.value = true
}

async function handleDelete(row: AdminTagDictItem) {
  try {
    await deleteTagDictionary(row.tagCode)
    ElMessage.success('标签删除成功')
    fetchTags()
  } catch (error) {
    console.error('Failed to delete tag:', error)
    ElMessage.error('删除标签失败')
  }
}

async function handleSubmit() {
  if (formRef.value) {
    await formRef.value.validate()
  }
  
  saving.value = true
  try {
    if (isEdit.value) {
      await updateTagDictionary(form.tagCode, {
        description: form.description,
        status: form.status
      })
      ElMessage.success('标签更新成功')
    } else {
      await createTagDictionary({
        tagCode: form.tagCode,
        tagName: form.tagName,
        description: form.description,
        status: form.status,
        sortNo: form.sortNo
      })
      ElMessage.success('标签创建成功')
    }
    dialogVisible.value = false
    fetchTags()
  } catch (error) {
    console.error('Failed to submit tag:', error)
    ElMessage.error(isEdit.value ? '更新标签失败' : '创建标签失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.panel {
  padding: 0;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 表格样式美化 */
:deep(.table-header-cell) {
  background-color: #f9fafb !important;
  color: #374151 !important;
  font-weight: 600 !important;
  height: 50px;
}

:deep(.table-row) {
  height: 60px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f3f4f6 !important;
  }
}

.tag-code {
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
  background-color: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.tag-name-text {
  font-weight: 500;
  color: #111827;
}

.description-text {
  color: #6b7280;
  font-size: 14px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  
  .text {
    font-size: 13px;
  }
  
  &.active {
    .dot { background-color: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.4); }
    .text { color: #059669; }
  }
  
  &.inactive {
    .dot { background-color: #9ca3af; }
    .text { color: #6b7280; }
  }
}

.edit-btn {
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
}

.op-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 弹窗与表单样式 */
.disabled-input {
  :deep(.el-input__inner) {
    background-color: #f9fafb;
    color: #9ca3af;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

.submit-btn {
  padding-left: 24px;
  padding-right: 24px;
  background-color: #111827;
  border-color: #111827;
  
  &:hover {
    background-color: #1f2937;
    border-color: #1f2937;
  }
}
</style>
