import { useUserStore } from '@/stores/user'
import { get, post, put, del } from '../request'
import type { Article, ArticleTag, ContentCategory, PageResponse, PresetQuestion } from '@/types'

// 获取文章列表
export function getArticles(params: { 
  page: number; 
  pageSize: number; 
  category?: string; 
  status?: string;
  keyword?: string;
}) {
  return get<PageResponse<Article>>(`${useUserStore().apiPrefix}/content/articles`, params)
}

// 获取文章详情
export function getArticleDetail(id: string) {
  return get<Article>(`${useUserStore().apiPrefix}/content/articles/${id}`)
}

// 创建文章
export function createArticle(data: Partial<Article>) {
  return post<Article>(`${useUserStore().apiPrefix}/content/articles`, data)
}

// 更新文章
export function updateArticle(id: string, data: Partial<Article>) {
  return put<Article>(`${useUserStore().apiPrefix}/content/articles/${id}`, data)
}

// 删除文章
export function deleteArticle(id: string) {
  return del<void>(`${useUserStore().apiPrefix}/content/articles/${id}`)
}

// 发布文章
export function publishArticle(id: string) {
  return post<Article>(`${useUserStore().apiPrefix}/content/articles/${id}/publish`)
}

// 归档文章
export function archiveArticle(id: string) {
  return post<Article>(`${useUserStore().apiPrefix}/content/articles/${id}/archive`)
}

// 获取分类列表
export function getCategories() {
  return get<ContentCategory[]>(`${useUserStore().apiPrefix}/content/categories`)
}

// 创建分类
export function createCategory(data: { label: string; sort: number }) {
  return post<ContentCategory>(`${useUserStore().apiPrefix}/content/categories`, data)
}

// 更新分类
export function updateCategory(id: string, data: { label: string; sort: number }) {
  return put<ContentCategory>(`${useUserStore().apiPrefix}/content/categories/${id}`, data)
}

// 删除分类
export function deleteCategory(id: string) {
  return del<void>(`${useUserStore().apiPrefix}/content/categories/${id}`)
}

export function extractArticleTags(articleId: string) {
  return post<ArticleTag[]>(`${useUserStore().apiPrefix}/articles/${articleId}/extract-tags`)
}

export function getArticleTags(articleId: string) {
  return get<ArticleTag[]>(`${useUserStore().apiPrefix}/articles/${articleId}/tags`)
}

export function addArticleTag(articleId: string, data: { tagCode: string; tagName: string; tagType?: string }) {
  return post<ArticleTag>(`${useUserStore().apiPrefix}/articles/${articleId}/tags`, data)
}

export function deleteArticleTag(articleId: string, tagCode: string) {
  return del<void>(`${useUserStore().apiPrefix}/articles/${articleId}/tags/${tagCode}`)
}

// 预设问题 CRUD
export function getPresetQuestions() {
  return get<PresetQuestion[]>(`${useUserStore().apiPrefix}/content/preset-questions`)
}

export function getPresetQuestion(id: string) {
  return get<PresetQuestion>(`${useUserStore().apiPrefix}/content/preset-questions/${id}`)
}

export function createPresetQuestion(data: PresetQuestion) {
  return post<PresetQuestion>(`${useUserStore().apiPrefix}/content/preset-questions`, data)
}

export function updatePresetQuestion(id: string, data: PresetQuestion) {
  return put<PresetQuestion>(`${useUserStore().apiPrefix}/content/preset-questions/${id}`, data)
}

export function deletePresetQuestion(id: string) {
  return del<void>(`${useUserStore().apiPrefix}/content/preset-questions/${id}`)
}
