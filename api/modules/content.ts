import { httpRequest } from '@/api/http';
import type { Pagination } from '@/types/api';
import type { ContentItem, ContentCategoryItem, FortuneCard, PresetQuestion } from '@/types/domain';

export function getContentCategories() {
  return httpRequest<ContentCategoryItem[]>({ url: '/api/v1/content/categories' });
}

export function getArticles(category: string, page: number = 1, pageSize: number = 10) {
  return httpRequest<Pagination<ContentItem>>({
    url: `/api/v1/content/articles?category=${category}&page=${page}&pageSize=${pageSize}`
  });
}

export function getArticleDetail(articleId: string) {
  return httpRequest<ContentItem>({ url: `/api/v1/content/articles/${articleId}` });
}

export function getTodayFortune() {
  return httpRequest<FortuneCard>({ url: '/api/v1/content/fortune/today' });
}

export function getPresetQuestions(limit?: number) {
  const query = limit ? `?limit=${limit}` : '';
  return httpRequest<PresetQuestion[]>({ url: `/api/v1/content/preset-questions${query}` });
}

// 文章互动接口响应类型
export interface ArticleStatsResponse {
  articleId: string;
  likes: number;
  views: number;
  liked: boolean | null;
}

// 浏览量上报（可匿名调用）
export function reportArticleView(articleId: string) {
  return httpRequest<ArticleStatsResponse>({
    url: `/api/v1/content/articles/${articleId}/views`,
    method: 'POST'
  });
}

// 点赞
export function likeArticle(articleId: string) {
  return httpRequest<ArticleStatsResponse>({
    url: `/api/v1/content/articles/${articleId}/likes`,
    method: 'POST'
  });
}

// 取消点赞
export function unlikeArticle(articleId: string) {
  return httpRequest<ArticleStatsResponse>({
    url: `/api/v1/content/articles/${articleId}/likes`,
    method: 'DELETE'
  });
}