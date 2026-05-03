import type { DashboardOverview, Customer, Article, Banner, Magazine, Suite, Order, Coupon, Evaluation, Complaint, AdminUser, UserJourney, AnalysisResult } from '@/types'

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ============ 用户相关 ============

export const mockAdminUser: AdminUser = {
  id: 'admin_001',
  username: 'admin',
  name: '管理员',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  role: 'admin',
  permissions: ['*'],
  createdAt: '2026-01-01T00:00:00+08:00',
  lastLoginAt: '2026-04-16T10:00:00+08:00'
}

export async function mockLogin(username: string, password: string) {
  await delay(500)
  if (username === 'admin' && password === 'admin123') {
    return {
      token: 'mock_token_' + Date.now(),
      user: mockAdminUser
    }
  }
  throw new Error('用户名或密码错误')
}

// ============ 仪表盘 ============

export const mockDashboardOverview: DashboardOverview = {
  activeCustomers: 124,
  todayVisits: 89,
  orderCount: 23,
  revenue: 12880000,
  revenueLabel: '¥128,800',
  avgStayMinutes: 12.5,
  leadConversionRate: 42,
  hotContentTitle: '产后28天黄金修复期'
}

// ============ 用户列表 ============

export const mockCustomers: Customer[] = Array.from({ length: 50 }, (_, i) => {
  const manualTotalScore = i % 4 === 0 ? undefined : Math.floor(65 + Math.random() * 30);
  return {
    uid: `user_${String(i + 1).padStart(3, '0')}`,
    name: `${Math.floor(i / 10) + 1}01房间号宝妈`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    phone: `138****${String(1000 + i).slice(-4)}`,
    memberLevel: ['normal', 'gold', 'diamond'][i % 3],
    pregnancyInfo: i % 2 === 0 ? {
      type: 'pregnancy',
      date: '2026-08-15'
    } : undefined,
    tags: i % 3 === 0 ? ['高意向', '套房咨询'] : i % 3 === 1 ? ['产康咨询'] : [],
    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    manualTotalScore,
    manualScoreSnapshot: manualTotalScore ? {
      conversionIntent: manualTotalScore + (i % 5),
      spendingPower: manualTotalScore - (i % 3),
      urgency: manualTotalScore + (i % 2)
    } : undefined
  }
})

export function mockUserJourney(uid: string): UserJourney {
  const paths = [
    {
      path: '文章详情',
      displayName: '文章详情',
      rawPath: '/pages/content/detail',
      eventId: 'E_202604281520001',
      eventType: 'ARTICLE_VIEW',
      pathName: 'Article Detail',
      durationSeconds: 18,
      totalDurationSeconds: 43,
      metadata: {
        articleId: 'A_102',
        title: '产后恢复饮食建议',
        category: 'postpartum'
      },
      context: '浏览文章「产后恢复饮食建议」（分类：postpartum）3次，总停留 43 秒，最长单次 18 秒',
      repeatCount: 3,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      path: '房型详情',
      displayName: '房型详情',
      rawPath: '/pages/suite/detail',
      eventId: 'E_202604281530001',
      eventType: 'PAGE_VIEW',
      pathName: 'Suite Detail',
      metadata: { suiteId: 'luxury' },
      context: '浏览了「套房详情」',
      timestamp: new Date(Date.now() - 3000000).toISOString()
    },
    {
      path: '预约意向',
      displayName: '预约意向',
      eventType: 'APPOINTMENT_INTENT',
      metadata: { intent: 'high', suiteId: 'luxury' },
      context: '表达了高强度的预约意向',
      timestamp: new Date(Date.now() - 2400000).toISOString()
    }
  ]
  return {
    uid,
    paths,
    tags: ['高净值客户', '套房意向强'],
    lastActive: new Date().toISOString()
  }
}

export function mockAnalysisResult(): AnalysisResult {
  return {
    tags: ['高净值客户', '套房意向强', '关注产后康复'],
    summary: '用户通过微信小程序主动探索，对AI咨询功能表现出较高兴趣，但会话浅层，核心需求为“如何选择月子套餐”。'
  }
}

// ============ 文章 ============

export const mockArticles: Article[] = Array.from({ length: 30 }, (_, i) => ({
  id: `article_${String(i + 1).padStart(3, '0')}`,
  title: ['产后28天黄金修复期，你应该知道这些', '新生儿护理全攻略', '科学坐月子的正确姿势', '母乳喂养常见问题解答', '产后塑形指南'][i % 5],
  cover: `https://picsum.photos/seed/${i + 100}/400/300`,
  type: i % 4 === 0 ? 'video' : 'image',
  category: ['pregnancy', 'postpartum', 'parenting', 'nanny'][i % 4],
  categoryLabel: ['孕期', '月子', '育儿', '月嫂'][i % 4],
  author: ['专业营养师', '金牌月嫂', '儿科医生', '产后康复师'][i % 4],
  likes: Math.floor(Math.random() * 1000) + 100,
  views: Math.floor(Math.random() * 10000) + 500,
  status: i < 20 ? 'published' : i < 25 ? 'draft' : 'archived',
  content: '<p>这是文章正文内容...</p>',
  publishedAt: i < 20 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
}))

// ============ 海报 ============

export const mockBanners: Banner[] = [
  {
    id: '1',
    title: '爱儿美：给宝宝的第一份珍贵礼物',
    buttonText: '品牌故事',
    image: 'https://picsum.photos/seed/banner1/800/400',
    detailTitle: '爱儿美品牌故事',
    detailContent: '爱儿美（Ai Er Mei）作为母婴护理行业的领军品牌...',
    sort: 1,
    status: 'active',
    createdAt: '2026-01-01T00:00:00+08:00'
  },
  {
    id: '2',
    title: '尊享至尊套房，开启品质月子之旅',
    buttonText: '立即预约',
    image: 'https://picsum.photos/seed/banner2/800/400',
    detailTitle: '尊享至尊套房',
    detailContent: '85㎡超大空间，全景落地窗...',
    sort: 2,
    status: 'active',
    createdAt: '2026-02-01T00:00:00+08:00'
  },
  {
    id: '3',
    title: '专业产后康复，重塑美丽自信',
    buttonText: '了解更多',
    image: 'https://picsum.photos/seed/banner3/800/400',
    detailTitle: '产后康复服务',
    detailContent: '专业康复团队，科学修复方案...',
    sort: 3,
    status: 'active',
    createdAt: '2026-03-01T00:00:00+08:00'
  }
]

// ============ 杂志 ============

export const mockMagazines: Magazine[] = [
  {
    id: 'mag_1',
    title: 'ECHOES OF HER',
    subtitle: '聆听她的新生之旅',
    cover: 'https://picsum.photos/seed/mag1/400/600',
    author: '爱儿美编辑部',
    content: '<p>杂志正文内容...</p>',
    status: 'published',
    publishedAt: '2026-04-01T10:00:00+08:00',
    createdAt: '2026-03-15T00:00:00+08:00'
  },
  {
    id: 'mag_2',
    title: '新生绽放',
    subtitle: '每一位妈妈的蜕变故事',
    cover: 'https://picsum.photos/seed/mag2/400/600',
    author: '爱儿美编辑部',
    content: '<p>杂志正文内容...</p>',
    status: 'published',
    publishedAt: '2026-03-01T10:00:00+08:00',
    createdAt: '2026-02-15T00:00:00+08:00'
  }
]

// ============ 房型 ============

export const mockSuites: Suite[] = [
  {
    id: 'standard',
    name: '温馨标准房',
    price: 6880000,
    priceLabel: '¥68,800起',
    size: '45㎡',
    features: ['温馨舒适环境', '专业护理团队', '营养月子餐'],
    coverImage: 'https://picsum.photos/seed/suite1/600/400',
    images: ['https://picsum.photos/seed/suite1_1/800/600', 'https://picsum.photos/seed/suite1_2/800/600'],
    description: '温馨舒适的标准房型...',
    facilities: ['24h呼叫系统', '智能马桶', '空气净化器'],
    status: 'active',
    sort: 1
  },
  {
    id: 'deluxe',
    name: '豪华套房',
    price: 9880000,
    priceLabel: '¥98,800起',
    size: '65㎡',
    features: ['独立会客区', '私人管家服务', '定制月子餐'],
    coverImage: 'https://picsum.photos/seed/suite2/600/400',
    images: ['https://picsum.photos/seed/suite2_1/800/600', 'https://picsum.photos/seed/suite2_2/800/600'],
    description: '宽敞豪华的套房...',
    facilities: ['24h呼call系统', '智能马桶', '空气净化器', '专业护理床', '婴儿监护系统'],
    status: 'active',
    sort: 2
  },
  {
    id: 'luxury',
    name: '尊享至尊套房',
    price: 12880000,
    priceLabel: '¥128,800起',
    size: '85㎡',
    features: ['全景落地窗', '私人管家服务', '顶级母婴护理设备'],
    coverImage: 'https://picsum.photos/seed/suite3/600/400',
    images: ['https://picsum.photos/seed/suite3_1/800/600', 'https://picsum.photos/seed/suite3_2/800/600'],
    description: '顶级尊享套房...',
    facilities: ['24h呼叫系统', '智能马桶', '空气净化器', '专业护理床', '婴儿监护系统', '私人影院'],
    status: 'active',
    sort: 3
  }
]

// ============ 订单 ============

export const mockOrders: Order[] = Array.from({ length: 30 }, (_, i) => {
  const suite = mockSuites[i % 3]
  const status = ['pending', 'paid', 'confirmed', 'completed', 'cancelled'][i % 5] as Order['status']
  return {
    id: `order_${String(i + 1).padStart(3, '0')}`,
    orderNo: `AEM${new Date().getFullYear()}${String(i + 1).padStart(6, '0')}`,
    customerId: `user_${String(i + 1).padStart(3, '0')}`,
    customerName: `${Math.floor(i / 10) + 1}01房间号宝妈`,
    customerPhone: `138****${String(1000 + i).slice(-4)}`,
    suiteId: suite.id,
    suiteName: suite.name,
    originalAmount: suite.price,
    discountAmount: i % 3 === 0 ? 50000 : 0,
    payableAmount: suite.price - (i % 3 === 0 ? 50000 : 0),
    payableAmountLabel: `¥${((suite.price - (i % 3 === 0 ? 50000 : 0)) / 100).toLocaleString()}`,
    status,
    paymentMethod: status !== 'pending' && status !== 'cancelled' ? 'wechat' : undefined,
    paidAt: status !== 'pending' && status !== 'cancelled' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    remark: i % 5 === 0 ? '预计下周到店咨询' : undefined
  }
})

// ============ 优惠券 ============

export const mockCoupons: Coupon[] = [
  {
    id: 'coupon_1',
    name: '产后康复代金券',
    value: 50000,
    valueLabel: '¥500',
    minAmount: 500000,
    expiry: '2026-12-31',
    status: 'active',
    usedCount: 23,
    totalCount: 100,
    createdAt: '2026-01-01T00:00:00+08:00'
  },
  {
    id: 'coupon_2',
    name: '新客专享优惠券',
    value: 100000,
    valueLabel: '¥1000',
    minAmount: 1000000,
    expiry: '2026-06-30',
    status: 'active',
    usedCount: 45,
    totalCount: 200,
    createdAt: '2026-01-15T00:00:00+08:00'
  },
  {
    id: 'coupon_3',
    name: '月子餐试吃券',
    value: 20000,
    valueLabel: '¥200',
    expiry: '2026-12-31',
    status: 'active',
    usedCount: 12,
    totalCount: 50,
    createdAt: '2026-02-01T00:00:00+08:00'
  }
]

// ============ 评价 ============

export const mockEvaluations: Evaluation[] = Array.from({ length: 20 }, (_, i) => ({
  id: `eval_${String(i + 1).padStart(3, '0')}`,
  orderId: `order_${String(i + 1).padStart(3, '0')}`,
  customerId: `user_${String(i + 1).padStart(3, '0')}`,
  customerName: i % 3 === 0 ? '匿名用户' : `${Math.floor(i / 10) + 1}01房间号宝妈`,
  score: i % 5 === 0 ? 5 : i % 4 === 0 ? 4 : 5,
  content: i % 3 === 0 ? undefined : ['服务非常好，环境优美，护理专业！', '月子餐很合口味，恢复得很好。', '房间设施齐全，护理人员态度亲切。'][i % 3],
  anonymous: i % 3 === 0,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
}))

// ============ 投诉 ============

export const mockComplaints: Complaint[] = [
  {
    id: 'complaint_1',
    contactName: '张女士',
    phone: '138****8888',
    content: '月子餐口味单一，希望增加菜品种类',
    relatedService: '月子餐',
    complaintType: 'CATERING_SUGGESTION',
    status: 'resolved',
    createdAt: '2026-04-10T10:00:00+08:00'
  },
  {
    id: 'complaint_2',
    contactName: '李女士',
    phone: '139****9999',
    content: '房间空调温度不稳定',
    relatedService: '客房设施',
    complaintType: 'FACILITY_ENVIRONMENT',
    status: 'processing',
    createdAt: '2026-04-15T14:00:00+08:00'
  },
  {
    id: 'complaint_3',
    content: '护士态度需要改善',
    relatedService: '护理服务',
    complaintType: 'SERVICE_QUALITY',
    status: 'pending',
    createdAt: '2026-04-16T09:00:00+08:00'
  }
]

// ============ 账号管理 ============

export const mockAdmins: any[] = [
  {
    id: 'admin_001',
    username: 'admin',
    name: '超级管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin',
    status: 'ENABLED',
    onlineStatus: 'ONLINE',
    permissions: ['*'],
    createdAt: '2026-01-01T10:00:00+08:00',
    updatedAt: '2026-01-01T10:00:00+08:00',
    lastLoginAt: '2026-04-16T10:00:00+08:00',
    lastLoginIp: '127.0.0.1'
  },
  {
    id: 'admin_002',
    username: 'zhang_manager',
    name: '张经理',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
    role: 'admin',
    status: 'ENABLED',
    onlineStatus: 'OFFLINE',
    permissions: ['dashboard.view', 'content.manage'],
    createdAt: '2026-02-15T14:30:00+08:00',
    updatedAt: '2026-02-15T14:30:00+08:00',
    lastLoginAt: '2026-04-15T16:20:00+08:00',
    lastLoginIp: '192.168.1.102'
  }
]

export const mockStaffs: any[] = Array.from({ length: 15 }, (_, i) => ({
  id: `staff_${String(i + 1).padStart(3, '0')}`,
  username: `staff_${i + 1}`,
  name: `员工客服${i + 1}`,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=staff${i}`,
  role: 'staff',
  status: i % 5 === 0 ? 'DISABLED' : 'ENABLED',
  onlineStatus: i % 3 === 0 ? 'ONLINE' : 'OFFLINE',
  permissions: ['employee.portal'],
  createdAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000).toISOString(),
  lastLoginAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
  lastLoginIp: `192.168.2.${100 + i}`
}))

export default {
  mockLogin,
  mockAdminUser,
  mockDashboardOverview,
  mockCustomers,
  mockUserJourney,
  mockAnalysisResult,
  mockArticles,
  mockBanners,
  mockMagazines,
  mockSuites,
  mockOrders,
  mockCoupons,
  mockEvaluations,
  mockComplaints,
  mockAdmins,
  mockStaffs
}
