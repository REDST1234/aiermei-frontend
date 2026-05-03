import { useUserStore } from '@/stores/user'
import { del, get, post, put } from '../request'
import type { PostpartumService } from '@/types'

export function getPostpartumServices() {
  return get<PostpartumService[]>(`${useUserStore().apiPrefix}/postpartum-services`)
}

export function getPostpartumService(id: string) {
  return get<PostpartumService>(`${useUserStore().apiPrefix}/postpartum-services/${id}`)
}

export function createPostpartumService(data: PostpartumService) {
  return post<PostpartumService>(`${useUserStore().apiPrefix}/postpartum-services`, data)
}

export function updatePostpartumService(id: string, data: PostpartumService) {
  return put<PostpartumService>(`${useUserStore().apiPrefix}/postpartum-services/${id}`, data)
}

export function deletePostpartumService(id: string) {
  return del<void>(`${useUserStore().apiPrefix}/postpartum-services/${id}`)
}
