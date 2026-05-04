import { get, put } from '../request'
import type { UiFeaturesResponse } from '@/types'

export function getUiFeatures() {
  return get<UiFeaturesResponse>('/ui/features')
}

export function getAdminUiFeatures() {
  return get<UiFeaturesResponse>('/admin/ui/features')
}

export function updateAdminUiFeatures(payload: Partial<UiFeaturesResponse>) {
  return put<UiFeaturesResponse>('/admin/ui/features', payload)
}

