import type {
  AnalysisResult,
  Banner,
  ContentItem,
  ContentCategoryItem,
  Coupon,
  PostpartumService,
  PresetQuestion,
  CenterSection,
  Suite,
  UserProfile,
  FortuneCard,
  FaqCategory,
  FaqItem,
  ServiceHotlines,
  CenterHome,
  Magazine,
  MagazineDetail,
} from '@/types/domain';

export const banners: Banner[] = [
  {
    id: '1',
    title: '爱儿美 高端月子照护体系',
    buttonText: '查看详情',
    image: 'https://picsum.photos/seed/poster1/1080/1920',
    detailTitle: '一站式月子中心服务',
    detailContent: '覆盖孕产管理、产后康复、婴儿照护与营养膳食。'
  },
  {
    id: '2',
    title: '24小时母婴专业团队守护',
    buttonText: '预约参观',
    image: 'https://picsum.photos/seed/poster2/1080/1920',
    detailTitle: '专业护理团队',
    detailContent: '护士、营养师、康复师多角色协同服务。'
  },
  {
    id: '3',
    title: '私享套房与定制康复方案',
    buttonText: '了解套餐',
    image: 'https://picsum.photos/seed/poster3/1080/1920',
    detailTitle: '定制化方案',
    detailContent: '根据体质、分娩方式与家庭需求匹配服务组合。'
  }
];

export const contentCategories: ContentCategoryItem[] = [
  { id: 'pregnancy', label: '孕期' },
  { id: 'postpartum', label: '月子' },
  { id: 'parenting', label: '育儿' },
  { id: 'nanny', label: '月嫂' }
];

export const contentItems: ContentItem[] = [
  { id: '1', title: '新生儿睡眠节律怎么建立', cover: 'https://picsum.photos/seed/baby1/400/600', type: 'image', category: 'parenting', author: '爱儿美顾问', likes: 1240 },
  { id: '2', title: '顺产后第2周恢复建议', cover: 'https://picsum.photos/seed/recovery1/400/500', type: 'image', category: 'postpartum', author: '康复治疗师', likes: 856 },
  { id: '3', title: '高端月子房环境实拍', cover: 'https://picsum.photos/seed/room1/400/700', type: 'video', category: 'pregnancy', author: '中心运营', likes: 3421 },
  { id: '4', title: '产后心理支持如何介入', cover: 'https://picsum.photos/seed/care1/400/550', type: 'image', category: 'postpartum', author: '心理咨询师', likes: 2100 },
  { id: '5', title: '待产包怎么准备更高效', cover: 'https://picsum.photos/seed/prep1/400/650', type: 'image', category: 'pregnancy', author: '护士长', likes: 1560 },
  { id: '6', title: '宝宝喂养常见误区', cover: 'https://picsum.photos/seed/sleep1/400/600', type: 'image', category: 'parenting', author: '母乳顾问', likes: 980 }
];

export const fortuneCard: FortuneCard = {
  date: '2026-04-14',
  suitable: '散步、听音乐、轻柔瑜伽',
  avoid: '过度劳累、焦虑熬夜',
  greeting: '中午好，亲爱的宝妈。今天阳光明媚，建议适当户外活动，保持心情愉悦。记得补充水分，关注宝宝喂养节律。'
};

export const centerSections: CenterSection[] = [
  { id: 'env', title: '爱儿美·环境', coverImage: 'https://picsum.photos/seed/env_high/800/1200', desc: '静谧私密的疗愈空间，强调产后恢复舒适度。' },
  { id: 'equip', title: '护理设备', coverImage: 'https://picsum.photos/seed/equip_high/800/1200', desc: '引入专业检测与监护设备，构建母婴安全闭环。' },
  { id: 'meal', title: '营养餐食', coverImage: 'https://picsum.photos/seed/meal_high/800/1200', desc: '按阶段制定膳食方案，兼顾恢复与口味。' },
  { id: 'team', title: '专家团队', coverImage: 'https://picsum.photos/seed/team_high/800/1200', desc: '护士、康复师、营养师协同服务。' }
];

export const centerHome: CenterHome = {
  heroImage: 'https://picsum.photos/seed/storefront/1080/1920',
  brandTitle: 'AI ER MEI',
  brandSubtitle: 'RESIDENCES',
  facilities: [
    { id: 'fac_1', title: '母婴照护体系', desc: '24h 护理值守与跨角色会诊，强调连续照护。', image: 'https://picsum.photos/seed/fac1_high/800/500' },
    { id: 'fac_2', title: '产后恢复模块', desc: '按体征与阶段推进恢复计划，减少恢复焦虑。', image: 'https://picsum.photos/seed/fac2_high/800/500' }
  ]
};

export const suites: Suite[] = [
  {
    id: 'elegant',
    name: '雅致套房',
    price: 6880000,
    priceLabel: '¥68,800起',
    size: '55㎡',
    features: ['独立会客区', '专业护理站响应', '每日营养餐'],
    coverImage: 'https://picsum.photos/seed/suite1/800/600',
    images: ['https://picsum.photos/seed/suite1/800/600', 'https://picsum.photos/seed/suite1b/800/600']
  },
  {
    id: 'luxury',
    name: '尊享套房',
    price: 12880000,
    priceLabel: '¥128,800起',
    size: '85㎡',
    features: ['私享客厅', '一对一康复计划', '家庭探访支持'],
    coverImage: 'https://picsum.photos/seed/suite2/800/600',
    images: ['https://picsum.photos/seed/suite2/800/600', 'https://picsum.photos/seed/suite2b/800/600']
  }
];

export const presetQuestions: PresetQuestion[] = [
  { id: 'qa_1', question: '剖宫产后多久可以开始康复训练？', answer: '通常在医生评估后 7-14 天可进行轻度训练。' },
  { id: 'qa_2', question: '月子期间家属可以陪住吗？', answer: '部分房型支持陪住，需提前预约和实名登记。' },
  { id: 'qa_3', question: '宝宝黄疸如何监测？', answer: '中心会每日评估并根据指标提供建议。' }
];

export const coupons: Coupon[] = [
  { id: '1', name: '产后康复体验券', value: 50000, valueLabel: '¥500', expiry: '2026-12-31', status: 'unused' },
  { id: '2', name: '新生儿护理抵扣券', value: 20000, valueLabel: '¥200', expiry: '2026-06-30', status: 'unused' },
  { id: '3', name: '营养餐升级券', value: 30000, valueLabel: '¥300', expiry: '2026-03-31', status: 'expired' }
];

export const postpartumServices: PostpartumService[] = [
  { id: '1', name: '盆底肌修复', time: '2026-04-10 14:00', status: 'pending', expert: '康复治疗师A' },
  { id: '2', name: '乳腺疏通护理', time: '2026-04-15 10:00', status: 'pending', expert: '护理专家B' },
  { id: '3', name: '心理放松课程', time: '2026-03-25 15:00', status: 'completed', expert: '心理咨询师C' }
];

export const faqCategories: FaqCategory[] = [
  { id: 'pregnancy', name: '我的孕期' },
  { id: 'common', name: '常见问题' }
];

export const faqItemsCommon: FaqItem[] = [
  { id: 'faq_1', categoryId: 'common', title: '如何注销我的账户？', content: '您可以在"我的-设置-账号管理"中申请注销账户，注销后数据将无法恢复，请谨慎操作。' },
  { id: 'faq_2', categoryId: 'common', title: '我的个人信息会被共享给第三方吗？', content: '我们严格遵守隐私政策，您的个人信息仅用于提供服务，未经您同意不会共享给任何第三方。' },
  { id: 'faq_3', categoryId: 'common', title: '如何修改绑定的手机号？', content: '请进入"我的-设置-账号管理-修改手机号"，通过验证码验证后即可更换。' },
  { id: 'faq_4', categoryId: 'common', title: '隐私政策在哪里查看？', content: '您可以在"我的-设置-关于我们-隐私政策"中查看完整的隐私条款内容。' }
];

export const faqItemsPregnancy: FaqItem[] = [
  { id: 'pfaq_1', categoryId: 'pregnancy', title: '孕期可以运动吗？', content: '孕期适度运动对母婴健康有益，建议选择散步、孕妇瑜伽等低强度运动，避免剧烈运动和跳跃动作。' },
  { id: 'pfaq_2', categoryId: 'pregnancy', title: '孕期需要补充哪些营养？', content: '建议补充叶酸、钙、铁、DHA等营养素，具体用量请咨询您的产检医生。' },
  { id: 'pfaq_3', categoryId: 'pregnancy', title: '孕期可以做几次产检？', content: '一般孕期需要进行8-12次产检，具体次数根据个人情况和医生建议而定。' }
];

export const serviceHotlines: ServiceHotlines = {
  hotlines: [
    { label: '24小时尊享热线', number: '400-106-1080' },
    { label: '前台预约咨询', number: '010-8888-9999' }
  ],
  serviceQrCodeUrl: 'https://picsum.photos/seed/qr2/360/360',
  serviceQrTips: '添加您的专属私教顾问'
};

export const defaultProfile: UserProfile = {
  uid: 'user_123',
  name: '访客',
  tags: [],
  lastActive: Date.now(),
  isLoggedIn: false,
  pregnancyInfo: {
    type: 'pregnancy',
    date: '2026-08-15'
  },
  paths: [{ path: '首页', timestamp: Date.now() }]
};

export const mockAnalysis: AnalysisResult = {
  tags: ['关注高端套房', '重视产后康复'],
  script: '建议优先介绍尊享套房与产后康复套餐，并邀请到店参观后再给个性化报价。'
};

export const memberShortcuts = [
  { id: 'evaluation', title: '服务评估' },
  { id: 'faq', title: '常见问题' },
  { id: 'package', title: '套餐详情' },
  { id: 'hotline', title: '24h热线' },
  { id: 'coupon', title: '我的优惠券' },
  { id: 'postpartum', title: '产后服务' },
  { id: 'complaint', title: '投诉建议' }
];

export const hotlineList = [
  { label: '24h 客服热线', number: '400-106-1080' },
  { label: '预约参观咨询', number: '010-8888-9999' },
  { label: '产后服务台', number: '010-8888-6666' }
];

export const memberArticles = [
  { id: 'mag_1', title: 'ECHOES OF HER', subtitle: '分娩后身体与情绪节律重建', desc: '阅读详情', image: 'https://picsum.photos/seed/mag1/400/400' },
  { id: 'mag_2', title: 'BEYOND MOTHERHOOD', subtitle: '母职之外的自我修复课题', desc: '阅读详情', image: 'https://picsum.photos/seed/mag2/400/400' }
];

export const magazines: Magazine[] = memberArticles.map(m => ({
  id: m.id,
  title: m.title,
  subtitle: m.subtitle,
  cover: m.image,
  desc: m.desc
}));

export const magazineDetails: MagazineDetail[] = [
  {
    id: 'mag_1',
    title: 'ECHOES OF HER',
    subtitle: '分娩后身体与情绪节律重建',
    cover: 'https://picsum.photos/seed/mag1/400/400',
    author: '爱儿美编辑部',
    content: '<p>每一位新妈妈都在经历一场深刻的转变——从独立的个体到生命的孕育者，再到新生命的守护者。</p><p>这个过程不仅是身体的恢复，更是情绪与身份的重新定义。本期杂志将带您探索产后恢复的多维度路径，从生理康复到心理调适，帮助您找到属于自己的新生节奏。</p><p>我们邀请了资深康复师、心理咨询师和营养学专家，为您提供科学、温暖的指导建议。愿每一位妈妈都能在这段特殊的日子里，温柔地对待自己，从容地迎接新生。</p>',
    publishedAt: '2026-04-01T10:00:00+08:00'
  },
  {
    id: 'mag_2',
    title: 'BEYOND MOTHERHOOD',
    subtitle: '母职之外的自我修复课题',
    cover: 'https://picsum.photos/seed/mag2/400/400',
    author: '爱儿美编辑部',
    content: '<p>成为母亲是人生中最美好的礼物之一，但这并不意味着要完全放下自我。</p><p>本期杂志聚焦于"母职之外"的话题——如何在照顾宝宝的同时，保留属于自己的时间与空间？如何在角色转换中找到平衡？如何重新定义与伴侣、家人、朋友的关系？</p><p>我们相信，一个快乐的妈妈才能养育出快乐的宝宝。让我们一起探索，在爱与责任之间，如何温柔地拥抱那个曾经的自己。</p>',
    publishedAt: '2026-03-15T10:00:00+08:00'
  }
];

export const centerFacilities = [
  { title: '母婴照护体系', desc: '24h 护理值守与跨角色会诊，强调连续照护。', image: 'https://picsum.photos/seed/fac1_high/800/500' },
  { title: '产后恢复模块', desc: '按体征与阶段推进恢复计划，减少恢复焦虑。', image: 'https://picsum.photos/seed/fac2_high/800/500' }
];