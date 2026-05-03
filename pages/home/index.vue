<template>
  <view class="page home-page">
    <scroll-view
      scroll-y
      class="full-scroll"
      refresher-enabled
      :refresher-triggered="isRefresherTriggered"
      @refresherrefresh="onRefresherRefresh"
      @refresherpulling="onRefresherPulling"
      @refresherrestore="onRefresherRestore"
    >
      <view slot="refresher">
        <CustomRefresher :status="refresherStatus" />
      </view>

      <swiper class="hero" :autoplay="true" :interval="5000" :duration="500" circular indicator-dots indicator-color="rgba(255,255,255,.25)" indicator-active-color="#fff">
        <swiper-item v-for="item in banners" :key="item.id">
          <view class="hero-item" @click="openPoster(item.id)">
            <image :src="item.image" mode="aspectFill" class="hero-image" />
            <view class="mask" />
            <view class="hero-content">
              <view class="brand">AI ER MEI</view>
              <view class="title">{{ item.title }}</view>
              <view class="cta">{{ item.buttonText }}</view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </scroll-view>

    <BottomNav current="/pages/home/index" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import CustomRefresher from '@/components/CustomRefresher.vue';
import BottomNav from '@/components/BottomNav.vue';
import { getBanners } from '@/api/modules/center';
import { trackPath } from '@/store/session';
import type { Banner } from '@/types/domain';

const banners = ref<Banner[]>([]);

// 自定义刷新状态
const isRefresherTriggered = ref(false);
const refresherStatus = ref<'pulling' | 'refreshing' | 'success' | 'none'>('none');

function openPoster(id: string) {
  trackPath(`海报:${id}`);
  uni.navigateTo({ url: `/pages/poster/detail?id=${id}` });
}

async function loadData() {
  try {
    const res = await getBanners();
    banners.value = res.data;
  } catch (e) {
    console.error('Failed to load banners:', e);
  }
}

onLoad(() => {
  trackPath('首页');
  loadData();
});

async function onRefresherRefresh() {
  if (isRefresherTriggered.value) return;
  
  isRefresherTriggered.value = true;
  refresherStatus.value = 'refreshing';
  
  try {
    await loadData();
    
    // 显示成功状态并停留一会
    refresherStatus.value = 'success';
    await new Promise(resolve => setTimeout(resolve, 1000));
  } finally {
    isRefresherTriggered.value = false;
    refresherStatus.value = 'none';
  }
}

function onRefresherPulling() {
  if (refresherStatus.value === 'none') {
    refresherStatus.value = 'pulling';
  }
}

function onRefresherRestore() {
  refresherStatus.value = 'none';
}
</script>

<style scoped>
.home-page {
  padding-bottom: 0;
  height: 100vh;
  overflow: hidden;
}

.full-scroll {
  width: 100%;
  height: 100%;
}

.hero {
  height: 100vh;
}

.hero-item,
.hero-image,
.mask {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.mask {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.45));
}

.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-align: center;
  padding: 0 72rpx;
}

.brand {
  position: absolute;
  top: var(--top-safe-offset);
  left: 48rpx;
  font-size: 44rpx;
  letter-spacing: 6rpx;
}

.title {
  font-size: 52rpx;
  line-height: 1.7;
  letter-spacing: 4rpx;
  margin-bottom: 80rpx;
}

.cta {
  border: 1rpx solid rgba(255, 255, 255, 0.4);
  padding: 26rpx 68rpx;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  backdrop-filter: blur(6rpx);
}
</style>
