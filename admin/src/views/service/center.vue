<template>
  <div class="center-page">
    <div class="page-header">
      <h1 class="page-title">中心配置管理</h1>
    </div>

    <div class="card section">
      <h3>首页配置</h3>
      <el-form :model="homeForm" label-width="100px">
        <el-form-item label="主图">
          <el-input v-model="homeForm.heroImage">
            <template #append>
              <el-upload
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleHomeHeroChange"
                accept="image/*"
              >
                <el-button type="primary" class="upload-btn">从本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="主标题"><el-input v-model="homeForm.brandTitle" /></el-form-item>
        <el-form-item label="副标题"><el-input v-model="homeForm.brandSubtitle" /></el-form-item>
      </el-form>
      <el-button type="primary" style="margin-top: 10px" @click="saveHomeConfig">保存首页配置</el-button>
    </div>

    <div class="card section">
      <div class="section-head">
        <h3>中心板块</h3>
        <el-button type="primary" @click="openSectionEditor()">新增板块</el-button>
      </div>
      <el-table :data="sections" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="160" />
        <el-table-column prop="desc" label="描述" min-width="220" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="sort" label="排序" width="90" />
        <el-table-column label="操作" width="130">
          <template #default="{ row }">
            <el-button type="primary" link @click="openSectionEditor(row)">编辑</el-button>
            <el-button type="danger" link @click="removeSection(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="sectionDialog" :title="sectionEditing ? '编辑板块' : '新增板块'" width="680px">
      <el-form :model="sectionForm" label-width="90px">
        <el-form-item label="标题" required><el-input v-model="sectionForm.title" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="sectionForm.desc" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="封面图" required>
          <el-input v-model="sectionForm.coverImage">
            <template #append>
              <el-upload
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleSectionCoverChange"
                accept="image/*"
              >
                <el-button type="primary" class="upload-btn">从本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="详情图">
          <el-input v-model="sectionForm.detailImage">
            <template #append>
              <el-upload
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleSectionDetailChange"
                accept="image/*"
              >
                <el-button type="primary" class="upload-btn">从本地上传</el-button>
              </el-upload>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态"><el-select v-model="sectionForm.status" style="width: 160px"><el-option label="active" value="active" /><el-option label="inactive" value="inactive" /></el-select></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="sectionForm.sort" :min="1" style="width: 160px" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sectionDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!canSaveSection" @click="saveSection">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { isConflictError } from '@/api/request'
import { uploadFile } from '@/api/modules/admin-console'
import {
  createCenterSection,
  deleteCenterSection,
  getCenterHomeConfig,
  getCenterSections,
  updateCenterHomeConfig,
  updateCenterSection,
  type CenterSection,
  type CenterHomeConfig
} from '@/api/modules/center'

const homeForm = reactive<CenterHomeConfig>({
  heroImage: '',
  brandTitle: '',
  brandSubtitle: '',
  facilities: []
})

const sections = ref<CenterSection[]>([])

const sectionDialog = ref(false)
const sectionEditing = ref<CenterSection | null>(null)
const sectionForm = reactive({
  title: '',
  desc: '',
  coverImage: '',
  detailImage: '',
  status: 'active' as 'active' | 'inactive',
  sort: 1
})

const canSaveSection = computed(() => Boolean(sectionForm.title.trim()) && Boolean(sectionForm.coverImage.trim()))

async function handleHomeFileUpload(file: any, key: 'heroImage') {
  const raw = file?.raw as File | undefined
  if (!raw) return
  const res = await uploadFile(raw, 'center_hero')
  homeForm[key] = res.data.url
}

async function handleSectionFileUpload(file: any, key: 'coverImage' | 'detailImage') {
  const raw = file?.raw as File | undefined
  if (!raw) return
  const bizType = key === 'coverImage' ? 'center_section_cover' : 'center_section_detail'
  const res = await uploadFile(raw, bizType)
  sectionForm[key] = res.data.url
}

const handleHomeHeroChange = (file: any) => void handleHomeFileUpload(file, 'heroImage')
const handleSectionCoverChange = (file: any) => void handleSectionFileUpload(file, 'coverImage')
const handleSectionDetailChange = (file: any) => void handleSectionFileUpload(file, 'detailImage')

async function reloadAll() {
  const [homeRes, sectionsRes] = await Promise.all([getCenterHomeConfig(), getCenterSections()])
  Object.assign(homeForm, homeRes.data)
  sections.value = sectionsRes.data
}


async function saveHomeConfig() {
  try {
    await updateCenterHomeConfig(homeForm)
    ElMessage.success('首页配置已保存')
  } catch (error) {
    if (isConflictError(error)) {
      ElMessage.warning('数据已被他人更新，请刷新后重试')
      await reloadAll()
      return
    }
    ElMessage.error('首页配置保存失败')
  }
}

function openSectionEditor(section?: CenterSection) {
  sectionEditing.value = section || null
  if (section) {
    Object.assign(sectionForm, {
      title: section.title,
      desc: section.desc || '',
      coverImage: section.coverImage,
      detailImage: section.detailImage || '',
      status: section.status,
      sort: section.sort
    })
  } else {
    Object.assign(sectionForm, {
      title: '',
      desc: '',
      coverImage: '',
      detailImage: '',
      status: 'active',
      sort: sections.value.length + 1
    })
  }
  sectionDialog.value = true
}

async function saveSection() {
  if (!canSaveSection.value) {
    ElMessage.warning('请先填写必填项：标题、封面图')
    return
  }
  const payload = {
    title: sectionForm.title,
    desc: sectionForm.desc,
    coverImage: sectionForm.coverImage,
    detailImage: sectionForm.detailImage,
    status: sectionForm.status,
    sort: sectionForm.sort,
    version: sectionEditing.value?.version
  }

  try {
    if (sectionEditing.value) {
      await updateCenterSection(sectionEditing.value.id, payload)
    } else {
      await createCenterSection(payload)
    }
    sectionDialog.value = false
    await reloadAll()
    ElMessage.success('板块已保存')
  } catch (error) {
    if (isConflictError(error)) {
      ElMessage.warning('数据已被他人更新，请刷新后重试')
      await reloadAll()
      return
    }
    ElMessage.error('板块保存失败')
  }
}

function removeSection(section: CenterSection) {
  ElMessageBox.confirm('确认删除该板块？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    if (section.version === undefined) {
      ElMessage.warning('当前数据缺少版本号，请先刷新列表')
      return
    }
    try {
      await deleteCenterSection(section.id, section.version)
      await reloadAll()
      ElMessage.success('板块已删除')
    } catch (error) {
      if (isConflictError(error)) {
        ElMessage.warning('数据已被他人更新，请刷新后重试')
        await reloadAll()
        return
      }
      ElMessage.error('板块删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  void reloadAll()
})
</script>

<style scoped lang="scss">
.section {
  padding: 14px;
  margin-bottom: 16px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.upload-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  &:active {
    transform: scale(0.92);
    filter: brightness(0.9);
  }
}
</style>
