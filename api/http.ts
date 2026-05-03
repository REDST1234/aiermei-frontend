import { API_BASE_URL, USE_MOCK } from './config';
import { mockRoute } from '@/mock/handlers';
import type { ApiResponse } from '@/types/api';
import { getToken, clearSession } from '@/store/session';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, any>;
  header?: Record<string, string>;
}

export async function httpRequest<T>(options: RequestOptions): Promise<ApiResponse<T>> {
  const method = options.method || 'GET';

  if (USE_MOCK) {
    const mockResult = mockRoute(options.url, method, options.data);
    if (mockResult) {
      return Promise.resolve(mockResult as ApiResponse<T>);
    }
  }

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE_URL}${options.url}`,
      method,
      data: options.data,
      timeout: 10000,
      header: headers,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const data = res.data as ApiResponse<T>;
          // 处理业务层未授权
          if (data.code === 4003) {
            clearSession();
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
            reject(new Error('Unauthorized'));
            return;
          }
          resolve(data);
          return;
        }
        // 处理 HTTP 层未授权
        if (res.statusCode === 401) {
          clearSession();
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
          reject(new Error('Unauthorized'));
          return;
        }
        reject(new Error(`HTTP ${res.statusCode}`));
      },
      fail: (err) => reject(err)
    });
  });
}

export interface SSEEvent {
  event: string;
  data: any;
}

export interface SSEOptions {
  url: string;
  data?: Record<string, any>;
  header?: Record<string, string>;
  onEvent: (event: SSEEvent) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export function createSSEConnection(options: SSEOptions): UniApp.RequestTask {
  let sseTextBuffer = '';
  let sseByteBuffer = new Uint8Array(0);
  let decoder: TextDecoder | null = null;
  if (typeof TextDecoder !== 'undefined') {
    decoder = new TextDecoder('utf-8');
  }

  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
    ...options.header
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestTask = uni.request({
    url: `${API_BASE_URL}${options.url}`,
    method: 'POST',
    data: options.data,
    enableChunked: true,
    header: headers,
    success: () => {
      options.onComplete?.();
    },
    fail: (err) => {
      options.onError?.(new Error(err.errMsg || 'SSE connection failed'));
    }
  });

  (requestTask as any).onChunkReceived?.((response: { data: ArrayBuffer }) => {
    try {
      const chunk = new Uint8Array(response.data);
      let text = '';
      
      if (decoder) {
        text = decoder.decode(chunk, { stream: true });
      } else {
        // Fallback for missing TextDecoder
        const newBuffer = new Uint8Array(sseByteBuffer.length + chunk.length);
        newBuffer.set(sseByteBuffer);
        newBuffer.set(chunk, sseByteBuffer.length);
        sseByteBuffer = newBuffer;

        let str = '';
        for (let i = 0; i < sseByteBuffer.length; i += 1000) {
          const sub = sseByteBuffer.subarray(i, i + 1000);
          str += String.fromCharCode.apply(null, Array.from(sub));
        }
        try {
          text = decodeURIComponent(escape(str));
          sseByteBuffer = new Uint8Array(0); // successfully decoded, clear byte buffer
        } catch (e) {
          // split multi-byte character, wait for next chunk
          return;
        }
      }

      if (text) {
        sseTextBuffer += text;
        const events = sseTextBuffer.split('\n\n');
        sseTextBuffer = events.pop() || '';

        for (const eventText of events) {
          if (!eventText.trim()) continue;

          const lines = eventText.split('\n');
          let currentEvent = 'message';
          let currentData = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.substring(6).trim();
            } else if (line.startsWith('data:')) {
              const dataContent = line.substring(5).trim();
              if (currentData) {
                currentData += '\n' + dataContent;
              } else {
                currentData = dataContent;
              }
            }
          }

          if (currentData) {
            try {
              const parsedData = JSON.parse(currentData);
              options.onEvent({ event: currentEvent, data: parsedData });
            } catch {
              options.onEvent({ event: currentEvent, data: currentData });
            }
          }
        }
      }
    } catch (e) {
      console.error('SSE parse error:', e);
    }
  });

  return requestTask;
}