import { getUiFeatures } from '@/api/modules/member';
import type { UiFeaturesResponse } from '@/types/api';
import { LOCAL_UI_FEATURES, UI_FEATURE_SOURCE } from '@/api/config';

const CACHE_KEY = 'aiermei_ui_features';

const DEFAULT_FEATURES: UiFeaturesResponse = {
  hideRevenueUi: Boolean(LOCAL_UI_FEATURES.hideRevenueUi),
  hideOrderUi: Boolean(LOCAL_UI_FEATURES.hideOrderUi),
  hideCouponUi: Boolean(LOCAL_UI_FEATURES.hideCouponUi)
};

let memoryCache: UiFeaturesResponse = readCache();
let loadingPromise: Promise<UiFeaturesResponse> | null = null;

function normalize(input?: Partial<UiFeaturesResponse> | null): UiFeaturesResponse {
  return {
    hideRevenueUi: Boolean(input?.hideRevenueUi),
    hideOrderUi: Boolean(input?.hideOrderUi),
    hideCouponUi: Boolean(input?.hideCouponUi)
  };
}

function readCache(): UiFeaturesResponse {
  try {
    const raw = uni.getStorageSync(CACHE_KEY);
    if (!raw) return { ...DEFAULT_FEATURES };
    if (typeof raw === 'string') {
      return normalize(JSON.parse(raw));
    }
    return normalize(raw as UiFeaturesResponse);
  } catch (_e) {
    return { ...DEFAULT_FEATURES };
  }
}

function writeCache(features: UiFeaturesResponse) {
  memoryCache = features;
  uni.setStorageSync(CACHE_KEY, features);
}

export function getUiFeatureCache() {
  return memoryCache;
}

export async function refreshUiFeatures(force = false): Promise<UiFeaturesResponse> {
  if (UI_FEATURE_SOURCE === 'local') {
    const localFeatures = { ...DEFAULT_FEATURES };
    writeCache(localFeatures);
    return localFeatures;
  }
  if (!force && loadingPromise) return loadingPromise;
  loadingPromise = getUiFeatures()
    .then((res) => {
      const normalized = normalize(res.data);
      writeCache(normalized);
      return normalized;
    })
    .catch((_e) => memoryCache)
    .finally(() => {
      loadingPromise = null;
    });
  return loadingPromise;
}
