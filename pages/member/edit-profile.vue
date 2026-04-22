<template>
  <view class="page edit-page">
    <view class="head">
      <view class="back" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
      <view class="head-title">编辑个人信息</view>
      <view class="placeholder-nav" />
    </view>

    <view class="body">
      <!-- 头像（展示，暂不支持修改） -->
      <view class="card avatar-card">
        <view class="tip">头像</view>
        <view class="avatar-row">
          <view class="avatar-wrap" @click="chooseAvatar">
            <image v-if="form.avatar" :src="form.avatar" mode="aspectFill" class="avatar-img" />
            <text v-else class="avatar-placeholder">A</text>
          </view>
          <view class="avatar-hint" @click="chooseAvatar">点击修改头像</view>
        </view>
      </view>

      <!-- 姓名 -->
      <view class="card">
        <view class="tip">姓名</view>
        <input
          class="field-input"
          v-model="form.name"
          placeholder="请输入姓名"
          maxlength="20"
        />
      </view>

      <!-- 手机号 -->
      <view class="card">
        <view class="tip">手机号</view>
        <input
          class="field-input"
          v-model="form.phone"
          type="number"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </view>

      <!-- 孕产类型 -->
      <view class="card">
        <view class="tip">孕产状态</view>
        <view class="radio-row">
          <view
            class="radio-item"
            :class="{ active: form.pregnancyType === 'pregnancy' }"
            @click="form.pregnancyType = 'pregnancy'"
          >孕期</view>
          <view
            class="radio-item"
            :class="{ active: form.pregnancyType === 'postpartum' }"
            @click="form.pregnancyType = 'postpartum'"
          >产后</view>
        </view>
      </view>

      <!-- 孕产日期 -->
      <view class="card">
        <view class="tip">{{ form.pregnancyType === 'pregnancy' ? '预产期' : '分娩日期' }}</view>
        <picker
          mode="date"
          :value="form.pregnancyDate"
          :start="dateRange.start"
          :end="dateRange.end"
          @change="onDateChange"
        >
          <view class="date-picker">
            <text class="date-text" :class="{ placeholder: !form.pregnancyDate }">
              {{ form.pregnancyDate || '请选择日期' }}
            </text>
            <image class="date-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
          </view>
        </picker>
      </view>

      <button class="submit-btn" :disabled="saving" @click="handleSave">
        {{ saving ? '保存中...' : '保存修改' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getLocalProfile, setLocalProfile } from '@/store/session';
import { updateCurrentUser } from '@/api/modules/member';

const saving = ref(false);

const form = reactive({
  name: '',
  phone: '',
  pregnancyType: 'postpartum' as 'pregnancy' | 'postpartum',
  pregnancyDate: '',
  avatar: ''
});

// 日期范围：前3年至后2年
const now = new Date();
const dateRange = {
  start: `${now.getFullYear() - 3}-01-01`,
  end: `${now.getFullYear() + 2}-12-31`
};

function goBack() {
  uni.navigateBack();
}

function onDateChange(e: any) {
  form.pregnancyDate = e.detail.value;
}

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        form.avatar = res.tempFilePaths[0] as string;
      }
    }
  });
}

async function handleSave() {
  if (saving.value) return;

  const name = form.name.trim();
  if (!name) {
    uni.showToast({ title: '姓名不能为空', icon: 'none' });
    return;
  }

  const profile = getLocalProfile();

  saving.value = true;
  try {
    const payload = {
      name,
      avatar: form.avatar !== profile.avatar ? form.avatar : undefined,
      phone: form.phone.trim() || undefined,
      pregnancyType: form.pregnancyType,
      pregnancyDate: form.pregnancyDate || undefined
    };

    const res = await updateCurrentUser(payload);
    if (res.code === 0 && res.data) {
      // 用返回数据更新本地缓存
      const current = getLocalProfile();
      const updated = {
        ...current,
        name: res.data.name,
        avatar: res.data.avatar || form.avatar,
        phone: res.data.phone,
        pregnancyInfo: res.data.pregnancyInfo,
        lastActive: res.data.lastActive
      };
      setLocalProfile(updated);
      uni.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => goBack(), 1200);
    } else {
      uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
    }
  } catch (e) {
    uni.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
  } finally {
    saving.value = false;
  }
}

onLoad(() => {
  const profile = getLocalProfile();
  form.name = profile.name || '';
  form.phone = profile.phone || '';
  form.avatar = profile.avatar || '';
  form.pregnancyType = (profile.pregnancyInfo?.type as 'pregnancy' | 'postpartum') || 'postpartum';
  form.pregnancyDate = profile.pregnancyInfo?.date || '';
});
</script>

<style scoped>
.edit-page {
  background: #f5f5f0;
  min-height: 100vh;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--top-safe-offset) + 20rpx) 24rpx 16rpx;
  background: #f5f5f0;
}

.back {
  min-width: 88rpx;
  display: flex;
  align-items: center;
}

.back-icon {
  width: 34rpx;
  height: 34rpx;
  opacity: 0.7;
}

.head-title {
  font-size: 34rpx;
  letter-spacing: 3rpx;
  color: #111827;
}

.placeholder-nav {
  min-width: 88rpx;
}

.body {
  padding: 20rpx 24rpx 60rpx;
}

.card {
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.1);
  padding: 24rpx 28rpx;
  margin-bottom: 16rpx;
}

.tip {
  color: #9ca3af;
  font-size: 22rpx;
  margin-bottom: 14rpx;
}

/* 头像区域 */
.avatar-card {
  padding-bottom: 28rpx;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  font-size: 40rpx;
  color: #9ca3af;
}

.avatar-hint {
  font-size: 26rpx;
  color: #9ca3af;
}

/* 输入框 */
.field-input {
  width: 100%;
  min-height: 72rpx;
  font-size: 30rpx;
  color: #111827;
  background: transparent;
}

/* 孕产类型单选 */
.radio-row {
  display: flex;
  gap: 20rpx;
}

.radio-item {
  flex: 1;
  min-height: 84rpx;
  border: 1rpx solid rgba(17, 24, 39, 0.15);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #6b7280;
}

.radio-item.active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

/* 日期选择器 */
.date-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72rpx;
}

.date-text {
  font-size: 30rpx;
  color: #111827;
}

.date-text.placeholder {
  color: #9ca3af;
}

.date-arrow {
  width: 20rpx;
  height: 20rpx;
  opacity: 0.4;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  min-height: 94rpx;
  background: #111827;
  color: #fff;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  margin-top: 20rpx;
  border-radius: 0;
}

.submit-btn[disabled] {
  opacity: 0.45;
}
</style>
