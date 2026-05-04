<template>
  <div class="articles-page">
    <div class="page-header">
      <h1 class="page-title">文章管理</h1>
      <el-button type="primary" @click="showEditor()">新增文章</el-button>
    </div>

    <div class="card search-bar">
      <el-form :inline="true">
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" clearable style="width: 140px">
            <el-option label="孕期" value="pregnancy" />
            <el-option label="产后" value="postpartum" />
            <el-option label="育儿" value="parenting" />
            <el-option label="月嫂" value="nanny" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable style="width: 140px">
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="标题" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card">
      <el-table :data="articles" v-loading="loading" style="width: 100%">
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image :src="row.cover" fit="cover" style="width: 80px; height: 60px; border-radius: 4px" />
          </template>
        </el-table-column>
        <el-table-column label="标题" min-width="220">
          <template #default="{ row }">
            <span>{{ row.title }}</span>
            <el-tag v-if="row.type === 'video'" size="small" type="info" class="ml8">视频</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="categoryLabel" label="分类" width="100" />
        <el-table-column prop="author" label="作者" width="100" />
        <el-table-column label="数据" width="120">
          <template #default="{ row }">{{ row.views }} / {{ row.likes }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="170">
          <template #default="{ row }">{{ row.publishedAt ? formatDate(row.publishedAt) : '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showEditor(row)">编辑</el-button>
            <el-button v-if="row.status === 'draft'" type="success" link @click="publishArticleHandle(row)">发布</el-button>
            <el-button v-if="row.status === 'published'" type="warning" link @click="archiveArticleHandle(row)">归档</el-button>
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

    <el-dialog v-model="editorVisible" :title="editingArticle ? '编辑文章' : '新增文章'" width="860px" destroy-on-close>
      <div class="editor-dialog-body">
        <el-form :model="articleForm" label-width="90px">
        <el-form-item label="标题" required><el-input v-model="articleForm.title" /></el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="articleForm.category" style="width: 200px">
            <el-option label="孕期" value="pregnancy" />
            <el-option label="产后" value="postpartum" />
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
        <el-form-item label="封面"><ImageUpload v-model="articleForm.cover" biz-type="article_cover" /></el-form-item>
        <el-form-item v-if="articleForm.type === 'video'" label="视频"><VideoUpload v-model="articleForm.mediaUrl" biz-type="article_media" /></el-form-item>
        <el-form-item label="作者"><el-input v-model="articleForm.author" /></el-form-item>

        <el-form-item label="内容" required><el-input v-model="articleForm.content" type="textarea" :rows="10" /></el-form-item>
        <el-divider />
        <el-form-item label="AI标签" required>
          <div class="ai-tag-panel">
            <div class="tag-toolbar">
              <el-button
                type="primary"
                @click="extractTagsHandle"
                :loading="extractingTags"
                :disabled="!canExtractTags"
              >
                AI 提取标签
              </el-button>
              <span v-if="!editingArticle?.id" class="hint-text">新建文章会先自动保存草稿后再提取标签</span>
              <span v-if="!canExtractTags" class="hint-text">请先填写标题和正文内容</span>
            </div>
            <div v-loading="loadingTags" class="tag-list-wrap">
              <el-tag
                v-for="tag in articleTags"
                :key="`${tag.tagCode}-${tag.source}`"
                class="tag-item"
                closable
                @close="removeTag(tag)"
              >
                {{ tag.tagName }} ({{ tag.source }})
              </el-tag>
              <span v-if="!loadingTags && articleTags.length === 0" class="hint-text">暂无标签</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="手动添加">
          <div class="manual-tag-row">
            <el-input
              v-model="newTagText"
              placeholder="输入一个标签文本（提交时 tagCode/tagName 同值，tagType=TOPIC）"
              @keyup.enter="addTagHandle"
            />
            <el-button type="primary" :loading="addingTag" :disabled="!canAddTag" @click="addTagHandle">
              添加标签
            </el-button>
          </div>
        </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="editorVisible = false">取消</el-button>
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" :disabled="!canPublishArticle" @click="saveAndPublish">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { isConflictError } from '@/api/request'
import {
  addArticleTag,
  archiveArticle as apiArchiveArticle,
  createArticle,
  deleteArticle,
  deleteArticleTag,
  extractArticleTags,
  getArticleTags,
  getArticles,
  publishArticle as apiPublishArticle,
  updateArticle
} from '@/api/modules/content'
import ImageUpload from '@/components/ImageUpload.vue'
import VideoUpload from '@/components/VideoUpload.vue'
import type { Article, ArticleTag } from '@/types'
import dayjs from 'dayjs'

const loading = ref(false)
const articles = ref<Article[]>([])
const editorVisible = ref(false)
const editingArticle = ref<Article | null>(null)

const searchForm = reactive({ category: '', status: '', keyword: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const articleForm = reactive({
  title: '',
  category: 'postpartum',
  type: 'image' as 'image' | 'video',
  cover: '',
  mediaUrl: '',
  author: '',
  content: ''
})

const articleTags = ref<ArticleTag[]>([])
const loadingTags = ref(false)
const extractingTags = ref(false)
const addingTag = ref(false)
const newTagText = ref('')
const minPublishTags = 1

const canExtractTags = computed(() => Boolean(articleForm.title.trim()) && Boolean(articleForm.content.trim()))
const canAddTag = computed(() => Boolean(newTagText.value.trim()) && !addingTag.value)
const canPublishArticle = computed(() =>
  Boolean(articleForm.title.trim()) &&
  Boolean(articleForm.category) &&
  Boolean(articleForm.content.trim()) &&
  articleTags.value.length >= minPublishTags
)

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function getStatusType(status: string) {
  const map: Record<string, string> = { published: 'success', draft: 'warning', archived: 'info' }
  return map[status] || 'info'
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = { published: '已发布', draft: '草稿', archived: '已归档' }
  return map[status] || status
}

function handleSearch() {
  pagination.page = 1
  void loadArticles()
}

function handleReset() {
  searchForm.category = ''
  searchForm.status = ''
  searchForm.keyword = ''
  pagination.page = 1
  void loadArticles()
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
  } finally {
    loading.value = false
  }
}

async function loadTags(articleId: string) {
  loadingTags.value = true
  try {
    const res = await getArticleTags(articleId)
    articleTags.value = res.data
  } catch {
    articleTags.value = []
    ElMessage.error('标签加载失败')
  } finally {
    loadingTags.value = false
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
    void loadTags(article.id)
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
    articleTags.value = []
  }
  newTagText.value = ''
  editorVisible.value = true
}

async function saveDraft() {
  await saveArticle('draft')
}

async function saveAndPublish() {
  if (!articleForm.title.trim() || !articleForm.category || !articleForm.content.trim()) {
    ElMessage.warning('请先填写必填项：标题、分类、正文')
    return
  }
  if (articleTags.value.length < minPublishTags) {
    ElMessage.warning(`发布前至少需要 ${minPublishTags} 个标签，请先提取或添加标签`)
    return
  }
  await saveArticle('published')
}

async function saveArticle(status: 'draft' | 'published', closeOnSuccess = true) {
  const payload: Partial<Article> = { ...articleForm, status }
  if (editingArticle.value?.version !== undefined) {
    payload.version = editingArticle.value.version
  }
  try {
    let savedArticle: Article
    if (editingArticle.value) {
      const res = await updateArticle(editingArticle.value.id, payload)
      savedArticle = { ...editingArticle.value, ...res.data }
      editingArticle.value = savedArticle
    } else {
      const res = await createArticle(payload)
      savedArticle = res.data
      editingArticle.value = savedArticle
    }

    if (closeOnSuccess) {
      ElMessage.success('保存成功')
      editorVisible.value = false
    } else {
      ElMessage.success('已先保存草稿，可继续进行标签分析')
      if (savedArticle.id) {
        await loadTags(savedArticle.id)
      }
    }
    await loadArticles()
    return savedArticle
  } catch (error) {
    if (isConflictError(error)) {
      ElMessage.warning('数据已被他人更新，请刷新后重试')
      await loadArticles()
      return null
    }
    ElMessage.error('保存失败')
    return null
  }
}

async function ensureArticleId() {
  if (editingArticle.value?.id) return editingArticle.value.id
  const saved = await saveArticle('draft', false)
  return saved?.id || ''
}

async function extractTagsHandle() {
  const articleId = await ensureArticleId()
  if (!articleId) return

  extractingTags.value = true
  try {
    const res = await extractArticleTags(articleId)
    articleTags.value = res.data
    ElMessage.success('AI 提取完成')
  } catch {
    ElMessage.error('AI 提取失败')
  } finally {
    extractingTags.value = false
  }
}

async function addTagHandle() {
  const text = newTagText.value.trim()
  if (!text) {
    ElMessage.warning('请输入标签文本')
    return
  }
  if (articleTags.value.some((item) => item.tagCode === text || item.tagName === text)) {
    ElMessage.warning('该标签已存在')
    return
  }

  const articleId = await ensureArticleId()
  if (!articleId) return

  addingTag.value = true
  try {
    await addArticleTag(articleId, {
      tagCode: text,
      tagName: text,
      tagType: 'TOPIC'
    })
    await loadTags(articleId)
    newTagText.value = ''
    ElMessage.success('标签已添加')
  } catch {
    ElMessage.error('标签添加失败')
  } finally {
    addingTag.value = false
  }
}

async function removeTag(tag: ArticleTag) {
  const articleId = editingArticle.value?.id
  if (!articleId) return

  ElMessageBox.confirm(`确认删除标签「${tag.tagName}」？`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteArticleTag(articleId, tag.tagCode)
      articleTags.value = articleTags.value.filter((item) => item.tagCode !== tag.tagCode)
      ElMessage.success('标签已删除')
    } catch {
      ElMessage.error('标签删除失败')
    }
  }).catch(() => {})
}

async function publishArticleHandle(article: Article) {
  if (article.version === undefined) {
    ElMessage.warning('当前数据缺少版本号，请先刷新列表')
    return
  }
  try {
    await apiPublishArticle(article.id, article.version)
    ElMessage.success('发布成功')
    await loadArticles()
  } catch (error) {
    if (isConflictError(error)) {
      ElMessage.warning('数据已被他人更新，请刷新后重试')
      await loadArticles()
      return
    }
    ElMessage.error('发布失败')
  }
}

async function archiveArticleHandle(article: Article) {
  if (article.version === undefined) {
    ElMessage.warning('当前数据缺少版本号，请先刷新列表')
    return
  }
  try {
    await apiArchiveArticle(article.id, article.version)
    ElMessage.success('归档成功')
    await loadArticles()
  } catch (error) {
    if (isConflictError(error)) {
      ElMessage.warning('数据已被他人更新，请刷新后重试')
      await loadArticles()
      return
    }
    ElMessage.error('归档失败')
  }
}

function deleteArticleHandle(article: Article) {
  ElMessageBox.confirm('确认删除该文章？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    if (article.version === undefined) {
      ElMessage.warning('当前数据缺少版本号，请先刷新列表')
      return
    }
    try {
      await deleteArticle(article.id, article.version)
      ElMessage.success('删除成功')
      await loadArticles()
    } catch (error) {
      if (isConflictError(error)) {
        ElMessage.warning('数据已被他人更新，请刷新后重试')
        await loadArticles()
        return
      }
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  void loadArticles()
})
</script>

<style scoped lang="scss">
.search-bar {
  padding: 14px 16px;
  margin-bottom: 16px;
}

.editor-dialog-body {
  max-height: min(70vh, 760px);
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.ml8 {
  margin-left: 8px;
}

.tag-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.ai-tag-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tag-list-wrap {
  width: 100%;
  min-height: 40px;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

.manual-tag-row {
  display: flex;
  width: 100%;
  gap: 8px;
}

.hint-text {
  color: #6b7280;
  font-size: 12px;
}
</style>
