<template>
  <view class="page article-page">
    <view class="head">
      <view class="back" @click="goBack">
        <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
      </view>
      <view class="head-title">文章详情</view>
    </view>

    <scroll-view scroll-y class="content-scroll">
      <view class="article-content" v-if="article">
        <image v-if="article.type === 'image'" :src="article.cover" mode="widthFix" class="cover" />
        <view v-else class="video-wrap">
          <video :src="article.mediaUrl" class="video" controls />
        </view>
        <view class="body">
          <view class="title">{{ article.title }}</view>
          <view class="meta">
            <text>{{ article.author }}</text>
            <text class="dot">·</text>
            <text>{{ formatViews(article.views) }} 浏览</text>
            <text class="dot">·</text>
            <text>{{ formatLikes(article.likes) }} 喜欢</text>
          </view>
          <view class="text" v-html="article.content || '暂无内容'"></view>
        </view>

        <!-- 点赞区域 -->
        <view class="like-bar">
          <view class="like-btn" :class="{ liked: article.liked }" @click="toggleLike">
            <text class="like-icon">{{ article.liked ? '❤' : '♡' }}</text>
            <text class="like-count">{{ formatLikes(article.likes) }}</text>
          </view>
        </view>
      </view>
      <view class="loading" v-else>
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app';
import { tracker } from '@/utils/tracker';
import { getArticleDetail, reportArticleView, likeArticle, unlikeArticle } from '@/api/modules/content';
import { getToken } from '@/store/session';
import type { ContentItem } from '@/types/domain';

const article = ref<ContentItem | null>(null);
const isLiking = ref(false);
const enterTime = ref(0);

function reportLeave() {
  if (article.value && enterTime.value > 0) {
    const durationSent = Math.floor((Date.now() - enterTime.value) / 1000);
    tracker.track('ARTICLE_VIEW', {
      path: '/pages/content/article',
      pathName: '文章详情',
      durationSeconds: durationSent,
      metadata: {
        sourceId: article.value.id,
        title: article.value.title,
        category: article.value.category,
        tags: article.value.tags || []
      }
    });
    enterTime.value = 0;
  }
}

onShow(() => {
  enterTime.value = Date.now();
});

onHide(() => {
  reportLeave();
});

onUnload(() => {
  reportLeave();
});

function goBack() {
  uni.navigateBack();
}

function formatLikes(likes?: number): string {
  if (!likes) return '0';
  if (likes >= 1000) {
    return (likes / 1000).toFixed(1) + 'k';
  }
  return String(likes);
}

function formatViews(views?: number): string {
  if (!views) return '0';
  if (views >= 10000) {
    return (views / 10000).toFixed(1) + 'w';
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'k';
  }
  return String(views);
}

async function toggleLike() {
  if (!article.value || isLiking.value) return;

  // 检查登录状态
  if (!getToken()) {
    uni.showToast({ title: '请先登录后再点赞', icon: 'none' });
    return;
  }

  isLiking.value = true;
  try {
    let res;
    if (article.value.liked) {
      res = await unlikeArticle(article.value.id);
    } else {
      res = await likeArticle(article.value.id);
    }
    if (res.code === 0 && res.data) {
      article.value.liked = res.data.liked === true;
      article.value.likes = res.data.likes;
    }
  } catch (e: any) {
    if (e?.code === 4003) {
      uni.showToast({ title: '请先登录后再点赞', icon: 'none' });
    } else {
      uni.showToast({ title: '操作失败，请稍后重试', icon: 'none' });
    }
  } finally {
    isLiking.value = false;
  }
}

onLoad(async (query) => {
  const articleId = String(query?.id || '');
  if (!articleId) {
    uni.showToast({ title: '文章ID不存在', icon: 'none' });
    return;
  }
  try {
    const res = await getArticleDetail(articleId);
    article.value = res.data;

    // 上报浏览量（不阻塞页面加载）
    reportArticleView(articleId).then(viewRes => {
      if (viewRes.code === 0 && viewRes.data && article.value) {
        article.value.views = viewRes.data.views;
      }
    }).catch(() => {
      // 浏览量上报失败不影响页面展示
    });
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
});
</script>

<style scoped>
.article-page {
  background: #fff;
  min-height: 100vh;
}

.head {
  display: flex;
  align-items: center;
  padding: var(--top-safe-offset) 24rpx 16rpx;
  gap: 8rpx;
  background: #fff;
  position: sticky;
  top: 0;
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
  height: calc(100vh - var(--top-safe-offset) - 60rpx);
}

.article-content {
  padding-bottom: 60rpx;
}

.cover {
  width: 100%;
}

.video-wrap {
  width: 100%;
}

.video {
  width: 100%;
  height: 420rpx;
}

.body {
  padding: 30rpx;
}

.title {
  font-size: 40rpx;
  color: #1f2937;
  line-height: 1.5;
  font-weight: 600;
}

.meta {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-wrap: wrap;
}

.dot {
  font-size: 20rpx;
}

.text {
  margin-top: 30rpx;
  font-size: 30rpx;
  color: #374151;
  line-height: 1.9;
}

/* 点赞区域 */
.like-bar {
  display: flex;
  justify-content: center;
  padding: 30rpx 30rpx 20rpx;
  border-top: 1rpx solid #f3f4f6;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 48rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 9999rpx;
  background: #fff;
  transition: all 0.2s ease;
}

.like-btn.liked {
  border-color: #fb7185;
  background: #fff1f2;
}

.like-icon {
  font-size: 42rpx;
  color: #9ca3af;
  line-height: 1;
}

.like-btn.liked .like-icon {
  color: #fb7185;
}

.like-count {
  font-size: 30rpx;
  color: #6b7280;
}

.like-btn.liked .like-count {
  color: #fb7185;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #9ca3af;
  font-size: 28rpx;
}
</style>
