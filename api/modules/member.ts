import { httpRequest, createSSEConnection, type SSEEvent } from '@/api/http';
import { API_BASE_URL } from '@/api/config';
import { getToken } from '@/store/session';
import type { EvaluationReq, ComplaintReq, AiChatReq, AiChatStartEvent, AiChatDeltaEvent, AiChatSuggestionEvent, AiChatDoneEvent, AiChatErrorEvent, AiSessionMessagesResp, UpdateUserReq, UiFeaturesResponse } from '@/types/api';
import type { Coupon, PostpartumService, FaqCategory, FaqItem, ServiceHotlines, Suite, MagazineDetail } from '@/types/domain';

export function getCurrentUser() {
  return httpRequest<{
    uid: string;
    name: string;
    avatar?: string;
    phone?: string;
    memberLevel?: string;
    isLoggedIn: boolean;
    pregnancyInfo?: { type: 'pregnancy' | 'postpartum'; date: string };
    tags?: string[];
    lastActive: string;
  }>({ url: '/api/v1/users/me' });
}

export function getMemberHome() {
  return httpRequest<{
    user: {
      uid: string;
      name: string;
      avatar?: string;
      memberLevel?: string;
    };
    magazines?: {
      id: string;
      title: string;
      subtitle: string;
      desc: string;
      cover: string;
    }[];
    serviceEntries?: { id: string; label: string }[];
    quickLinks?: { id: string; label: string }[];
  }>({ url: '/api/v1/member/home' });
}

export function getUiFeatures() {
  return httpRequest<UiFeaturesResponse>({ url: '/api/v1/ui/features' });
}

export function getMemberCoupons() {
  return httpRequest<Coupon[]>({ url: '/api/v1/member/coupons' });
}

export function getMemberPackages() {
  return httpRequest<Suite[]>({ url: '/api/v1/member/packages' });
}

export function getMagazineDetail(magazineId: string) {
  return httpRequest<MagazineDetail>({ url: `/api/v1/member/magazines/${magazineId}` });
}

export function getPostpartumServices() {
  return httpRequest<PostpartumService[]>({ url: '/api/v1/member/postpartum-services' });
}

export function getFaqCategories() {
  return httpRequest<FaqCategory[]>({ url: '/api/v1/faq/categories' });
}

export function getFaqItems(categoryId: string) {
  return httpRequest<FaqItem[]>({ url: `/api/v1/faq/items?categoryId=${categoryId}` });
}

export function getServiceHotlines() {
  return httpRequest<ServiceHotlines>({ url: '/api/v1/service/hotlines' });
}

export function submitEvaluation(payload: EvaluationReq) {
  return httpRequest<{ evaluationId: string; submitted: boolean }>({
    url: '/api/v1/feedback/evaluations',
    method: 'POST',
    data: payload
  });
}

export function submitComplaint(payload: ComplaintReq) {
  return httpRequest<{ complaintId: string; submitted: boolean }>({
    url: '/api/v1/feedback/complaints',
    method: 'POST',
    data: payload
  });
}

export interface AiChatCallbacks {
  onStart?: (data: AiChatStartEvent) => void;
  onDelta?: (data: AiChatDeltaEvent) => void;
  onSuggestion?: (data: AiChatSuggestionEvent) => void;
  onDone?: (data: AiChatDoneEvent) => void;
  onError?: (data: AiChatErrorEvent) => void;
  onConnectionError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * AI 问答（SSE 流式响应）
 * @param payload 请求参数
 * @param callbacks 各事件回调
 * @returns UniApp.RequestTask 可用于取消请求
 */
export function aiChat(payload: AiChatReq, callbacks: AiChatCallbacks): UniApp.RequestTask {
  return createSSEConnection({
    url: '/api/v1/ai/chat',
    data: payload,
    onEvent: (event: SSEEvent) => {
      switch (event.event) {
        case 'start':
          callbacks.onStart?.(event.data);
          break;
        case 'delta':
          callbacks.onDelta?.(event.data);
          break;
        case 'suggestion':
          callbacks.onSuggestion?.(event.data);
          break;
        case 'done':
          callbacks.onDone?.(event.data);
          break;
        case 'error':
          callbacks.onError?.(event.data);
          break;
      }
    },
    onError: callbacks.onConnectionError,
    onComplete: callbacks.onComplete
  });
}

export function getAiSessionMessages(sessionId: string, cursor?: string, limit: number = 20) {
  const queryParts: string[] = [];
  if (cursor) queryParts.push(`cursor=${encodeURIComponent(cursor)}`);
  queryParts.push(`limit=${limit}`);

  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return httpRequest<AiSessionMessagesResp>({
    url: `/api/v1/ai/sessions/${sessionId}/messages${query}`
  });
}

export function updateCurrentUser(payload: UpdateUserReq) {
  return httpRequest<{
    uid: string;
    name: string;
    avatar?: string;
    phone?: string;
    memberLevel?: string;
    isLoggedIn: boolean;
    pregnancyInfo?: { type: 'pregnancy' | 'postpartum'; date: string };
    lastActive: string;
  }>({
    url: '/api/v1/users/me',
    method: 'PUT',
    data: payload
  });
}

export function uploadUserAvatar(filePath: string) {
  const token = getToken();
  return new Promise<{
    code: number;
    message: string;
    data: { url: string; bizType: string; fileId: string };
    requestId?: string;
  }>((resolve, reject) => {
    uni.uploadFile({
      url: `${API_BASE_URL}/api/v1/files/upload`,
      filePath,
      name: 'file',
      formData: { bizType: 'user_avatar' },
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        try {
          const parsed = JSON.parse(res.data || '{}');
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      },
      fail: (err) => reject(err)
    });
  });
}
