import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getUiFeatures } from '@/api/modules/ui-features'
import type { UiFeaturesResponse } from '@/types'
import { LOCAL_UI_FEATURES, UI_FEATURE_SOURCE } from '@/config'

const UI_FEATURE_CACHE_KEY = 'aiermei_admin_ui_features'

const DEFAULT_FEATURES: UiFeaturesResponse = {
  hideRevenueUi: Boolean(LOCAL_UI_FEATURES.hideRevenueUi),
  hideOrderUi: Boolean(LOCAL_UI_FEATURES.hideOrderUi),
  hideCouponUi: Boolean(LOCAL_UI_FEATURES.hideCouponUi)
}

function parseCachedFeatures(): UiFeaturesResponse {
  try {
    const raw = localStorage.getItem(UI_FEATURE_CACHE_KEY)
    if (!raw) return { ...DEFAULT_FEATURES }
    const parsed = JSON.parse(raw) as Partial<UiFeaturesResponse>
    return {
      hideRevenueUi: Boolean(parsed.hideRevenueUi),
      hideOrderUi: Boolean(parsed.hideOrderUi),
      hideCouponUi: Boolean(parsed.hideCouponUi)
    }
  } catch (_e) {
    return { ...DEFAULT_FEATURES }
  }
}

export const useUiFeatureStore = defineStore('uiFeature', () => {
  const features = ref<UiFeaturesResponse>(parseCachedFeatures())
  const initialized = ref(false)

  const hideRevenueUi = computed(() => Boolean(features.value.hideRevenueUi))
  const hideOrderUi = computed(() => Boolean(features.value.hideOrderUi))
  const hideCouponUi = computed(() => Boolean(features.value.hideCouponUi))

  function setFeatures(next: UiFeaturesResponse) {
    features.value = {
      hideRevenueUi: Boolean(next.hideRevenueUi),
      hideOrderUi: Boolean(next.hideOrderUi),
      hideCouponUi: Boolean(next.hideCouponUi)
    }
    localStorage.setItem(UI_FEATURE_CACHE_KEY, JSON.stringify(features.value))
    initialized.value = true
  }

  async function fetchFeatures() {
    if (UI_FEATURE_SOURCE === 'local') {
      setFeatures({ ...DEFAULT_FEATURES })
      return
    }
    const res = await getUiFeatures()
    setFeatures(res.data)
  }

  async function initFeatures() {
    if (initialized.value) return
    try {
      await fetchFeatures()
    } catch (_e) {
      initialized.value = true
    }
  }

  return {
    features,
    initialized,
    hideRevenueUi,
    hideOrderUi,
    hideCouponUi,
    setFeatures,
    fetchFeatures,
    initFeatures
  }
})
