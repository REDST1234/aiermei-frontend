<template>
  <div class="console-page dashboard-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">管理员仪表盘</h1>
        <p class="sub-title">核心经营指标与流量来源总览</p>
      </div>
      <div class="today-chip">数据更新时间：{{ updatedAtText }}</div>
    </div>

    <div class="stat-grid" :style="{ '--stat-columns': statColumnCount }">
      <div class="card stat-card stat-blue">
        <div class="stat-top">
          <span class="stat-label">活跃客户</span>
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-value">{{ overview.activeCustomers }}</div>
      </div>
      <div class="card stat-card stat-cyan">
        <div class="stat-top">
          <span class="stat-label">今日访问</span>
          <el-icon><View /></el-icon>
        </div>
        <div class="stat-value">{{ overview.todayVisits }}</div>
      </div>
      <div v-if="!uiFeatureStore.hideOrderUi" class="card stat-card stat-amber">
        <div class="stat-top">
          <span class="stat-label">订单数</span>
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-value">{{ overview.orderCount }}</div>
      </div>
      <div v-if="!uiFeatureStore.hideRevenueUi" class="card stat-card stat-emerald">
        <div class="stat-top">
          <span class="stat-label">营收</span>
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-value">{{ overview.revenueLabel }}</div>
      </div>
    </div>

    <div class="grid-two">
      <div class="card panel">
        <div class="panel-title">用户洞察</div>
        <div class="metric-row"><span>平均停留时长</span><b>{{ overview.avgStayMinutes }} min</b></div>
        <div class="metric-row"><span>线索转化率</span><b>{{ overview.leadConversionRate }}%</b></div>
        <div class="metric-row"><span>热门内容</span><b class="ellipsis">{{ overview.hotContentTitle || '-' }}</b></div>
      </div>

      <div class="card panel traffic-panel">
        <div class="panel-header">
          <span class="panel-title">流量来源统计</span>
          <div class="traffic-tools">
            <span class="muted">天数</span>
            <el-input-number v-model="days" :min="1" :max="90" :step="1" size="small" />
            <el-button size="small" @click="loadTraffic">刷新</el-button>
          </div>
        </div>
        <div class="metric-row total-row"><span>去重总人数</span><b>{{ traffic.total }}</b></div>
        <div v-for="item in traffic.sources" :key="item.sourceChannel" class="traffic-row">
          <div class="traffic-row-head">
            <span class="source-name">
              <i class="dot" :class="`dot-${item.sourceChannel}`"></i>
              {{ item.label }}
            </span>
            <span>{{ item.count }} 人 · {{ (item.ratio * 100).toFixed(1) }}%</span>
          </div>
          <el-progress :percentage="Number((item.ratio * 100).toFixed(1))" :stroke-width="10" :show-text="false" />
        </div>
      </div>

      <div v-if="!uiFeatureStore.hideOrderUi" class="card panel">
        <div class="panel-header">
          <span class="panel-title">最近订单</span>
          <el-button type="primary" link @click="$router.push('/orders')">查看全部</el-button>
        </div>
        <div v-for="(order, idx) in recentOrders" :key="order.id" class="line-item">
          <span class="line-left"><em>{{ idx + 1 }}</em>{{ order.orderNo }} / {{ order.customerName }}</span>
          <span class="line-right">{{ order.payableAmountLabel }}</span>
        </div>
      </div>

      <div class="card panel">
        <div class="panel-header">
          <span class="panel-title">最近客户</span>
          <el-button type="primary" link @click="$router.push('/console/recent-customers')">查看全部</el-button>
        </div>
        <div v-for="(user, idx) in recentUsers" :key="user.uid" class="line-item">
          <span class="line-left user-left">
            <em>{{ idx + 1 }}</em>
            <span class="user-block">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-meta">
                UID: {{ user.uid }}
                <el-tooltip content="复制 UID" placement="top">
                  <el-button
                    link
                    :icon="CopyDocument"
                    class="copy-uid-btn"
                    @click.stop="copyText(user.uid)"
                  />
                </el-tooltip>
                <span class="phone-inline">{{ user.phone || '-' }}</span>
                <el-icon
                  v-if="user.phone && user.phone !== '-'"
                  class="reveal-icon"
                  @click.stop="togglePhone(user)"
                >
                  <View v-if="user.phone.includes('*')" />
                  <Hide v-else />
                </el-icon>
              </span>
            </span>
          </span>
          <span class="line-right">{{ user.tags.slice(0, 2).map(getTagName).join(' / ') || '暂无标签' }}</span>
        </div>
      </div>

      <div class="card panel content-panel" :class="{ 'content-panel-all-hidden': isAllBusinessHidden }">
        <div class="panel-title">内容统计</div>
        <div class="content-stats" :class="{ 'content-stats-quad': isAllBusinessHidden }">
          <div class="stat-box"><b>{{ contentStats.articles }}</b><span>文章</span></div>
          <div class="stat-box"><b>{{ contentStats.banners }}</b><span>Banner</span></div>
          <div class="stat-box"><b>{{ contentStats.magazines }}</b><span>杂志</span></div>
          <div class="stat-box"><b>{{ contentStats.suites }}</b><span>套餐</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { CopyDocument, Document, Hide, Money, User, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getCustomers, getDashboardOverview } from '@/api/modules/auth'
import { getTrafficSources } from '@/api/modules/admin-console'
import { getArticles } from '@/api/modules/content'
import { getBanners, getMagazines, getSuites } from '@/api/modules/media'
import { getOrders } from '@/api/modules/order'
import { getCustomerPhone } from '@/api/modules/customer-profile'
import type { Customer, Order } from '@/types'
import { useUiFeatureStore } from '@/stores/ui-feature'

const uiFeatureStore = useUiFeatureStore()

const overview = ref({
  activeCustomers: 0,
  todayVisits: 0,
  orderCount: 0,
  revenue: 0,
  revenueLabel: '0',
  avgStayMinutes: 0,
  leadConversionRate: 0,
  hotContentTitle: '-'
})

const recentOrders = ref<Order[]>([])
const recentUsers = ref<Customer[]>([])
const contentStats = ref({ articles: 0, banners: 0, magazines: 0, suites: 0 })
const days = ref(7)
const traffic = reactive({ total: 0, sources: [] as Array<{ sourceChannel: string; label: string; count: number; ratio: number }> })
const updatedAt = ref(new Date())
const maskedPhoneMap = new Map<string, string>()

const updatedAtText = computed(() => {
  const d = updatedAt.value
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
})

async function loadBase() {
  const [overviewRes, userRes, articleRes, bannerRes, magazineRes, suiteRes] = await Promise.all([
    getDashboardOverview(),
    getCustomers({ page: 1, pageSize: 5 }),
    getArticles({ page: 1, pageSize: 1 }),
    getBanners(),
    getMagazines(),
    getSuites()
  ])

  overview.value = overviewRes.data
  if (uiFeatureStore.hideOrderUi) {
    recentOrders.value = []
  } else {
    const orderRes = await getOrders({ page: 1, pageSize: 5 })
    recentOrders.value = orderRes.data.list
  }
  recentUsers.value = userRes.data.list
  contentStats.value = {
    articles: articleRes.data.total,
    banners: bannerRes.data.length,
    magazines: magazineRes.data.length,
    suites: suiteRes.data.length
  }
}

async function loadTraffic() {
  const res = await getTrafficSources(days.value)
  traffic.total = res.data.total
  traffic.sources = res.data.sources
  updatedAt.value = new Date()
}

function getTagName(tag: Customer['tags'][number]) {
  if (typeof tag === 'string') return tag
  return tag.tagName || tag.name || tag.tagCode || tag.code || ''
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

const statColumnCount = computed(() => {
  let count = 2
  if (!uiFeatureStore.hideOrderUi) count += 1
  if (!uiFeatureStore.hideRevenueUi) count += 1
  return Math.max(1, Math.min(4, count))
})

const isAllBusinessHidden = computed(() => (
  uiFeatureStore.hideRevenueUi && uiFeatureStore.hideOrderUi && uiFeatureStore.hideCouponUi
))

onMounted(async () => {
  await Promise.all([loadBase(), loadTraffic()])
})
</script>

<style scoped lang="scss">
.dashboard-page { --panel-radius: 14px; }
.sub-title { margin-top: 4px; color: #6b7280; font-size: 13px; }
.today-chip { padding: 6px 10px; border-radius: 999px; background: #eef2ff; color: #374151; font-size: 12px; }

.stat-grid {
  display: grid;
  grid-template-columns: repeat(var(--stat-columns, 4), minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.grid-two {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 16px;
  border-radius: var(--panel-radius);
  border: 1px solid #e5e7eb;
}
.stat-top { display: flex; justify-content: space-between; align-items: center; }
.stat-top .el-icon { font-size: 18px; opacity: 0.85; }
.stat-label { color: #6b7280; font-size: 13px; }
.stat-value { font-size: 28px; font-weight: 700; color: #111827; margin-top: 8px; }
.stat-blue { background: linear-gradient(180deg, #eff6ff, #ffffff); }
.stat-cyan { background: linear-gradient(180deg, #ecfeff, #ffffff); }
.stat-amber { background: linear-gradient(180deg, #fffbeb, #ffffff); }
.stat-emerald { background: linear-gradient(180deg, #ecfdf5, #ffffff); }

.panel {
  padding: 16px;
  border-radius: var(--panel-radius);
  border: 1px solid #e5e7eb;
}
.panel-title { font-size: 16px; font-weight: 600; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 8px; }
.metric-row,
.line-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}
.metric-row:last-child,
.line-item:last-child { border-bottom: none; }

.traffic-tools { display: flex; align-items: center; gap: 6px; }
.muted { color: #6b7280; font-size: 12px; }
.total-row { margin-bottom: 6px; }
.traffic-row { margin: 12px 0; }
.traffic-row-head { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #4b5563; }
.source-name { display: inline-flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot-mini_search { background: #3b82f6; }
.dot-friend_share { background: #10b981; }
.dot-ai_transfer { background: #f59e0b; }
.dot-other { background: #94a3b8; }

.line-left { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
.user-left { align-items: flex-start; }
.user-block { display: flex; flex-direction: column; min-width: 0; }
.user-name { font-weight: 500; }
.user-meta { display: inline-flex; align-items: center; gap: 6px; color: #6b7280; font-size: 12px; }
.phone-inline { font-family: 'Roboto Mono', 'Courier New', Courier, monospace; }
.copy-uid-btn {
  padding: 0;
  height: auto;
  color: #9aa3b2;
}
.reveal-icon {
  cursor: pointer;
  color: #409eff;
  font-size: 14px;
}
.line-left em {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4f46e5;
  font-style: normal;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.line-right { color: #374151; font-weight: 500; }

.content-panel { grid-column: span 2; }
.content-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
.content-panel-all-hidden { grid-column: auto; }
.content-stats-quad { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.stat-box {
  text-align: center;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #fbfdff;
  padding: 12px 8px;
}
.content-stats b { display: block; font-size: 24px; }
.content-stats span { color: #6b7280; font-size: 13px; }

.ellipsis {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
}

@media (max-width: 1200px) {
  .content-panel { grid-column: auto; }
}

@media (max-width: 992px) {
  .stat-grid,
  .grid-two { grid-template-columns: 1fr; }
  .content-panel { grid-column: auto; }
}
</style>
