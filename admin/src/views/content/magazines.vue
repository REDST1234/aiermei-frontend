<template>
  <div class="magazines-page">
    <div class="page-header">
      <h1 class="page-title">杂志管理</h1>
      <el-button type="primary" @click="showEditor()">新增杂志</el-button>
    </div>

    <div class="grid">
      <div v-for="mag in magazines" :key="mag.id" class="card item-card">
        <el-image :src="mag.cover" fit="cover" class="cover" />
        <div class="body">
          <div class="title">{{ mag.title }}</div>
          <div class="sub">{{ mag.subtitle || '-' }}</div>
          <div class="meta">{{ mag.author || '-' }} / {{ mag.publishedAt ? formatDate(mag.publishedAt) : '-' }}</div>
          <el-tag :type="mag.status === 'active' ? 'success' : 'info'" size="small">{{ mag.status === 'active' ? '启用' : '停用' }}</el-tag>
          <div class="actions">
            <el-button type="primary" link @click="showEditor(mag)">编辑</el-button>
            <el-button :type="mag.status === 'active' ? 'warning' : 'success'" link @click="toggleStatus(mag)">
              {{ mag.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="deleteMagazineHandle(mag)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="editorVisible" :title="editingMagazine ? '编辑杂志' : '新增杂志'" width="640px" destroy-on-close>
      <el-form :model="magazineForm" label-width="90px">
        <el-form-item label="标题" required>
          <el-input v-model="magazineForm.title" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="magazineForm.subtitle" />
        </el-form-item>
        <el-form-item label="封面" required>
          <ImageUpload v-model="magazineForm.cover" biz-type="magazine_cover" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="magazineForm.author" />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="magazineForm.content" type="textarea" :rows="8" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editorVisible = false">取消</el-button>
        <el-button :disabled="!canSaveMagazine" @click="saveDraft">保存停用</el-button>
        <el-button type="primary" :disabled="!canSaveMagazine" @click="saveAndPublish">保存启用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { isConflictError } from '@/api/request'
import { createMagazine, deleteMagazine, getMagazines, updateMagazine } from '@/api/modules/media'
import ImageUpload from '@/components/ImageUpload.vue'
import type { Magazine } from '@/types'
import dayjs from 'dayjs'

const magazines = ref<Magazine[]>([])
const editorVisible = ref(false)
const editingMagazine = ref<Magazine | null>(null)

const magazineForm = reactive({
  title: '',
  subtitle: '',
  cover: '',
  author: '',
  content: ''
})

const canSaveMagazine = computed(
  () => Boolean(magazineForm.title.trim()) && Boolean(magazineForm.cover.trim()) && Boolean(magazineForm.content.trim())
)

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD')
}

function showEditor(mag?: Magazine) {
  editingMagazine.value = mag || null
  if (mag) {
    Object.assign(magazineForm, {
      title: mag.title,
      subtitle: mag.subtitle || '',
      cover: mag.cover,
      author: mag.author || '',
      content: mag.content
    })
  } else {
    Object.assign(magazineForm, {
      title: '',
      subtitle: '',
      cover: '',
      author: '',
      content: ''
    })
  }
  editorVisible.value = true
}

function saveDraft() {
  void saveMagazine('inactive')
}

function saveAndPublish() {
  void saveMagazine('active')
}

async function saveMagazine(status: 'active' | 'inactive') {
  if (!canSaveMagazine.value) {
    ElMessage.warning('请先填写必填项：标题、封面、正文')
    return
  }
  const payload: Partial<Magazine> = {
    title: magazineForm.title,
    subtitle: magazineForm.subtitle,
    cover: magazineForm.cover,
    author: magazineForm.author,
    content: magazineForm.content,
    status,
    version: editingMagazine.value?.version
  }

  if (status === 'active') payload.publishedAt = new Date().toISOString()

  try {
    if (editingMagazine.value) {
      await updateMagazine(editingMagazine.value.id, payload)
      ElMessage.success('已更新')
    } else {
      await createMagazine(payload)
      ElMessage.success('已创建')
    }
    editorVisible.value = false
    await loadMagazines()
  } catch (error) {
    if (isConflictError(error)) {
      ElMessage.warning('数据已被他人更新，请刷新后重试')
      await loadMagazines()
      return
    }
    ElMessage.error('操作失败')
  }
}

async function toggleStatus(mag: Magazine) {
  if (mag.version === undefined) {
    ElMessage.warning('当前数据缺少版本号，请先刷新列表')
    return
  }
  try {
    await updateMagazine(mag.id, { status: mag.status === 'active' ? 'inactive' : 'active', version: mag.version })
    ElMessage.success('状态已更新')
    await loadMagazines()
  } catch (error) {
    if (isConflictError(error)) {
      ElMessage.warning('数据已被他人更新，请刷新后重试')
      await loadMagazines()
      return
    }
    ElMessage.error('状态更新失败')
  }
}

function deleteMagazineHandle(mag: Magazine) {
  ElMessageBox.confirm('确认删除该杂志？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    if (mag.version === undefined) {
      ElMessage.warning('当前数据缺少版本号，请先刷新列表')
      return
    }
    try {
      await deleteMagazine(mag.id, mag.version)
      ElMessage.success('已删除')
      await loadMagazines()
    } catch (error) {
      if (isConflictError(error)) {
        ElMessage.warning('数据已被他人更新，请刷新后重试')
        await loadMagazines()
        return
      }
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

async function loadMagazines() {
  const res = await getMagazines()
  magazines.value = res.data
}

onMounted(() => {
  void loadMagazines()
})
</script>

<style scoped lang="scss">
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.item-card {
  overflow: hidden;
}

.cover {
  width: 100%;
  height: 180px;
}

.body {
  padding: 12px;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.sub,
.meta {
  color: #6b7280;
  font-size: 13px;
  margin: 4px 0;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
</style>
