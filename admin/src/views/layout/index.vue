<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '240px'" class="layout-aside" :class="{ collapsed: isCollapse }">
      <div class="logo">
        <span class="logo-text">AI ER MEI</span>
        <span class="logo-mini">A</span>
      </div>

      <el-menu :default-active="activeMenu" :collapse="isCollapse" :collapse-transition="false" router class="layout-menu">
        <template v-for="item in visibleMenus" :key="item.index">
          <el-sub-menu v-if="item.children?.length" :index="item.index">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.index" :index="child.index">
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.index">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container class="layout-main">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.user?.avatar">{{ userStore.user?.name?.charAt(0) }}</el-avatar>
              <span class="user-name">{{ userStore.user?.name }}</span>
              <el-tag size="small" type="info">{{ userStore.isAdmin ? '管理员' : '员工' }}</el-tag>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item v-if="userStore.isAdmin" command="accounts">账号管理</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  ChatDotRound,
  Checked,
  DataAnalysis,
  DataLine,
  Document,
  DocumentCopy,
  Expand,
  Fold,
  Memo,
  Setting,
  Ticket,
  User
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useUiFeatureStore } from '@/stores/ui-feature'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const uiFeatureStore = useUiFeatureStore()

const isCollapse = ref(false)
const activeMenu = computed(() => route.path)

type MenuNode = {
  index: string
  title: string
  icon: any
  children?: Array<{ index: string; title: string }>
}

const employeeMenus: MenuNode[] = [
  { index: '/dashboard', title: '仪表盘', icon: DataAnalysis },
  { index: '/users', title: '客户管理', icon: User },
  { index: '/orders', title: '订单管理', icon: Document },
  {
    index: '/content',
    title: '内容管理',
    icon: DocumentCopy,
    children: [
      { index: '/content/articles', title: '文章管理' },
      { index: '/content/banners', title: '海报管理' },
      { index: '/content/magazines', title: '杂志管理' },
      { index: '/content/suites', title: '套餐管理' },
      { index: '/content/facilities', title: '设施管理' },
      { index: '/content/preset-questions', title: '预设问题' }
    ]
  },
  {
    index: '/service',
    title: '服务配置',
    icon: Setting,
    children: [
      { index: '/service/postpartum-services', title: '产后服务' },
      { index: '/service/faq', title: 'FAQ管理' },
      { index: '/service/hotline', title: '热线管理' },
      { index: '/service/center', title: '中心配置' }
    ]
  },
  { index: '/coupons', title: '优惠券管理', icon: Ticket },
  { index: '/feedback', title: '反馈管理', icon: ChatDotRound }
]

const adminMenus: MenuNode[] = [
  { index: '/console/dashboard', title: '仪表盘', icon: DataAnalysis },
  { index: '/console/approvals', title: '标签审批池', icon: Checked },
  {
    index: '/console/scoring-config',
    title: '评分配置',
    icon: DataLine,
    children: [
      { index: '/console/scoring', title: '评分权重' },
      { index: '/console/decay', title: '衰减参数' },
      { index: '/console/scoring-logs', title: '操作日志' }
    ]
  },
  { index: '/console/dictionary', title: '字典管理', icon: Memo }
]

const visibleMenus = computed(() => {
  if (userStore.isAdmin) {
    return adminMenus
  }
  return employeeMenus.filter((item) => {
    if (item.index === '/orders') {
      return !uiFeatureStore.hideOrderUi
    }
    if (item.index === '/coupons') {
      return !uiFeatureStore.hideCouponUi
    }
    return true
  })
})

function handleCommand(command: string) {
  if (command === 'profile') {
    router.push({ name: 'Profile' })
  } else if (command === 'accounts') {
    router.push({ name: 'AccountManagement' })
  } else if (command === 'logout') {
    ElMessageBox.confirm('确认退出登录吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push({ name: 'Login' })
    }).catch(() => {})
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.layout-aside {
  background: #111827;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.logo-text,
.logo-mini {
  position: absolute;
  transition: opacity 0.3s ease;
}

.layout-aside:not(.collapsed) .logo-text,
.layout-aside.collapsed .logo-mini {
  opacity: 1;
}

.layout-aside:not(.collapsed) .logo-mini,
.layout-aside.collapsed .logo-text {
  opacity: 0;
}

.layout-menu {
  border-right: none;
  background: #111827 !important;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  /* Hide scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.layout-menu :deep(.el-menu) {
  background: #111827 !important;
  border-right: none !important;
}

.layout-menu:not(.el-menu--collapse) {
  width: 240px;
}

.layout-menu :deep(.el-menu-item),
.layout-menu :deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.72) !important;
  height: 48px;
  line-height: 48px;
  border-left: 3px solid transparent;
}

.layout-menu :deep(.el-menu-item:not(.is-active)),
.layout-menu :deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.72) !important;
}

.layout-menu :deep(.el-menu-item:hover),
.layout-menu :deep(.el-sub-menu__title:hover) {
  color: #fff !important;
  background-color: rgba(255, 255, 255, 0.08) !important;
}

.layout-menu :deep(.el-menu-item.is-active) {
  color: #fff !important;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)) !important;
  border-left-color: #93c5fd;
  font-weight: 600;
}

.layout-menu :deep(.el-sub-menu .el-menu) {
  background: #151b27 !important;
}

.layout-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 50px !important;
  min-width: auto;
  color: rgba(255, 255, 255, 0.72) !important;
  border-left: 3px solid transparent;
}

.layout-menu :deep(.el-sub-menu .el-menu-item:hover) {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.08) !important;
}

.layout-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  color: #fff !important;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)) !important;
  border-left-color: #93c5fd;
  font-weight: 600;
}

.layout-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #fff !important;
  background-color: rgba(255, 255, 255, 0.08) !important;
}

.layout-main {
  background: #f5f5f0;
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
}

.user-info:hover {
  background: rgba(17, 24, 39, 0.04);
}

.layout-content {
  padding: 24px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
