import { useUserStore } from '@/stores/user'
import { del, get, post, put, request } from '../request'
import type {
  AdminTagDictItem,
  DecayConfigItem,
  PageResponse,
  ScoringWeights,
  TagMention,
  TagPendingDetail,
  TagPendingItem,
  TagReviewRequest,
  TagReviewResult,
  TrafficSourcesStat,
  UploadFileResponse
} from '@/types'

export function getTagPendingList(params: { status?: string; keyword?: string; page: number; pageSize: number }) {
  return get<PageResponse<TagPendingItem>>(`${useUserStore().apiPrefix}/tag-pending`, params)
}

export function getTagPendingDetail(pendingId: string) {
  return get<TagPendingDetail>(`${useUserStore().apiPrefix}/tag-pending/${pendingId}`)
}

export function getTagMentions(pendingId: string, params: { page: number; pageSize: number }) {
  return get<PageResponse<TagMention>>(`${useUserStore().apiPrefix}/tag-pending/${pendingId}/mentions`, params)
}

export function reviewTagPending(pendingId: string, data: TagReviewRequest) {
  return post<TagReviewResult>(`${useUserStore().apiPrefix}/tag-pending/${pendingId}/review`, data)
}

export function getScoringWeights() {
  return get<ScoringWeights>(`${useUserStore().apiPrefix}/scoring-weights`)
}

export function updateScoringWeights(data: Pick<ScoringWeights, 'conversionIntent' | 'spendingPower' | 'recentActivity'>) {
  return put<ScoringWeights>(`${useUserStore().apiPrefix}/scoring-weights`, data)
}

export function getDecayConfigList() {
  return get<DecayConfigItem[]>(`${useUserStore().apiPrefix}/decay-config`)
}

export function updateDecayConfig(eventType: string, data: Partial<Pick<DecayConfigItem, 'initialWeight' | 'lambda' | 'minWeight'>>) {
  return put<DecayConfigItem>(`${useUserStore().apiPrefix}/decay-config/${eventType}`, data)
}

export function getTrafficSources(days: number) {
  return get<TrafficSourcesStat>(`${useUserStore().apiPrefix}/dashboard/traffic-sources`, { days })
}

// ============ 标签字典 ============

export function getTagDictionary(params: { keyword?: string; status?: string }) {
  return get<AdminTagDictItem[]>(`${useUserStore().apiPrefix}/tag-dictionary`, params)
}

export function updateTagDictionary(tagCode: string, data: Partial<AdminTagDictItem>) {
  return put<AdminTagDictItem>(`${useUserStore().apiPrefix}/tag-dictionary/${tagCode}`, data)
}

export function uploadFile(file: File, bizType: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bizType', bizType)
  return request<UploadFileResponse>({
    method: 'POST',
    url: '/files/upload',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
