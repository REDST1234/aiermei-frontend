import instance from '../api/request'
import {
  mockAdminUser,
  mockAnalysisResult,
  mockArticles,
  mockBanners,
  mockComplaints,
  mockCoupons,
  mockCustomers,
  mockDashboardOverview,
  mockEvaluations,
  mockMagazines,
  mockOrders,
  mockSuites,
  mockUserJourney,
  mockStaffs,
  mockAdmins
} from './data'

type AnyObj = Record<string, any>

type ApiResp<T = any> = {
  code: number
  message: string
  data: T
  requestId: string
  timestamp: string
}

const state = {
  articles: [...mockArticles] as AnyObj[],
  banners: [...mockBanners] as AnyObj[],
  magazines: [...mockMagazines] as AnyObj[],
  suites: [...mockSuites] as AnyObj[],
  orders: [...mockOrders] as AnyObj[],
  coupons: [...mockCoupons] as AnyObj[],
  evaluations: [...mockEvaluations] as AnyObj[],
  complaints: [...mockComplaints] as AnyObj[],
  customers: [...mockCustomers] as AnyObj[],
  admins: [...mockAdmins] as AnyObj[],
  staffs: [...mockStaffs] as AnyObj[],
  contentCategories: [
    { id: 'pregnancy', label: '孕期', sort: 1 },
    { id: 'postpartum', label: '产后', sort: 2 },
    { id: 'parenting', label: '育儿', sort: 3 },
    { id: 'nanny', label: '月嫂', sort: 4 }
  ] as AnyObj[],
  faqCategories: [
    { id: 'faq_cat_1', name: '入住须知', sort: 1, createdAt: new Date().toISOString() },
    { id: 'faq_cat_2', name: '产后护理', sort: 2, createdAt: new Date().toISOString() }
  ] as AnyObj[],
  faqItems: [
    {
      id: 'faq_item_1',
      categoryId: 'faq_cat_1',
      title: '可以提前看房吗？',
      content: '支持预约看房。',
      sort: 1,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'faq_item_2',
      categoryId: 'faq_cat_2',
      title: '母乳指导包含哪些内容？',
      content: '包括姿势、频率、常见问题处理。',
      sort: 2,
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ] as AnyObj[],
  hotlineConfig: {
    serviceQrCodeUrl: 'https://picsum.photos/seed/service_qr/300/300',
    serviceQrTips: '添加客服微信了解详情',
    hotlines: [
      { id: 'hotline_1', label: '客服热线', number: '400-800-1234', sort: 1, status: 'active' },
      { id: 'hotline_2', label: '夜间值班', number: '400-800-5678', sort: 2, status: 'active' }
    ]
  } as AnyObj,
  centerHome: {
    heroImage: 'https://picsum.photos/seed/center_hero/1200/500',
    brandTitle: '爱儿美月子中心',
    brandSubtitle: '专业产后康复与新生儿照护',
    facilities: [
      { id: 'facility_1', title: '护理站', desc: '24小时护士值班', image: 'https://picsum.photos/seed/f1/400/240', sort: 1 },
      { id: 'facility_2', title: '月子餐', desc: '营养师定制', image: 'https://picsum.photos/seed/f2/400/240', sort: 2 }
    ]
  } as AnyObj,
  centerSections: [
    {
      id: 'section_1',
      title: '产后修复中心',
      desc: '个性化修复方案',
      coverImage: 'https://picsum.photos/seed/s1/600/320',
      detailImage: 'https://picsum.photos/seed/s1d/1200/800',
      sort: 1,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'section_2',
      title: '新生儿照护专区',
      desc: '科学护理与早教支持',
      coverImage: 'https://picsum.photos/seed/s2/600/320',
      detailImage: 'https://picsum.photos/seed/s2d/1200/800',
      sort: 2,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] as AnyObj[],
  articleTags: new Map<string, AnyObj[]>(),
  tagPending: [
    {
      pendingId: '205001',
      tagCode: 'auto_1177456945',
      tagName: '新手妈妈焦虑',
      aiReason: '近7天多条咨询内容体现明显焦虑情绪，建议作为新标签审批',
      similarTag: '产后情绪支持',
      similarity: 0.62122,
      mentionCount: 8,
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      status: 'PENDING',
      candidateCount: 2,
      reviewedBy: null,
      reviewedAt: null,
      reviewAction: null,
      mergedToTagCode: null,
      candidates: [
        { tagCode: 'postpartum_emotion_support', tagName: '产后情绪支持', similarity: 0.62122, rankNo: 1 },
        { tagCode: 'new_mother_anxiety', tagName: '新手妈妈焦虑', similarity: 0.59012, rankNo: 2 }
      ]
    }
  ] as AnyObj[],
  scoringWeights: {
    conversionIntent: 50,
    spendingPower: 30,
    recentActivity: 20,
    total: 100,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin_001'
  } as AnyObj,
  decayConfig: [
    { eventType: 'PAGE_VIEW', eventLabel: '页面浏览', initialWeight: 1.0, lambda: 0.03, minWeight: 0.01 },
    { eventType: 'CLICK', eventLabel: '关键点击', initialWeight: 1.2, lambda: 0.028, minWeight: 0.01 },
    { eventType: 'ARTICLE_VIEW', eventLabel: '文章阅读', initialWeight: 1.5, lambda: 0.025, minWeight: 0.01 },
    { eventType: 'AI_CHAT', eventLabel: 'AI咨询', initialWeight: 2.0, lambda: 0.02, minWeight: 0.01 },
    { eventType: 'APPOINTMENT_INTENT', eventLabel: '预约意向', initialWeight: 2.5, lambda: 0.018, minWeight: 0.02 }
  ] as AnyObj[],
  trafficSources: [
    { sourceChannel: 'mini_search', label: '小程序搜索', count: 45, ratio: 0.45 },
    { sourceChannel: 'friend_share', label: '朋友圈分享', count: 32, ratio: 0.32 },
    { sourceChannel: 'ai_transfer', label: 'AI客服转接', count: 23, ratio: 0.23 }
  ] as AnyObj[],
  centerFacilities: [
    { id: '205888001', title: '瑜伽康复室', desc: '用于产后拉伸与体态修复课程', image: 'https://picsum.photos/seed/fac_1/600/360', sort: 1 },
    { id: '205888002', title: '婴儿游泳区', desc: '用于宝宝抚触、游泳与早教互动', image: 'https://picsum.photos/seed/fac_2/600/360', sort: 2 }
  ] as AnyObj[],
  customerTagCorrections: [] as AnyObj[],
  customerManualScores: {} as Record<string, AnyObj>,
  presetQuestions: [
    { id: 'pq_1', question: '产后多久可以开始运动？', answer: '建议先评估恢复情况，再循序渐进。', category: 'postpartum', sortNo: 10 },
    { id: 'pq_2', question: '宝宝黄疸怎么办？', answer: '轻微黄疸多喂奶促进排泄，严重请咨询医生。', category: 'parenting', sortNo: 20 }
  ] as AnyObj[],
  postpartumServices: [
    { id: 'ps_1', uid: 'user_001', serviceName: '盆底修复评估', expertName: '王护理师', appointmentTime: '2026-05-10T10:00:00+08:00', durationMinutes: 45, status: 'scheduled' }
  ] as AnyObj[],
  tagDictionary: [
    { tagCode: 'postpartum_recovery', tagName: '产后恢复', description: '产后体能与机能恢复相关标签', status: 'ACTIVE', sortNo: 1, useCount: 125 },
    { tagCode: 'breastfeeding', tagName: '母乳喂养', description: '开奶、催乳及喂养指导相关标签', status: 'ACTIVE', sortNo: 2, useCount: 89 },
    { tagCode: 'newborn_care', tagName: '新生儿护理', description: '婴儿黄疸、睡眠及日常照护相关标签', status: 'ACTIVE', sortNo: 3, useCount: 210 }
  ] as AnyObj[]
}

function now() {
  return new Date().toISOString()
}

function createResponse<T>(config: AnyObj, data: T, code = 0, message = 'ok') {
  return Promise.resolve({
    data: {
      code,
      message,
      data,
      requestId: 'mock',
      timestamp: now()
    } as ApiResp<T>,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {}
  })
}

function parseUrl(url: string) {
  return new URL(url, 'http://mock.local')
}

function parseData(data: any): AnyObj {
  if (!data) return {}
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return {}
    }
  }
  return data
}

function toNumber(v: any, d: number) {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}

function paginate<T>(list: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    list: list.slice(start, end),
    page,
    pageSize,
    total: list.length,
    hasMore: end < list.length
  }
}

function nextId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

function findByPathId(path: string) {
  const seg = path.split('/').filter(Boolean)
  return seg[seg.length - 1] || ''
}

function upsertById<T extends AnyObj>(arr: T[], id: string, patch: AnyObj) {
  const idx = arr.findIndex((item) => item.id === id)
  if (idx < 0) return null
  arr[idx] = { ...arr[idx], ...patch, updatedAt: now() }
  return arr[idx]
}

function removeById<T extends AnyObj>(arr: T[], id: string) {
  const idx = arr.findIndex((item) => item.id === id)
  if (idx >= 0) arr.splice(idx, 1)
}

export function setupMock() {
  const originalAdapter = instance.defaults.adapter

  instance.defaults.adapter = async (config: AnyObj) => {
    const method = String(config.method || 'GET').toUpperCase()
    const rawUrl = String(config.url || '')
    const parsed = parseUrl(rawUrl)
    const path = parsed.pathname
    const query = Object.fromEntries(parsed.searchParams.entries())
    const body = parseData(config.data)

    let normalizedPath = path;
    if (path.startsWith('/api/v1')) {
      normalizedPath = path.replace('/api/v1', '');
    }
    
    if (normalizedPath.startsWith('/staff/')) {
      normalizedPath = normalizedPath.replace('/staff/', '/admin/');
    }

    await new Promise((resolve) => setTimeout(resolve, 120))

    // Auth
    if ((normalizedPath === '/admin/auth/login' || path === '/staff/auth/login') && method === 'POST') {
      const isStaffLogin = path.includes('/staff/')
      const username = String(body.username || '').trim()
      const password = String(body.password || '')
      
      // Mock credentials check
      const isAdminCred = username === 'admin' && password === 'admin123'
      const isStaffCred = username === 'staff' && password === 'staff123'
      
      if (isStaffLogin && !isStaffCred) {
        return createResponse(config, null, 4000, '员工用户名或密码错误')
      }
      if (!isStaffLogin && !isAdminCred) {
        return createResponse(config, null, 4000, '管理员用户名或密码错误')
      }

      return createResponse(config, {
        token: `demo_token_${Date.now()}`,
        principalType: isStaffLogin ? 'STAFF' : 'ADMIN',
        user: {
          ...mockAdminUser,
          username,
          name: isStaffLogin ? '员工客服' : '超级管理员',
          role: isStaffLogin ? 'staff' : 'admin',
          permissions: isStaffLogin ? ['employee.portal'] : ['*'],
          lastLoginAt: now()
        }
      })
    }
    if ((normalizedPath === '/admin/auth/me' || path === '/staff/auth/me') && method === 'GET') {
      return createResponse(config, mockAdminUser)
    }

    if ((normalizedPath === '/admin/auth/me' || path === '/staff/auth/me') && method === 'PUT') {
      return createResponse(config, { ...mockAdminUser, ...body })
    }

    if ((normalizedPath === '/admin/auth/password' || path === '/staff/auth/password') && method === 'PUT') {
      return createResponse(config, null)
    }

    if (normalizedPath === '/admin/auth/logout' && method === 'POST') {
      return createResponse(config, null)
    }

    if (path === '/files/upload' && method === 'POST') {
      const bizType = body.bizType || 'unknown'
      return createResponse(config, {
        fileId: nextId('file'),
        url: `https://picsum.photos/seed/${bizType}_${Date.now()}/800/450`,
        objectKey: `mock/${bizType}/${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
        sizeBytes: 204800,
        bizType,
        uploadedAt: now()
      })
    }
    if (normalizedPath === '/admin/tag-pending' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 20)
      const status = String(query.status || 'PENDING').trim()
      const keyword = String(query.keyword || '').trim()
      let filtered = state.tagPending.filter((item) => !status || item.status === status)
      if (keyword) filtered = filtered.filter((item) => String(item.tagName).includes(keyword) || String(item.tagCode).includes(keyword))
      const mapped = filtered.map((item) => ({ ...item, topCandidate: item.candidates?.[0] || null }))
      return createResponse(config, paginate(mapped, page, pageSize))
    }
    if (normalizedPath.match(/^\/admin\/tag-pending\/[^/]+$/) && method === 'GET') {
      const pendingId = findByPathId(path)
      return createResponse(config, state.tagPending.find((x) => x.pendingId === pendingId) || state.tagPending[0])
    }
    if (normalizedPath.match(/^\/admin\/tag-pending\/[^/]+\/mentions$/) && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 20)
      const list = Array.from({ length: 8 }, (_, idx) => ({
        uid: `20435072062342881${idx}`,
        userName: null,
        articleId: null,
        sourceType: idx % 2 ? 'AI_CHAT' : 'PAGE_VIEW',
        sourceContext: '示例上下文',
        sourceEventId: `17770${idx}`,
        sourceEventType: idx % 2 ? 'AI_CHAT' : 'PAGE_VIEW',
        chatSessionId: idx % 2 ? `chat_${idx}` : null,
        chatMessageId: idx % 2 ? `${Date.now()}${idx}` : null,
        chatMessageSeqNo: idx + 1,
        analysisRecordId: `${Date.now()}${idx}`,
        createdAt: now()
      }))
      return createResponse(config, paginate(list, page, pageSize))
    }
    if (normalizedPath.match(/^\/admin\/tag-pending\/[^/]+\/review$/) && method === 'POST') {
      const pendingId = path.split('/')[3]
      const action = body.action
      const item = state.tagPending.find((x) => x.pendingId === pendingId)
      if (!item || !['APPROVE', 'REJECT', 'MERGE'].includes(action)) return createResponse(config, null, 4000, 'invalid request')
      if (action === 'MERGE' && !body.targetTagCode) return createResponse(config, null, 4000, 'targetTagCode required')
      item.reviewAction = action
      item.status = action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'MERGED'
      item.reviewedAt = now()
      item.reviewedBy = 'admin_001'
      item.mergedToTagCode = action === 'MERGE' ? body.targetTagCode : null
      return createResponse(config, {
        pendingId,
        finalStatus: item.status,
        resolvedTagCode: item.mergedToTagCode || item.tagCode,
        backfilledUserCount: 3,
        removedPendingUserTagCount: 3
      })
    }
    if (normalizedPath === '/admin/scoring-weights' && method === 'GET') {
      return createResponse(config, state.scoringWeights)
    }
    if (normalizedPath === '/admin/scoring-weights' && method === 'PUT') {
      const conversionIntent = Number(body.conversionIntent)
      const spendingPower = Number(body.spendingPower)
      const recentActivity = Number(body.recentActivity)
      const total = conversionIntent + spendingPower + recentActivity
      if ([conversionIntent, spendingPower, recentActivity].some((v) => !Number.isInteger(v) || v < 0 || v > 100) || total !== 100) {
        return createResponse(config, null, 4000, 'weights invalid')
      }
      state.scoringWeights = { conversionIntent, spendingPower, recentActivity, total, updatedAt: now(), updatedBy: 'admin_001' }
      return createResponse(config, state.scoringWeights)
    }
    if (normalizedPath === '/admin/decay-config' && method === 'GET') {
      return createResponse(config, state.decayConfig)
    }
    if (normalizedPath.match(/^\/admin\/decay-config\/[^/]+$/) && method === 'PUT') {
      const eventType = findByPathId(path)
      const target = state.decayConfig.find((x) => x.eventType === eventType)
      if (!target) return createResponse(config, null, 4000, 'eventType not found')
      ;['initialWeight', 'lambda', 'minWeight'].forEach((key) => {
        if (body[key] !== undefined) target[key] = Number(body[key])
      })
      return createResponse(config, target)
    }
    if (normalizedPath === '/admin/dashboard/traffic-sources' && method === 'GET') {
      const days = Math.max(1, Math.min(90, toNumber(query.days, 7)))
      const total = state.trafficSources.reduce((acc, item) => acc + Number(item.count), 0)
      const sources = state.trafficSources.map((item) => ({ ...item, ratio: total ? item.count / total : 0 }))
      return createResponse(config, { days, total, sources })
    }
    if (normalizedPath === '/admin/centers/facilities' && method === 'GET') {
      return createResponse(config, [...state.centerFacilities].sort((a, b) => a.sort - b.sort))
    }
    if (normalizedPath === '/admin/centers/facilities' && method === 'POST') {
      if (!String(body.title || '').trim()) return createResponse(config, null, 4000, 'title required')
      const item = { id: nextId('facility'), ...body }
      state.centerFacilities.push(item)
      return createResponse(config, item)
    }
    if (normalizedPath.match(/^\/admin\/centers\/facilities\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const idx = state.centerFacilities.findIndex((x) => x.id === id)
      if (idx < 0) return createResponse(config, null, 4004, 'facility not found')
      if (body.title !== undefined && !String(body.title).trim()) return createResponse(config, null, 4000, 'title required')
      state.centerFacilities[idx] = { ...state.centerFacilities[idx], ...body }
      return createResponse(config, state.centerFacilities[idx])
    }
    if (normalizedPath.match(/^\/admin\/centers\/facilities\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      const idx = state.centerFacilities.findIndex((x) => x.id === id)
      if (idx < 0) return createResponse(config, null, 4004, 'facility not found')
      state.centerFacilities.splice(idx, 1)
      return createResponse(config, null)
    }    // Dashboard
    if (normalizedPath === '/admin/dashboard/overview' && method === 'GET') {
      return createResponse(config, {
        ...mockDashboardOverview,
        orderCount: state.orders.length,
        hotContentTitle: state.articles[0]?.title || mockDashboardOverview.hotContentTitle
      })
    }

    // Customers + Analytics
    if (normalizedPath === '/admin/customers' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const keyword = (query.keyword || '').trim()
      const list = keyword
        ? state.customers.filter((u) => String(u.name).includes(keyword) || String(u.phone || '').includes(keyword))
        : state.customers
      return createResponse(config, paginate(list, page, pageSize))
    }

    
    if (normalizedPath.match(/^\/admin\/customers\/[^/]+\/phone$/) && method === 'GET') {
      const uid = path.split('/')[3]
      const customer = state.customers.find((x) => x.uid === uid)
      const lastFour = uid.slice(-4).padStart(4, '0')
      return createResponse(config, {
        uid,
        phone: `1398888${lastFour}`,
        maskedPhone: customer?.phone || `139****${lastFour}`,
        viewedAt: now()
      })
    }

    if (normalizedPath.match(/^\/admin\/customers\/[^/]+\/tags$/) && method === 'GET') {
      const uid = path.split('/')[3]
      const customer = state.customers.find((x) => x.uid === uid)
      const tags = Array.isArray(customer?.tags) ? customer.tags : []
      const normalized = tags.map((tag: AnyObj, idx: number) => {
        const decay = Number((80 + Math.random() * 15).toFixed(1))
        if (typeof tag === 'string') {
          return {
            tagCode: `legacy_${idx}_${tag}`,
            tagName: tag,
            source: 'AI',
            confidence: 0.72,
            decayPercent: decay,
            createdAt: now(),
            evidenceCount: 1
          }
        }
        return {
          tagCode: tag.tagCode || tag.code || `tag_${idx}`,
          tagName: tag.tagName || tag.name || `标签${idx + 1}`,
          source: tag.source || 'AI',
          confidence: tag.confidence ?? 0.72,
          decayPercent: tag.decayPercent ?? decay,
          createdAt: tag.createdAt || now(),
          evidenceCount: tag.evidenceCount ?? 1
        }
      })
      return createResponse(config, normalized)
    }

    if (normalizedPath.match(/^\/admin\/customers\/[^/]+\/tags$/) && method === 'POST') {
      const uid = path.split('/')[3]
      const customer = state.customers.find((x) => x.uid === uid)
      if (!customer) return createResponse(config, null, 4004, 'customer not found')
      const tagName = String(body.tagName || '').trim()
      if (!tagName) return createResponse(config, null, 4000, 'tagName required')
      const tagCode = `manual_${Date.now()}`
      const tagObj = { tagCode, tagName, source: 'MANUAL', confidence: 1, decayPercent: 100.0 }
      customer.tags = customer.tags || []
      customer.tags.push(tagObj)
      state.customerTagCorrections.unshift({
        id: nextId('corr'),
        uid,
        action: 'ADD',
        tagCode,
        tagName,
        reason: String(body.reason || ''),
        source: 'MANUAL',
        operator: 'staff_001',
        operatedAt: now()
      })
      return createResponse(config, tagObj)
    }

    if (normalizedPath.match(/^\/admin\/customers\/[^/]+\/tags\/[^/]+\/trace$/) && method === 'GET') {
      const seg = path.split('/').filter(Boolean)
      const uid = seg[2]
      const tagCode = decodeURIComponent(seg[4])
      const customer = state.customers.find((x) => x.uid === uid)
      const tagName = (() => {
        const tags: AnyObj[] = Array.isArray(customer?.tags) ? customer.tags : []
        const hit = tags.find((tag, i) => {
          if (typeof tag === 'string') return `legacy_${i}_${tag}` === tagCode
          return (tag.tagCode || tag.code) === tagCode
        })
        if (!hit) return tagCode
        return typeof hit === 'string' ? hit : (hit.tagName || hit.name || tagCode)
      })()
      const base = Date.now()
      const traces = [
        {
          id: nextId('trace'),
          uid,
          tagCode,
          tagName,
          sourceType: 'AI_CHAT',
          sourceEventType: 'AI_CHAT',
          sourceEventId: `chat_${uid}_1`,
          sourceContext: `AI对话记录提到「${tagName}」相关诉求，客服追问了预算与到店时间。`,
          occurredAt: new Date(base - 1000 * 60 * 60 * 24).toISOString()
        },
        {
          id: nextId('trace'),
          uid,
          tagCode,
          tagName,
          sourceType: 'PAGE_VIEW',
          sourceEventType: 'PAGE_VIEW',
          sourceEventId: `pv_${uid}_2`,
          sourceContext: `浏览了与「${tagName}」强相关的服务详情页并停留较久。`,
          occurredAt: new Date(base - 1000 * 60 * 60 * 12).toISOString()
        }
      ]
      return createResponse(config, traces)
    }

    if (normalizedPath.match(/^\/admin\/customers\/[^/]+\/tags\/[^/]+$/) && method === 'DELETE') {
      const seg = path.split('/').filter(Boolean)
      const uid = seg[2]
      const tagCode = decodeURIComponent(seg[4])
      const reason = String(query.reason || '')
      const customer = state.customers.find((x) => x.uid === uid)
      if (!customer) return createResponse(config, null, 4004, 'customer not found')
      const currentTags: AnyObj[] = Array.isArray(customer.tags) ? customer.tags : []
      const idx = currentTags.findIndex((tag, i) => {
        if (typeof tag === 'string') return `legacy_${i}_${tag}` === tagCode
        return (tag.tagCode || tag.code) === tagCode
      })
      if (idx < 0) return createResponse(config, null, 4004, 'tag not found')
      const found = currentTags[idx]
      const tagName = typeof found === 'string' ? found : (found.tagName || found.name || tagCode)
      currentTags.splice(idx, 1)
      state.customerTagCorrections.unshift({
        id: nextId('corr'),
        uid,
        action: 'REMOVE',
        tagCode,
        tagName,
        reason,
        source: 'MANUAL',
        operator: 'staff_001',
        operatedAt: now()
      })
      customer.tags = currentTags
      return createResponse(config, null)
    }

    if (normalizedPath.match(/^\/admin\/customers\/[^/]+\/manual-score$/) && method === 'GET') {
      const uid = path.split('/')[3]
      const draft = state.customerManualScores[uid] || {
        dimensions: [
          { key: 'conversionIntent', label: '转化意向度', score: 60 },
          { key: 'spendingPower', label: '消费能力', score: 55 },
          { key: 'urgency', label: '孕产急迫度', score: 68 }
        ],
        overallScore: 61,
        note: '',
        updatedBy: 'staff_001',
        updatedAt: now()
      }
      return createResponse(config, draft)
    }

    if (normalizedPath.match(/^\/admin\/customers\/[^/]+\/manual-score:confirm$/) && method === 'POST') {
      const uid = path.split('/')[3]
      const dimensions = Array.isArray(body.dimensions) ? body.dimensions : []
      if (dimensions.length === 0) return createResponse(config, null, 4000, 'dimensions required')
      const overallScore = Math.round(
        dimensions.reduce((sum: number, item: AnyObj) => sum + Number(item.score || 0), 0) / dimensions.length
      )
      const saved = {
        id: nextId('mscore'),
        uid,
        dimensions,
        overallScore,
        note: body.note || '',
        confirmedBy: 'staff_001',
        confirmedAt: now()
      }
      state.customerManualScores[uid] = {
        dimensions,
        overallScore,
        note: body.note || '',
        updatedBy: 'staff_001',
        updatedAt: now()
      }
      return createResponse(config, saved)
    }

    if (normalizedPath.match(/^\/admin\/customers\/[^/]+\/tag-corrections$/) && method === 'GET') {
      const uid = path.split('/')[3]
      const list = state.customerTagCorrections.filter((x) => x.uid === uid)
      return createResponse(config, list)
    }

    if (normalizedPath.match(/^\/admin\/customers\/[^/]+$/) && method === 'GET') {
      const uid = findByPathId(path)
      const item = state.customers.find((u) => u.uid === uid)
      return createResponse(config, item || state.customers[0])
    }

    if ((normalizedPath.startsWith('/analytics/users/') || normalizedPath.match(/^\/admin\/customers\/[^/]+\/journey$/)) && method === 'GET') {
      const seg = path.split('/').filter(Boolean)
      const uid = seg[2] || state.customers[0]?.uid
      return createResponse(config, mockUserJourney(uid))
    }

    if (normalizedPath.startsWith('/admin/users/') && normalizedPath.endsWith('/analysis') && method === 'POST') {
      const uid = normalizedPath.split('/')[3]
      const result = mockAnalysisResult()
      
      // 更新 Mock 状态中的客户数据，以便后续 getCustomerDetail 能拿到更新后的结果
      const customer = state.customers.find((u) => u.uid === uid)
      if (customer) {
        customer.profileSummary = result.summary
        // 模拟 AI 分析后分数发生变化
        customer.manualTotalScore = Math.floor(60 + Math.random() * 35)
        // 模拟标签更新
        if (result.tags && result.tags.length > 0) {
          customer.tags = [...(customer.tags || []), ...result.tags.map(t => typeof t === 'string' ? t : t.tagName)]
        }
      }

      return createResponse(config, {
        ...result,
        concerns: [{ code: 'sleep_quality', name: '睡眠质量', confidence: 0.81 }],
        anxieties: [{ code: 'milk_supply', name: '泌乳不足', confidence: 0.79 }],
        behaviors: [{ code: 'content_reader', name: '内容深读', confidence: 0.74 }]
      })
    }

    // Account Management - Staff
    if (normalizedPath === '/admin/accounts/staff' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const keyword = (query.keyword || '').toLowerCase().trim()
      const status = query.status
      let list = [...state.staffs]
      if (status) list = list.filter(x => x.status === status)
      if (keyword) {
        list = list.filter(x => 
          x.username.toLowerCase().includes(keyword) || 
          x.name.toLowerCase().includes(keyword)
        )
      }
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (normalizedPath === '/admin/accounts/staff' && method === 'POST') {
      const item = {
        id: nextId('staff'),
        onlineStatus: 'OFFLINE',
        permissions: ['employee.portal'],
        status: 'ENABLED',
        createdAt: now(),
        updatedAt: now(),
        ...body
      }
      state.staffs.unshift(item)
      return createResponse(config, item)
    }

    if (normalizedPath.match(/^\/admin\/accounts\/staff\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      const item = state.staffs.find(x => x.id === id)
      return createResponse(config, item || state.staffs[0])
    }

    if (normalizedPath.match(/^\/admin\/accounts\/staff\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const item = upsertById(state.staffs, id, body)
      return createResponse(config, item || true)
    }

    if (normalizedPath.match(/^\/admin\/accounts\/staff\/[^/]+\/status$/) && method === 'PUT') {
      const id = path.split('/')[4]
      const item = upsertById(state.staffs, id, { status: body.status })
      return createResponse(config, item || true)
    }

    if (normalizedPath.match(/^\/admin\/accounts\/staff\/[^/]+\/password:reset$/) && method === 'PUT') {
      return createResponse(config, { updatedAt: now() })
    }

    if (normalizedPath.match(/^\/admin\/accounts\/staff\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.staffs, id)
      return createResponse(config, null)
    }

    // Account Management - Admin
    if (normalizedPath === '/admin/accounts/admins' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const keyword = (query.keyword || '').toLowerCase().trim()
      const status = query.status
      let list = [...state.admins]
      if (status) list = list.filter(x => x.status === status)
      if (keyword) {
        list = list.filter(x => 
          x.username.toLowerCase().includes(keyword) || 
          x.name.toLowerCase().includes(keyword)
        )
      }
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (normalizedPath === '/admin/accounts/admins' && method === 'POST') {
      const item = {
        id: nextId('admin'),
        onlineStatus: 'OFFLINE',
        permissions: [],
        status: 'ENABLED',
        createdAt: now(),
        updatedAt: now(),
        ...body
      }
      state.admins.unshift(item)
      return createResponse(config, item)
    }

    if (normalizedPath.match(/^\/admin\/accounts\/admins\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      const item = state.admins.find(x => x.id === id)
      return createResponse(config, item || state.admins[0])
    }

    if (normalizedPath.match(/^\/admin\/accounts\/admins\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const item = upsertById(state.admins, id, body)
      return createResponse(config, item || true)
    }

    if (normalizedPath.match(/^\/admin\/accounts\/admins\/[^/]+\/status$/) && method === 'PUT') {
      const id = path.split('/')[4]
      const item = upsertById(state.admins, id, { status: body.status })
      return createResponse(config, item || true)
    }

    if (normalizedPath.match(/^\/admin\/accounts\/admins\/[^/]+\/password:reset$/) && method === 'PUT') {
      return createResponse(config, { updatedAt: now() })
    }

    if (normalizedPath.match(/^\/admin\/accounts\/admins\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.admins, id)
      return createResponse(config, null)
    }

    // Orders
    if (normalizedPath === '/admin/orders' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const status = (query.status || '').trim()
      const keyword = (query.keyword || '').trim()
      let list = [...state.orders]
      if (status) list = list.filter((x) => x.status === status)
      if (keyword) {
        list = list.filter(
          (x) => String(x.orderNo).includes(keyword) || String(x.customerName).includes(keyword) || String(x.customerPhone || '').includes(keyword)
        )
      }
      return createResponse(config, paginate(list, page, pageSize))
    }

    // Preset Questions Mock
    if (normalizedPath === '/admin/content/preset-questions' && method === 'GET') {
      return createResponse(config, state.presetQuestions)
    }
    if (normalizedPath === '/admin/content/preset-questions' && method === 'POST') {
      const item = { id: nextId('pq'), ...body }
      state.presetQuestions.push(item)
      return createResponse(config, item)
    }
    if (normalizedPath.match(/^\/admin\/content\/preset-questions\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      return createResponse(config, state.presetQuestions.find(x => x.id === id) || state.presetQuestions[0])
    }
    if (normalizedPath.match(/^\/admin\/content\/preset-questions\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const item = upsertById(state.presetQuestions, id, body)
      return createResponse(config, item || true)
    }
    if (normalizedPath.match(/^\/admin\/content\/preset-questions\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.presetQuestions, id)
      return createResponse(config, null)
    }

    // Postpartum Services Mock
    if (normalizedPath === '/admin/postpartum-services' && method === 'GET') {
      return createResponse(config, state.postpartumServices)
    }
    if (normalizedPath === '/admin/postpartum-services' && method === 'POST') {
      const item = { id: nextId('ps'), ...body }
      state.postpartumServices.push(item)
      return createResponse(config, item)
    }
    if (normalizedPath.match(/^\/admin\/postpartum-services\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      return createResponse(config, state.postpartumServices.find(x => x.id === id) || state.postpartumServices[0])
    }
    if (normalizedPath.match(/^\/admin\/postpartum-services\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const item = upsertById(state.postpartumServices, id, body)
      return createResponse(config, item || true)
    }
    if (normalizedPath.match(/^\/admin\/postpartum-services\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.postpartumServices, id)
      return createResponse(config, null)
    }

    if (normalizedPath.startsWith('/admin/orders/') && method === 'GET' && !normalizedPath.endsWith('/stats')) {
      const id = findByPathId(path)
      const item = state.orders.find((x) => x.id === id)
      return createResponse(config, item || state.orders[0])
    }

    if (normalizedPath === '/admin/orders/stats' && method === 'GET') {
      const stats = state.orders.reduce(
        (acc, o) => {
          acc.total += 1
          if (acc[o.status] !== undefined) acc[o.status] += 1
          acc.totalRevenue += Number(o.payableAmount || 0)
          return acc
        },
        {
          total: 0,
          pending: 0,
          paid: 0,
          completed: 0,
          cancelled: 0,
          refunded: 0,
          confirmed: 0,
          totalRevenue: 0,
          totalRevenueLabel: ''
        } as AnyObj
      )
      stats.totalRevenueLabel = `¥${(stats.totalRevenue / 100).toLocaleString()}`
      return createResponse(config, stats)
    }

    if (normalizedPath.match(/^\/admin\/orders\/[^/]+\/confirm$/) && method === 'POST') {
      const id = path.split('/')[3]
      const item = upsertById(state.orders, id, { status: 'confirmed' })
      return createResponse(config, item || true)
    }

    if (normalizedPath.match(/^\/admin\/orders\/[^/]+\/cancel$/) && method === 'POST') {
      const id = path.split('/')[3]
      const item = upsertById(state.orders, id, { status: 'cancelled', cancelReason: body.reason || '' })
      return createResponse(config, item || true)
    }

    if (normalizedPath.match(/^\/admin\/orders\/[^/]+\/refund$/) && method === 'POST') {
      const id = path.split('/')[3]
      const item = upsertById(state.orders, id, { status: 'refunded', refundReason: body.reason || '' })
      return createResponse(config, item || true)
    }

    if (normalizedPath.match(/^\/admin\/orders\/[^/]+\/remark$/) && method === 'PUT') {
      const id = path.split('/')[3]
      const item = upsertById(state.orders, id, { remark: body.remark || '' })
      return createResponse(config, item || true)
    }

    // Articles + Categories
    if (normalizedPath === '/admin/content/articles' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const category = (query.category || '').trim()
      const status = (query.status || '').trim()
      const keyword = (query.keyword || '').trim()
      let list = [...state.articles]
      if (category) list = list.filter((x) => x.category === category)
      if (status) list = list.filter((x) => x.status === status)
      if (keyword) list = list.filter((x) => String(x.title).includes(keyword))
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (normalizedPath === '/admin/content/articles' && method === 'POST') {
      const item = {
        id: nextId('article'),
        likes: 0,
        views: 0,
        createdAt: now(),
        updatedAt: now(),
        ...body
      }
      state.articles.unshift(item)
      return createResponse(config, item)
    }

    if (normalizedPath.match(/^\/admin\/content\/articles\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      const item = state.articles.find((x) => x.id === id)
      return createResponse(config, item || state.articles[0])
    }

    if (normalizedPath.match(/^\/admin\/content\/articles\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const item = upsertById(state.articles, id, body)
      return createResponse(config, item || true)
    }

    if (normalizedPath.match(/^\/admin\/content\/articles\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.articles, id)
      return createResponse(config, null)
    }

    if (normalizedPath.match(/^\/admin\/content\/articles\/[^/]+\/publish$/) && method === 'POST') {
      const id = path.split('/')[4]
      const item = upsertById(state.articles, id, { status: 'published', publishedAt: now() })
      return createResponse(config, item || true)
    }

    if (normalizedPath.match(/^\/admin\/content\/articles\/[^/]+\/archive$/) && method === 'POST') {
      const id = path.split('/')[4]
      const item = upsertById(state.articles, id, { status: 'archived' })
      return createResponse(config, item || true)
    }

    if (normalizedPath === '/admin/content/categories' && method === 'GET') {
      return createResponse(config, state.contentCategories)
    }

    if (normalizedPath === '/admin/content/categories' && method === 'POST') {
      const item = { id: nextId('category'), ...body }
      state.contentCategories.push(item)
      return createResponse(config, item)
    }

    if (normalizedPath.match(/^\/admin\/content\/categories\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const idx = state.contentCategories.findIndex((x) => x.id === id)
      if (idx >= 0) state.contentCategories[idx] = { ...state.contentCategories[idx], ...body }
      return createResponse(config, state.contentCategories[idx] || true)
    }

    if (normalizedPath.match(/^\/admin\/content\/categories\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.contentCategories, id)
      return createResponse(config, null)
    }

    // Article tags
    if (normalizedPath.match(/^\/admin\/articles\/[^/]+\/extract-tags$/) && method === 'POST') {
      const articleId = path.split('/')[3]
      const generated = [
        { articleId, tagCode: 'postpartum_recovery', tagName: '产后恢复', source: 'AI' },
        { articleId, tagCode: 'nutrition', tagName: '营养膳食', source: 'AI' }
      ]
      state.articleTags.set(articleId, generated)
      return createResponse(config, generated)
    }

    if (normalizedPath.match(/^\/admin\/articles\/[^/]+\/tags$/) && method === 'GET') {
      const articleId = path.split('/')[3]
      return createResponse(config, state.articleTags.get(articleId) || [])
    }

    if (normalizedPath.match(/^\/admin\/articles\/[^/]+\/tags$/) && method === 'POST') {
      const articleId = path.split('/')[3]
      const list = state.articleTags.get(articleId) || []
      const item = {
        articleId,
        tagCode: body.tagCode || nextId('tag'),
        tagName: body.tagName || body.tagCode || '新标签',
        source: body.source || 'MANUAL'
      }
      list.push(item)
      state.articleTags.set(articleId, list)
      return createResponse(config, item)
    }

    if (normalizedPath.match(/^\/admin\/articles\/[^/]+\/tags\/[^/]+$/) && method === 'DELETE') {
      const articleId = path.split('/')[3]
      const tagCode = path.split('/')[5]
      const list = (state.articleTags.get(articleId) || []).filter((x) => x.tagCode !== tagCode)
      state.articleTags.set(articleId, list)
      return createResponse(config, null)
    }

    // Banner/Magazine/Suite
    const contentCollections: Array<{ base: string; data: AnyObj[]; prefix: string }> = [
      { base: '/admin/content/banners', data: state.banners, prefix: 'banner' },
      { base: '/admin/content/magazines', data: state.magazines, prefix: 'magazine' },
      { base: '/admin/content/suites', data: state.suites, prefix: 'suite' }
    ]

    for (const col of contentCollections) {
      if (normalizedPath === col.base && method === 'GET') return createResponse(config, col.data)
      if (normalizedPath === col.base && method === 'POST') {
        const item = { id: nextId(col.prefix), createdAt: now(), updatedAt: now(), ...body }
        col.data.unshift(item)
        return createResponse(config, item)
      }
      if (normalizedPath.match(new RegExp(`^${col.base}\\/[^/]+$`)) && method === 'GET') {
        const id = findByPathId(path)
        return createResponse(config, col.data.find((x) => x.id === id) || col.data[0])
      }
      if (normalizedPath.match(new RegExp(`^${col.base}\\/[^/]+$`)) && method === 'PUT') {
        const id = findByPathId(path)
        const item = upsertById(col.data, id, body)
        return createResponse(config, item || true)
      }
      if (normalizedPath.match(new RegExp(`^${col.base}\\/[^/]+$`)) && method === 'DELETE') {
        const id = findByPathId(path)
        removeById(col.data, id)
        return createResponse(config, null)
      }
    }

    // Coupons
    if (normalizedPath === '/admin/coupons' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const status = (query.status || '').trim()
      const list = status ? state.coupons.filter((x) => x.status === status) : state.coupons
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (normalizedPath === '/admin/coupons' && method === 'POST') {
      const item = { id: nextId('coupon'), createdAt: now(), ...body }
      state.coupons.unshift(item)
      return createResponse(config, item)
    }

    if (normalizedPath.match(/^\/admin\/coupons\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      return createResponse(config, state.coupons.find((x) => x.id === id) || state.coupons[0])
    }

    if (normalizedPath.match(/^\/admin\/coupons\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const item = upsertById(state.coupons, id, body)
      return createResponse(config, item || true)
    }

    if (normalizedPath.match(/^\/admin\/coupons\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.coupons, id)
      return createResponse(config, null)
    }

    if (normalizedPath.match(/^\/admin\/coupons\/[^/]+\/status$/) && method === 'PUT') {
      const id = path.split('/')[3]
      const item = upsertById(state.coupons, id, { status: body.status || 'inactive' })
      return createResponse(config, item || true)
    }

    // Feedback
    if (normalizedPath === '/admin/feedback/evaluations' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const score = query.score ? toNumber(query.score, 0) : 0
      const list = score ? state.evaluations.filter((x) => Number(x.score) === score) : state.evaluations
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (normalizedPath.match(/^\/admin\/feedback\/evaluations\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      return createResponse(config, state.evaluations.find((x) => x.id === id) || state.evaluations[0])
    }

    if (normalizedPath === '/admin/feedback/complaints' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const status = (query.status || '').trim()
      const list = status ? state.complaints.filter((x) => x.status === status) : state.complaints
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (normalizedPath.match(/^\/admin\/feedback\/complaints\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      return createResponse(config, state.complaints.find((x) => x.id === id) || state.complaints[0])
    }

    if (normalizedPath.match(/^\/admin\/feedback\/complaints\/[^/]+\/status$/) && method === 'PUT') {
      const id = path.split('/')[4]
      const item = upsertById(state.complaints, id, { status: body.status || 'processing', note: body.note || '' })
      return createResponse(config, item || true)
    }

    // FAQ
    if (normalizedPath === '/admin/faq/categories' && method === 'GET') {
      return createResponse(config, state.faqCategories)
    }

    if (normalizedPath === '/admin/faq/categories' && method === 'POST') {
      const item = { id: nextId('faq_cat'), createdAt: now(), ...body }
      state.faqCategories.push(item)
      return createResponse(config, item)
    }

    if (normalizedPath.match(/^\/admin\/faq\/categories\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const idx = state.faqCategories.findIndex((x) => x.id === id)
      if (idx >= 0) state.faqCategories[idx] = { ...state.faqCategories[idx], ...body }
      return createResponse(config, state.faqCategories[idx] || true)
    }

    if (normalizedPath.match(/^\/admin\/faq\/categories\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.faqCategories, id)
      state.faqItems = state.faqItems.filter((x) => x.categoryId !== id)
      return createResponse(config, null)
    }

    if (normalizedPath === '/admin/faq/items' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const categoryId = (query.categoryId || '').trim()
      const list = categoryId ? state.faqItems.filter((x) => x.categoryId === categoryId) : state.faqItems
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (normalizedPath === '/admin/faq/items' && method === 'POST') {
      const item = { id: nextId('faq_item'), createdAt: now(), ...body }
      state.faqItems.unshift(item)
      return createResponse(config, item)
    }

    if (normalizedPath.match(/^\/admin\/faq\/items\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      return createResponse(config, state.faqItems.find((x) => x.id === id) || state.faqItems[0])
    }

    if (normalizedPath.match(/^\/admin\/faq\/items\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const item = upsertById(state.faqItems, id, body)
      return createResponse(config, item || true)
    }

    if (normalizedPath.match(/^\/admin\/faq\/items\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.faqItems, id)
      return createResponse(config, null)
    }

    // Hotline
    if (normalizedPath === '/admin/service/hotlines' && method === 'GET') {
      return createResponse(config, state.hotlineConfig)
    }

    if (normalizedPath === '/admin/service/hotlines' && method === 'PUT') {
      state.hotlineConfig = { ...state.hotlineConfig, ...body }
      return createResponse(config, state.hotlineConfig)
    }

    if (normalizedPath === '/admin/service/hotlines' && method === 'POST') {
      const item = { id: nextId('hotline'), sort: state.hotlineConfig.hotlines.length + 1, status: 'active', ...body }
      state.hotlineConfig.hotlines.push(item)
      return createResponse(config, item)
    }

    if (normalizedPath.match(/^\/admin\/service\/hotlines\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      state.hotlineConfig.hotlines = state.hotlineConfig.hotlines.filter((x: AnyObj) => x.id !== id)
      return createResponse(config, null)
    }

    // Center
    if (normalizedPath === '/admin/centers/home' && method === 'GET') {
      return createResponse(config, state.centerHome)
    }

    if (normalizedPath === '/admin/centers/home' && method === 'PUT') {
      state.centerHome = { ...state.centerHome, ...body }
      return createResponse(config, state.centerHome)
    }

    if (normalizedPath === '/admin/centers/sections' && method === 'GET') {
      return createResponse(config, state.centerSections)
    }

    if (normalizedPath === '/admin/centers/sections' && method === 'POST') {
      const item = { id: nextId('section'), createdAt: now(), updatedAt: now(), ...body }
      state.centerSections.unshift(item)
      return createResponse(config, item)
    }

    if (normalizedPath.match(/^\/admin\/centers\/sections\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      return createResponse(config, state.centerSections.find((x) => x.id === id) || state.centerSections[0])
    }

    if (normalizedPath.match(/^\/admin\/centers\/sections\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const item = upsertById(state.centerSections, id, body)
      return createResponse(config, item || true)
    }

    if (normalizedPath.match(/^\/admin\/centers\/sections\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.centerSections, id)
      return createResponse(config, null)
    }

    // Tag Dictionary Mock
    if (normalizedPath === '/admin/tag-dictionary' && method === 'GET') {
      const keyword = (query.keyword || '').toLowerCase().trim()
      const status = query.status
      let list = [...state.tagDictionary]
      if (status) list = list.filter(x => x.status === status)
      if (keyword) {
        list = list.filter(x => 
          x.tagName.toLowerCase().includes(keyword) || 
          x.tagCode.toLowerCase().includes(keyword)
        )
      }
      return createResponse(config, list)
    }

    if (normalizedPath === '/admin/tag-dictionary' && method === 'POST') {
      const item = {
        useCount: 0,
        ...body
      }
      state.tagDictionary.push(item)
      return createResponse(config, item)
    }

    if (normalizedPath.match(/^\/admin\/tag-dictionary\/[^/]+$/) && method === 'PUT') {
      const tagCode = findByPathId(path)
      const idx = state.tagDictionary.findIndex(x => x.tagCode === tagCode)
      if (idx < 0) return createResponse(config, null, 4004, 'tag not found')
      state.tagDictionary[idx] = { ...state.tagDictionary[idx], ...body }
      return createResponse(config, state.tagDictionary[idx])
    }

    if (normalizedPath.match(/^\/admin\/tag-dictionary\/[^/]+$/) && method === 'DELETE') {
      const tagCode = findByPathId(path)
      const idx = state.tagDictionary.findIndex(x => x.tagCode === tagCode)
      if (idx >= 0) state.tagDictionary.splice(idx, 1)
      return createResponse(config, null)
    }

    // Mock default for admin/analytics paths to avoid falling back to network in demo mode.
    if (normalizedPath.startsWith('/admin') || normalizedPath.startsWith('/analytics')) {
      console.warn(`[Mock Adapter] Default mock response for: ${method} ${path}`)
      return createResponse(config, null)
    }

    // Non-admin APIs: keep original behavior.
    if (originalAdapter) {
      if (typeof originalAdapter === 'function') return (originalAdapter as any)(config)
      if (Array.isArray(originalAdapter) && typeof originalAdapter[0] === 'function') return (originalAdapter[0] as any)(config)
    }

    return Promise.reject(new Error(`No mock adapter for ${rawUrl}`))
  }
}

