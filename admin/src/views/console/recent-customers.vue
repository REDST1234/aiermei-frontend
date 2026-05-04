<template>
  <div class="console-page">
    <div class="page-header">
      <h1 class="page-title">最近客户</h1>
    </div>

    <div class="card panel">
      <div class="toolbar">
        <el-input
          v-model="query.keyword"
          clearable
          placeholder="搜索姓名或手机号"
          style="width: 260px"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="sortBy" style="width: 180px" @change="applySort">
          <el-option label="评分从高到低" value="score_desc" />
          <el-option label="评分从低到高" value="score_asc" />
          <el-option label="最近活跃优先" value="active_desc" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>

      <el-table :data="displayList" v-loading="loading">
        <el-table-column prop="name" label="客户" min-width="180" />
        <el-table-column label="UID" min-width="220">
          <template #default="{ row }">
            <span>{{ row.uid }}</span>
            <el-tooltip content="复制 UID" placement="top">
              <el-button
                link
                :icon="CopyDocument"
                class="copy-uid-btn"
                @click.stop="copyText(row.uid)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="手机号" width="150">
          <template #default="{ row }">
            <span>{{ row.phone || '-' }}</span>
            <el-icon
              v-if="row.phone && row.phone !== '-'"
              class="reveal-icon"
              @click.stop="togglePhone(row)"
            >
              <View v-if="row.phone.includes('*')" />
              <Hide v-else />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="360">
          <template #default="{ row }">
            <span>{{ row.tags.slice(0, 4).map(getTagName).join(' / ') || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="员工评分" width="120" align="center">
          <template #default="{ row }">
            {{ formatScore(row.manualTotalScore) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastActive" label="最近活跃" width="180" />
      </el-table>

      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="total, prev, pager, next, sizes"
        @current-change="loadList"
        @size-change="loadList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CopyDocument, Hide, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCustomers } from '@/api/modules/auth'
import { getCustomerPhone } from '@/api/modules/customer-profile'
import type { Customer } from '@/types'

type SortBy = 'score_desc' | 'score_asc' | 'active_desc'

const loading = ref(false)
const total = ref(0)
const list = ref<Customer[]>([])
const query = ref({ page: 1, pageSize: 20, keyword: '' })
const sortBy = ref<SortBy>('score_desc')
const maskedPhoneMap = new Map<string, string>()

const displayList = computed(() => {
  const copied = [...list.value]
  if (sortBy.value === 'score_desc') {
    copied.sort((a, b) => normalizedScore(b) - normalizedScore(a))
  } else if (sortBy.value === 'score_asc') {
    copied.sort((a, b) => normalizedScore(a) - normalizedScore(b))
  } else {
    copied.sort((a, b) => normalizedTime(b.lastActive) - normalizedTime(a.lastActive))
  }
  return copied
})

async function loadList() {
  loading.value = true
  try {
    const res = await getCustomers({
      page: query.value.page,
      pageSize: query.value.pageSize,
      keyword: query.value.keyword || undefined
    })
    list.value = res.data.list || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.value.page = 1
  void loadList()
}

function applySort() {
  // no-op: computed list handles sort immediately
}

function copyText(text: string) {
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('UID 已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

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
    } catch (_e) {
      ElMessage.error('获取完整手机号失败')
    }
  } else {
    const masked = maskedPhoneMap.get(user.uid)
    if (masked) {
      user.phone = masked
    }
  }
}

function getTagName(tag: Customer['tags'][number]) {
  if (typeof tag === 'string') return tag
  return tag.tagName || tag.name || tag.tagCode || tag.code || ''
}

function normalizedScore(user: Customer) {
  return typeof user.manualTotalScore === 'number' ? user.manualTotalScore : -1
}

function normalizedTime(raw?: string) {
  if (!raw) return 0
  const ts = Date.parse(raw)
  return Number.isNaN(ts) ? 0 : ts
}

function formatScore(score?: number) {
  return typeof score === 'number' ? `${score}%` : '-'
}

onMounted(loadList)
</script>

<style scoped lang="scss">
.panel { padding: 16px; }
.toolbar { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.copy-uid-btn {
  margin-left: 4px;
  padding: 0;
  height: auto;
  color: #9aa3b2;
}
.reveal-icon {
  margin-left: 6px;
  cursor: pointer;
  color: #409eff;
  font-size: 14px;
}
</style>
