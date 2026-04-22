<template>
  <view v-if="visible" class="overlay">
    <view class="modal">
      <view class="lock">🔒</view>
      <view class="title">登录后查看完整服务</view>
      <view class="desc">当前入口需要登录授权，授权后将自动回到目标页面。</view>
      <button class="primary" :disabled="loading" @click="handleLogin">
        {{ loading ? '登录中...' : '微信一键登录' }}
      </button>
      <button class="ghost" @click="$emit('close')">取消</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { wechatLogin } from '@/api/modules/auth';
import { getCurrentUser } from '@/api/modules/member';
import { saveToken, setLoginState, getLocalProfile, setLocalProfile } from '@/store/session';
import { tracker } from '@/utils/tracker';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    // 1. 调用微信登录获取 code
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        success: resolve,
        fail: reject
      });
    });

    if (!loginRes.code) {
      throw new Error('获取微信登录凭证失败');
    }

    // 2. 发送到后端换取 token
    const res = await wechatLogin({ code: loginRes.code });
    if (res.code === 0 && res.data) {
      // 3. 保存 token
      saveToken(res.data.token);
      setLoginState(true, res.data.token);

      // 4. 获取用户信息
      const userRes = await getCurrentUser();
      if (userRes.code === 0 && userRes.data) {
        const profile = getLocalProfile();
        const updatedProfile = {
          ...profile,
          uid: userRes.data.uid,
          name: userRes.data.name,
          avatar: userRes.data.avatar,
          phone: userRes.data.phone,
          memberLevel: userRes.data.memberLevel,
          isLoggedIn: true,
          lastActive: Date.now()
        };
        setLocalProfile(updatedProfile);
      }

      // 5. 通知父组件登录成功
      emit('success');
      tracker.flush();
    } else {
      throw new Error(res.message || '登录失败');
    }
  } catch (e: any) {
    console.error('Login failed:', e);
    uni.showToast({ title: e.message || '登录失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 48rpx;
}

.modal {
  width: 100%;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx 36rpx;
  text-align: center;
}

.lock {
  font-size: 64rpx;
  margin-bottom: 24rpx;
}

.title {
  font-size: 36rpx;
  color: #111827;
  margin-bottom: 14rpx;
}

.desc {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 34rpx;
}

.primary {
  background: #111827;
  color: #ffffff;
  border: none;
  border-radius: 14rpx;
  font-size: 28rpx;
  margin-bottom: 22rpx;
}

.ghost {
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 26rpx;
}
</style>
