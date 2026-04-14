<template>
  <view class="page magazine-page">
    <view class="head">
      <view class="back" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
      <view class="head-title">{{ magazine?.title || '杂志详情' }}</view>
    </view>

    <scroll-view scroll-y class="content-scroll" v-if="magazine" :scroll-top="0">
      <view class="scroll-content">
        <image :src="magazine.cover" mode="widthFix" class="cover" />
        <view class="body">
          <view class="title">{{ magazine.title }}</view>
          <view class="subtitle">{{ magazine.subtitle }}</view>
          <view class="meta" v-if="magazine.author || magazine.publishedAt">
            <text v-if="magazine.author">{{ magazine.author }}</text>
            <text class="dot" v-if="magazine.author && magazine.publishedAt">·</text>
            <text v-if="magazine.publishedAt">{{ formatDate(magazine.publishedAt) }}</text>
          </view>
          <view class="content" v-html="magazine.content || '暂无内容'"></view>
        </view>
      </view>
    </scroll-view>

    <view class="loading" v-else>
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getMagazineDetail } from '@/api/modules/member';
import type { MagazineDetail } from '@/types/domain';

const magazine = ref<MagazineDetail | null>(null);

function goBack() {
  uni.navigateBack();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

onLoad(async (query) => {
  const magazineId = String(query.id || '');
  if (!magazineId) {
    uni.showToast({ title: '杂志ID不存在', icon: 'none' });
    return;
  }
  try {
    const res = await getMagazineDetail(magazineId);
    magazine.value = res.data;
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
});
</script>

<style scoped>
.magazine-page {
  background: #fff;
  min-height: 100vh;
}

.head {
  position: fixed;
  top: 20rpx;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: var(--top-safe-offset) 24rpx 16rpx;
  gap: 8rpx;
  background: #fff;
  z-index: 10;
}

.back {
  min-width: 88rpx;
  color: #6b7280;
}

.back-icon {
  width: 34rpx;
  height: 34rpx;
  opacity: 0.8;
}

.head-title {
  font-size: 34rpx;
  letter-spacing: 5rpx;
  color: #111827;
}

.content-scroll {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding-top: calc(var(--top-safe-offset) + 100rpx);
  box-sizing: border-box;
}

.scroll-content {
  padding-bottom: 60rpx;
}

.cover {
  width: 100%;
}

.body {
  padding: 30rpx;
}

.title {
  font-size: 44rpx;
  color: #1f2937;
  line-height: 1.4;
  font-weight: 600;
}

.subtitle {
  margin-top: 16rpx;
  font-size: 30rpx;
  color: #6b7280;
  line-height: 1.5;
}

.meta {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.dot {
  font-size: 20rpx;
}

.content {
  margin-top: 30rpx;
  font-size: 30rpx;
  color: #374151;
  line-height: 1.9;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #9ca3af;
  font-size: 28rpx;
  padding-top: calc(var(--top-safe-offset) + 60rpx);
}
</style>