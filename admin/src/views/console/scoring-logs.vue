<template>
  <div class="console-page scoring-logs-page">
    <div class="page-header"><h1 class="page-title">评分配置 · 操作日志</h1></div>

    <div class="card console-panel" v-loading="loading">
      <div class="toolbar">
        <el-radio-group v-model="logTab" @change="loadLogs">
          <el-radio-button value="history">历史版本</el-radio-button>
          <el-radio-button value="schedules">待生效排期</el-radio-button>
        </el-radio-group>
        <el-button :icon="Refresh" circle @click="loadLogs" />
      </div>

      <el-table :data="logList" style="width: 100%" stripe empty-text="暂无记录">
        <el-table-column label="ID" prop="id" width="90" align="center" />
        <el-table-column label="转化意向" prop="conversionIntent" width="100" align="center" />
        <el-table-column label="消费能力" prop="spendingPower" width="100" align="center" />
        <el-table-column label="近期活跃" prop="recentActivity" width="100" align="center" />
        <el-table-column label="总和" prop="total" width="70" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="计划生效时间" width="180">
          <template #default="{ row }">{{ formatTime(row.effectiveAt) }}</template>
        </el-table-column>
        <el-table-column label="实际生效时间" width="180">
          <template #default="{ row }">{{ formatTime(row.activatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作人" prop="createdBy" width="140" />
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="logTab === 'schedules' && row.status === 'SCHEDULED'"
              type="danger" size="small" link
              @click="handleCancel(row)"
            >取消排期</el-button>
            <el-button
              v-if="logTab === 'history' && row.status === 'APPLIED'"
              type="primary" size="small" link
              @click="handleRollback(row)"
            >回滚此版本</el-button>
            <span v-if="row.status === 'CANCELLED'" class="text-muted">—</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import type { ScoringWeightSchedule } from '@/types'
import {
  getScoringWeightHistory,
  getScoringWeightSchedules,
  cancelScoringWeightSchedule,
  rollbackScoringWeight
} from '@/api/modules/admin-console'

const logTab = ref<'history' | 'schedules'>('history')
const loading = ref(false)
const logList = ref<ScoringWeightSchedule[]>([])

async function loadLogs() {
  loading.value = true
  try {
    if (logTab.value === 'history') {
      const res = await getScoringWeightHistory(100)
      logList.value = res.data || []
    } else {
      const res = await getScoringWeightSchedules()
      logList.value = res.data || []
    }
  } catch {
    logList.value = []
  } finally {
    loading.value = false
  }
}

async function handleCancel(row: ScoringWeightSchedule) {
  try {
    await ElMessageBox.confirm(`确定取消此排期（生效时间：${formatTime(row.effectiveAt)}）？`, '取消排期', {
      confirmButtonText: '确认取消',
      cancelButtonText: '返回',
      type: 'warning'
    })
    await cancelScoringWeightSchedule(row.id)
    ElMessage.success('排期已取消')
    loadLogs()
  } catch {
    // 用户点击了取消
  }
}

async function handleRollback(row: ScoringWeightSchedule) {
  try {
    await ElMessageBox.confirm(
      `确定回滚到此历史版本？\n转化意向=${row.conversionIntent}，消费能力=${row.spendingPower}，近期活跃=${row.recentActivity}`,
      '回滚版本',
      {
        confirmButtonText: '确认回滚',
        cancelButtonText: '返回',
        type: 'warning'
      }
    )
    await rollbackScoringWeight(row.id)
    ElMessage.success('已创建回滚版本')
    loadLogs()
  } catch {
    // 用户点击了取消
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'SCHEDULED': return '待生效'
    case 'APPLIED': return '已生效'
    case 'CANCELLED': return '已取消'
    default: return status
  }
}

function statusTagType(status: string) {
  switch (status) {
    case 'SCHEDULED': return 'warning'
    case 'APPLIED': return 'success'
    case 'CANCELLED': return 'info'
    default: return ''
  }
}

function formatTime(iso?: string) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('zh-CN', { hour12: false })
  } catch {
    return iso
  }
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped lang="scss">
.scoring-logs-page {
  display: flex;
  flex-direction: column;
}

.console-panel {
  padding: 24px;
  border-radius: 16px;
  margin-top: 24px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.text-muted {
  color: #9ca3af;
}
</style>
