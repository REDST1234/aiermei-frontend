<template>
  <div class="banners-page">
    <div class="page-header">
      <h1 class="page-title">海报管理</h1>
      <el-button type="primary" @click="showEditor()">
        <el-icon><Plus /></el-icon>
        新建海报
      </el-button>
    </div>
    
    <!-- 海报列表 -->
    <div class="banner-grid">
      <div v-for="banner in banners" :key="banner.id" class="banner-card card">
        <div class="banner-cover">
          <el-image :src="banner.image" fit="cover" />
          <div class="banner-status">
            <el-tag :type="banner.status === 'active' ? 'success' : 'info'" size="small">
              {{ banner.status === 'active' ? '已上线' : '已下线' }}
            </el-tag>
          </div>
        </div>
        <div class="banner-content">
          <div class="banner-title">{{ banner.title }}</div>
          <div class="banner-btn-text">{{ banner.buttonText }}</div>
          <div class="banner-actions">
            <el-button type="primary" link @click="showEditor(banner)">编辑</el-button>
            <el-button
              :type="banner.status === 'active' ? 'warning' : 'success'"
              link
              @click="toggleStatus(banner)"
            >
              {{ banner.status === 'active' ? '下线' : '上线' }}
            </el-button>
            <el-button type="danger" link @click="deleteBannerHandle(banner)">删除</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 编辑器弹窗 -->
    <el-dialog
      v-model="editorVisible"
      :title="editingBanner ? '编辑海报' : '新建海报'"
      width="600px"
      destroy-on-close
    >
      <el-form :model="bannerForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="bannerForm.title" placeholder="海报标题" />
        </el-form-item>
        
        <el-form-item label="按钮文案">
          <el-input v-model="bannerForm.buttonText" placeholder="按钮文案" />
        </el-form-item>
        
        <el-form-item label="封面图" required>
          <ImageUpload v-model="bannerForm.image" biz-type="banner_image" />
        </el-form-item>
        
        <el-form-item label="详情标题">
          <el-input v-model="bannerForm.detailTitle" placeholder="详情页标题" />
        </el-form-item>
        
        <el-form-item label="详情内容">
          <el-input
            v-model="bannerForm.detailContent"
            type="textarea"
            :rows="4"
            placeholder="详情页内容"
          />
        </el-form-item>
        
        <el-form-item label="排序">
          <el-input-number v-model="bannerForm.sort" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editorVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!canSaveBanner" @click="saveBanner">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { isConflictError } from '@/api/request'
import { getBanners, createBanner, updateBanner, deleteBanner } from '@/api/modules/media'
import ImageUpload from '@/components/ImageUpload.vue'
import type { Banner } from '@/types'

const banners = ref<Banner[]>([])
const editorVisible = ref(false)
const editingBanner = ref<Banner | null>(null)

const bannerForm = reactive({
  title: '',
  buttonText: '',
  image: '',
  detailTitle: '',
  detailContent: '',
  sort: 1
})

const canSaveBanner = computed(() => Boolean(bannerForm.title.trim()) && Boolean(bannerForm.image.trim()))

function showEditor(banner?: Banner) {
  editingBanner.value = banner || null
  
  if (banner) {
    Object.assign(bannerForm, {
      title: banner.title,
      buttonText: banner.buttonText || '',
      image: banner.image,
      detailTitle: banner.detailTitle || '',
      detailContent: banner.detailContent || '',
      sort: banner.sort
    })
  } else {
    Object.assign(bannerForm, {
      title: '',
      buttonText: '',
      image: '',
      detailTitle: '',
      detailContent: '',
      sort: banners.value.length + 1
    })
  }
  
  editorVisible.value = true
}

async function saveBanner() {
  if (!canSaveBanner.value) {
    ElMessage.warning('请先填写必填项：标题、封面图')
    return
  }
  
  const payload = {
    ...bannerForm,
    status: editingBanner.value ? editingBanner.value.status : 'active',
    version: editingBanner.value?.version
  }

  try {
    if (editingBanner.value) {
      await updateBanner(editingBanner.value.id, payload)
      ElMessage.success('海报已更新')
    } else {
      await createBanner(payload)
      ElMessage.success('海报已创建')
    }
    editorVisible.value = false
    await loadBanners()
  } catch (error) {
    if (isConflictError(error)) {
      ElMessage.warning('数据已被他人更新，请刷新后重试')
      await loadBanners()
      return
    }
    console.error(error)
  }
}

async function toggleStatus(banner: Banner) {
  if (banner.version === undefined) {
    ElMessage.warning('当前数据缺少版本号，请先刷新列表')
    return
  }
  const newStatus = banner.status === 'active' ? 'inactive' : 'active'
  try {
    await updateBanner(banner.id, { status: newStatus, version: banner.version })
    ElMessage.success(newStatus === 'active' ? '海报已上线' : '海报已下线')
    await loadBanners()
  } catch (error) {
    if (isConflictError(error)) {
      ElMessage.warning('数据已被他人更新，请刷新后重试')
      await loadBanners()
      return
    }
    console.error(error)
  }
}

function deleteBannerHandle(banner: Banner) {
  ElMessageBox.confirm('确定删除该海报？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    if (banner.version === undefined) {
      ElMessage.warning('当前数据缺少版本号，请先刷新列表')
      return
    }
    try {
      await deleteBanner(banner.id, banner.version)
      ElMessage.success('海报已删除')
      await loadBanners()
    } catch (error) {
      if (isConflictError(error)) {
        ElMessage.warning('数据已被他人更新，请刷新后重试')
        await loadBanners()
        return
      }
      console.error(error)
    }
  }).catch(() => {})
}

async function loadBanners() {
  try {
    const res = await getBanners()
    banners.value = res.data
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  void loadBanners()
})
</script>

<style scoped lang="scss">
.banners-page {
  .banner-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }
  
  .banner-card {
    overflow: hidden;
    
    .banner-cover {
      position: relative;
      height: 180px;
      
      .el-image {
        width: 100%;
        height: 100%;
      }
      
      .banner-status {
        position: absolute;
        top: 12px;
        right: 12px;
      }
    }
    
    .banner-content {
      padding: 16px;
      
      .banner-title {
        font-size: 16px;
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 4px;
      }
      
      .banner-btn-text {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 12px;
      }
      
      .banner-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>
