import { useUserStore } from '@/stores/user'
import { get, post, put, del } from '../request'
import type { PageResponse } from '@/types'

// FAQ 分类
export interface FaqCategory {
  id: string;
  name: string;
  sort: number;
  createdAt: string;
  version?: number;
}

// FAQ 条目
export interface FaqItem {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  sort: number;
  status: 'active' | 'inactive';
  createdAt: string;
  version?: number;
}

// ============ 分类管理 ============

export function getFaqCategories() {
  return get<FaqCategory[]>(`${useUserStore().apiPrefix}/faq/categories`)
}

export function createFaqCategory(data: { name: string; sort: number }) {
  return post<FaqCategory>(`${useUserStore().apiPrefix}/faq/categories`, data)
}

export function updateFaqCategory(id: string, data: { name: string; sort: number; version?: number }) {
  return put<FaqCategory>(`${useUserStore().apiPrefix}/faq/categories/${id}`, data)
}

export function deleteFaqCategory(id: string, version: number) {
  return del<void>(`${useUserStore().apiPrefix}/faq/categories/${id}`, { version })
}

// ============ 条目管理 ============

export function getFaqItems(params: { page: number; pageSize: number; categoryId?: string }) {
  return get<PageResponse<FaqItem>>(`${useUserStore().apiPrefix}/faq/items`, params)
}

export function getFaqItemDetail(id: string) {
  return get<FaqItem>(`${useUserStore().apiPrefix}/faq/items/${id}`)
}

export function createFaqItem(data: Partial<FaqItem>) {
  return post<FaqItem>(`${useUserStore().apiPrefix}/faq/items`, data)
}

export function updateFaqItem(id: string, data: Partial<FaqItem>) {
  return put<FaqItem>(`${useUserStore().apiPrefix}/faq/items/${id}`, data)
}

export function deleteFaqItem(id: string, version: number) {
  return del<void>(`${useUserStore().apiPrefix}/faq/items/${id}`, { version })
}
