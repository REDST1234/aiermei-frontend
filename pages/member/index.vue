<template>
  <view class="page member-page">
    <view class="member-head">
      <view class="brand-row">
        <view class="brand">AI ER MEI</view>
      </view>
      <view class="profile-row">
        <view class="avatar">AVATAR</view>
        <view>
          <view class="badge">GOLD MEMBER</view>
          <view class="name">111号用户</view>
        </view>
      </view>
    </view>

    <view class="body-wrap">
      <view class="split-title">
        <view class="line" />
        <text>会员服务</text>
        <view class="line" />
      </view>

      <view class="service-grid">
        <view class="service-card" v-for="item in topServices" :key="item.id" @click="openSub(item.id)">
          <view class="service-icon">
            <image class="service-icon-img" :src="item.iconPath" mode="aspectFit" />
          </view>
          <view class="service-label">{{ item.label }}</view>
        </view>
      </view>

      <view class="feature-wrap">
        <swiper
          class="feature-swiper"
          circular
          autoplay
          :interval="4000"
          :duration="650"
          @change="onFeatureChange"
        >
          <swiper-item v-for="item in articles" :key="item.id">
            <view class="feature-card" @click="openMagazine(item.id)">
              <view class="feature-left">
                <image :src="item.image" mode="aspectFill" class="feature-image" />
                <view class="feature-cover">
                  <view class="feature-tag">Featured</view>
                  <view class="feature-title">{{ item.title }}</view>
                </view>
              </view>
              <view class="feature-right">
                <view class="feature-sub">{{ item.subtitle }}</view>
                <view class="feature-link">
                  {{ item.desc }}
                  <image class="tiny-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
                </view>
              </view>
            </view>
          </swiper-item>
        </swiper>
        <view class="feature-dots">
          <view class="f-dot" :class="{ active: index === articleIndex }" v-for="(_, index) in articles" :key="index" />
        </view>
      </view>

      <view class="menu-list">
        <view class="menu-row" v-for="item in bottomMenus" :key="item.id" @click="openSub(item.id)">
          <view class="menu-left">
            <image class="menu-icon" :src="item.iconPath" mode="aspectFit" />
            <text class="menu-label">{{ item.label }}</text>
          </view>
          <image class="menu-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
      </view>
    </view>

    <AuthModal :visible="showAuth" @close="showAuth = false" @success="handleAuthSuccess" />
    <BottomNav current="/pages/member/index" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import AuthModal from '@/components/AuthModal.vue';
import BottomNav from '@/components/BottomNav.vue';
import { memberArticles } from '@/mock/data';
import { getLocalProfile, setLoginState, trackPath } from '@/store/session';

const profile = ref(getLocalProfile());
const showAuth = ref(false);
const pendingId = ref('');
const protectedIds = ['package', 'postpartum', 'coupon'];

const topServices = [
  { id: 'package', label: '我的套餐', iconPath: '/static/icons/package.svg' },
  { id: 'coupon', label: '我的优惠券', iconPath: '/static/icons/ticket.svg' },
  { id: 'postpartum', label: '产后服务', iconPath: '/static/icons/heart.svg' }
];

const bottomMenus = [
  { id: 'hotline', label: '服务热线', iconPath: '/static/icons/phone.svg' },
  { id: 'evaluation', label: '服务评价', iconPath: '/static/icons/note.svg' },
  { id: 'faq', label: '常见问题', iconPath: '/static/icons/shield.svg' }
];

const articles = memberArticles;
const articleIndex = ref(0);

function openSub(id: string) {
  if (protectedIds.includes(id) && !profile.value.isLoggedIn) {
    pendingId.value = id;
    showAuth.value = true;
    return;
  }
  trackPath(`会员子页:${id}`);
  uni.navigateTo({ url: `/pages/member-sub/index?id=${id}` });
}

function openMagazine(id: string) {
  trackPath(`杂志:${id}`);
  uni.navigateTo({ url: `/pages/member/magazine?id=${id}` });
}

function handleAuthSuccess() {
  setLoginState(true);
  profile.value = getLocalProfile();
  showAuth.value = false;
  if (pendingId.value) {
    const target = pendingId.value;
    pendingId.value = '';
    openSub(target);
  }
}

function onFeatureChange(event: any) {
  articleIndex.value = event?.detail?.current || 0;
}

onLoad(() => {
  trackPath('会员中心');
});

onShow(() => {
  profile.value = getLocalProfile();
});
</script>

<style scoped>
.member-page {
  background: #f5f5f0;
}

.member-head {
  padding: calc(var(--top-safe-offset) + 12rpx) 30rpx 16rpx;
}

.brand {
  font-size: 46rpx;
  letter-spacing: 8rpx;
  color: #111827;
}

.profile-row {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  width: 124rpx;
  height: 124rpx;
  border: 1rpx solid rgba(17, 24, 39, 0.12);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 25rpx;
}

.badge {
  display: inline-block;
  background: #111827;
  color: #fff;
  font-size: 22rpx;
  letter-spacing: 2rpx;
  padding: 8rpx 14rpx;
}

.name {
  margin-top: 10rpx;
  font-size: 40rpx;
  color: #111827;
}

.body-wrap {
  padding: 0 30rpx 170rpx;
}

.split-title {
  display: flex;
  align-items: center;
  gap: 14rpx;
  color: #9ca3af;
  font-size: 26rpx;
  letter-spacing: 5rpx;
  margin-bottom: 22rpx;
}

.line {
  flex: 1;
  height: 1rpx;
  background: rgba(17, 24, 39, 0.15);
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
}

.service-card {
  aspect-ratio: 1;
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
}

.service-icon {
  width: 76rpx;
  height: 76rpx;
  border-radius: 10rpx;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-icon-img {
  width: 40rpx;
  height: 40rpx;
}

.service-label {
  font-size: 28rpx;
  color: #374151;
}

.feature-wrap {
  margin-top: 26rpx;
}

.feature-swiper {
  height: 336rpx;
}

.feature-card {
  display: flex;
  height: 336rpx;
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.08);
  overflow: hidden;
}

.feature-left,
.feature-right {
  width: 50%;
  position: relative;
}

.feature-image {
  width: 100%;
  height: 100%;
  opacity: 0.85;
}

.feature-cover {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  text-align: center;
  padding: 14rpx;
  background: rgba(0, 0, 0, 0.2);
}

.feature-tag {
  font-size: 24rpx;
  opacity: 0.7;
}

.feature-title {
  margin-top: 10rpx;
  font-size: 31rpx;
  line-height: 1.5;
}

.feature-right {
  padding: 26rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.feature-sub {
  font-size: 25rpx;
  line-height: 1.75;
  color: #374151;
}

.feature-link {
  margin-top: 14rpx;
  color: #9ca3af;
  font-size: 26rpx;
  letter-spacing: 2rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.tiny-arrow {
  width: 18rpx;
  height: 18rpx;
}

.feature-dots {
  margin-top: 18rpx;
  display: flex;
  justify-content: center;
  gap: 12rpx;
}

.f-dot {
  height: 2rpx;
  width: 22rpx;
  background: #d1d5db;
}

.f-dot.active {
  width: 56rpx;
  background: #111827;
}

.menu-list {
  margin-top: 26rpx;
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.08);
}

.menu-row {
  min-height: 102rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22rpx;
  border-bottom: 1rpx solid rgba(17, 24, 39, 0.08);
}

.menu-row:last-child {
  border-bottom: 0;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.menu-icon {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.7;
}

.menu-label {
  font-size: 30rpx;
  color: #1f2937;
}

.menu-arrow {
  width: 20rpx;
  height: 20rpx;
  opacity: 0.45;
}

.fade-in {
  animation: fadeIn 0.35s ease both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
