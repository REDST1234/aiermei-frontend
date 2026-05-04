<template>
  <view class="page suite-page">
    <view class="head">
      <view class="back" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
      <view class="head-title">套房详情</view>
    </view>

    <view class="list-wrap" v-if="isLoggedIn">
      <view class="suite-card" v-for="item in suites" :key="item.id" @click="openDetail(item)">
        <view class="suite-cover-wrap">
          <image :src="item.coverImage || item.images?.[0]" class="suite-cover" mode="aspectFill" />

        </view>
        <view class="suite-body">
          <view class="suite-row">
            <view>
              <view class="suite-name">{{ item.name }}</view>
              <view class="suite-feat">{{ item.size }} / {{ item.features.join(' | ') }}</view>
            </view>
            <view class="suite-price">{{ item.priceLabel }}</view>
          </view>
          <button class="suite-btn">查看详情</button>
        </view>
      </view>
    </view>

    <view class="login-prompt" v-else>
      <view class="prompt-icon">🔒</view>
      <view class="prompt-title">登录后查看套房详情</view>
      <view class="prompt-desc">请先登录以查看完整房型信息</view>
      <button class="login-btn" @click="showAuth = true">立即登录</button>
    </view>

    <view class="overlay" v-if="selected">
      <view class="detail-panel slide-in">
        <view class="detail-hero">
          <swiper 
            class="detail-swiper" 
            :autoplay="true" 
            :circular="true" 
            :interval="3000" 
            :duration="500"
            @change="onSwiperChange"
            v-if="selected.images && selected.images.length > 0"
          >
            <swiper-item v-for="(img, index) in selected.images" :key="index">
              <image :src="img" class="detail-img" mode="aspectFill" />
            </swiper-item>
          </swiper>
          <image v-else :src="selected.coverImage" class="detail-img" mode="aspectFill" />
          <view class="hero-mask" />
          <view class="close" @click="closeDetail">
            <image class="close-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
          </view>
          <view class="indicators" v-if="selected.images && selected.images.length > 1">
            <view class="ind" :class="{ active: index === currentImageIndex }" v-for="(_, index) in selected.images" :key="index" />
          </view>
        </view>

        <scroll-view scroll-y class="detail-scroll">
          <view class="detail-content">
            <view class="detail-title">{{ selected.name }}</view>
            <view class="detail-tags">
              <text class="tag" v-for="f in selected.features" :key="f">{{ f }}</text>
            </view>
            <view class="detail-price">{{ selected.priceLabel }}</view>
            <view class="detail-desc">
              {{ selected.description || '基于产后阶段和家庭需求提供套房级照护计划，包含空间服务、营养餐食、护理响应与康复课程配置。' }}
            </view>
            <view class="facilities-section" v-if="selected.facilities && selected.facilities.length > 0">
              <view class="section-title">配套设施</view>
              <view class="facilities-list">
                <text class="facility-tag" v-for="f in selected.facilities" :key="f">{{ f }}</text>
              </view>
            </view>
            <button class="book-btn" @click="handleBook">预约到店顾问</button>
          </view>
        </scroll-view>
      </view>

      <view v-if="showQr" class="qr-overlay" @click="showQr = false">
        <view class="qr-box" @click.stop>
          <view class="qr-title">{{ qrTips || '扫码预约顾问' }}</view>
          <image class="qr" :src="qrCodeUrl" mode="aspectFill" />
          <button class="book-btn qr-confirm-btn" @click="showQr = false">我知道了</button>
        </view>
      </view>
    </view>

    <AuthModal :visible="showAuth" @close="showAuth = false" @success="handleAuthSuccess" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getSuites, getSuiteDetail, getAppointmentQrCode } from '@/api/modules/center';
import { trackPath, getLocalProfile, getToken, setLocalProfile } from '@/store/session';
import { getCurrentUser } from '@/api/modules/member';
import AuthModal from '@/components/AuthModal.vue';
import type { Suite } from '@/types/domain';
import { tracker } from '@/utils/tracker';

const suites = ref<Suite[]>([]);
const selected = ref<Suite | null>(null);
const currentImageIndex = ref(0);
const isLoggedIn = ref(false);
const showAuth = ref(false);
const showQr = ref(false);
const qrCodeUrl = ref('https://picsum.photos/seed/qr_suite/360/360');
const qrTips = ref('扫码预约顾问');

function goBack() {
  uni.navigateBack();
}

async function handleBook() {
  if (selected.value) {
    tracker.track('APPOINTMENT_INTENT', {
      path: '/pages/suite-details/index',
      pathName: '套房详情',
      metadata: {
        sourceType: 'suite',
        sourceId: selected.value.id,
        targetPackage: selected.value.name,
        estimatedPrice: selected.value.price,
        intentLevel: 'HIGH'
      }
    });

    try {
      const qrRes = await getAppointmentQrCode('suite', selected.value.id);
      if (qrRes?.data?.qrCodeUrl) {
        qrCodeUrl.value = qrRes.data.qrCodeUrl;
      }
      if (qrRes?.data?.tips) {
        qrTips.value = qrRes.data.tips;
      } else {
        qrTips.value = '扫码预约顾问';
      }
    } catch (e) {
      console.error('Failed to load suite appointment qrcode:', e);
      uni.showToast({ title: '二维码获取失败，请稍后重试', icon: 'none' });
    }
    showQr.value = true;
  }
}

function closeDetail() {
  showQr.value = false;
  selected.value = null;
}

function handleAuthSuccess() {
  showAuth.value = false;
  isLoggedIn.value = true;
  loadSuites();
}

async function loadSuites() {
  try {
    const res = await getSuites();
    suites.value = res.data;
  } catch (e) {
    console.error('Failed to load suites:', e);
  }
}

async function openDetail(item: Suite) {
  try {
    const res = await getSuiteDetail(item.id);
    selected.value = res.data;
  } catch (e) {
    selected.value = item;
  }
  currentImageIndex.value = 0;
}

function onSwiperChange(e: any) {
  currentImageIndex.value = e.detail.current;
}

onLoad(async () => {
  trackPath('套房详情');

  const profile = getLocalProfile();
  const token = getToken();

  if (!profile.isLoggedIn && !token) {
    showAuth.value = true;
    return;
  }

  isLoggedIn.value = true;
  loadSuites();
});
</script>

<style scoped>
.suite-page {
  background: #f5f5f0;
  min-height: 100vh;
}

.head {
  display: flex;
  align-items: center;
  padding: calc(var(--top-safe-offset) + 24rpx) 24rpx 16rpx;
}

.back {
  min-width: 88rpx;
  color: #6b7280;
}

.back-icon {
  width: 36rpx;
  height: 36rpx;
  opacity: 0.8;
}

.head-title {
  font-size: 36rpx;
  color: #111827;
  letter-spacing: 5rpx;
}

.list-wrap {
  padding: 10rpx 24rpx 40rpx;
}

.suite-card {
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.1);
  margin-bottom: 16rpx;
}

.suite-cover-wrap {
  position: relative;
  height: 320rpx;
}

.suite-cover {
  width: 100%;
  height: 100%;
}


.suite-body {
  padding: 18rpx;
}

.suite-row {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.suite-name {
  font-size: 34rpx;
  color: #111827;
}

.suite-feat {
  margin-top: 8rpx;
  font-size: 25rpx;
  color: #6b7280;
  line-height: 1.6;
}

.suite-price {
  font-size: 32rpx;
  color: #111827;
}

.suite-btn {
  margin-top: 14rpx;
  min-height: 78rpx;
  background: #111827;
  color: #fff;
  font-size: 26rpx;
  letter-spacing: 4rpx;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 130;
  background: #f5f5f0;
}

.qr-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 48rpx;
  z-index: 20;
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

.qr-confirm-btn {
  margin-top: 0;
}

.detail-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-hero {
  position: relative;
  height: 45vh;
}

.detail-img,
.hero-mask {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-mask {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.16));
  pointer-events: none;
}

.close {
  position: absolute;
  left: 28rpx;
  top: calc(var(--top-safe-offset-compact) + 8rpx);
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.close-icon {
  width: 32rpx;
  height: 32rpx;
  filter: brightness(0) invert(1);
}

.detail-swiper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.indicators {
  position: absolute;
  left: 50%;
  bottom: 24rpx;
  transform: translateX(-50%);
  display: flex;
  gap: 8rpx;
  pointer-events: auto;
}

.ind {
  height: 4rpx;
  width: 10rpx;
  background: rgba(255, 255, 255, 0.4);
}

.ind.active {
  width: 30rpx;
  background: #fff;
}

.detail-scroll {
  flex: 1;
}

.detail-content {
  padding: 24rpx;
}

.detail-title {
  font-size: 42rpx;
  letter-spacing: 5rpx;
  color: #111827;
}

.detail-tags {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.tag {
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.12);
  color: #6b7280;
  font-size: 24rpx;
  padding: 8rpx 14rpx;
}

.detail-price {
  margin-top: 20rpx;
  font-size: 36rpx;
  color: #111827;
}

.detail-desc {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #6b7280;
  line-height: 1.8;
}

.facilities-section {
  margin-top: 24rpx;
}

.section-title {
  font-size: 30rpx;
  color: #111827;
  margin-bottom: 12rpx;
}

.facilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.facility-tag {
  background: #f3f4f6;
  color: #4b5563;
  font-size: 24rpx;
  padding: 8rpx 14rpx;
  border-radius: 4rpx;
}

.book-btn {
  margin-top: 24rpx;
  width: 100%;
  min-height: 92rpx;
  background: #111827;
  color: #fff;
  font-size: 30rpx;
  letter-spacing: 4rpx;
}

.slide-in {
  animation: slideIn .3s ease both;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: .5;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
  text-align: center;
}

.prompt-icon {
  font-size: 80rpx;
  margin-bottom: 32rpx;
}

.prompt-title {
  font-size: 36rpx;
  color: #111827;
  margin-bottom: 16rpx;
}

.prompt-desc {
  font-size: 28rpx;
  color: #6b7280;
  margin-bottom: 40rpx;
}

.login-btn {
  background: #111827;
  color: #fff;
  font-size: 30rpx;
  padding: 24rpx 64rpx;
  border-radius: 12rpx;
}
</style>
