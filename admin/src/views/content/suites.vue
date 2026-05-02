<template>
  <div class="suites-page">
    <div class="page-header">
      <h1 class="page-title">套餐管理</h1>
      <el-button type="primary" @click="showEditor()">新增套餐</el-button>
    </div>

    <div class="grid">
      <div v-for="suite in suites" :key="suite.id" class="card suite-card">
        <el-image :src="suite.coverImage" fit="cover" class="cover" />
        <div class="body">
          <div class="name">{{ suite.name }}</div>
          <div class="price">{{ suite.priceLabel }}</div>
          <div class="meta">{{ suite.size || '-' }}</div>
          <div class="tags">
            <el-tag v-for="feature in suite.features.slice(0, 3)" :key="feature" size="small" type="info">{{ feature }}</el-tag>
          </div>
          <el-tag :type="suite.status === 'active' ? 'success' : 'info'" size="small">{{ suite.status === 'active' ? '启用' : '停用' }}</el-tag>
          <div class="actions">
            <el-button type="primary" link @click="showEditor(suite)">编辑</el-button>
            <el-button :type="suite.status === 'active' ? 'warning' : 'success'" link @click="toggleStatus(suite)">
              {{ suite.status === 'active' ? '停用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="deleteSuiteHandle(suite)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="editorVisible" :title="editingSuite ? '编辑套餐' : '新增套餐'" width="720px" destroy-on-close top="5vh">
      <div class="editor-content">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基础信息" name="basic">
            <el-form :model="suiteForm" label-width="90px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="名称" required><el-input v-model="suiteForm.name" placeholder="请输入套餐名称" /></el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="面积"><el-input v-model="suiteForm.size" placeholder="如：60㎡" /></el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="价格(分)"><el-input-number v-model="suiteForm.price" :min="0" style="width:100%" /></el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="排序"><el-input-number v-model="suiteForm.sort" :min="1" style="width:100%" /></el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="特色">
                <el-select v-model="suiteForm.features" multiple allow-create filterable placeholder="请选择或输入特色标签" style="width:100%" />
              </el-form-item>
              <el-form-item label="设施">
                <el-select v-model="suiteForm.facilities" multiple allow-create filterable placeholder="请选择或输入设施标签" style="width:100%" />
              </el-form-item>
              <el-form-item label="简述">
                <el-input v-model="suiteForm.description" type="textarea" :rows="4" placeholder="请输入套餐简要描述" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="媒体配置" name="media">
            <el-form :model="suiteForm" label-width="90px">
              <el-form-item label="封面图" required>
                <ImageUpload v-model="suiteForm.coverImage" biz-type="suite_cover" />
                <div class="item-tip">展示在列表的主图，建议 750x420</div>
              </el-form-item>
              <el-form-item label="相册图集">
                <div class="album-container">
                  <div class="image-list">
                    <div v-for="(img, idx) in suiteForm.images" :key="idx" class="image-item">
                      <el-image :src="img" fit="cover" />
                      <div class="image-actions" @click="suiteForm.images.splice(idx, 1)">
                        <el-icon><Delete /></el-icon>
                      </div>
                    </div>
                    <div class="upload-trigger">
                      <ImageUpload v-model="tempImage" biz-type="suite_images" compact @update:modelValue="addSuiteImage" />
                    </div>
                  </div>
                  <div class="item-tip">展示在详情页轮播，建议 750x750，可上传多张</div>
                </div>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="editorVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!canSaveSuite" @click="saveSuite">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { createSuite, deleteSuite, getSuites, updateSuite } from '@/api/modules/media'
import ImageUpload from '@/components/ImageUpload.vue'
import type { Suite } from '@/types'

const suites = ref<Suite[]>([])
const editorVisible = ref(false)
const activeTab = ref('basic')
const editingSuite = ref<Suite | null>(null)

const tempImage = ref('')

function addSuiteImage(url: string) {
  if (url) {
    suiteForm.images.push(url)
    tempImage.value = ''
  }
}

const suiteForm = reactive({
  name: '',
  price: 0,
  size: '',
  coverImage: '',
  images: [] as string[],
  features: [] as string[],
  facilities: [] as string[],
  description: '',
  sort: 1
})

const canSaveSuite = computed(() => Boolean(suiteForm.name.trim()) && Boolean(suiteForm.coverImage.trim()))

function showEditor(suite?: Suite) {
  activeTab.value = 'basic'
  editingSuite.value = suite || null
  if (suite) {
    Object.assign(suiteForm, {
      name: suite.name,
      price: suite.price,
      size: suite.size,
      coverImage: suite.coverImage,
      images: suite.images ? [...suite.images] : [],
      features: [...suite.features],
      facilities: suite.facilities ? [...suite.facilities] : [],
      description: suite.description || '',
      sort: suite.sort
    })
  } else {
    Object.assign(suiteForm, {
      name: '',
      price: 0,
      size: '',
      coverImage: '',
      features: [],
      facilities: [],
      description: '',
      sort: suites.value.length + 1
    })
  }
  editorVisible.value = true
}

async function saveSuite() {
  if (!canSaveSuite.value) {
    ElMessage.warning('请先填写必填项：名称、封面')
    return
  }
  const payload: Partial<Suite> = {
    name: suiteForm.name,
    price: suiteForm.price,
    size: suiteForm.size,
    coverImage: suiteForm.coverImage,
    images: suiteForm.images,
    features: suiteForm.features,
    facilities: suiteForm.facilities,
    description: suiteForm.description,
    sort: suiteForm.sort
  }

  try {
    if (editingSuite.value) {
      await updateSuite(editingSuite.value.id, payload)
      ElMessage.success('套餐已更新')
    } else {
      await createSuite({ ...payload, status: 'active' })
      ElMessage.success('套餐已创建')
    }
    editorVisible.value = false
    await loadSuites()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function toggleStatus(suite: Suite) {
  try {
    await updateSuite(suite.id, { status: suite.status === 'active' ? 'inactive' : 'active' })
    ElMessage.success('状态已更新')
    await loadSuites()
  } catch {
    ElMessage.error('状态更新失败')
  }
}

function deleteSuiteHandle(suite: Suite) {
  ElMessageBox.confirm('确认删除该套餐？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteSuite(suite.id)
      ElMessage.success('套餐已删除')
      await loadSuites()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

async function loadSuites() {
  const res = await getSuites()
  suites.value = res.data
}

onMounted(() => {
  void loadSuites()
})
</script>

<style scoped lang="scss">
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.suite-card {
  overflow: hidden;
}

.cover {
  width: 100%;
  height: 180px;
}

.body {
  padding: 12px;
}

.name {
  font-size: 16px;
  font-weight: 600;
}

.price {
  font-size: 18px;
  font-weight: 600;
  margin: 4px 0;
}

.meta {
  color: #6b7280;
  font-size: 13px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.editor-content {
  max-height: 55vh;
  overflow-y: auto;
  padding: 0 12px;
}

.item-tip {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.album-container {
  width: 100%;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;

  .el-image {
    width: 100%;
    height: 100%;
  }

  .image-actions {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    color: #fff;
    font-size: 18px;
    cursor: pointer;
  }

  &:hover .image-actions {
    opacity: 1;
  }
}

.upload-trigger {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 8px;
}
</style>
