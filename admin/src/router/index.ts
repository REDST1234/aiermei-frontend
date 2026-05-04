import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUiFeatureStore } from '@/stores/ui-feature'

const employeeChildren: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: { title: '仪表盘', icon: 'DataAnalysis', roles: ['editor', 'viewer', 'staff'] }
  },
  {
    path: 'users',
    name: 'Users',
    component: () => import('@/views/users/index.vue'),
    meta: { title: '客户管理', icon: 'User', roles: ['editor', 'viewer', 'staff'] }
  },
  {
    path: 'orders',
    name: 'Orders',
    component: () => import('@/views/orders/index.vue'),
    meta: { title: '订单管理', icon: 'Document', roles: ['editor', 'viewer', 'staff'] }
  },
  {
    path: 'content',
    name: 'Content',
    redirect: '/content/articles',
    meta: { title: '内容管理', icon: 'DocumentCopy', roles: ['editor', 'viewer', 'staff'] },
    children: [
      {
        path: 'articles',
        name: 'Articles',
        component: () => import('@/views/content/articles.vue'),
        meta: { title: '文章管理', roles: ['editor', 'viewer', 'staff'] }
      },
      {
        path: 'banners',
        name: 'Banners',
        component: () => import('@/views/content/banners.vue'),
        meta: { title: '海报管理', roles: ['editor', 'viewer', 'staff'] }
      },
      {
        path: 'magazines',
        name: 'Magazines',
        component: () => import('@/views/content/magazines.vue'),
        meta: { title: '杂志管理', roles: ['editor', 'viewer', 'staff'] }
      },
      {
        path: 'suites',
        name: 'Suites',
        component: () => import('@/views/content/suites.vue'),
        meta: { title: '套餐管理', roles: ['editor', 'viewer', 'staff'] }
      },
      {
        path: 'facilities',
        name: 'Facilities',
        component: () => import('@/views/content/facilities.vue'),
        meta: { title: '设施管理', roles: ['editor', 'viewer', 'staff'] }
      },
      {
        path: 'preset-questions',
        name: 'PresetQuestions',
        component: () => import('@/views/content/preset-questions.vue'),
        meta: { title: '预设问题', roles: ['editor', 'viewer', 'staff'] }
      }
    ]
  },
  {
    path: 'service',
    name: 'Service',
    redirect: '/service/faq',
    meta: { title: '服务配置', icon: 'Setting', roles: ['editor', 'viewer', 'staff'] },
    children: [
      {
        path: 'faq',
        name: 'FaqAdmin',
        component: () => import('@/views/service/faq.vue'),
        meta: { title: 'FAQ管理', roles: ['editor', 'viewer', 'staff'] }
      },
      {
        path: 'hotline',
        name: 'HotlineAdmin',
        component: () => import('@/views/service/hotline.vue'),
        meta: { title: '热线管理', roles: ['editor', 'viewer', 'staff'] }
      },
      {
        path: 'center',
        name: 'CenterAdmin',
        component: () => import('@/views/service/center.vue'),
        meta: { title: '中心配置', roles: ['editor', 'viewer', 'staff'] }
      },
      {
        path: 'postpartum-services',
        name: 'PostpartumServices',
        component: () => import('@/views/service/postpartum-services.vue'),
        meta: { title: '产后服务', roles: ['editor', 'viewer', 'staff'] }
      }
    ]
  },
  {
    path: 'coupons',
    name: 'Coupons',
    component: () => import('@/views/content/coupons.vue'),
    meta: { title: '优惠券管理', icon: 'Ticket', roles: ['editor', 'viewer', 'staff'] }
  },
  {
    path: 'feedback',
    name: 'Feedback',
    component: () => import('@/views/content/feedback.vue'),
    meta: { title: '反馈管理', icon: 'ChatDotRound', roles: ['editor', 'viewer', 'staff'] }
  }
]

const adminChildren: RouteRecordRaw[] = [
  {
    path: 'console/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/console/dashboard.vue'),
    meta: { title: '仪表盘', icon: 'DataAnalysis', roles: ['admin'] }
  },
  {
    path: 'console/recent-customers',
    name: 'AdminRecentCustomers',
    component: () => import('@/views/console/recent-customers.vue'),
    meta: { title: '最近客户', icon: 'User', roles: ['admin'] }
  },
  {
    path: 'console/approvals',
    name: 'TagApprovals',
    component: () => import('@/views/console/tag-approvals.vue'),
    meta: { title: '标签审批池', icon: 'Checked', roles: ['admin'] }
  },
  {
    path: 'console/scoring',
    name: 'ScoringWeights',
    component: () => import('@/views/console/scoring-weights.vue'),
    meta: { title: '评分权重', icon: 'DataLine', roles: ['admin'] }
  },
  {
    path: 'console/decay',
    name: 'DecayConfig',
    component: () => import('@/views/console/decay-config.vue'),
    meta: { title: '衰减参数', icon: 'TrendCharts', roles: ['admin'] }
  },
  {
    path: 'console/dictionary',
    name: 'TagDictionary',
    component: () => import('@/views/console/dictionary.vue'),
    meta: { title: '字典管理', icon: 'Memo', roles: ['admin'] }
  },
  {
    path: 'console/accounts',
    name: 'AccountManagement',
    component: () => import('@/views/console/accounts/index.vue'),
    meta: { title: '账号管理', icon: 'UserFilled', roles: ['admin'] }
  }
]

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/views/layout/index.vue'),
    meta: { requiresAuth: true },
    children: [
      ...employeeChildren,
      ...adminChildren,
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人设置', roles: ['admin', 'editor', 'viewer', 'staff'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function isAdminPath(path: string) {
  return path.startsWith('/console/')
}

function resolveBlockedFeatureRedirect(isAdmin: boolean) {
  return isAdmin ? { name: 'AdminDashboard' } : { name: 'Dashboard' }
}

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '管理后台'} - 爱儿美月子中心`

  const userStore = useUserStore()
  const uiFeatureStore = useUiFeatureStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.name === 'Login' && userStore.isLoggedIn) {
    next(userStore.isAdmin ? { name: 'AdminDashboard' } : { name: 'Dashboard' })
    return
  }

  if (!requiresAuth) {
    next()
    return
  }

  if (to.path === '/') {
    next(userStore.isAdmin ? { name: 'AdminDashboard' } : { name: 'Dashboard' })
    return
  }

  if (userStore.isAdmin && !isAdminPath(to.path) && to.path !== '/profile') {
    next({ name: 'AdminDashboard' })
    return
  }

  if (userStore.isEmployee && isAdminPath(to.path)) {
    next({ name: 'Dashboard' })
    return
  }

  if (to.path === '/orders' && uiFeatureStore.hideOrderUi) {
    next(resolveBlockedFeatureRedirect(userStore.isAdmin))
    return
  }

  if (to.path === '/coupons' && uiFeatureStore.hideCouponUi) {
    next(resolveBlockedFeatureRedirect(userStore.isAdmin))
    return
  }

  next()
})

export default router
