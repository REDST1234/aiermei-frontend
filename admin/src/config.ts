import type { UiFeaturesResponse } from '@/types'

// UI 开关来源：'local' 表示仅读本地配置；'api' 表示请求后端 /ui/features
export const UI_FEATURE_SOURCE: 'local' | 'api' = 'local'

// 本地 UI 开关（当 UI_FEATURE_SOURCE='local' 时生效）
export const LOCAL_UI_FEATURES: UiFeaturesResponse = {
  hideRevenueUi: true,
  hideOrderUi: true,
  hideCouponUi: true
}
