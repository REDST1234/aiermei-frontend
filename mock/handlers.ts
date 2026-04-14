import type { ApiResponse } from '@/types/api';
import { banners, contentCategories, contentItems, coupons, defaultProfile, faqCategories, faqItemsCommon, faqItemsPregnancy, fortuneCard, mockAnalysis, postpartumServices, presetQuestions, serviceHotlines, suites, centerSections, centerHome, magazineDetails } from './data';

export function createMockResponse<T>(data: T): ApiResponse<T> {
  return {
    code: 0,
    message: 'ok',
    data,
    requestId: `mock_${Date.now()}`
  };
}

export function mockRoute(url: string, method: string, data?: any): ApiResponse<any> | null {
  // 解析带查询参数的URL
  const urlWithoutQuery = url.split('?')[0];
  const queryStr = url.includes('?') ? url.split('?')[1] : '';
  const query: Record<string, string> = {};
  if (queryStr) {
    queryStr.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      query[k] = v;
    });
  }

  // 使用不带查询参数的 URL 进行匹配
  const key = `${method.toUpperCase()} ${urlWithoutQuery}`;

  switch (key) {
    // 首页Banner
    case 'GET /api/v1/banners':
      return createMockResponse(banners);

    // 内容中心
    case 'GET /api/v1/content/categories':
      return createMockResponse(contentCategories);

    case 'GET /api/v1/content/fortune/today':
      return createMockResponse(fortuneCard);

    case 'GET /api/v1/content/preset-questions':
      return createMockResponse(presetQuestions);

    case 'GET /api/v1/content/articles':
      const category = query.category || 'pregnancy';
      const page = parseInt(query.page || '1');
      const pageSize = parseInt(query.pageSize || '10');
      const filtered = contentItems.filter(item => item.category === category);
      const start = (page - 1) * pageSize;
      const list = filtered.slice(start, start + pageSize);
      return createMockResponse({
        list,
        page,
        pageSize,
        total: filtered.length,
        hasMore: start + pageSize < filtered.length
      });

    // 月子中心
    case 'GET /api/v1/centers/home':
      return createMockResponse(centerHome);

    case 'GET /api/v1/centers/sections':
      return createMockResponse(centerSections);

    case 'GET /api/v1/suites':
      return createMockResponse(suites);

    // 会员中心
    case 'GET /api/v1/users/me':
      return createMockResponse(defaultProfile);

    case 'GET /api/v1/member/coupons':
      return createMockResponse(coupons);

    case 'GET /api/v1/member/packages':
      return createMockResponse(suites);

    case 'GET /api/v1/member/postpartum-services':
      return createMockResponse(postpartumServices);

    // FAQ
    case 'GET /api/v1/faq/categories':
      return createMockResponse(faqCategories);

    case 'GET /api/v1/faq/items':
      const categoryId = query.categoryId || 'common';
      if (categoryId === 'pregnancy') {
        return createMockResponse(faqItemsPregnancy);
      }
      return createMockResponse(faqItemsCommon);

    // 服务热线
    case 'GET /api/v1/service/hotlines':
      return createMockResponse(serviceHotlines);

    // 评价与投诉
    case 'POST /api/v1/feedback/evaluations':
      return createMockResponse({ evaluationId: `eval_${Date.now()}`, submitted: true });

    case 'POST /api/v1/feedback/complaints':
      return createMockResponse({ complaintId: `complaint_${Date.now()}`, submitted: true });

    // 管理后台
    case 'POST /api/v1/admin/analyze-profile':
      return createMockResponse(mockAnalysis);

    // 登录
    case 'POST /api/v1/auth/wechat/login':
      return createMockResponse({ token: 'mock-token', refreshToken: 'mock-refresh', expiresIn: 7200 });

    case 'POST /api/v1/auth/logout':
      return createMockResponse(null);

    // AI对话 - 返回模拟的SSE响应（实际使用时会被SSE连接处理）
    case 'POST /api/v1/ai/chat':
      return createMockResponse({ sessionId: `chat_${Date.now()}`, content: '这是一条模拟的AI回复。' });

    default:
      // 动态路由处理
      if (urlWithoutQuery.startsWith('/api/v1/banners/')) {
        const id = urlWithoutQuery.split('/').pop();
        const banner = banners.find((item) => item.id === id) || banners[0];
        return createMockResponse({ id, title: banner.title, content: banner.detailContent, image: banner.image });
      }

      if (urlWithoutQuery.startsWith('/api/v1/posters/')) {
        const id = urlWithoutQuery.split('/').pop();
        const poster = banners.find((item) => item.id === id) || banners[0];
        return createMockResponse({ id, title: poster.detailTitle, content: poster.detailContent, image: poster.image });
      }

      if (urlWithoutQuery.startsWith('/api/v1/centers/sections/')) {
        const id = urlWithoutQuery.split('/').pop();
        const section = centerSections.find((item) => item.id === id) || centerSections[0];
        return createMockResponse({ id, title: section.title, detailImage: `https://picsum.photos/seed/${id}_long/1080/3000` });
      }

      if (urlWithoutQuery.startsWith('/api/v1/suites/')) {
        const id = urlWithoutQuery.split('/').pop();
        const suite = suites.find((item) => item.id === id) || suites[0];
        return createMockResponse(suite);
      }

      if (urlWithoutQuery.startsWith('/api/v1/content/articles/')) {
        const id = urlWithoutQuery.split('/').pop();
        const article = contentItems.find((item) => item.id === id);
        if (article) {
          return createMockResponse({ ...article, content: '<p>这是文章正文内容...</p>', publishedAt: '2026-04-14T10:00:00+08:00' });
        }
        return createMockResponse(contentItems[0]);
      }

      if (urlWithoutQuery.startsWith('/api/v1/member/magazines/')) {
        const id = urlWithoutQuery.split('/').pop();
        const magazine = magazineDetails.find((item) => item.id === id) || magazineDetails[0];
        return createMockResponse(magazine);
      }

      return null;
  }
}