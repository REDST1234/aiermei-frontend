import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'
import type { ApiResponse } from '@/types'

// 标记是否正在处理登录过期，防止并发请求导致多个提示框
let isRelogging = false

// 记录当前正在显示的错误消息内容，用于去重
const errorMessages = new Set<string>()

/**
 * 显示错误消息（去重版）
 */
function showError(message: string, onClose?: () => void) {
  if (errorMessages.has(message)) return
  errorMessages.add(message)
  ElMessage.error({
    message,
    onClose: () => {
      errorMessages.delete(message)
      onClose?.()
    }
  })
}

const instance: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    
    // 检查是否有弃用告警头
    if (response.headers['x-api-deprecated'] === 'true') {
      const replacement = response.headers['x-api-replacement']
      console.warn(`[API 弃用警告] 当前接口已被标记为废弃，建议尽快迁移至：${replacement || '新接口'}`)
    }
    
    if (data.code === 0) {
      return data as unknown as AxiosResponse
    }
    
    // 业务错误
    if (data.code === 4003) {
      // 未登录或 token 过期
      if (!isRelogging) {
        isRelogging = true
        const userStore = useUserStore()
        userStore.logout()
        router.push({ name: 'Login' })
        showError('登录已过期，请重新登录', () => {
          isRelogging = false
        })
      }
    } else {
      showError(data.message || '请求失败')
    }
    
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    if (error.response?.status === 401) {
      if (!isRelogging) {
        isRelogging = true
        const userStore = useUserStore()
        userStore.logout()
        router.push({ name: 'Login' })
        showError('登录已过期，请重新登录', () => {
          isRelogging = false
        })
      }
    } else {
      showError(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export async function request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return instance.request(config)
}

export function get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
  return request<T>({ method: 'GET', url, params })
}

export function post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  return request<T>({ method: 'POST', url, data })
}

export function put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  return request<T>({ method: 'PUT', url, data })
}

export function del<T>(url: string): Promise<ApiResponse<T>> {
  return request<T>({ method: 'DELETE', url })
}

export default instance
