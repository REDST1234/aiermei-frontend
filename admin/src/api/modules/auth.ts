import { useUserStore } from '@/stores/user'
import { get, post, put } from '../request'
import type {
  AnalysisTask,
  AdminUser,
  AnalysisResult,
  Customer,
  DashboardOverview,
  LoginRequest,
  LoginResponse,
  PageResponse,
  UserJourney,
  UpdateProfileRequest,
  ChangePasswordRequest
} from '@/types'

export function login(data: LoginRequest, type: 'admin' | 'staff' = 'admin') {
  return post<LoginResponse>(`/${type}/auth/login`, data)
}

export function getCurrentProfile(type: 'admin' | 'staff' = 'admin') {
  return get<AdminUser>(`/${type}/auth/me`)
}

export function logout(type: 'admin' | 'staff' = 'admin') {
  return post<void>(`/${type}/auth/logout`)
}

export function updateProfile(data: UpdateProfileRequest, type: 'admin' | 'staff' = 'admin') {
  return put<AdminUser>(`/${type}/auth/me`, data)
}

export function changePassword(data: ChangePasswordRequest, type: 'admin' | 'staff' = 'admin') {
  return put<void>(`/${type}/auth/password`, data)
}

export function getDashboardOverview() {
  return get<DashboardOverview>(`${useUserStore().apiPrefix}/dashboard/overview`)
}

export function getCustomers(params: { page: number; pageSize: number; keyword?: string }) {
  return get<PageResponse<Customer>>(`${useUserStore().apiPrefix}/customers`, params)
}

export function getCustomerDetail(uid: string) {
  return get<Customer>(`${useUserStore().apiPrefix}/customers/${uid}`)
}

export function getUserJourney(uid: string, limit?: number) {
  return get<UserJourney>(`${useUserStore().apiPrefix}/customers/${uid}/journey`, {
    limit
  })
}

export function analyzeUser(uid: string, forceRefresh?: boolean) {
  return post<AnalysisResult>(`${useUserStore().apiPrefix}/users/${uid}/analysis`, {
    forceRefresh: Boolean(forceRefresh)
  })
}

export function createAnalysisTask(uid: string, forceRefresh?: boolean) {
  return post<AnalysisTask>(`${useUserStore().apiPrefix}/users/${uid}/analysis/tasks`, {
    forceRefresh: Boolean(forceRefresh)
  })
}

export function getAnalysisTask(uid: string, taskId: string) {
  return get<AnalysisTask>(`${useUserStore().apiPrefix}/users/${uid}/analysis/tasks/${taskId}`)
}

export function getLatestAnalysisTask(uid: string) {
  return get<AnalysisTask>(`${useUserStore().apiPrefix}/users/${uid}/analysis/tasks/latest`)
}
