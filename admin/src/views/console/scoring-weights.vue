<template>
  <div class="console-page scoring-page">
    <div class="page-header"><h1 class="page-title">评分权重</h1></div>

    <div class="card console-panel panel" v-loading="loading">
      <div class="tip">建议：请将三项权重总和保持为 100，便于统一评估标准与运营复盘。</div>

      <div class="weight-row">
        <div class="weight-label">转化意向</div>
        <el-slider v-model="form.conversionIntent" :min="0" :max="100" :step="1" show-stops />
        <el-input-number v-model="form.conversionIntent" :min="0" :max="100" :step="1" />
      </div>

      <div class="weight-row">
        <div class="weight-label">消费能力</div>
        <el-slider v-model="form.spendingPower" :min="0" :max="100" :step="1" show-stops />
        <el-input-number v-model="form.spendingPower" :min="0" :max="100" :step="1" />
      </div>

      <div class="weight-row">
        <div class="weight-label">近期活跃度</div>
        <el-slider v-model="form.recentActivity" :min="0" :max="100" :step="1" show-stops />
        <el-input-number v-model="form.recentActivity" :min="0" :max="100" :step="1" />
      </div>

      <div class="summary">当前总和: <b :style="{ color: total === 100 ? '#16a34a' : '#dc2626' }">{{ total }}</b> / 100</div>
      <div class="meta">最近更新：{{ meta.updatedAt || '-' }} / {{ meta.updatedBy || '-' }}</div>
      <div class="action-row">
        <el-button type="primary" size="large" :disabled="total !== 100" :loading="saving" @click="save">保存权重（立即生效）</el-button>
        <el-button size="large" @click="scheduleDialogVisible = true">新建排期</el-button>
      </div>
    </div>

    <!-- 新建排期弹窗 -->
    <el-dialog v-model="scheduleDialogVisible" title="新建权重排期" width="520px" :close-on-click-modal="false">
      <el-form label-width="100px" :model="scheduleForm">
        <el-form-item label="转化意向">
          <el-input-number v-model="scheduleForm.conversionIntent" :min="0" :max="100" :step="1" />
        </el-form-item>
        <el-form-item label="消费能力">
          <el-input-number v-model="scheduleForm.spendingPower" :min="0" :max="100" :step="1" />
        </el-form-item>
        <el-form-item label="近期活跃">
          <el-input-number v-model="scheduleForm.recentActivity" :min="0" :max="100" :step="1" />
        </el-form-item>
        <el-form-item label="总和">
          <span :style="{ fontWeight: 600, color: scheduleTotal === 100 ? '#16a34a' : '#dc2626' }">{{ scheduleTotal }} / 100</span>
        </el-form-item>
        <el-form-item label="生效时间">
          <el-date-picker v-model="scheduleForm.effectiveAt" type="datetime" placeholder="选择生效时间" format="YYYY-MM-DD HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="scheduleForm.remark" placeholder="选填，如：母亲节活动临时策略" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scheduleDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="scheduleTotal !== 100 || !scheduleForm.effectiveAt" :loading="scheduleSubmitting" @click="submitSchedule">创建排期</el-button>
      </template>
    </el-dialog>

    <!-- 变更日志面板 -->
    <div class="card console-panel panel log-panel" v-loading="logLoading">
      <div class="log-header">
        <h2 class="log-title">变更日志</h2>
        <el-radio-group v-model="logTab" size="small" @change="loadLogs">
          <el-radio-button value="history">历史版本</el-radio-button>
          <el-radio-button value="schedules">待生效排期</el-radio-button>
        </el-radio-group>
      </div>

      <el-table :data="logList" style="width: 100%" stripe empty-text="暂无记录" size="small">
        <el-table-column label="转化意向" prop="conversionIntent" width="90" align="center" />
        <el-table-column label="消费能力" prop="spendingPower" width="90" align="center" />
        <el-table-column label="近期活跃" prop="recentActivity" width="90" align="center" />
        <el-table-column label="总和" prop="total" width="70" align="center" />
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="生效时间" width="170">
          <template #default="{ row }">{{ formatTime(row.effectiveAt || row.activatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作人" prop="createdBy" width="120" />
        <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="logTab === 'schedules' && row.status === 'SCHEDULED'"
              type="danger"
              size="small"
              link
              @click="handleCancel(row)"
            >取消排期</el-button>
            <el-button
              v-if="logTab === 'history' && row.status === 'APPLIED'"
              type="primary"
              size="small"
              link
              @click="handleRollback(row)"
            >回滚此版本</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="log-footer">
        <router-link to="/console/scoring-logs" class="view-all-link">查看完整操作日志 →</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ScoringWeightSchedule } from '@/types'
import {
  getScoringWeights,
  updateScoringWeights,
  getScoringWeightHistory,
  getScoringWeightSchedules,
  cancelScoringWeightSchedule,
  rollbackScoringWeight,
  createScoringWeightSchedule
} from '@/api/modules/admin-console'

const loading = ref(false)
const saving = ref(false)
const form = reactive({ conversionIntent: 50, spendingPower: 30, recentActivity: 20 })
const meta = reactive({ updatedAt: '', updatedBy: '' })
const total = computed(() => Number(form.conversionIntent) + Number(form.spendingPower) + Number(form.recentActivity))

const logTab = ref<'history' | 'schedules'>('history')
const logLoading = ref(false)
const logList = ref<ScoringWeightSchedule[]>([])

// 新建排期
const scheduleDialogVisible = ref(false)
const scheduleSubmitting = ref(false)
const scheduleForm = reactive({
  conversionIntent: 50,
  spendingPower: 30,
  recentActivity: 20,
  effectiveAt: null as Date | null,
  remark: ''
})
const scheduleTotal = computed(() => Number(scheduleForm.conversionIntent) + Number(scheduleForm.spendingPower) + Number(scheduleForm.recentActivity))

async function load() {
  loading.value = true
  try {
    const res = await getScoringWeights()
    Object.assign(form, {
      conversionIntent: res.data.conversionIntent,
      spendingPower: res.data.spendingPower,
      recentActivity: res.data.recentActivity
    })
    meta.updatedAt = res.data.updatedAt
    meta.updatedBy = res.data.updatedBy
  } finally {
    loading.value = false
  }
}

async function save() {
  if (total.value !== 100) {
    ElMessage.warning('三项总和必须为 100')
    return
  }
  saving.value = true
  try {
    const res = await updateScoringWeights(form)
    meta.updatedAt = res.data.updatedAt
    meta.updatedBy = res.data.updatedBy
    ElMessage.success('保存成功')
    loadLogs()
  } finally {
    saving.value = false
  }
}

async function submitSchedule() {
  if (scheduleTotal.value !== 100 || !scheduleForm.effectiveAt) return
  scheduleSubmitting.value = true
  try {
    const dt = scheduleForm.effectiveAt instanceof Date
      ? scheduleForm.effectiveAt.toISOString()
      : String(scheduleForm.effectiveAt)
    await createScoringWeightSchedule({
      conversionIntent: scheduleForm.conversionIntent,
      spendingPower: scheduleForm.spendingPower,
      recentActivity: scheduleForm.recentActivity,
      effectiveAt: dt,
      remark: scheduleForm.remark || undefined
    })
    ElMessage.success('排期创建成功')
    scheduleDialogVisible.value = false
    // 重置表单
    scheduleForm.conversionIntent = form.conversionIntent
    scheduleForm.spendingPower = form.spendingPower
    scheduleForm.recentActivity = form.recentActivity
    scheduleForm.effectiveAt = null
    scheduleForm.remark = ''
    // 切换到待生效排期 Tab 并刷新
    logTab.value = 'schedules'
    loadLogs()
  } catch (e: any) {
    ElMessage.error(e?.message || '创建排期失败')
  } finally {
    scheduleSubmitting.value = false
  }
}

async function loadLogs() {
  logLoading.value = true
  try {
    if (logTab.value === 'history') {
      const res = await getScoringWeightHistory(50)
      logList.value = res.data || []
    } else {
      const res = await getScoringWeightSchedules()
      logList.value = res.data || []
    }
  } catch {
    logList.value = []
  } finally {
    logLoading.value = false
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
      `确定回滚到此历史版本？（转化意向=${row.conversionIntent}，消费能力=${row.spendingPower}，近期活跃=${row.recentActivity}）`,
      '回滚版本',
      {
        confirmButtonText: '确认回滚',
        cancelButtonText: '返回',
        type: 'warning'
      }
    )
    await rollbackScoringWeight(row.id)
    ElMessage.success('已创建回滚版本，请在排期列表中查看')
    await load()
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
  load()
  loadLogs()
})
</script>

<style scoped lang="scss">
.scoring-page {
  display: flex;
  flex-direction: column;
}

.panel {
  padding: 26px 28px;
  width: min(980px, 100%);
  margin: 40px auto 0;
  border-radius: 16px;
}

.log-panel.panel {
  width: 100%;
  max-width: 100%;
}

.tip {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 18px;
}

.action-row {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.weight-row {
  display: grid;
  grid-template-columns: 110px 1fr 128px;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.weight-label {
  color: #111827;
  font-weight: 600;
}

:deep(.el-slider__runway) {
  margin: 0;
}

.summary {
  margin: 14px 0 8px;
  font-size: 22px;
  font-weight: 600;
}

.meta {
  margin-bottom: 18px;
  color: #6b7280;
  font-size: 14px;
}

.log-panel {
  margin-top: 24px;
  margin-bottom: 40px;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.log-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.log-footer {
  margin-top: 16px;
  text-align: right;
}

.view-all-link {
  color: #3b82f6;
  font-size: 14px;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

@media (max-width: 900px) {
  .panel { padding: 18px; }
  .weight-row {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }
  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
