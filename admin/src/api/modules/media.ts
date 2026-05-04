import { useUserStore } from '@/stores/user'
﻿import { del, get, post, put } from '../request'
import type { Banner, Magazine, Suite } from '@/types'

export function getBanners() {
  return get<Banner[]>(`${useUserStore().apiPrefix}/content/banners`)
}

export function getBannerDetail(id: string) {
  return get<Banner>(`${useUserStore().apiPrefix}/content/banners/${id}`)
}

export function createBanner(data: Partial<Banner>) {
  return post<Banner>(`${useUserStore().apiPrefix}/content/banners`, data)
}

export function updateBanner(id: string, data: Partial<Banner>) {
  return put<Banner>(`${useUserStore().apiPrefix}/content/banners/${id}`, data)
}

export function deleteBanner(id: string, version: number) {
  return del<void>(`${useUserStore().apiPrefix}/content/banners/${id}`, { version })
}

export function getMagazines() {
  return get<Magazine[]>(`${useUserStore().apiPrefix}/content/magazines`)
}

export function getMagazineDetail(id: string) {
  return get<Magazine>(`${useUserStore().apiPrefix}/content/magazines/${id}`)
}

export function createMagazine(data: Partial<Magazine>) {
  return post<Magazine>(`${useUserStore().apiPrefix}/content/magazines`, data)
}

export function updateMagazine(id: string, data: Partial<Magazine>) {
  return put<Magazine>(`${useUserStore().apiPrefix}/content/magazines/${id}`, data)
}

export function deleteMagazine(id: string, version: number) {
  return del<void>(`${useUserStore().apiPrefix}/content/magazines/${id}`, { version })
}

export function getSuites() {
  return get<Suite[]>(`${useUserStore().apiPrefix}/content/suites`)
}

export function getSuiteDetail(id: string) {
  return get<Suite>(`${useUserStore().apiPrefix}/content/suites/${id}`)
}

export function createSuite(data: Partial<Suite>) {
  return post<Suite>(`${useUserStore().apiPrefix}/content/suites`, data)
}

export function updateSuite(id: string, data: Partial<Suite>) {
  return put<Suite>(`${useUserStore().apiPrefix}/content/suites/${id}`, data)
}

export function deleteSuite(id: string, version: number) {
  return del<void>(`${useUserStore().apiPrefix}/content/suites/${id}`, { version })
}
