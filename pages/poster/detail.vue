<template>
  <view class="page">
    <view class="poster-cover">
      <image :src="detail.image || detail.cover" mode="aspectFill" class="cover-image" />
      <view class="back" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
    </view>

    <view class="content">
      <view class="title">{{ detail.title }}</view>
      <view class="desc">{{ detail.content }}</view>
    </view>

    <view class="actions">
      <button class="secondary-btn" @click="goCenter">查看中心</button>
      <button class="primary-btn" @click="handleAppointment">预约参观</button>
    </view>

    <view v-if="showQr" class="overlay" @click="showQr = false">
      <view class="qr-box" @click.stop>
        <view class="qr-title">扫码预约顾问</view>
        <image class="qr" :src="qrCodeUrl" mode="aspectFill" />
        <button class="primary-btn" @click="showQr = false">我知道了</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getBannerDetail, getAppointmentQrCode } from '@/api/modules/center';
import { trackPath } from '@/store/session';
import type { BannerDetail } from '@/types/domain';
import { tracker } from '@/utils/tracker';

const showQr = ref(false);
const qrCodeUrl = ref('https://picsum.photos/seed/qr/360/360');
const detail = ref<BannerDetail>({
  id: '0',
  title: '',
  content: '',
  image: 'https://picsum.photos/seed/detail/800/1200'
});

function parseEstimatedPriceFromText(text: string): number | undefined {
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return undefined;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function goBack() {
  uni.navigateBack();
}

function goCenter() {
  uni.reLaunch({ url: '/pages/center/index' });
}

function handleAppointment() {
  showQr.value = true;
  const estimatedPrice = parseEstimatedPriceFromText(detail.value.title || '');
  tracker.track('APPOINTMENT_INTENT', {
    path: '/pages/poster/detail',
    pathName: '海报详情',
    metadata: {
      sourceType: 'banner',
      sourceId: detail.value.id,
      targetPackage: detail.value.title,
      estimatedPrice,
      intentLevel: 'MEDIUM'
    }
  });
}

onLoad(async (query) => {
  const id = String(query.id || '1');
  trackPath(`海报详情:${id}`);
  
  try {
    const [detailRes, qrRes] = await Promise.all([
      getBannerDetail(id),
      getAppointmentQrCode('banner', id).catch(() => null)
    ]);
    
    detail.value = detailRes.data;
    if (qrRes?.data?.qrCodeUrl) {
      qrCodeUrl.value = qrRes.data.qrCodeUrl;
    }
  } catch (e) {
    console.error('Failed to load poster detail:', e);
  }
});
</script>

<style scoped>
.poster-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.back {
  position: absolute;
  left: 24rpx;
  top: var(--top-safe-offset-compact);
  color: #fff;
  width: 90rpx;
  height: 74rpx;
  text-align: center;
  line-height: 68rpx;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 50%;
}

.back-icon {
  width: 34rpx;
  height: 34rpx;
  filter: brightness(0) invert(1);
}

.content {
  padding: 44rpx;
}

.title {
  font-size: 42rpx;
  letter-spacing: 4rpx;
  margin-bottom: 24rpx;
}

.desc {
  font-size: 28rpx;
  color: #4b5563;
  line-height: 1.9;
}

.actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 28rpx calc(24rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.95);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48rpx;
}

.qr-box {
  width: 100%;
  background: #fff;
  border-radius: 24rpx;
  padding: 34rpx;
  text-align: center;
}

.qr-title {
  font-size: 34rpx;
  margin-bottom: 24rpx;
}

.qr {
  width: 400rpx;
  height: 400rpx;
  margin: 0 auto 24rpx;
}
</style>
