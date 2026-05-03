<template>
  <view class="refresher-container">
    <view v-if="status === 'pulling' || status === 'refreshing'" class="loading-box">
      <view class="dot-row">
        <view class="dot" :class="{ animate: status === 'refreshing' }"></view>
        <view class="dot" :class="{ animate: status === 'refreshing' }"></view>
        <view class="dot" :class="{ animate: status === 'refreshing' }"></view>
      </view>
      <text class="status-text">{{ status === 'refreshing' ? '正在刷新...' : '下拉刷新' }}</text>
    </view>
    <view v-if="status === 'success'" class="success-box fade-in">
      <view class="success-content">
        <text class="success-tick">✓</text>
        <text class="status-text success">刷新成功</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  status: 'pulling' | 'refreshing' | 'success' | 'none';
}>();
</script>

<style scoped>
.refresher-container {
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: transparent;
}

.loading-box, .success-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.dot-row {
  display: flex;
  gap: 12rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #fb7185;
  opacity: 0.3;
}

.dot.animate {
  animation: dotPulse 1s infinite ease-in-out;
}

.dot.animate:nth-child(2) {
  animation-delay: 0.2s;
}

.dot.animate:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 100% { transform: scale(0.8); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 1; }
}

.success-content {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.success-tick {
  font-size: 32rpx;
  color: #fb7185;
  font-weight: bold;
}

.status-text {
  font-size: 24rpx;
  color: #9ca3af;
  letter-spacing: 2rpx;
}

.status-text.success {
  color: #fb7185;
  font-weight: 500;
}

.fade-in {
  animation: fadeIn 0.3s ease both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
