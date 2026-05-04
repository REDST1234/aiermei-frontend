<template>
  <div class="users-page">
    <div class="page-header">
      <h1 class="page-title">客户管理</h1>
    </div>

    <div class="card search-bar">
      <el-form :inline="true">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="姓名或手机号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card list-wrap" v-loading="loading">
      <div class="card-grid">
        <article v-for="user in users" :key="user.uid" class="lead-card">
          <div 
            v-if="typeof user.manualTotalScore === 'number'" 
            :class="['score-badge', { 'is-updating': updatingUids.has(user.uid) }]" 
            title="后端综合评分"
          >
            {{ user.manualTotalScore }}%
          </div>
          <div class="lead-header">
            <div class="identity">
              <el-avatar :size="48" :src="user.avatar">{{ user.name?.charAt(0) }}</el-avatar>
              <div class="meta">
                <div class="name-row">
                  <h3>{{ user.name }}</h3>
                  <el-tooltip content="复制 UID" placement="top">
                    <el-button
                      link
                      :icon="CopyDocument"
                      class="copy-uid-btn"
                      @click.stop="copyText(user.uid)"
                    />
                  </el-tooltip>
                </div>
                <p class="phone-meta">
                  <span class="phone-text">{{ user.phone || '-' }}</span>
                  <el-icon v-if="user.phone && user.phone !== '-'" class="reveal-icon" @click.stop="togglePhone(user)">
                    <View v-if="user.phone.includes('*')" />
                    <Hide v-else />
                  </el-icon>
                </p>
              </div>
            </div>
          </div>

          <div class="tag-row">
            <el-tag v-for="(tag, index) in user.tags.slice(0, 4)" :key="getTagKey(tag, index)" effect="plain" round>
              {{ getTagName(tag) }}
            </el-tag>
            <span v-if="!user.tags?.length" class="tag-placeholder">tag尚未分析</span>
          </div>

          <p :class="['quote', { 'is-updating': updatingUids.has(user.uid) }]">{{ insightPreview(user) }}</p>
          
          <div class="metric-row" title="点击查看详细行为路径" @click="openProfileDialog(user, 'logs')">
            <div class="metric-item">
              <label>意向</label>
              <b class="c-intent">
                {{ metricPreview(user, 'conversionIntent') }}{{ typeof metricPreview(user, 'conversionIntent') === 'number' ? '%' : '' }}
              </b>
            </div>
            <div class="metric-item">
              <label>消费</label>
              <b class="c-spending">
                {{ metricPreview(user, 'spendingPower') }}{{ typeof metricPreview(user, 'spendingPower') === 'number' ? '%' : '' }}
              </b>
            </div>
            <div class="metric-item">
              <label>急迫</label>
              <b class="c-urgency">
                {{ metricPreview(user, 'urgency') }}{{ typeof metricPreview(user, 'urgency') === 'number' ? '%' : '' }}
              </b>
            </div>
          </div>

          <div class="ai-analysis-wrap">
            <el-button 
              class="ai-btn" 
              :loading="analyzingUid === user.uid"
              @click.stop="handleAiAnalysis(user)"
            >
              <el-icon><Compass /></el-icon> AI 深度分析
            </el-button>
          </div>

          <div class="footer-row">
            <el-button text @click="openProfileDialog(user)">展开卡片</el-button>
            <el-button type="primary" text @click="openProfileDialog(user)">提交评分</el-button>
          </div>
        </article>
      </div>

      <el-empty v-if="!users.length && !loading" description="暂无客户数据" />

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[12, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadUsers"
        @current-change="loadUsers"
      />
    </div>

    <el-dialog
      v-model="profileDialogVisible"
      class="profile-dialog"
      width="68vw"
      top="8vh"
      :close-on-click-modal="false"
      :before-close="handleDialogBeforeClose"
      destroy-on-close
    >
      <template #header>
        <div v-if="selectedUser" class="dialog-head">
          <div class="identity">
            <el-avatar :size="48" :src="selectedUser.avatar">{{ selectedUser.name?.charAt(0) }}</el-avatar>
            <div class="meta">
              <div class="name-row">
                <h2>{{ selectedUser.name }}</h2>
                <el-tooltip content="复制 UID" placement="top">
                  <el-button
                    link
                    :icon="CopyDocument"
                    class="copy-uid-btn"
                    @click.stop="copyText(selectedUser.uid)"
                  />
                </el-tooltip>
              </div>
              <p class="phone-meta">
                <span class="phone-text">{{ selectedUser.phone || '-' }}</span>
                <el-icon v-if="selectedUser.phone && selectedUser.phone !== '-'" class="reveal-icon" @click.stop="togglePhone(selectedUser)">
                  <View v-if="selectedUser.phone.includes('*')" />
                  <Hide v-else />
                </el-icon>
              </p>
              <p class="last-active">最后更新：{{ formatDate(selectedUser.lastActive) }}</p>
            </div>
          </div>
          <el-button 
            type="primary" 
            class="ai-action-btn" 
            :loading="analyzingUid === selectedUser.uid" 
            @click="handleAiAnalysis(selectedUser!)"
          >
            更新AI分析
          </el-button>
        </div>
      </template>

      <template v-if="selectedUser">
        <section :class="['ai-summary', { 'is-updating': updatingUids.has(selectedUser.uid) }]">
          <div class="summary-title">
            <el-icon class="ai-sparkle"><MagicStick /></el-icon>
            AI洞察摘要
          </div>
          <p>{{ analysisResult.summary || '暂无AI摘要' }}</p>
        </section>

        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="人工评分面板" name="scoring">
            <section class="panel">
              <h3>多维度意向分校准</h3>
              <div v-for="dim in scoreDimensions" :key="dim.key" class="score-block">
                <div class="score-title">{{ dim.label }}</div>
                <div class="score-main">
                  <el-slider v-model="dim.score" :min="0" :max="100" :step="1" />
                  <span class="score-pill">{{ dim.score }}%</span>
                </div>
              </div>

              <el-input
                v-model="manualScoreNote"
                type="textarea"
                :rows="2"
                maxlength="300"
                show-word-limit
                placeholder="评分备注（选填）"
              />

              <div class="confirm-row">
                <el-button type="primary" :loading="submittingScore" @click="submitManualScore">确认提交</el-button>
              </div>
            </section>
          </el-tab-pane>

          <el-tab-pane label="人工纠偏机制">
            <section class="panel">
              <h3>标签纠偏与完善</h3>
              <p class="subtle">点击标签可溯源，关闭图标用于删除标签</p>
              <div class="tag-row correction-tag-row">
                <el-tag
                  v-for="tag in customerTags"
                  :key="tag.tagCode"
                  class="trace-tag"
                  size="large"
                  closable
                  @click.stop="openTagTrace(tag)"
                  @close="removeTag(tag)"
                >
                  <span class="tag-name">{{ tag.tagName }}</span>
                  <span v-if="tag.decayPercent !== undefined" class="tag-decay">
                    {{ tag.decayPercent }}%
                  </span>
                </el-tag>
                <span v-if="!customerTags.length" class="subtle">暂无标签</span>
              </div>

              <p class="subtle minor-top">补充线下调研特征</p>
              <div class="quick-add-row">
                <el-input v-model="newTagName" placeholder="输入新特征标签（如：家属陪同、停车需求）" maxlength="30" />
                <el-input v-model="tagCorrectionReason" placeholder="纠偏理由（选填）" maxlength="120" />
                <el-button type="primary" :loading="addingTag" @click="addTag">新增标签</el-button>
              </div>
            </section>
          </el-tab-pane>

          <el-tab-pane label="行为路径与日志">
            <div class="dialog-grid">
              <section class="panel">
                <h3>行为路径溯源</h3>
                <div class="journey-list">
                  <div v-for="(item, index) in userJourney.paths" :key="`${item.eventId || item.path}-${index}`" class="journey-item">
                    <div class="journey-main">
                      <div class="journey-title">
                        <span class="display-name">{{ item.displayName || item.path }}</span>
                        <span v-if="item.repeatCount && item.repeatCount > 1" class="repeat-badge">x{{ item.repeatCount }}</span>
                        <span class="timestamp">{{ formatDate(item.timestamp) }}</span>
                      </div>
                      <div v-if="item.context" class="journey-context">{{ item.context }}</div>
                      <div v-else class="journey-path-fallback">{{ item.path }}</div>
                      
                      <div v-if="item.metadata && Object.keys(item.metadata).length > 0" class="journey-metadata">
                        <el-collapse class="metadata-collapse">
                          <el-collapse-item :title="`查看元数据 (${Object.keys(item.metadata).length})`" :name="1">
                            <pre class="metadata-pre">{{ JSON.stringify(item.metadata, null, 2) }}</pre>
                          </el-collapse-item>
                        </el-collapse>
                      </div>
                    </div>
                  </div>
                  <span v-if="!userJourney.paths.length" class="subtle">暂无路径数据</span>
                </div>
              </section>

              <section class="panel">
                <h3>纠偏操作日志</h3>
                <el-table :data="tagCorrectionLogs" size="small" max-height="240">
                  <el-table-column label="动作" width="80">
                    <template #default="{ row }">{{ correctionActionLabel(row.action) }}</template>
                  </el-table-column>
                  <el-table-column label="标签" min-width="120">
                    <template #default="{ row }">{{ row.tagName || row.tagCode || '-' }}</template>
                  </el-table-column>
                  <el-table-column label="原因" min-width="140">
                    <template #default="{ row }">{{ correctionReasonText(row) }}</template>
                  </el-table-column>
                  <el-table-column label="操作人" width="120">
                    <template #default="{ row }">{{ row.operatorName || '已离职员工' }}</template>
                  </el-table-column>
                </el-table>
              </section>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-dialog>

    <el-dialog v-model="tagTraceVisible" width="560px" title="标签溯源记录" append-to-body destroy-on-close>
      <div class="trace-head">标签：{{ activeTraceTagName }}</div>
      <div class="trace-content">
        <el-timeline v-loading="tagTraceLoading">
          <el-timeline-item
            v-for="item in tagTraceRecords"
            :key="item.id"
            :timestamp="formatDate(item.occurredAt)"
            placement="top"
          >
            <div class="trace-item">
              <p class="trace-meta">来源：{{ sourceTypeLabel(item.sourceType) }} · 事件：{{ eventTypeLabel(item.sourceEventType) }}</p>
              <p class="trace-context">{{ item.sourceContext }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-if="!tagTraceLoading && !tagTraceRecords.length" description="暂无溯源记录" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { View, Hide, Compass, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createAnalysisTask, getAnalysisTask, getCustomerDetail, getCustomers, getUserJourney } from '@/api/modules/auth'
import {
  addCustomerTag,
  getCustomerManualScoreDraft,
  getCustomerTagCorrectionLogs,
  getCustomerTagTrace,
  getCustomerPhone,
  getCustomerTags,
  removeCustomerTag,
  submitCustomerManualScore
} from '@/api/modules/customer-profile'
import type {
  AnalysisResult,
  Customer,
  CustomerManualScoreSubmitRequest,
  CustomerTag,
  CustomerTagCorrectionLog,
  CustomerTagTraceRecord,
  UserJourney
} from '@/types'

import { MagicStick } from '@element-plus/icons-vue'

const loading = ref(false)
const users = ref<Customer[]>([])
const profileDialogVisible = ref(false)
const selectedUser = ref<Customer | null>(null)
const userJourney = ref<UserJourney>({ uid: '', paths: [], tags: [], lastActive: '' })
const analysisResult = ref<AnalysisResult>({ tags: [], summary: '' })
const customerTags = ref<CustomerTag[]>([])
const tagCorrectionLogs = ref<CustomerTagCorrectionLog[]>([])
const tagTraceVisible = ref(false)
const tagTraceLoading = ref(false)
const activeTraceTagName = ref('')
const tagTraceRecords = ref<CustomerTagTraceRecord[]>([])
const activeTab = ref('scoring')

const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, pageSize: 12, total: 0 })

const scoreDimensions = reactive([
  { key: 'conversionIntent', label: '转化意向度', score: 60 },
  { key: 'spendingPower', label: '消费能力', score: 55 },
  { key: 'urgency', label: '孕产急迫度', score: 65 }
])
const manualScoreNote = ref('')
const submittingScore = ref(false)
const analyzingUid = ref('')
const updatingUids = ref(new Set<string>())

const ANALYSIS_POLL_INTERVAL_MS = 1500
const ANALYSIS_POLL_MAX_ROUNDS = 40

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function pollAnalysisResult(uid: string, taskId: string) {
  for (let round = 0; round < ANALYSIS_POLL_MAX_ROUNDS; round += 1) {
    const taskRes = await getAnalysisTask(uid, taskId)
    const task = taskRes.data
    if (task.status === 'SUCCESS') {
      return task.result ?? null
    }
    if (task.status === 'FAILED') {
      throw new Error(task.errorMessage || 'AI 分析执行失败')
    }
    await sleep(ANALYSIS_POLL_INTERVAL_MS)
  }
  return null
}

async function handleAiAnalysis(user: Customer, force = true) {
  analyzingUid.value = user.uid
  updatingUids.value.add(user.uid)
  
  try {
    const taskRes = await createAnalysisTask(user.uid, force)
    const taskId = taskRes.data.taskId
    const result = await pollAnalysisResult(user.uid, taskId)
    
    // 模拟一段分析后的数据加载感，配合动画
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // 重新获取详情以同步最新的综合得分（manualTotalScore）和标签
    const detailRes = await getCustomerDetail(user.uid)
    const updatedUser = detailRes.data as Customer
    
    // 如果详情对话框已打开，且是同一个用户，更新详情页数据
    if (profileDialogVisible.value && selectedUser.value?.uid === user.uid) {
      if (result) {
        analysisResult.value = result
      }
      selectedUser.value = updatedUser
    }
    
    // 同步刷新列表中的该用户信息
    const index = users.value.findIndex(u => u.uid === user.uid)
    if (index > -1) {
      users.value[index] = updatedUser
    }
    if (result) {
      ElMessage.success('AI 分析完成，数据已更新')
    } else {
      ElMessage.info('分析任务仍在进行中，请稍后刷新查看')
    }
  } catch (e) {
    console.error('AI Analysis failed:', e)
    const message = e instanceof Error ? e.message : 'AI 分析执行失败'
    ElMessage.error(message)
  } finally {
    analyzingUid.value = ''
    // 动画保持一段时间
    setTimeout(() => {
      updatingUids.value.delete(user.uid)
    }, 1000)
  }
}

const newTagName = ref('')
const tagCorrectionReason = ref('')
const addingTag = ref(false)

const initialScoreSnapshot = ref('')
const initialNoteSnapshot = ref('')

const updateSnapshots = () => {
  initialScoreSnapshot.value = JSON.stringify(scoreDimensions.map((x) => ({ key: x.key, score: x.score })))
  initialNoteSnapshot.value = manualScoreNote.value
}

const hasUnsavedScoreChanges = computed(() => {
  const currentScore = JSON.stringify(scoreDimensions.map((x) => ({ key: x.key, score: x.score })))
  return currentScore !== initialScoreSnapshot.value || manualScoreNote.value !== initialNoteSnapshot.value
})

function copyText(text: string) {
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('UID 已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

function formatDate(date: string) {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

function getTagName(tag: Customer['tags'][number]) {
  if (typeof tag === 'string') return tag
  return tag.tagName || tag.name || tag.tagCode || tag.code || ''
}

function getTagKey(tag: Customer['tags'][number], index: number) {
  if (typeof tag === 'string') return `${tag}-${index}`
  return `${tag.tagCode || tag.code || tag.tagName || tag.name || index}-${index}`
}

function metricPreview(user: Customer, type: 'conversionIntent' | 'spendingPower' | 'urgency') {
  if (user.manualScoreSnapshot) {
    const hit = user.manualScoreSnapshot[type]
    if (typeof hit === 'number') return hit
    if (hit && typeof hit.score === 'number') return hit.score
  }
  return '未评分'
}

function insightPreview(user: Customer) {
  return user.aiSummary || '未备注'
}

function sourceTypeLabel(sourceType: string) {
  const map: Record<string, string> = {
    AI_CHAT: 'AI对话',
    PAGE_VIEW: '页面浏览',
    ARTICLE_VIEW: '内容阅读',
    MANUAL: '人工录入'
  }
  return map[sourceType] || sourceType || '未知来源'
}

function eventTypeLabel(eventType?: string) {
  if (!eventType) return '未知事件'
  const map: Record<string, string> = {
    AI_CHAT: 'AI对话消息',
    PAGE_VIEW: '页面访问事件',
    ARTICLE_VIEW: '文章阅读事件',
    CLICK: '点击事件',
    APPOINTMENT_INTENT: '预约意向',
    MANUAL_TAG_ADD: '人工补录标签'
  }
  return map[eventType] || eventType
}

function correctionActionLabel(action?: string) {
  const map: Record<string, string> = {
    ADD: '新增',
    REMOVE: '移除',
    MERGE: '并入'
  }
  return (action && map[action]) || action || '-'
}

function correctionReasonText(log: CustomerTagCorrectionLog) {
  if (log.note) return log.note
  if (log.reason) return log.reason
  if (log.action === 'MERGE') return '并入标签'
  return '-'
}

function handleSearch() {
  pagination.page = 1
  void loadUsers()
}

function handleReset() {
  searchForm.keyword = ''
  pagination.page = 1
  void loadUsers()
}

async function loadUsers() {
  loading.value = true
  try {
    const res = await getCustomers({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined
    })
    users.value = res.data.list
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

async function loadProfileData(uid: string) {
  try {
    const [detailRes, journeyRes, tagsRes, scoreDraftRes, logsRes] = await Promise.all([
      getCustomerDetail(uid).catch(() => ({ data: selectedUser.value })),
      getUserJourney(uid, 100).catch(() => ({ data: { paths: [] } })),
      getCustomerTags(uid).catch(() => ({ data: [] })),
      getCustomerManualScoreDraft(uid).catch(() => ({ data: null })),
      getCustomerTagCorrectionLogs(uid).catch(() => ({ data: [] }))
    ])

    if (detailRes.data) selectedUser.value = detailRes.data as Customer
    userJourney.value = journeyRes.data as UserJourney
    analysisResult.value = {
      summary: selectedUser.value?.aiSummary || '',
      tags: []
    } as AnalysisResult
    customerTags.value = tagsRes.data as CustomerTag[]
    tagCorrectionLogs.value = logsRes.data as CustomerTagCorrectionLog[]

    if (scoreDraftRes.data) {
      const draft = scoreDraftRes.data as any
      scoreDimensions.forEach((dim) => {
        const hit = draft.dimensions?.find((d: any) => d.key === dim.key)
        if (hit) dim.score = hit.score
      })
      manualScoreNote.value = draft.note || ''
    }
    updateSnapshots()
  } catch (e) {
    console.error('Failed to load profile data:', e)
    ElMessage.error('部分详情数据加载失败')
  }
}

async function openProfileDialog(user: Customer, tab: string = 'scoring') {
  selectedUser.value = user
  activeTab.value = tab
  // Reset score dimensions to defaults
  scoreDimensions[0].score = 60
  scoreDimensions[1].score = 55
  scoreDimensions[2].score = 65
  manualScoreNote.value = ''
  updateSnapshots()
  
  profileDialogVisible.value = true
  await loadProfileData(user.uid)
}


async function submitManualScore() {
  if (!selectedUser.value?.uid) return
  const payload: CustomerManualScoreSubmitRequest = {
    dimensions: scoreDimensions.map((item) => ({ key: item.key as any, label: item.label, score: Number(item.score) })),
    note: manualScoreNote.value || undefined
  }
  submittingScore.value = true
  try {
    await submitCustomerManualScore(selectedUser.value.uid, payload)
    initialScoreSnapshot.value = JSON.stringify(scoreDimensions.map((x) => ({ key: x.key, score: x.score })))
    initialNoteSnapshot.value = manualScoreNote.value
    profileDialogVisible.value = false
    ElMessage.success('人工评分已确认提交')
  } finally {
    submittingScore.value = false
  }
}

async function addTag() {
  if (!selectedUser.value?.uid) return
  const tagName = newTagName.value.trim()
  if (!tagName) {
    ElMessage.warning('请先输入标签名称')
    return
  }
  addingTag.value = true
  try {
    await addCustomerTag(selectedUser.value.uid, {
      tagName,
      reason: tagCorrectionReason.value || undefined
    })
    const [tagsRes, logsRes] = await Promise.all([
      getCustomerTags(selectedUser.value.uid),
      getCustomerTagCorrectionLogs(selectedUser.value.uid)
    ])
    customerTags.value = tagsRes.data
    tagCorrectionLogs.value = logsRes.data
    newTagName.value = ''
    tagCorrectionReason.value = ''
    ElMessage.success('标签已新增')
  } finally {
    addingTag.value = false
  }
}

async function removeTag(tag: CustomerTag) {
  if (!selectedUser.value?.uid) return
  const reason = await ElMessageBox.prompt('请输入删除标签原因（选填）', `删除标签：${tag.tagName}`, {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：线下沟通后确认标签不准确'
  }).catch(() => null)
  if (reason === null) return
  await removeCustomerTag(selectedUser.value.uid, tag.tagCode, reason.value || undefined)
  const [tagsRes, logsRes] = await Promise.all([
    getCustomerTags(selectedUser.value.uid),
    getCustomerTagCorrectionLogs(selectedUser.value.uid)
  ])
  customerTags.value = tagsRes.data
  tagCorrectionLogs.value = logsRes.data
  ElMessage.success('标签已删除')
}



const maskedPhoneMap = new Map<string, string>()

async function togglePhone(user: Customer) {
  if (!user.phone) return
  const isMasked = user.phone.includes('*')
  
  if (isMasked) {
    try {
      if (!maskedPhoneMap.has(user.uid)) {
        maskedPhoneMap.set(user.uid, user.phone)
      }
      const res = await getCustomerPhone(user.uid)
      user.phone = res.data.phone
    } catch (e) {
      ElMessage.error('获取完整手机号失败')
    }
  } else {
    const masked = maskedPhoneMap.get(user.uid)
    if (masked) {
      user.phone = masked
    }
  }
}


async function openTagTrace(tag: CustomerTag) {
  if (!selectedUser.value?.uid) return
  activeTraceTagName.value = tag.tagName
  tagTraceVisible.value = true
  tagTraceLoading.value = true
  try {
    const res = await getCustomerTagTrace(selectedUser.value.uid, tag.tagCode)
    tagTraceRecords.value = res.data
  } finally {
    tagTraceLoading.value = false
  }
}


const handleDialogBeforeClose = (done: any) => {
  if (!hasUnsavedScoreChanges.value) {
    if (typeof done === 'function') {
      done()
    } else {
      profileDialogVisible.value = false
    }
    return
  }

  ElMessageBox.confirm('评分内容有未保存改动，确定关闭吗？', '未保存提示', {
    confirmButtonText: '仍然关闭',
    cancelButtonText: '继续编辑',
    type: 'warning',
    distinguishCancelAndClose: true
  }).then(() => {
    // Force close
    profileDialogVisible.value = false
    if (typeof done === 'function') done()
  }).catch(() => {
    // Keep open
  })
}


onMounted(() => {
  void loadUsers()
})
</script>

<style scoped lang="scss">
.search-bar {
  margin-bottom: 16px;
  padding: 14px 16px;
}

.list-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.lead-card {
  position: relative;
  border-radius: 12px;
  border: 1px solid #e6e9ef;
  background: #f5f5f0;
  overflow: visible;
  min-height: 315px;
  display: flex;
  flex-direction: column;
  padding: 0 0 12px;
}

.lead-header {
  padding: 12px 12px 8px;
}

.identity {
  display: flex;
  gap: 10px;
  align-items: center;
}

.meta h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.meta p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #8a93a2;
}

.tag-row {
  padding: 0 12px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  min-height: 28px;
  max-height: 56px;
  overflow: hidden;
  align-content: flex-start;
}

.tag-placeholder {
  font-size: 12px;
  color: #9aa3b2;
  font-style: italic;
  display: flex;
  align-items: center;
  height: 28px;
  padding-left: 4px;
}

.quote {
  margin: 10px 12px 0;
  color: #5f6b7a;
  font-size: 13px;
  line-height: 1.5;
  min-height: 42px;
  max-height: 42px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

  &.is-updating {
    opacity: 0.3;
    filter: blur(2px);
    transform: translateY(-2px);
  }
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-uid-btn {
  padding: 0;
  height: auto;
  color: #9aa3b2;
  font-size: 14px;
  
  &:hover {
    color: #11c5bb;
  }
  
  :deep(.el-icon) {
    font-size: 14px;
  }
}


.metric-row {
  margin-top: 12px;
  border-top: 1px solid #e7ebf2;
  border-bottom: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 10px 8px;
  background: #f8f9fb;
  border-radius: 0 0 10px 10px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f1f5f9;
  }
}

.metric-item {
  text-align: center;
}

.metric-item label {
  color: #9aa3b2;
  display: block;
  font-size: 12px;
}

.metric-item b {
  display: block;
  margin-top: 3px;
  font-size: 20px;
}

.c-intent { color: #11c5bb; }
.c-spending { color: #f59e0b; }
.c-urgency { color: #f43f5e; }

.footer-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: none;
  margin-top: auto;
  background: #f5f5f0;
  margin: auto 12px 0;
  border: 1px solid #d9ded6;
  border-radius: 8px;
  overflow: hidden;
}

.footer-row :deep(.el-button) {
  border-radius: 0;
  padding: 10px 0;
  font-size: 14px;
  background: transparent !important;
}

.footer-row :deep(.el-button + .el-button) {
  margin-left: 0;
  border-left: 1px solid #d9ded6;
}

.footer-row :deep(.el-button:hover),
.footer-row :deep(.el-button:focus) {
  background: rgba(17, 24, 39, 0.04) !important;
}

.ai-analysis-wrap {
  padding: 0 12px 10px;
}

.ai-btn {
  width: 100%;
  border-radius: 8px;
  background: linear-gradient(135deg, #128053 0%, #10b981 100%);
  border: none;
  color: white;
  height: 36px;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    background: linear-gradient(135deg, #0f766e 0%, #128053 100%);
  }

  .el-icon {
    font-size: 16px;
  }
}

.ai-action-btn {
  background: linear-gradient(135deg, #128053 0%, #10b981 100%);
  border: none;
  font-weight: 600;
  
  &:hover, &:focus {
    background: linear-gradient(135deg, #0f766e 0%, #128053 100%);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
  }
}

.dialog-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-head h2 {
  margin: 0;
  font-size: 20px;
}

.last-active {
  margin: 0;
  color: #7b8797;
}

.ai-summary {
  border: 1px solid #d4ece0;
  background: #eaf7ef;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 10px;
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;

  &.is-updating {
    background: #f0fdf4;
    &::after {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 50%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
      animation: ai-shimmer 1.2s infinite;
    }
  }
}

@keyframes ai-shimmer {
  0% { left: -100%; }
  100% { left: 200%; }
}

.summary-title {
  font-weight: 700;
  color: #128053;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ai-sparkle {
  color: #10b981;
  animation: sparkle-rotate 2s linear infinite;
}

@keyframes sparkle-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.detail-tabs {
  margin-top: 4px;
}

.dialog-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.panel {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
}

.panel h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.subtle {
  margin: 0 0 8px;
  color: #96a0b0;
  font-size: 12px;
}

.minor-top {
  margin-top: 10px;
}

.quick-add-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
}

.score-block {
  margin-bottom: 10px;
}

.score-title {
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 700;
}

.score-main {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
}

.score-pill {
  min-width: 56px;
  text-align: center;
  border-radius: 8px;
  padding: 2px 8px;
  color: #fff;
  background: #14b8a6;
  font-size: 12px;
  font-weight: 700;
}

.confirm-row {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.journey-list {
  max-height: 230px;
  overflow: auto;
}

.journey-item {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid #eef2f7;
}

.trace-tag {
  cursor: pointer;
  font-size: 16px !important;
  height: 36px !important;
  padding: 0 16px !important;
  display: inline-flex;
  align-items: center;
  margin-bottom: 8px; /* 增加行间距 */

  .tag-decay {
    margin-left: 8px;
    font-size: 13px;
    opacity: 0.7;
    font-weight: normal;
    background: rgba(0, 0, 0, 0.05);
    padding: 0 4px;
    border-radius: 4px;
  }
}

.correction-tag-row {
  max-height: 148px; /* 约 3 行标签的高度 + 间距 */
  overflow-y: auto;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #edf2f7;
  gap: 8px !important;
  align-content: flex-start;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.trace-head {
  margin-bottom: 12px;
  color: #5f6b7a;
  padding: 0 4px;
}

.trace-content {
  max-height: 520px;
  overflow-y: auto;
  padding: 4px 8px 0 4px;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.trace-meta {
  margin: 0 0 4px;
  color: #8a93a2;
  font-size: 12px;
}

.trace-context {
  margin: 0;
  color: #2f3a4a;
  line-height: 1.5;
}

:deep(.profile-dialog) {
  max-width: 1180px;
}

@media (max-width: 1400px) {
  .card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dialog-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .quick-add-row {
    grid-template-columns: 1fr;
  }
}


.phone-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.phone-text {
  font-family: 'Roboto Mono', 'Courier New', Courier, monospace;
  width: 115px;
  font-size: 15px;
  display: inline-block;
}

.reveal-icon {
  cursor: pointer;
  color: #409eff;
  transition: color 0.2s;
  font-size: 14px;
  flex-shrink: 0;

  &:hover {
    color: #66b1ff;
  }
}


.score-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.35);
  border: 2px solid #fff;
  z-index: 10;
  transform: rotate(3deg);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: help;

  &.is-updating {
    animation: badge-pulse-highlight 0.8s ease-in-out;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.6);
  }
}

@keyframes badge-pulse-highlight {
  0% { transform: rotate(3deg) scale(1); }
  50% { transform: rotate(0deg) scale(1.3); }
  100% { transform: rotate(3deg) scale(1); }
}

.lead-card:hover .score-badge {
  transform: rotate(0deg) scale(1.1);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.45);
}


.journey-item {
  border-bottom: 1px solid #f0f2f5;
  padding: 12px 0;
  
  &:last-child {
    border-bottom: none;
  }
}

.journey-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.display-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.repeat-badge {
  background: #fef2f2;
  color: #ef4444;
  font-size: 11px;
  padding: 0 6px;
  border-radius: 10px;
  border: 1px solid #fee2e2;
}

.timestamp {
  margin-left: auto;
  font-size: 12px;
  color: #9ca3af;
}

.journey-context {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 4px;
}

.journey-path-fallback {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}

.journey-metadata {
  margin-top: 8px;
}

.metadata-collapse {
  border: none !important;
  
  :deep(.el-collapse-item__header) {
    height: 32px;
    line-height: 32px;
    background: #f9fafb;
    border-radius: 4px;
    padding: 0 8px;
    font-size: 12px;
    color: #6b7280;
    border: none;
  }
  
  :deep(.el-collapse-item__wrap) {
    background: transparent;
    border: none;
  }
  
  :deep(.el-collapse-item__content) {
    padding: 8px;
  }
}

.metadata-pre {
  background: #1f2937;
  color: #e5e7eb;
  padding: 10px;
  border-radius: 6px;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  overflow-x: auto;
  margin: 0;
}

</style>





