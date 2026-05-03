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
  return get<PageResponse<TagPendingItem>>(`/admin/tag-pending`, params)
}

export function getTagPendingDetail(pendingId: string) {
  return get<TagPendingDetail>(`/admin/tag-pending/${pendingId}`)
}

export function getTagMentions(pendingId: string, params: { page: number; pageSize: number }) {
  return get<PageResponse<TagMention>>(`/admin/tag-pending/${pendingId}/mentions`, params)
}

export function reviewTagPending(pendingId: string, data: TagReviewRequest) {
  return post<TagReviewResult>(`/admin/tag-pending/${pendingId}/review`, data)
}

export function getScoringWeights() {
  return get<ScoringWeights>(`/admin/scoring-weights`)
}

export function updateScoringWeights(data: Pick<ScoringWeights, 'conversionIntent' | 'spendingPower' | 'recentActivity'>) {
  return put<ScoringWeights>(`/admin/scoring-weights`, data)
}

export function getDecayConfigList() {
  return get<DecayConfigItem[]>(`/admin/decay-config`)
}

export function updateDecayConfig(eventType: string, data: Partial<Pick<DecayConfigItem, 'initialWeight' | 'lambda' | 'minWeight'>>) {
  return put<DecayConfigItem>(`/admin/decay-config/${eventType}`, data)
}

export function getTrafficSources(days: number) {
  return get<TrafficSourcesStat>(`/admin/dashboard/traffic-sources`, { days })
}

// ============ 标签字典 ============

export function getTagDictionary(params: { keyword?: string; status?: string }) {
  return get<AdminTagDictItem[]>(`/admin/tag-dictionary`, params)
}

export function updateTagDictionary(tagCode: string, data: Partial<AdminTagDictItem>) {
  return put<AdminTagDictItem>(`/admin/tag-dictionary/${tagCode}`, data)
}

export function createTagDictionary(data: Partial<AdminTagDictItem>) {
  return post<AdminTagDictItem>(`/admin/tag-dictionary`, data)
}

export function deleteTagDictionary(tagCode: string) {
  return del<void>(`/admin/tag-dictionary/${tagCode}`)
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
