// API 响应通用结构
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  requestId?: string;
  timestamp?: string;
}

// 分页响应
export interface PageResponse<T> {
  list: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// 管理员信息
export interface AdminUser {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer' | 'staff';
  permissions: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export type UserRole = AdminUser['role']

export interface TagPendingCandidate {
  tagCode: string;
  tagName: string;
  similarity: number;
  rankNo: number;
}

export interface TagPendingItem {
  pendingId: string;
  tagCode: string;
  tagName: string;
  aiReason: string;
  similarTag?: string | null;
  similarity?: number | null;
  mentionCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MERGED';
  candidateCount: number;
  topCandidate?: TagPendingCandidate | null;
}

export interface TagPendingDetail extends TagPendingItem {
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewAction?: 'APPROVE' | 'REJECT' | 'MERGE' | null;
  mergedToTagCode?: string | null;
  candidates: TagPendingCandidate[];
}

export interface TagMention {
  uid: string;
  userName?: string | null;
  articleId?: string | null;
  sourceType: string;
  sourceContext?: string | null;
  sourceEventId?: string | null;
  sourceEventType?: string | null;
  chatSessionId?: string | null;
  chatMessageId?: string | null;
  chatMessageSeqNo?: number | null;
  analysisRecordId?: string | null;
  createdAt: string;
}

export interface TagReviewRequest {
  action: 'APPROVE' | 'REJECT' | 'MERGE';
  targetTagCode?: string;
  description?: string;
}

export interface TagReviewResult {
  pendingId: string;
  finalStatus: 'APPROVED' | 'REJECTED' | 'MERGED';
  resolvedTagCode?: string | null;
  backfilledUserCount: number;
  removedPendingUserTagCount: number;
}

export interface ScoringWeights {
  conversionIntent: number;
  spendingPower: number;
  recentActivity: number;
  total: number;
  updatedAt: string;
  updatedBy: string;
}

export interface DecayConfigItem {
  eventType: string;
  eventLabel: string;
  initialWeight: number;
  lambda: number;
  minWeight: number;
}

export interface TrafficSourceItem {
  sourceChannel: 'mini_search' | 'friend_share' | 'ai_transfer' | 'other';
  label: string;
  count: number;
  ratio: number;
}

export interface TrafficSourcesStat {
  days: number;
  total: number;
  sources: TrafficSourceItem[];
}

export interface CenterFacility {
  id: string;
  title: string;
  desc?: string;
  image?: string;
  sort: number;
}

export interface UploadFileResponse {
  fileId: string;
  url: string;
  objectKey: string;
  mimeType: string;
  sizeBytes: number;
  bizType: string;
  uploadedAt: string;
}

export interface AdminTagDictItem {
  tagCode: string;
  tagName: string;
  description: string;
  status: string;
  sortNo: number;
  useCount: number;
}

// 用户信息（C端用户）
export interface Customer {
  uid: string;
  name: string;
  avatar?: string;
  phone?: string;
  memberLevel: string;
  pregnancyInfo?: {
    type: string;
    date: string;
  };
  tags: Array<TagItem | string>;
  lastActive: string;
  createdAt: string;
  profileSummary?: string;
  manualTotalScore?: number;
  manualScoreSnapshot?: Record<string, any>;
}

// 用户路径
export interface UserJourney {
  uid: string;
  paths: {
    path: string;
    displayName?: string;
    rawPath?: string;
    eventId?: string;
    eventType?: string;
    pathName?: string;
    durationSeconds?: number;
    totalDurationSeconds?: number;
    metadata?: Record<string, any>;
    context?: string;
    repeatCount?: number;
    timestamp: string;
  }[];
  tags: string[];
  lastActive: string;
}

// 预设问题
export interface PresetQuestion {
  id?: string;
  questionId?: string;
  question: string;
  answer: string;
  category: string;
  sortNo: number;
}

// 产后服务
export interface PostpartumService {
  id?: string;
  serviceId?: string;
  uid: string;
  orderId?: string;
  serviceName: string;
  appointmentTime: string;
  durationMinutes: number;
  expertName: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// AI 分析结果
export interface AnalysisResult {
  concerns?: TagItem[];
  anxieties?: TagItem[];
  behaviors?: TagItem[];
  tags: Array<TagItem | string>;
  summary: string;
}

export interface TagItem {
  code?: string;
  name?: string;
  tagCode?: string;
  tagName?: string;
  source?: string;
  confidence?: number;
}

export interface CustomerTag {
  tagCode: string;
  tagName: string;
  source?: string;
  confidence?: number;
  decayPercent?: number;
  createdAt?: string;
  evidenceCount?: number;
}

export interface CustomerScoreDimension {
  key: 'conversionIntent' | 'spendingPower' | 'urgency';
  label: string;
  score: number;
}

export interface CustomerManualScoreDraft {
  dimensions: CustomerScoreDimension[];
  overallScore: number;
  note?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface CustomerManualScoreSubmitRequest {
  dimensions: CustomerScoreDimension[];
  note?: string;
}

export interface CustomerManualScoreSubmitResponse {
  id: string;
  uid: string;
  dimensions: CustomerScoreDimension[];
  overallScore: number;
  note?: string;
  confirmedBy: string;
  confirmedAt: string;
}

export interface CustomerTagCorrectionLog {
  id: string;
  uid: string;
  action: 'ADD' | 'REMOVE';
  tagCode: string;
  tagName: string;
  reason?: string;
  source: 'MANUAL';
  operator: string;
  operatedAt: string;
}

export interface CustomerTagTraceRecord {
  id: string;
  uid: string;
  tagCode: string;
  tagName: string;
  sourceType: 'AI_CHAT' | 'PAGE_VIEW' | 'ARTICLE_VIEW' | 'MANUAL';
  sourceEventType?: string;
  sourceEventId?: string;
  sourceContext: string;
  occurredAt: string;
}

export interface ArticleTag {
  articleId: string;
  tagCode: string;
  tagName: string;
  source: string;
}

// 仪表盘概览
export interface DashboardOverview {
  activeCustomers: number;
  todayVisits: number;
  orderCount: number;
  revenue: number;
  revenueLabel: string;
  avgStayMinutes: number;
  leadConversionRate: number;
  hotContentTitle: string;
}

// 文章
export interface Article {
  id: string;
  title: string;
  cover?: string;
  mediaUrl?: string;
  type: 'image' | 'video';
  category: string;
  categoryLabel: string;
  author?: string;
  likes: number;
  views: number;
  status: 'draft' | 'published' | 'archived';
  content?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 文章分类
export interface ContentCategory {
  id: string;
  label: string;
  sort: number;
}

// 海报/轮播
export interface Banner {
  id: string;
  title: string;
  buttonText?: string;
  image: string;
  detailTitle?: string;
  detailContent?: string;
  sort: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

// 杂志
export interface Magazine {
  id: string;
  title: string;
  subtitle?: string;
  cover: string;
  author?: string;
  content: string;
  status: 'draft' | 'published' | 'active' | 'inactive';
  publishedAt?: string;
  createdAt: string;
}

// 房型
export interface Suite {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  size: string;
  features: string[];
  coverImage: string;
  images?: string[];
  description?: string;
  facilities?: string[];
  status: 'active' | 'inactive';
  sort: number;
}

// 订单
export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  suiteId: string;
  suiteName: string;
  originalAmount: number;
  discountAmount: number;
  payableAmount: number;
  payableAmountLabel: string;
  status: 'pending' | 'paid' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
  remark?: string;
}

// 优惠券
export interface Coupon {
  id: string;
  name: string;
  value: number;
  valueLabel: string;
  minAmount?: number;
  expiry: string;
  status: 'active' | 'inactive';
  usedCount: number;
  totalCount: number;
  createdAt: string;
}

// 评价
export interface Evaluation {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  score: number;
  content?: string;
  anonymous: boolean;
  createdAt: string;
}

// 投诉
export interface Complaint {
  id: string;
  contactName?: string;
  phone?: string;
  content: string;
  relatedService?: string;
  complaintType: string;
  status: 'pending' | 'processing' | 'resolved';
  createdAt: string;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  principalType: 'ADMIN' | 'STAFF';
  user: AdminUser;
}

export interface UpdateProfileRequest {
  name: string;
  avatar: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}
