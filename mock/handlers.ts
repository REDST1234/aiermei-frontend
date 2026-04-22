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
      return createMockResponse({
        uid: 'user_123',
        name: '111房间号宝妈',
        avatar: 'https://picsum.photos/seed/avatar/200/200',
        phone: '138****0000',
        memberLevel: 'gold',
        isLoggedIn: true,
        pregnancyInfo: {
          type: 'postpartum',
          date: '2026-08-15'
        },
        tags: ['关注产后康复'],
        lastActive: new Date().toISOString()
      });

    case 'PUT /api/v1/users/me': {
      // Mock：将提交的字段合并回用户快照返回
      const updatedUser = {
        uid: 'user_123',
        name: data?.name || '111房间号宝妈',
        avatar: data?.avatar || 'https://picsum.photos/seed/avatar/200/200',
        phone: data?.phone || '138****0000',
        memberLevel: 'gold',
        isLoggedIn: true,
        pregnancyInfo: {
          type: data?.pregnancyType || 'postpartum',
          date: data?.pregnancyDate || '2026-08-15'
        },
        lastActive: new Date().toISOString()
      };
      return createMockResponse(updatedUser);
    }

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

    // 埋点上报
    case 'POST /api/v1/analytics/events/batch':
      return createMockResponse({
        accepted: Array.isArray(data?.events) ? data.events.length : 0,
        deduplicated: 0
      });

    // 管理后台
    case 'POST /api/v1/admin/analyze-profile':
      return createMockResponse(mockAnalysis);

    // 登录
    case 'POST /api/v1/auth/wechat/login':
      return createMockResponse({
        token: 'mock-token',
        user: {
          uid: 'user_123',
          name: '111房间号宝妈',
          avatar: 'https://picsum.photos/seed/avatar/200/200',
          memberLevel: 'gold',
          isLoggedIn: true
        }
      });

    case 'POST /api/v1/auth/logout':
      return createMockResponse(null);

    // AI对话 - 返回模拟的SSE响应（实际使用时会被SSE连接处理）
    case 'POST /api/v1/ai/chat':
      return createMockResponse({ sessionId: `chat_${Date.now()}`, content: '这是一条模拟的AI回复。' });

    default:
      // 动态路由处理
      // AI 历史消息
      if (urlWithoutQuery.startsWith('/api/v1/ai/sessions/') && urlWithoutQuery.endsWith('/messages')) {
        return createMockResponse({
          sessionId: urlWithoutQuery.split('/')[5],
          list: [
            { seqNo: 1, role: 'USER', content: '剖宫产后多久能做康复？', createdAt: '2026-04-15T10:00:00+08:00' },
            { seqNo: 2, role: 'ASSISTANT', content: '剖宫产后一般建议**术后6-8周**开始进行轻度康复训练，具体时间需根据您的身体恢复情况，建议咨询您的主治医生获得个性化建议。', createdAt: '2026-04-15T10:00:05+08:00' },
            { seqNo: 3, role: 'USER', content: '新生儿作息怎么建立？', createdAt: '2026-04-15T11:00:00+08:00' },
            { seqNo: 4, role: 'ASSISTANT', content: '建立新生儿作息建议：\n\n1. **区分昼夜**：白天保持明亮，晚上保持昏暗\n2. **规律喂养**：每2-3小时喂养一次\n3. **睡前仪式**：洗澡、按摩、轻声哼唱\n4. **观察睡意信号**：打哈欠、揉眼睛时及时哄睡', createdAt: '2026-04-15T11:00:08+08:00' }
          ],
          nextCursor: undefined,
          hasMore: false
        });
      }

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

      // 文章互动：浏览量上报 POST /articles/{id}/views
      if (method.toUpperCase() === 'POST' && urlWithoutQuery.match(/^\/api\/v1\/content\/articles\/[^/]+\/views$/)) {
        const articleId = urlWithoutQuery.split('/')[5];
        const article = contentItems.find(a => a.id === articleId);
        return createMockResponse({
          articleId,
          likes: article?.likes ?? 0,
          views: (article?.views ?? 0) + 1,
          liked: null
        });
      }

      // 文章互动：点赞 POST /articles/{id}/likes
      if (method.toUpperCase() === 'POST' && urlWithoutQuery.match(/^\/api\/v1\/content\/articles\/[^/]+\/likes$/)) {
        const articleId = urlWithoutQuery.split('/')[5];
        const article = contentItems.find(a => a.id === articleId);
        return createMockResponse({
          articleId,
          likes: (article?.likes ?? 0) + 1,
          views: article?.views ?? 0,
          liked: true
        });
      }

      // 文章互动：取消点赞 DELETE /articles/{id}/likes
      if (method.toUpperCase() === 'DELETE' && urlWithoutQuery.match(/^\/api\/v1\/content\/articles\/[^/]+\/likes$/)) {
        const articleId = urlWithoutQuery.split('/')[5];
        const article = contentItems.find(a => a.id === articleId);
        return createMockResponse({
          articleId,
          likes: Math.max(0, (article?.likes ?? 1) - 1),
          views: article?.views ?? 0,
          liked: false
        });
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
