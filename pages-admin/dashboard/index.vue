<template>
  <view class="page admin-page">
    <view class="admin-wrap">
      <view class="header">
        <view>
          <view class="h1">数据后台</view>
          <view class="sub">用户行为与画像分析</view>
        </view>
        <view class="count">用户 {{ dashboard?.activeCustomers ?? '-' }}</view>
      </view>

      <view class="stats-grid">
        <view class="stat">
          <view class="stat-label">停留时长</view>
          <view class="stat-value">{{ dashboard?.avgStayMinutes ?? '-' }} min</view>
        </view>
        <view class="stat">
          <view class="stat-label">转化率</view>
          <view class="stat-value">{{ dashboard?.leadConversionRate ?? '-' }}%</view>
        </view>
        <view class="stat">
          <view class="stat-label">热门内容</view>
          <view class="stat-value">{{ dashboard?.hotContentTitle ?? '-' }}</view>
        </view>
      </view>

      <view class="panel">
        <view class="panel-head">
          <view class="panel-title">画像分析</view>
          <button class="re-btn" @click="runAnalysis">重新分析</button>
        </view>

        <view class="sec-title">行为路径</view>
        <view class="path-wrap">
          <view class="path-tag" v-for="(item, idx) in journey?.paths ?? profile.paths" :key="idx">{{ item.path }}</view>
        </view>

        <view class="sec-title">标签</view>
        <view class="tag-row">
          <view class="tag" v-for="(tag, idx) in analysis.tags" :key="idx">#{{ tag }}</view>
        </view>

        <view class="sec-title">销售建议</view>
        <view class="script">{{ analysis.script || '暂无分析建议' }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getDashboardOverview, analyzeUser, getUserJourney } from '@/api/modules/admin';
import { getLocalProfile, trackPath } from '@/store/session';
import type { AnalysisResult, UserProfile, DashboardOverview, UserJourney } from '@/types/domain';

const profile = ref<UserProfile>(getLocalProfile());
const analysis = ref<AnalysisResult>({ tags: [], script: '' });
const dashboard = ref<DashboardOverview | null>(null);
const journey = ref<UserJourney | null>(null);

async function loadDashboard() {
  const res = await getDashboardOverview();
  dashboard.value = res.data;
}

async function runAnalysis() {
  if (!profile.value.uid) return;
  const res = await analyzeUser(profile.value.uid, true);
  analysis.value = res.data;
}

async function loadJourney() {
  if (!profile.value.uid) return;
  const res = await getUserJourney(profile.value.uid);
  journey.value = res.data;
}

onLoad(async () => {
  trackPath('管理后台');
  profile.value = getLocalProfile();
  await Promise.all([loadDashboard(), runAnalysis(), loadJourney()]);
});
</script>

<style scoped>
.admin-page {
  background: #f5f5f0;
}

.admin-wrap {
  padding: var(--top-safe-offset-compact) 24rpx 24rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.h1 {
  font-size: 40rpx;
  color: #111827;
}

.sub {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #6b7280;
}

.count {
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.1);
  min-height: 68rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #374151;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.stat {
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.1);
  padding: 18rpx;
}

.stat-label {
  font-size: 20rpx;
  color: #9ca3af;
}

.stat-value {
  margin-top: 10rpx;
  font-size: 28rpx;
  color: #111827;
}

.panel {
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.1);
  padding: 20rpx;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.panel-title {
  font-size: 30rpx;
  color: #111827;
}

.re-btn {
  min-height: 64rpx;
  padding: 0 18rpx;
  background: #111827;
  color: #fff;
  font-size: 22rpx;
}

.sec-title {
  margin-top: 14rpx;
  margin-bottom: 8rpx;
  font-size: 21rpx;
  color: #9ca3af;
}

.path-wrap,
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.path-tag,
.tag {
  background: #f9fafb;
  border: 1rpx solid rgba(17, 24, 39, 0.1);
  color: #374151;
  font-size: 22rpx;
  padding: 8rpx 12rpx;
}

.script {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #4b5563;
  line-height: 1.75;
  background: #f9fafb;
  padding: 14rpx;
}
</style>
