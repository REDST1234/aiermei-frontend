<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h1 class="page-title">仪表盘</h1>
    </div>

    <div class="stat-grid" :style="{ '--stat-columns': statColumnCount }">
      <div class="card stat-card">
        <div class="stat-label">活跃客户</div>
        <div class="stat-value">{{ overview.activeCustomers }}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">今日访问</div>
        <div class="stat-value">{{ overview.todayVisits }}</div>
      </div>
      <div v-if="!uiFeatureStore.hideOrderUi" class="card stat-card">
        <div class="stat-label">订单数</div>
        <div class="stat-value">{{ overview.orderCount }}</div>
      </div>
      <div v-if="!uiFeatureStore.hideRevenueUi" class="card stat-card">
        <div class="stat-label">营收</div>
        <div class="stat-value">{{ overview.revenueLabel }}</div>
      </div>
    </div>

    <div class="grid-two">
      <div class="card panel">
        <div class="panel-title">用户洞察</div>
        <div class="metric-row"><span>平均停留时长</span><b>{{ overview.avgStayMinutes }} min</b></div>
        <div class="metric-row"><span>线索转化率</span><b>{{ overview.leadConversionRate }}%</b></div>
        <div class="metric-row"><span>热门内容</span><b>{{ overview.hotContentTitle || '-' }}</b></div>
      </div>

      <div v-if="!uiFeatureStore.hideOrderUi" class="card panel">
        <div class="panel-header">
          <span class="panel-title">最近订单</span>
          <el-button type="primary" link @click="$router.push('/orders')">查看全部</el-button>
        </div>
        <div v-for="order in recentOrders" :key="order.id" class="line-item">
          <span>{{ order.orderNo }} / {{ order.customerName }}</span>
          <span>{{ order.payableAmountLabel }}</span>
        </div>
      </div>

      <div class="card panel">
        <div class="panel-header">
          <span class="panel-title">最近客户</span>
          <el-button type="primary" link @click="$router.push('/users')">查看全部</el-button>
        </div>
        <div v-for="user in recentUsers" :key="user.uid" class="line-item">
          <span>{{ user.name }}</span>
          <span>{{ user.tags.slice(0, 2).map(getTagName).join(' / ') }}</span>
        </div>
      </div>

      <div class="card panel">
        <div class="panel-title">内容统计</div>
        <div class="content-stats">
          <div><b>{{ contentStats.articles }}</b><span>文章</span></div>
          <div><b>{{ contentStats.banners }}</b><span>Banner</span></div>
          <div><b>{{ contentStats.magazines }}</b><span>杂志</span></div>
          <div><b>{{ contentStats.suites }}</b><span>套餐</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getCustomers, getDashboardOverview } from '@/api/modules/auth'
import { getArticles } from '@/api/modules/content'
import { getBanners, getMagazines, getSuites } from '@/api/modules/media'
import { getOrders } from '@/api/modules/order'
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
const contentStats = ref({
  articles: 0,
  banners: 0,
  magazines: 0,
  suites: 0
})

async function loadDashboard() {
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

const statColumnCount = computed(() => {
  let count = 2
  if (!uiFeatureStore.hideOrderUi) count += 1
  if (!uiFeatureStore.hideRevenueUi) count += 1
  return Math.max(1, Math.min(4, count))
})

onMounted(() => {
  void loadDashboard()
})

function getTagName(tag: Customer['tags'][number]) {
  if (typeof tag === 'string') return tag
  return tag.tagName || tag.name || tag.tagCode || tag.code || ''
}
</script>

<style scoped lang="scss">
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
}

.stat-label {
  color: #6b7280;
  font-size: 13px;
}

.stat-value {
  font-size: 26px;
  font-weight: 600;
  color: #111827;
}

.panel {
  padding: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.metric-row,
.line-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.metric-row:last-child,
.line-item:last-child {
  border-bottom: none;
}

.content-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 12px;
  text-align: center;
}

.content-stats b {
  display: block;
  font-size: 24px;
}

.content-stats span {
  color: #6b7280;
  font-size: 13px;
}

@media (max-width: 992px) {
  .stat-grid,
  .grid-two {
    grid-template-columns: 1fr;
  }
}
</style>
