import { httpRequest } from '@/api/http';
import type { AnalysisResult, DashboardOverview, UserJourney } from '@/types/domain';

/**
 * 获取后台概览数据
 */
export function getDashboardOverview() {
  return httpRequest<DashboardOverview>({ url: '/api/v1/admin/dashboard/overview' });
}

/**
 * 获取用户路径
 * @param uid 用户唯一 ID
 */
export function getUserJourney(uid: string) {
  return httpRequest<UserJourney>({ url: `/api/v1/analytics/users/${uid}/journey` });
}

/**
 * AI 路径分析
 * @param uid 用户唯一 ID
 * @param forceRefresh 是否强制刷新
 */
export function analyzeUser(uid: string, forceRefresh?: boolean) {
  return httpRequest<AnalysisResult>({
    url: `/api/v1/admin/users/${uid}/analysis`,
    method: 'POST',
    data: forceRefresh !== undefined ? { forceRefresh } : {}
  });
}
