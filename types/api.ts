export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  requestId?: string;
}

export interface Pagination<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore?: boolean;
}

export interface WechatLoginReq {
  code: string;
  encryptedPhoneData?: string;
  iv?: string;
  redirectUri?: string;
}

export interface WechatLoginResp {
  token: string;
  user: {
    uid: string;
    name: string;
    avatar?: string;
    memberLevel?: string;
    isLoggedIn: boolean;
  };
}

export interface EvaluationReq {
  orderId?: string;
  score: number;
  content?: string;
  anonymous?: boolean;
}

export interface ComplaintReq {
  contactName?: string;
  phone?: string;
  content: string;
  relatedService?: string;
  complaintType?: 'SERVICE_QUALITY' | 'FACILITY_ENVIRONMENT' | 'CATERING_SUGGESTION' | 'OTHER';
}

export interface AiChatReq {
  sessionId?: string;
  message: string;
}

export interface AiChatStartEvent {
  sessionId: string;
}

export interface AiChatDeltaEvent {
  content: string;
}

export interface AiChatSuggestionEvent {
  items: string[];
}

export interface AiChatDoneEvent {
  finishReason: string;
}

export interface AiChatErrorEvent {
  code: number;
  message: string;
}

export interface AiMessage {
  seqNo: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export interface AiSessionMessagesResp {
  sessionId: string;
  list: AiMessage[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface UpdateUserReq {
  name?: string;
  avatar?: string;
  phone?: string;
  pregnancyType?: 'pregnancy' | 'postpartum';
  pregnancyDate?: string;
}

export interface UiFeaturesResponse {
  hideRevenueUi: boolean;
  hideOrderUi: boolean;
  hideCouponUi: boolean;
}
