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
      </div>
    </div>

    <div class="card console-panel panel">
      <el-table :data="tags" v-loading="loading" style="width: 100%">
        <el-table-column prop="tagCode" label="标签编码" min-width="150" />
        <el-table-column prop="tagName" label="标签名称" min-width="150">
          <template #default="{ row }">
            <el-tag size="small">{{ row.tagName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="useCount" label="使用次数" width="100" align="center" sortable />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="编辑标签" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标签编码">
          <el-input v-model="form.tagCode" disabled />
        </el-form-item>
        <el-form-item label="标签名称">
          <el-input v-model="form.tagName" disabled />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入标签描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="ACTIVE">启用</el-radio>
            <el-radio label="INACTIVE">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="handleSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getTagDictionary, updateTagDictionary } from '@/api/modules/admin-console'
import type { AdminTagDictItem } from '@/types'

const loading = ref(false)
const saving = ref(false)
const tags = ref<AdminTagDictItem[]>([])
const queryParams = reactive({
  keyword: '',
  status: ''
})

const dialogVisible = ref(false)
const form = reactive({
  tagCode: '',
  tagName: '',
  description: '',
  status: 'ACTIVE'
})

async function fetchTags() {
  loading.value = true
  try {
    const res = await getTagDictionary(queryParams)
    // 根据 OpenAPI，接口直接返回数组
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

function handleEdit(row: AdminTagDictItem) {
  form.tagCode = row.tagCode
  form.tagName = row.tagName
  form.description = row.description || ''
  form.status = row.status || 'ACTIVE'
  dialogVisible.value = true
}

async function handleSubmit() {
  saving.value = true
  try {
    await updateTagDictionary(form.tagCode, {
      description: form.description,
      status: form.status
    })
    ElMessage.success('更新成功')
    dialogVisible.value = false
    fetchTags()
  } catch (error) {
    console.error('Failed to update tag:', error)
    ElMessage.error('更新标签失败')
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
  padding: 16px;
}
</style>
