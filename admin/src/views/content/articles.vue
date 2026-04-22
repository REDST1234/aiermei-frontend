<template>
  <div class="articles-page">
    <div class="page-header">
      <h1 class="page-title">文章管理</h1>
      <el-button type="primary" @click="showEditor()">
        <el-icon><Plus /></el-icon>
        新建文章
      </el-button>
    </div>
    
    <!-- 搜索栏 -->
    <div class="card search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="全部" clearable style="width: 120px">
            <el-option label="孕期" value="pregnancy" />
            <el-option label="月子" value="postpartum" />
            <el-option label="育儿" value="parenting" />
            <el-option label="月嫂" value="nanny" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="文章标题"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 文章列表 -->
    <div class="card">
      <el-table :data="articles" v-loading="loading" style="width: 100%">
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.cover"
              fit="cover"
              style="width: 80px; height: 60px; border-radius: 4px;"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="标题" min-width="200">
          <template #default="{ row }">
            <div class="article-title">
              {{ row.title }}
              <el-tag v-if="row.type === 'video'" size="small" type="info">视频</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="categoryLabel" label="分类" width="80" />
        
        <el-table-column prop="author" label="作者" width="100" />
        
        <el-table-column label="数据" width="140">
          <template #default="{ row }">
            <div class="data-cell">
              <span>浏览 {{ row.views }}</span>
              <span>点赞 {{ row.likes }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="发布时间" width="160">
          <template #default="{ row }">
            {{ row.publishedAt ? formatDate(row.publishedAt) : '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showEditor(row)">编辑</el-button>
            <el-button
              v-if="row.status === 'draft'"
              type="success"
              link
              @click="publishArticle(row)"
            >发布</el-button>
            <el-button
              v-if="row.status === 'published'"
              type="warning"
              link
              @click="archiveArticle(row)"
            >归档</el-button>
            <el-button type="danger" link @click="deleteArticleHandle(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadArticles"
        @current-change="loadArticles"
      />
    </div>
    
    <!-- 编辑器弹窗 -->
    <el-dialog
      v-model="editorVisible"
      :title="editingArticle ? '编辑文章' : '新建文章'"
      width="800px"
      destroy-on-close
    >
      <el-form :model="articleForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="articleForm.title" placeholder="请输入文章标题" />
        </el-form-item>
        
        <el-form-item label="分类" required>
          <el-select v-model="articleForm.category" placeholder="请选择分类" style="width: 200px">
            <el-option label="孕期" value="pregnancy" />
            <el-option label="月子" value="postpartum" />
            <el-option label="育儿" value="parenting" />
            <el-option label="月嫂" value="nanny" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="类型">
          <el-radio-group v-model="articleForm.type">
            <el-radio value="image">图文</el-radio>
            <el-radio value="video">视频</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="封面">
          <ImageUpload v-model="articleForm.cover" />
        </el-form-item>
        
        <el-form-item label="视频链接" v-if="articleForm.type === 'video'">
          <el-input v-model="articleForm.mediaUrl" placeholder="视频URL" />
        </el-form-item>
        
        <el-form-item label="作者">
          <el-input v-model="articleForm.author" placeholder="作者名称" />
        </el-form-item>
        
        <el-form-item label="正文">
          <el-input
            v-model="articleForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入文章正文（支持HTML）"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editorVisible = false">取消</el-button>
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" @click="saveAndPublish">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getArticles, createArticle, updateArticle, deleteArticle, publishArticle as apiPublishArticle, archiveArticle as apiArchiveArticle } from '@/api/modules/content'
import ImageUpload from '@/components/ImageUpload.vue'
import type { Article } from '@/types'
import dayjs from 'dayjs'

const loading = ref(false)
const articles = ref<Article[]>([])
const editorVisible = ref(false)
const editingArticle = ref<Article | null>(null)

const searchForm = reactive({
  category: '',
  status: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const articleForm = reactive({
  title: '',
  category: 'postpartum',
  type: 'image' as 'image' | 'video',
  cover: '',
  mediaUrl: '',
  author: '',
  content: ''
})

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    published: 'success',
    draft: 'warning',
    archived: 'info'
  }
  return map[status] || 'info'
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档'
  }
  return map[status] || status
}

function handleSearch() {
  pagination.page = 1
  loadArticles()
}

function handleReset() {
  searchForm.category = ''
  searchForm.status = ''
  searchForm.keyword = ''
  pagination.page = 1
  loadArticles()
}

async function loadArticles() {
  loading.value = true
  try {
    const res = await getArticles({
      page: pagination.page,
      pageSize: pagination.pageSize,
      category: searchForm.category || undefined,
      status: searchForm.status || undefined,
      keyword: searchForm.keyword || undefined
    })
    articles.value = res.data.list
    pagination.total = res.data.total
  } catch (e) {
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

function showEditor(article?: Article) {
  editingArticle.value = article || null
  
  if (article) {
    Object.assign(articleForm, {
      title: article.title,
      category: article.category,
      type: article.type,
      cover: article.cover || '',
      mediaUrl: article.mediaUrl || '',
      author: article.author || '',
      content: article.content || ''
    })
  } else {
    Object.assign(articleForm, {
      title: '',
      category: 'postpartum',
      type: 'image',
      cover: '',
      mediaUrl: '',
      author: '',
      content: ''
    })
  }
  
  editorVisible.value = true
}

async function saveDraft() {
  const payload: Partial<Article> = { ...articleForm, status: 'draft' }
  try {
    if (editingArticle.value) {
      await updateArticle(editingArticle.value.id, payload)
    } else {
      await createArticle(payload)
    }
    ElMessage.success('草稿已保存')
    editorVisible.value = false
    loadArticles()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

async function saveAndPublish() {
  const payload: Partial<Article> = { ...articleForm, status: 'published' }
  try {
    if (editingArticle.value) {
      await updateArticle(editingArticle.value.id, payload)
    } else {
      await createArticle(payload)
    }
    ElMessage.success('文章已发布')
    editorVisible.value = false
    loadArticles()
  } catch (e) {
    ElMessage.error('发布失败')
  }
}

async function publishArticle(article: Article) {
  try {
    await apiPublishArticle(article.id)
    ElMessage.success('文章已发布')
    loadArticles()
  } catch (e) {
    ElMessage.error('发布失败')
  }
}

async function archiveArticle(article: Article) {
  try {
    await apiArchiveArticle(article.id)
    ElMessage.success('文章已归档')
    loadArticles()
  } catch (e) {
    ElMessage.error('归档失败')
  }
}

function deleteArticleHandle(article: Article) {
  ElMessageBox.confirm('确定删除该文章？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteArticle(article.id)
      ElMessage.success('文章已删除')
      loadArticles()
    } catch (e) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadArticles()
})
</script>

<style scoped lang="scss">
.articles-page {
  .search-bar {
    margin-bottom: 20px;
    padding: 16px 20px;
  }
  
  .article-title {
    font-size: 14px;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .data-cell {
    font-size: 12px;
    color: #6b7280;
    
    span {
      display: block;
    }
  }
}
</style>
