<template>
  <div class="feedback-page">
    <div class="page-header">
      <h1 class="page-title">反馈管理</h1>
    </div>
    
    <el-tabs v-model="activeTab">
      <!-- 评价管理 -->
      <el-tab-pane label="用户评价" name="evaluations">
        <div class="card">
          <el-table :data="evaluations" style="width: 100%">
            <el-table-column label="用户" width="160">
              <template #default="{ row }">
                {{ row.anonymous ? '匿名用户' : row.customerName }}
              </template>
            </el-table-column>
            
            <el-table-column label="评分" width="160">
              <template #default="{ row }">
                <el-rate v-model="row.score" disabled />
              </template>
            </el-table-column>
            
            <el-table-column prop="content" label="评价内容" min-width="200">
              <template #default="{ row }">
                {{ row.content || '-' }}
              </template>
            </el-table-column>
            
            <el-table-column label="提交时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      
      <!-- 投诉管理 -->
      <el-tab-pane label="投诉建议" name="complaints">
        <div class="card">
          <el-table :data="complaints" style="width: 100%">
            <el-table-column label="联系人" width="120">
              <template #default="{ row }">
                {{ row.contactName || '-' }}
              </template>
            </el-table-column>
            
            <el-table-column prop="phone" label="电话" width="130" />
            
            <el-table-column prop="content" label="投诉内容" min-width="200" />
            
            <el-table-column label="类型" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ getComplaintType(row.complaintType) }}</el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getComplaintStatusType(row.status)" size="small">
                  {{ getComplaintStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="提交时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'pending'"
                  type="primary"
                  link
                  @click="processComplaint(row)"
                >处理</el-button>
                <el-button
                  v-if="row.status === 'processing'"
                  type="success"
                  link
                  @click="resolveComplaint(row)"
                >解决</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getEvaluations, getComplaints, updateComplaintStatus } from '@/api/modules/feedback'
import type { Evaluation, Complaint } from '@/types'
import dayjs from 'dayjs'

const activeTab = ref('evaluations')
const evaluations = ref<Evaluation[]>([])
const complaints = ref<Complaint[]>([])

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function getComplaintType(type: string) {
  const map: Record<string, string> = {
    SERVICE_QUALITY: '服务质量',
    FACILITY_ENVIRONMENT: '设施环境',
    CATERING_SUGGESTION: '餐饮建议',
    OTHER: '其他'
  }
  return map[type] || type
}

function getComplaintStatusType(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    resolved: 'success'
  }
  return map[status] || 'info'
}

function getComplaintStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决'
  }
  return map[status] || status
}

async function loadData() {
  try {
    const [evalRes, compRes] = await Promise.all([
      getEvaluations({ page: 1, pageSize: 50 }),
      getComplaints({ page: 1, pageSize: 50 })
    ])
    evaluations.value = evalRes.data.list
    complaints.value = compRes.data.list
  } catch (e) {
    console.error('Failed to load feedback data', e)
  }
}

function processComplaint(complaint: Complaint) {
  ElMessageBox.confirm('确定开始处理该投诉？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await updateComplaintStatus(complaint.id, 'processing')
      complaint.status = 'processing'
      ElMessage.success('已开始处理')
    } catch (e) {
      ElMessage.error('处理失败')
    }
  }).catch(() => {})
}

function resolveComplaint(complaint: Complaint) {
  ElMessageBox.confirm('确定该投诉已解决？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await updateComplaintStatus(complaint.id, 'resolved')
      complaint.status = 'resolved'
      ElMessage.success('投诉已解决')
    } catch (e) {
      ElMessage.error('处理失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.feedback-page {
  .card {
    margin-top: 16px;
  }
}
</style>
