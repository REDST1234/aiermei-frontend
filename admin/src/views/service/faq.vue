<template>
  <div class="faq-page">
    <div class="page-header">
      <h1 class="page-title">FAQ 管理</h1>
    </div>

    <div class="layout">
      <div class="card block">
        <div class="block-header">
          <span>分类</span>
          <el-button type="primary" link @click="openCategoryEditor()">新增分类</el-button>
        </div>
        <el-table :data="categories" style="width: 100%">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="sort" label="排序" width="90" />
        <el-table-column label="操作" width="130">
          <template #default="{ row }">
            <el-button type="primary" link @click="openCategoryEditor(row)">编辑</el-button>
            <el-button type="danger" link @click="removeCategory(row)">删除</el-button>
          </template>
        </el-table-column>
        </el-table>
      </div>

      <div class="card block">
        <div class="block-header">
          <span>问题</span>
          <div>
            <el-select v-model="itemQuery.categoryId" clearable placeholder="按分类筛选" style="width: 160px; margin-right: 8px" @change="reloadItems">
              <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
            <el-button type="primary" @click="openItemEditor()">新增问题</el-button>
          </div>
        </div>
        <el-table :data="items" style="width: 100%">
          <el-table-column prop="title" label="标题" min-width="220" />
          <el-table-column label="分类" width="130">
            <template #default="{ row }">{{ categoryMap[row.categoryId] || row.categoryId }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column prop="sort" label="排序" width="90" />
          <el-table-column label="操作" width="130">
            <template #default="{ row }">
              <el-button type="primary" link @click="openItemEditor(row)">编辑</el-button>
              <el-button type="danger" link @click="removeItem(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog v-model="categoryDialog" :title="categoryEditing ? '编辑分类' : '新增分类'" width="420px">
      <el-form :model="categoryForm" label-width="70px">
        <el-form-item label="名称" required><el-input v-model="categoryForm.name" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="categoryForm.sort" :min="1" style="width: 100%" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!canSaveCategory" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="itemDialog" :title="itemEditing ? '编辑问题' : '新增问题'" width="680px">
      <el-form :model="itemForm" label-width="80px">
        <el-form-item label="分类" required><el-select v-model="itemForm.categoryId" style="width: 220px"><el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" /></el-select></el-form-item>
        <el-form-item label="标题" required><el-input v-model="itemForm.title" /></el-form-item>
        <el-form-item label="内容" required><el-input v-model="itemForm.content" type="textarea" :rows="6" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="itemForm.status" style="width: 160px"><el-option label="active" value="active" /><el-option label="inactive" value="inactive" /></el-select></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="itemForm.sort" :min="1" style="width: 160px" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!canSaveItem" @click="saveItem">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { isConflictError } from '@/api/request'
import {
  createFaqCategory,
  createFaqItem,
  deleteFaqCategory,
  deleteFaqItem,
  getFaqCategories,
  getFaqItems,
  updateFaqCategory,
  updateFaqItem,
  type FaqCategory,
  type FaqItem
} from '@/api/modules/faq'

const categories = ref<FaqCategory[]>([])
const items = ref<FaqItem[]>([])
const itemQuery = reactive({ categoryId: '' })

const categoryDialog = ref(false)
const categoryEditing = ref<FaqCategory | null>(null)
const categoryForm = reactive({ name: '', sort: 1 })

const itemDialog = ref(false)
const itemEditing = ref<FaqItem | null>(null)
const itemForm = reactive({ categoryId: '', title: '', content: '', status: 'active' as 'active' | 'inactive', sort: 1 })

const categoryMap = computed(() => Object.fromEntries(categories.value.map((item) => [item.id, item.name])))
const canSaveCategory = computed(() => Boolean(categoryForm.name.trim()))
const canSaveItem = computed(() => Boolean(itemForm.categoryId) && Boolean(itemForm.title.trim()) && Boolean(itemForm.content.trim()))

async function reloadCategories() {
  const res = await getFaqCategories()
  categories.value = res.data
}

async function reloadItems() {
  const res = await getFaqItems({ page: 1, pageSize: 200, categoryId: itemQuery.categoryId || undefined })
  items.value = res.data.list
}

function openCategoryEditor(category?: FaqCategory) {
  categoryEditing.value = category || null
  if (category) {
    categoryForm.name = category.name
    categoryForm.sort = category.sort
  } else {
    categoryForm.name = ''
    categoryForm.sort = categories.value.length + 1
  }
  categoryDialog.value = true
}

async function saveCategory() {
  if (!canSaveCategory.value) {
    ElMessage.warning('请先填写必填项：名称')
    return
  }
  try {
    if (categoryEditing.value) {
      await updateFaqCategory(categoryEditing.value.id, {
        name: categoryForm.name,
        sort: categoryForm.sort,
        version: categoryEditing.value.version
      })
    } else {
      await createFaqCategory({ name: categoryForm.name, sort: categoryForm.sort })
    }
    categoryDialog.value = false
    await reloadCategories()
    ElMessage.success('分类已保存')
  } catch (error) {
    if (isConflictError(error)) {
      ElMessage.warning('数据已被他人更新，请刷新后重试')
      await reloadCategories()
      return
    }
    ElMessage.error('分类保存失败')
  }
}

function removeCategory(category: FaqCategory) {
  ElMessageBox.confirm('确认删除该分类？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    if (category.version === undefined) {
      ElMessage.warning('当前数据缺少版本号，请先刷新列表')
      return
    }
    try {
      await deleteFaqCategory(category.id, category.version)
      await reloadCategories()
      ElMessage.success('分类已删除')
    } catch (error) {
      if (isConflictError(error)) {
        ElMessage.warning('数据已被他人更新，请刷新后重试')
        await reloadCategories()
        return
      }
      ElMessage.error('分类删除失败')
    }
  }).catch(() => {})
}

function openItemEditor(item?: FaqItem) {
  itemEditing.value = item || null
  if (item) {
    itemForm.categoryId = item.categoryId
    itemForm.title = item.title
    itemForm.content = item.content
    itemForm.status = item.status
    itemForm.sort = item.sort
  } else {
    itemForm.categoryId = itemQuery.categoryId || categories.value[0]?.id || ''
    itemForm.title = ''
    itemForm.content = ''
    itemForm.status = 'active'
    itemForm.sort = 1
  }
  itemDialog.value = true
}

async function saveItem() {
  if (!canSaveItem.value) {
    ElMessage.warning('请先填写必填项：分类、标题、内容')
    return
  }
  const payload = {
    categoryId: itemForm.categoryId,
    title: itemForm.title,
    content: itemForm.content,
    status: itemForm.status,
    sort: itemForm.sort
  }

  try {
    if (itemEditing.value) {
      await updateFaqItem(itemEditing.value.id, { ...payload, version: itemEditing.value.version })
    } else {
      await createFaqItem(payload)
    }
    itemDialog.value = false
    await reloadItems()
    ElMessage.success('问题已保存')
  } catch (error) {
    if (isConflictError(error)) {
      ElMessage.warning('数据已被他人更新，请刷新后重试')
      await reloadItems()
      return
    }
    ElMessage.error('问题保存失败')
  }
}

function removeItem(item: FaqItem) {
  ElMessageBox.confirm('确认删除该问题？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    if (item.version === undefined) {
      ElMessage.warning('当前数据缺少版本号，请先刷新列表')
      return
    }
    try {
      await deleteFaqItem(item.id, item.version)
      await reloadItems()
      ElMessage.success('问题已删除')
    } catch (error) {
      if (isConflictError(error)) {
        ElMessage.warning('数据已被他人更新，请刷新后重试')
        await reloadItems()
        return
      }
      ElMessage.error('问题删除失败')
    }
  }).catch(() => {})
}

onMounted(async () => {
  await reloadCategories()
  await reloadItems()
})
</script>

<style scoped lang="scss">
.layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 16px;
}

.block {
  padding: 14px;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

@media (max-width: 1100px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
