<template>
  <div class="facilities-page">
    <div class="page-header">
      <h1 class="page-title">设施管理</h1>
      <el-button type="primary" @click="openCreate">新增设施</el-button>
    </div>

    <div v-loading="loading" class="grid">
      <div v-for="item in rows" :key="item.id" class="card facility-card">
        <el-image :src="item.image" fit="cover" class="cover" />
        <div class="body">
          <div class="title-row">
            <span class="title">{{ item.title }}</span>
            <el-tag size="small" type="info">排序: {{ item.sort }}</el-tag>
          </div>
          <p class="desc">{{ item.desc || '暂无描述' }}</p>
        <div class="actions">
          <el-button type="primary" link @click="openEdit(item)">编辑</el-button>
          <el-button type="danger" link @click="remove(item)">删除</el-button>
        </div>
      </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑设施' : '新增设施'" width="560px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="form.title" placeholder="设施名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.desc" type="textarea" :rows="3" placeholder="设施功能或规格描述" />
        </el-form-item>
        <el-form-item label="配图" required>
          <ImageUpload v-model="form.image" biz-type="center_facility_image" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { isConflictError } from '@/api/request'
import {
  createCenterFacility,
  deleteCenterFacility,
  getCenterFacilities,
  updateCenterFacility
} from '@/api/modules/center'
import ImageUpload from '@/components/ImageUpload.vue'
import type { CenterFacility } from '@/types'

const loading = ref(false)
const saving = ref(false)
const rows = ref<CenterFacility[]>([])

const dialogVisible = ref(false)
const editingId = ref('')
const editingVersion = ref<number | undefined>(undefined)
const form = reactive({ title: '', desc: '', image: '', sort: 1 })

async function load() {
  loading.value = true
  try {
    const res = await getCenterFacilities()
    rows.value = res.data
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, { title: '', desc: '', image: '', sort: 1 })
}

function openCreate() {
  editingId.value = ''
  editingVersion.value = undefined
  resetForm()
  dialogVisible.value = true
}

function openEdit(row: CenterFacility) {
  editingId.value = row.id
  editingVersion.value = row.version
  Object.assign(form, {
    title: row.title,
    desc: row.desc || '',
    image: row.image || '',
    sort: row.sort
  })
  dialogVisible.value = true
}

async function save() {
  if (!form.title.trim()) {
    ElMessage.warning('标题不能为空')
    return
  }
  if (!form.image.trim()) {
    ElMessage.warning('请上传图片')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateCenterFacility(editingId.value, { ...form, version: editingVersion.value })
    } else {
      await createCenterFacility(form)
    }
    dialogVisible.value = false
    await load()
    ElMessage.success('保存成功')
  } catch (error) {
    if (isConflictError(error)) {
      ElMessage.warning('数据已被他人更新，请刷新后重试')
      await load()
      return
    }
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

function remove(row: CenterFacility) {
  ElMessageBox.confirm('确认删除该设施？', '提示', { type: 'warning' })
    .then(async () => {
      if (row.version === undefined) {
        ElMessage.warning('当前数据缺少版本号，请先刷新列表')
        return
      }
      await deleteCenterFacility(row.id, row.version)
      await load()
      ElMessage.success('删除成功')
    })
    .catch(async (error) => {
      if (isConflictError(error)) {
        ElMessage.warning('数据已被他人更新，请刷新后重试')
        await load()
      }
    })
}

onMounted(load)
</script>

<style scoped lang="scss">
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.facility-card {
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .cover {
    width: 100%;
    height: 160px;
    background: #f3f4f6;
  }

  .body {
    padding: 16px;

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .title {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
      }
    }

    .desc {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
      margin-bottom: 16px;
      height: 42px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid #f3f4f6;
      padding-top: 12px;
    }
  }
}
</style>

