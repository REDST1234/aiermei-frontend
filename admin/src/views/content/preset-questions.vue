<template>
  <div class="preset-questions-page">
    <div class="page-header">
      <h1 class="page-title">预设问题管理</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 新增问题
      </el-button>
    </div>

    <div class="card list-card" v-loading="loading">
      <el-table :data="questions" style="width: 100%" border stripe>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="问题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="answer" label="回答" min-width="300" show-overflow-tooltip />
        <el-table-column prop="sortNo" label="排序" width="80" align="center" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑问题' : '新增问题'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="form" label-width="80px" ref="formRef" :rules="rules">
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="产后恢复" value="postpartum" />
            <el-option label="育儿知识" value="parenting" />
            <el-option label="月子中心" value="center" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题" prop="question">
          <el-input v-model="form.question" type="textarea" :rows="2" placeholder="输入问题" />
        </el-form-item>
        <el-form-item label="回答" prop="answer">
          <el-input v-model="form.answer" type="textarea" :rows="4" placeholder="输入标准回答" />
        </el-form-item>
        <el-form-item label="排序" prop="sortNo">
          <el-input-number v-model="form.sortNo" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getPresetQuestions, 
  createPresetQuestion, 
  updatePresetQuestion, 
  deletePresetQuestion 
} from '@/api/modules/content'
import type { PresetQuestion } from '@/types'

const loading = ref(false)
const questions = ref<PresetQuestion[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = reactive<PresetQuestion>({
  question: '',
  answer: '',
  category: 'postpartum',
  sortNo: 10
})

const rules = {
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入回答', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await getPresetQuestions()
    questions.value = res.data
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  Object.assign(form, {
    question: '',
    answer: '',
    category: 'postpartum',
    sortNo: 10
  })
  delete form.id
  delete form.questionId
  dialogVisible.value = true
}

function handleEdit(row: PresetQuestion) {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

async function submitForm() {
  await formRef.value.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      const id = form.id || form.questionId
      if (!id) throw new Error('ID missing')
      await updatePresetQuestion(id, form)
      ElMessage.success('更新成功')
    } else {
      await createPresetQuestion(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    void loadData()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: PresetQuestion) {
  const id = row.id || row.questionId
  if (!id) return
  try {
    await ElMessageBox.confirm('确定要删除这个问题吗？', '提示', { type: 'warning' })
    await deletePresetQuestion(id)
    ElMessage.success('删除成功')
    void loadData()
  } catch (e) {
    // cancelled
  }
}

function getCategoryType(category: string) {
  const map: Record<string, string> = {
    postpartum: 'success',
    parenting: 'primary',
    center: 'warning',
    other: 'info'
  }
  return map[category] || 'info'
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.preset-questions-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.list-card {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
}
</style>
