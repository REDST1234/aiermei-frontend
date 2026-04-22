import instance from '../api/request'
import { mockArticles, mockEvaluations, mockComplaints } from './data'

export function setupMock() {
  const originalAdapter = instance.defaults.adapter

  instance.defaults.adapter = async (config) => {
    const url = config.url || ''
    
    // Create a helper to construct response
    const createRes = (data: any, code = 0, message = 'ok') => {
      const response = {
        data: { code, message, data, requestId: 'mock', timestamp: new Date().toISOString() },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {}
      }
      return Promise.resolve(response)
    }

    // Delay to simulate network
    await new Promise(resolve => setTimeout(resolve, 300))

    // Match Feedback Evaluation
    if (url.includes('/admin/feedback/evaluations')) {
      return createRes({ list: mockEvaluations, page: 1, pageSize: 50, total: mockEvaluations.length, hasMore: false })
    }

    // Match Feedback Complaint
    if (url.includes('/admin/feedback/complaints')) {
      if (config.method?.toUpperCase() === 'PUT') {
        return createRes(true)
      }
      return createRes({ list: mockComplaints, page: 1, pageSize: 50, total: mockComplaints.length, hasMore: false })
    }

    // Match Articles
    if (url.includes('/admin/content/articles')) {
      if (['PUT', 'POST', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
        return createRes(true)
      }
      return createRes({ list: mockArticles, page: 1, pageSize: 50, total: mockArticles.length, hasMore: false })
    }

    // If it does not match, try to use the original adapter (which will go to the proxy)
    console.warn(`[Mock Adapter] No mock found for: ${url}, falling back to network.`)
    if (originalAdapter) {
      if (typeof originalAdapter === 'function') {
        return (originalAdapter as any)(config)
      } else if (Array.isArray(originalAdapter) && typeof originalAdapter[0] === 'function') {
        return (originalAdapter[0] as any)(config)
      }
    }
    
    // Fallback error
    return Promise.reject(new Error(`No mock adapter for ${url}`))
  }
}
