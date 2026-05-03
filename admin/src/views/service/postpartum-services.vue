<template>
  <div class="postpartum-services-page">
    <div class="page-header">
      <h1 class="page-title">产后服务管理</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 新增服务预约
      </el-button>
    </div>

    <div class="card list-card" v-loading="loading">
      <el-table :data="services" style="width: 100%" border stripe>
        <el-table-column prop="appointmentTime" label="预约时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.appointmentTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="serviceName" label="服务项目" min-width="150" />
        <el-table-column prop="expertName" label="专家/护理师" width="120" />
        <el-table-column prop="durationMinutes" label="时长(分钟)" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uid" label="客户ID" width="120" show-overflow-tooltip />
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
      :title="isEdit ? '编辑服务' : '新增服务预约'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="form" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="客户UID" prop="uid">
          <el-input v-model="form.uid" placeholder="输入客户UID" />
        </el-form-item>
        <el-form-item label="服务项目" prop="serviceName">
          <el-input v-model="form.serviceName" placeholder="如：盆底修复评估" />
        </el-form-item>
        <el-form-item label="专家名称" prop="expertName">
          <el-input v-model="form.expertName" placeholder="输入专家或护理师姓名" />
        </el-form-item>
        <el-form-item label="预约时间" prop="appointmentTime">
          <el-date-picker
            v-model="form.appointmentTime"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
          />
        </el-form-item>
        <el-form-item label="服务时长" prop="durationMinutes">
          <el-input-number v-model="form.durationMinutes" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="待服务" value="scheduled" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
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
import dayjs from 'dayjs'
import { 
  getPostpartumServices, 
  createPostpartumService, 
  updatePostpartumService, 
  deletePostpartumService 
} from '@/api/modules/postpartum'
import type { PostpartumService } from '@/types'

const loading = ref(false)
const services = ref<PostpartumService[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = reactive<PostpartumService>({
  uid: '',
  serviceName: '',
  expertName: '',
  appointmentTime: '',
  durationMinutes: 45,
  status: 'scheduled'
})

const rules = {
  uid: [{ required: true, message: '请输入客户UID', trigger: 'blur' }],
  serviceName: [{ required: true, message: '请输入服务项目', trigger: 'blur' }],
  expertName: [{ required: true, message: '请输入专家名称', trigger: 'blur' }],
  appointmentTime: [{ required: true, message: '请选择预约时间', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await getPostpartumServices()
    services.value = res.data
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  Object.assign(form, {
    uid: '',
    serviceName: '',
    expertName: '',
    appointmentTime: '',
    durationMinutes: 45,
    status: 'scheduled'
  })
  delete form.id
  delete form.serviceId
  dialogVisible.value = true
}

function handleEdit(row: PostpartumService) {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

async function submitForm() {
  await formRef.value.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      const id = form.id || form.serviceId
      if (!id) throw new Error('ID missing')
      await updatePostpartumService(id, form)
      ElMessage.success('更新成功')
    } else {
      await createPostpartumService(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    void loadData()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: PostpartumService) {
  const id = row.id || row.serviceId
  if (!id) return
  try {
    await ElMessageBox.confirm('确定要删除这个预约记录吗？', '提示', { type: 'warning' })
    await deletePostpartumService(id)
    ElMessage.success('删除成功')
    void loadData()
  } catch (e) {
    // cancelled
  }
}

function formatDate(date: string) {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function getStatusType(status: string) {
  const map: Record<string, string> = {
    scheduled: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    scheduled: '待服务',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.postpartum-services-page {
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
