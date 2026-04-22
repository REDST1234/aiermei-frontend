import { httpRequest } from '@/api/http';
import { USE_MOCK } from '@/api/config';
import { getToken } from '@/store/session';

export interface AnalyticsEvent {
  eventId: string;
  eventType: string;
  path: string;
  pathName?: string;
  occurredAt: string;
  durationSeconds?: number;
  metadata?: Record<string, any>;
}

class AnalyticsTracker {
  private queue: AnalyticsEvent[] = [];
  private flushTimer: any = null;
  private isFlushing = false;

  private readonly MAX_QUEUE_SIZE = 20;
  private readonly FLUSH_INTERVAL_MS = 30000;
  private readonly MAX_BUFFER_SIZE = 200;
  private readonly MAX_RETRY_DELAY_MS = 5 * 60 * 1000;

  private retryDelayMs = this.FLUSH_INTERVAL_MS;
  private consecutiveFailures = 0;

  private utmParams: Record<string, string> = {};

  constructor() {
    this.utmParams = uni.getStorageSync('aiermei_utm') || {};
  }

  public setUtmParams(query: Record<string, any>) {
    const utms: Record<string, string> = {};
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'sourceId'];
    let changed = false;
    for (const key of keys) {
      if (query[key]) {
        utms[key] = query[key];
        changed = true;
      }
    }
    if (changed) {
      this.utmParams = { ...this.utmParams, ...utms };
      uni.setStorageSync('aiermei_utm', this.utmParams);
    }
  }

  public getUtmParams() {
    return this.utmParams;
  }

  public track(eventType: string, params: Omit<AnalyticsEvent, 'eventId' | 'occurredAt' | 'eventType'>) {
    const event: AnalyticsEvent = {
      eventId: this.generateUUID(),
      eventType,
      path: params.path,
      pathName: params.pathName,
      occurredAt: this.getISO8601WithTimezone(),
      durationSeconds: params.durationSeconds,
      metadata: {
        ...this.utmParams,
        ...(params.metadata || {})
      }
    };

    this.queue.push(event);
    if (this.queue.length > this.MAX_BUFFER_SIZE) {
      this.queue.splice(0, this.queue.length - this.MAX_BUFFER_SIZE);
    }

    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
    } else {
      this.resetTimer(this.FLUSH_INTERVAL_MS);
    }
  }

  public async flush() {
    if (this.queue.length === 0 || this.isFlushing) return;

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // In mock mode, mark batch as accepted locally and avoid network calls.
    if (USE_MOCK) {
      this.queue = [];
      this.onFlushSuccess();
      return;
    }

    // Current backend requires bearer token for this endpoint.
    if (!getToken()) {
      this.resetTimer(this.FLUSH_INTERVAL_MS);
      return;
    }

    this.isFlushing = true;
    const batchSize = Math.min(this.queue.length, this.MAX_QUEUE_SIZE);
    const eventsToSend = this.queue.slice(0, batchSize);

    try {
      const res = await httpRequest({
        url: '/api/v1/analytics/events/batch',
        method: 'POST',
        data: {
          events: eventsToSend
        }
      });

      if (res.code !== 0) {
        throw new Error(`Business error: ${res.code}`);
      }

      // Remove only the confirmed successful batch.
      this.queue.splice(0, batchSize);
      this.onFlushSuccess();

      if (this.queue.length > 0) {
        this.resetTimer(this.FLUSH_INTERVAL_MS);
      }
    } catch (e) {
      this.onFlushFailure(e);
      this.resetTimer(this.retryDelayMs);
    } finally {
      this.isFlushing = false;
    }
  }

  private onFlushSuccess() {
    this.consecutiveFailures = 0;
    this.retryDelayMs = this.FLUSH_INTERVAL_MS;
  }

  private onFlushFailure(error: unknown) {
    this.consecutiveFailures += 1;
    this.retryDelayMs = Math.min(this.retryDelayMs * 2, this.MAX_RETRY_DELAY_MS);

    // Reduce noisy logs: print first failure and then every 5 failures.
    if (this.consecutiveFailures === 1 || this.consecutiveFailures % 5 === 0) {
      console.error('[Tracker] Failed to send events', error);
    }
  }

  private resetTimer(delayMs: number) {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    this.flushTimer = setTimeout(() => {
      this.flush();
    }, delayMs);
  }

  private generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private getISO8601WithTimezone() {
    const tzOffset = -new Date().getTimezoneOffset();
    const diff = tzOffset >= 0 ? '+' : '-';
    const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
    const offsetString = diff + pad(tzOffset / 60) + ':' + pad(tzOffset % 60);

    const now = new Date();
    const localISOTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, -1);

    return localISOTime.split('.')[0] + offsetString;
  }
}

export const tracker = new AnalyticsTracker();
