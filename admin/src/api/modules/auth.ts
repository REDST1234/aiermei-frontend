import { get, post } from '../request'
import type {
  AdminUser,
  AnalysisResult,
  Customer,
  DashboardOverview,
  LoginRequest,
  LoginResponse,
  PageResponse,
  UserJourney
} from '@/types'

export function login(data: LoginRequest, type: 'admin' | 'staff' = 'admin') {
  return post<LoginResponse>(`/${type}/auth/login`, data)
}

export function getCurrentAdmin() {
  return get<AdminUser>('/admin/auth/me')
}

export function logout() {
  return post<void>('/admin/auth/logout')
}

export function getDashboardOverview() {
  return get<DashboardOverview>('/admin/dashboard/overview')
}

export function getCustomers(params: { page: number; pageSize: number; keyword?: string }) {
  return get<PageResponse<Customer>>('/admin/customers', params)
}

export function getCustomerDetail(uid: string) {
  return get<Customer>(`/admin/customers/${uid}`)
}

export function getUserJourney(uid: string, limit?: number) {
  return get<UserJourney>(`/analytics/users/${uid}/journey`, {
    limit
  })
}

export function analyzeUser(uid: string, forceRefresh?: boolean) {
  return post<AnalysisResult>(`/admin/users/${uid}/analysis`, {
    forceRefresh: Boolean(forceRefresh)
  })
}
