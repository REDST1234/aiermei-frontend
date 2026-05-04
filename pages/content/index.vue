<template>
  <view class="page content-page">
    <view class="content-head" id="contentHead">
      <view class="title">内容中心</view>
    </view>

    <scroll-view
      scroll-y
      class="main-scroll"
      :style="{ height: scrollHeight }"
      refresher-enabled
      :refresher-triggered="isRefresherTriggered"
      @refresherrefresh="onRefresherRefresh"
      @refresherpulling="onRefresherPulling"
      @refresherrestore="onRefresherRestore"
      @scrolltolower="onReachBottomScroll"
    >
      <view slot="refresher">
        <CustomRefresher :status="refresherStatus" />
      </view>

      <view class="main-wrap">
        <view class="fortune-card fade-in">
          <view class="fortune-top">
            <view>
              <view class="fortune-title">今日好运签</view>
              <view class="fortune-sub">Daily Fortune</view>
            </view>
            <view class="fortune-date">{{ formatDate(fortune?.date) }}</view>
          </view>
          <view class="fortune-grid">
            <view class="fortune-col">
              <view class="small-label">宜</view>
              <view class="small-text">{{ fortune?.suitable || '放松训练' }}</view>
            </view>
            <view class="divider" />
            <view class="fortune-col">
              <view class="small-label">忌</view>
              <view class="small-text">{{ fortune?.avoid || '焦虑熬夜' }}</view>
            </view>
          </view>
          <view class="fortune-text">{{ typedGreeting }}</view>
        </view>

        <view class="qa-head">
          <view class="line" />
          <text>AI 问答精选</text>
          <view class="line" />
        </view>

        <view class="qa-list">
          <view class="qa-item" v-for="(item, idx) in questions.slice(0, 2)" :key="idx" @click="openQa(item)">
            <text class="qa-q">{{ item.question }}</text>
            <image class="qa-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
          </view>
          <view class="qa-ai" @click="openAIChat">
            <view class="qa-ai-left">AI 专家对话</view>
            <image class="qa-arrow white" src="/static/icons/arrow-right.svg" mode="aspectFit" />
          </view>
        </view>

        <view class="tab-row">
          <view
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            v-for="tab in tabs"
            :key="tab.id"
            @click="switchTab(tab.id)"
          >
            {{ tab.label }}
          </view>
        </view>

        <view class="article-list">
          <view class="article-card reveal" v-for="item in articles" :key="item.id" @click="openArticle(item.id)">
            <view class="cover-wrap">
              <image :src="item.cover" mode="aspectFill" class="cover" />
              <view v-if="item.type === 'video'" class="play">
                <image class="play-icon" src="/static/icons/play.svg" mode="aspectFit" />
              </view>
            </view>
            <view class="article-body">
              <view class="article-title">{{ item.title }}</view>
              <view class="article-meta">{{ item.author }} / Like {{ item.likes }}</view>
            </view>
          </view>
        </view>

        <view class="loading-status" v-if="articles.length > 0">
          <text v-if="isLoadingArticles">加载中...</text>
          <text v-else-if="!hasMoreArticles">已经到底啦</text>
        </view>
      </view>
    </scroll-view>

    <view class="overlay" v-if="selectedQa" @click="selectedQa = null">
      <view class="qa-modal pop-in" @click.stop>
        <view class="modal-close" @click="selectedQa = null">
          <image class="close-icon" src="/static/icons/close.svg" mode="aspectFit" />
        </view>
        <view class="modal-q">{{ selectedQa?.question }}</view>
        <view class="modal-a">{{ selectedQa?.answer }}</view>
        <button class="primary-btn modal-btn" @click="selectedQa = null">知道了</button>
      </view>
    </view>

    <view class="ai-drawer" :class="{ open: isAIChatOpen }">
      <view class="ai-header">
        <view class="ai-back" @click="closeAIChat">
          <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
          <text>返回</text>
        </view>
        <view class="ai-title">AI 专家问答</view>
        <view style="width: 100rpx;"></view>
      </view>
      <scroll-view
        scroll-y
        class="ai-messages"
        :scroll-into-view="scrollAnchorId"
        scroll-with-animation
        @scrolltoupper="loadMoreHistory"
      >
        <view v-if="isLoadingHistory" class="loading-history">加载历史消息...</view>
        <view class="msg-wrap" :class="m.role" v-for="(m, i) in messages" :key="i">
          <view class="msg" :class="m.role">
            <rich-text v-if="m.role === 'ai'" :nodes="renderMarkdown(m.text)"></rich-text>
            <text v-else>{{ m.text }}</text>
            <view v-if="m.isLoading" class="loading-dots">
              <view class="dot"></view>
              <view class="dot"></view>
              <view class="dot"></view>
            </view>
          </view>
        </view>
        <view id="msgBottom" style="height: 1px;"></view>
      </scroll-view>
      <view class="ai-preset-row">
        <text class="preset" v-for="(p, i) in presets" :key="i" @click="input = p">{{ p }}</text>
      </view>
      <view class="ai-input-row">
        <input class="ai-input" v-model="input" placeholder="输入你的问题..." confirm-type="send" @confirm="send" />
        <view class="send" @click="send">
          <image class="send-icon" src="/static/icons/send.svg" mode="aspectFit" />
        </view>
      </view>
    </view>

    <BottomNav current="/pages/content/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import CustomRefresher from '@/components/CustomRefresher.vue';
import BottomNav from '@/components/BottomNav.vue';
import { getTodayFortune, getPresetQuestions, getArticles } from '@/api/modules/content';
import { createSSEConnection, type SSEEvent } from '@/api/http';
import { USE_MOCK } from '@/api/config';
import { getLocalProfile, getAiSessionId, setAiSessionId, clearAiSessionId, getToken, setLocalProfile } from '@/store/session';
import { trackPath } from '@/store/session';
import { getAiSessionMessages } from '@/api/modules/member';
import type { ContentItem, FortuneCard, PresetQuestion } from '@/types/domain';
import { marked } from 'marked';
import { tracker } from '@/utils/tracker';

// 配置 marked 选项
marked.setOptions({
  breaks: true,
  gfm: true
});

const activeTab = ref('pregnancy');
const tabs = [
  { id: 'pregnancy', label: '孕期' },
  { id: 'postpartum', label: '月子' },
  { id: 'parenting', label: '育儿' },
  { id: 'nanny', label: '月嫂' }
];

const fortune = ref<FortuneCard | null>(null);
const articles = ref<ContentItem[]>([]);
const questions = ref<PresetQuestion[]>([]);
const selectedQa = ref<PresetQuestion | null>(null);
const isAIChatOpen = ref(false);

const typedGreeting = ref('');
let typingTimer: ReturnType<typeof setInterval> | null = null;

interface Message {
  role: 'user' | 'ai';
  text: string;
  isLoading?: boolean;
  seqNo?: number;
}

const messages = ref<Message[]>([]);
const input = ref('');
const scrollAnchorId = ref('');
const presets = ['剖宫产后多久能做康复？', '新生儿作息怎么建立？', '怎么选月子套餐？'];

let sseConnection: UniApp.RequestTask | null = null;
let currentSessionId: string | null = null;
let nextCursor: string | undefined = undefined;
let hasMoreHistory = false;
let isLoadingHistory = ref(false);
let latestUserMessageRendered = false;
let pendingAiChatSessionId: string | null = null;
let pendingAiChatMsgId: string | null = null;
let aiChatTrackedForCurrentSend = false;

// 分页相关状态
const page = ref(1);
const pageSize = 10;
const isLoadingArticles = ref(false);
const hasMoreArticles = ref(true);

// 自定义刷新状态
const isRefresherTriggered = ref(false);
const refresherStatus = ref<'pulling' | 'refreshing' | 'success' | 'none'>('none');
const scrollHeight = ref('100vh');

function updateScrollHeight() {
  const sys = uni.getSystemInfoSync();
  const query = uni.createSelectorQuery();
  query.select('#contentHead').boundingClientRect(rect => {
    if (rect && !Array.isArray(rect)) {
      // 减去头部高度和底部导航高度（约160rpx）
      const headHeight = rect.height || 0;
      const bottomNavHeight = uni.upx2px(160);
      scrollHeight.value = `${sys.windowHeight - headHeight - bottomNavHeight}px`;
    }
  }).exec();
}

onMounted(() => {
  nextTick(() => {
    updateScrollHeight();
  });
});

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    return `${parseInt(parts[2])} ${getMonthShort(parts[1])}`;
  }
  return dateStr;
}

function getMonthShort(month: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[parseInt(month) - 1] || month;
}

async function switchTab(tabId: string) {
  tracker.track('CLICK', {
    path: '/pages/content/index',
    pathName: '内容中心',
    metadata: {
      elementName: `内容分类-${tabId}`,
      elementId: `tab-${tabId}`
    }
  });
  activeTab.value = tabId;
  page.value = 1;
  hasMoreArticles.value = true;
  articles.value = [];
  await loadArticles();
}

async function loadArticles() {
  if (isLoadingArticles.value || !hasMoreArticles.value) return;

  isLoadingArticles.value = true;
  try {
    const res = await getArticles(activeTab.value, page.value, pageSize);
    if (res.code === 0 && res.data) {
      const newList = res.data.list || [];
      if (page.value === 1) {
        articles.value = newList;
      } else {
        articles.value = [...articles.value, ...newList];
      }
      
      hasMoreArticles.value = articles.value.length < res.data.total;
      if (newList.length > 0) {
        page.value++;
      } else {
        hasMoreArticles.value = false;
      }
    }
  } catch (e) {
    console.error('Failed to load articles:', e);
  } finally {
    isLoadingArticles.value = false;
  }
}

async function onRefresherRefresh() {
  if (isRefresherTriggered.value) return;
  
  isRefresherTriggered.value = true;
  refresherStatus.value = 'refreshing';
  
  // 重置分页并重新加载数据
  page.value = 1;
  hasMoreArticles.value = true;
  
  try {
    const [fortuneRes, qRes] = await Promise.all([
      getTodayFortune().catch(() => ({ data: null })),
      getPresetQuestions(2).catch(() => ({ data: [] })),
      loadArticles()
    ]);
    
    if (fortuneRes.data) fortune.value = fortuneRes.data;
    if (qRes.data) questions.value = qRes.data;
    
    // 显示成功状态并停留一会
    refresherStatus.value = 'success';
    console.log('[Refresher] Status changed to success');
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    console.error('[Refresher] Error during refresh:', err);
  } finally {
    isRefresherTriggered.value = false;
    refresherStatus.value = 'none';
    console.log('[Refresher] Status reset to none');
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

function onReachBottomScroll() {
  if (hasMoreArticles.value && !isLoadingArticles.value) {
    loadArticles();
  }
}

function openQa(item: PresetQuestion) {
  tracker.track('CLICK', {
    path: '/pages/content/index',
    pathName: '内容中心',
    metadata: {
      elementName: '预设问答',
      elementId: `qa-${item.id || item.question.slice(0, 20)}`
    }
  });
  selectedQa.value = item;
}

function openArticle(articleId: string) {
  uni.navigateTo({ url: `/pages/content/article?id=${articleId}` });
}

function openAIChat() {
  const profile = getLocalProfile();
  const token = getToken();

  // 检查登录状态：profile.isLoggedIn 或 token 存在
  if (!profile.isLoggedIn && !token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }

  // 如果 token 存在但 profile.isLoggedIn 为 false，修正状态
  if (token && !profile.isLoggedIn) {
    profile.isLoggedIn = true;
    setLocalProfile(profile);
  }

  tracker.track('CLICK', {
    path: '/pages/content/index',
    pathName: '内容中心',
    metadata: {
      elementName: '打开AI对话',
      elementId: 'btn-open-ai-chat'
    }
  });

  isAIChatOpen.value = true;

  // 尝试恢复会话
  let savedSessionId = getAiSessionId();

  // Mock 模式下使用模拟的 sessionId 来测试历史消息
  if (USE_MOCK && !savedSessionId) {
    savedSessionId = 'chat_mock_test_001';
    setAiSessionId(savedSessionId);
  }

  if (savedSessionId) {
    currentSessionId = savedSessionId;
    loadHistoryMessages();
  } else {
    // 新会话，显示欢迎消息
    messages.value = [
      { role: 'ai', text: '你好，我是你的产后照护助手。' },
      { role: 'ai', text: '你可以问我恢复、喂养、情绪或套餐问题。' }
    ];
  }
}

async function loadHistoryMessages(cursor?: string) {
  if (!currentSessionId || isLoadingHistory.value) return;

  isLoadingHistory.value = true;
  try {
    const res = await getAiSessionMessages(currentSessionId, cursor, 20);
    if (res.code === 0 && res.data) {
      const historyMessages: Message[] = res.data.list.map(msg => ({
        role: msg.role === 'USER' ? 'user' : 'ai',
        text: msg.content,
        seqNo: msg.seqNo
      }));

      if (cursor) {
        // 加载更多历史，带去重
        const existingSeqs = new Set(messages.value.map(m => m.seqNo));
        const uniqueNew = historyMessages.filter(m => !existingSeqs.has(m.seqNo));
        messages.value = [...uniqueNew, ...messages.value];
      } else {
        // 首次加载历史
        messages.value = historyMessages;
        // 如果没有历史消息，显示欢迎语
        if (messages.value.length === 0) {
          messages.value = [
            { role: 'ai', text: '你好，我是你的产后照护助手。' },
            { role: 'ai', text: '你可以问我恢复、喂养、情绪或套餐问题。' }
          ];
        }
        // 首次加载完成后滚到底部，让用户看到最新内容
        nextTick(() => scrollToBottom());
      }

      nextCursor = res.data.nextCursor;
      hasMoreHistory = res.data.hasMore;
    }
  } catch (e) {
    console.error('Failed to load history messages:', e);
    // 加载失败时显示欢迎语
    if (messages.value.length === 0) {
      messages.value = [
        { role: 'ai', text: '你好，我是你的产后照护助手。' },
        { role: 'ai', text: '你可以问我恢复、喂养、情绪或套餐问题。' }
      ];
    }
  } finally {
    isLoadingHistory.value = false;
  }
}

function loadMoreHistory(e?: any) {
  // 增加触发兜底与调试日志
  console.log('[AI Chat] scrolltoupper triggered', {
    hasMoreHistory,
    nextCursor,
    isLoadingHistory: isLoadingHistory.value,
    detail: e?.detail
  });

  if (hasMoreHistory && nextCursor && !isLoadingHistory.value) {
    loadHistoryMessages(nextCursor);
  } else {
    if (!hasMoreHistory) console.log('[AI Chat] loadMoreHistory intercepted: no more history');
    if (isLoadingHistory.value) console.log('[AI Chat] loadMoreHistory intercepted: already loading');
  }
}

function closeAIChat() {
  isAIChatOpen.value = false;
  if (sseConnection) {
    sseConnection.abort();
    sseConnection = null;
  }
}

function startTyping(greeting: string) {
  typedGreeting.value = '';
  let idx = 0;
  if (typingTimer) {
    clearInterval(typingTimer);
  }
  typingTimer = setInterval(() => {
    if (idx >= greeting.length) {
      if (typingTimer) {
        clearInterval(typingTimer);
      }
      return;
    }
    typedGreeting.value += greeting[idx];
    idx += 1;
  }, 42);
}

async function send() {
  const text = input.value.trim();
  if (!text) return;
  if (sseConnection) {
    uni.showToast({ title: '请等待当前回复完成', icon: 'none' });
    return;
  }

  const profile = getLocalProfile();
  if (!profile.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return;
  }

  // 添加用户消息，并立即滚到底部
  messages.value.push({ role: 'user', text });
  input.value = '';
  latestUserMessageRendered = false;
  pendingAiChatSessionId = currentSessionId;
  pendingAiChatMsgId = null;
  aiChatTrackedForCurrentSend = false;
  nextTick(() => {
    scrollToBottom();
    latestUserMessageRendered = true;
    tryTrackAiChat();
  });

  // 添加 AI 占位气泡 + 等待动画
  const aiMessageIndex = messages.value.length;
  messages.value.push({ role: 'ai', text: '', isLoading: true });

  try {
    const requestData: { sessionId?: string; message: string } = { message: text };
    if (currentSessionId) {
      requestData.sessionId = currentSessionId;
    }

    sseConnection = createSSEConnection({
      url: '/api/v1/ai/chat',
      data: requestData,
      onEvent: (event: SSEEvent) => {
        handleSSEEvent(event, aiMessageIndex);
      },
      onError: (error) => {
        pendingAiChatSessionId = null;
        aiChatTrackedForCurrentSend = true;
        messages.value[aiMessageIndex].isLoading = false;
        messages.value[aiMessageIndex].text = '抱歉，连接出现问题，请稍后重试。';
      },
      onComplete: () => {
        sseConnection = null;
      }
    });
  } catch (e) {
    pendingAiChatSessionId = null;
    aiChatTrackedForCurrentSend = true;
    messages.value[aiMessageIndex].isLoading = false;
    messages.value[aiMessageIndex].text = '抱歉，发送失败，请稍后重试。';
  }
}

function handleSSEEvent(event: SSEEvent, messageIndex: number) {
  switch (event.event) {
    case 'start':
      currentSessionId = event.data.sessionId;
      // 保存 sessionId 到本地
      if (currentSessionId) {
        setAiSessionId(currentSessionId);
        pendingAiChatSessionId = currentSessionId;
        pendingAiChatMsgId = event.data.msgId || (USE_MOCK ? `msg_mock_${Date.now()}` : null);
        tryTrackAiChat();
      }
      break;
    case 'delta':
      // 关闭等待动画
      messages.value[messageIndex].isLoading = false;
      messages.value[messageIndex].text += event.data.content;
      scrollToBottom();
      break;
    case 'suggestion':
      // 可以在消息末尾添加推荐问题
      break;
    case 'done':
      // 兜底：如果 AI 回复为空，可能是 delta 丢失，通过历史接口同步最新一条
      if (!messages.value[messageIndex].text && currentSessionId) {
        getAiSessionMessages(currentSessionId, undefined, 1).then(res => {
          if (res.data?.list?.length) {
            const last = res.data.list[0];
            if (last.role === 'ASSISTANT') {
              messages.value[messageIndex].text = last.content;
              messages.value[messageIndex].isLoading = false;
              scrollToBottom();
            }
          }
        });
      }
      sseConnection?.abort();
      sseConnection = null;
      break;
    case 'error':
      messages.value[messageIndex].isLoading = false;
      messages.value[messageIndex].text = `错误: ${event.data.message}`;
      sseConnection?.abort();
      sseConnection = null;
      break;
  }
}

function tryTrackAiChat() {
  if (!latestUserMessageRendered || aiChatTrackedForCurrentSend || !pendingAiChatSessionId || !pendingAiChatMsgId) return;

  tracker.track('AI_CHAT', {
    path: '/pages/content/index',
    pathName: 'AI内容问答',
    metadata: {
      sessionId: pendingAiChatSessionId,
      msgId: pendingAiChatMsgId
    }
  });

  aiChatTrackedForCurrentSend = true;
}

function scrollToBottom() {
  // 先清空再设置，确保 scroll-into-view 能触发（即使锚点 id 相同）
  scrollAnchorId.value = '';
  nextTick(() => {
    scrollAnchorId.value = 'msgBottom';
  });
}

function renderMarkdown(text: string): string {
  if (!text) return '';
  try {
    return marked.parse(text) as string;
  } catch {
    return text;
  }
}

onLoad(async () => {
  trackPath('内容中心');

  // 并行加载所有数据
  const [fortuneRes, qRes, articlesRes] = await Promise.all([
    getTodayFortune().catch(() => ({ data: null, code: 0, message: '' })),
    getPresetQuestions(2).catch(() => ({ data: [], code: 0, message: '' })),
    getArticles(activeTab.value, 1, 10).catch(() => ({ data: { list: [], total: 0, page: 1, pageSize: 10 }, code: 0, message: '' }))
  ]);

  fortune.value = fortuneRes.data;
  questions.value = qRes.data;
  // articles 由 loadArticles 处理了，不需要在这里赋值
  // articles.value = articlesRes.data.list;

  if (fortune.value?.greeting) {
    startTyping(fortune.value.greeting);
  } else {
    startTyping('根据你最近浏览路径，建议本周优先关注产后修复课程与夜间喂养节律。');
  }
});

onUnload(() => {
  if (typingTimer) {
    clearInterval(typingTimer);
  }
  if (sseConnection) {
    sseConnection.abort();
  }
});
</script>

<style scoped>
.content-page {
  background: #fff9f9;
}

.content-head {
  padding: calc(var(--top-safe-offset) + 12rpx) 30rpx 10rpx;
}

.title {
  font-size: 50rpx;
  color: #fb7185;
  letter-spacing: 4rpx;
}

.main-scroll {
  width: 100%;
}

.main-wrap {
  padding: 0 26rpx 40rpx;
}

.fortune-card {
  background: #fff1f2;
  border: 1rpx solid #fecdd3;
  border-radius: 30rpx;
  padding: 28rpx;
  margin-bottom: 28rpx;
}

.fortune-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.fortune-title {
  font-size: 48rpx;
  color: #f43f5e;
}

.fortune-sub {
  margin-top: 6rpx;
  color: #fb7185;
  font-size: 28rpx;
  letter-spacing: 2rpx;
}

.fortune-date {
  font-size: 40rpx;
  color: #fb7185;
}

.fortune-grid {
  display: flex;
  gap: 16rpx;
  align-items: stretch;
}

.fortune-col {
  flex: 1;
}

.divider {
  width: 1rpx;
  background: #fda4af;
  opacity: 0.6;
}

.small-label {
  font-size: 28rpx;
  color: #fb7185;
  margin-bottom: 10rpx;
}

.small-text {
  font-size: 28rpx;
  color: #4b5563;
  line-height: 2.4;
}

.fortune-text {
  margin-top: 30rpx;
  min-height: 180rpx;
  font-size: 32rpx;
  line-height: 2.5;
  color: #6b7280;
}

.qa-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #fb7185;
  font-size: 26rpx;
  letter-spacing: 4rpx;
  margin: 18rpx 0;
}

.line {
  flex: 1;
  height: 1rpx;
  background: #fecdd3;
}

.qa-list {
  display: grid;
  gap: 12rpx;
}

.qa-item,
.qa-ai {
  min-height: 108rpx;
  border-radius: 26rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qa-item {
  background: #fff;
  border: 1rpx solid #ffe4e6;
}

.qa-ai {
  background: #fb7185;
}

.qa-q,
.qa-ai-left {
  font-size: 29rpx;
  color: #4b5563;
}

.qa-ai-left {
  color: #fff;
}

.qa-arrow {
  width: 18rpx;
  height: 18rpx;
  margin-right: 6rpx;
  opacity: 0.55;
}

.qa-arrow.white {
  opacity: 0.95;
  filter: brightness(0) invert(1);
}

.tab-row {
  margin-top: 22rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
}

.tab-btn {
  min-height: 82rpx;
  border-radius: 9999rpx;
  background: #fff;
  border: 1rpx solid #ffe4e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #fb7185;
}

.tab-btn.active {
  background: #fb7185;
  color: #fff;
}

.article-list {
  margin-top: 24rpx;
  display: grid;
  gap: 18rpx;
}

.article-card {
  border-radius: 28rpx;
  overflow: hidden;
  background: #fff;
  border: 1rpx solid #ffe4e6;
}

.cover-wrap {
  position: relative;
  height: 350rpx;
}

.cover {
  width: 100%;
  height: 100%;
}

.play {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  width: 82rpx;
  height: 82rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(6rpx);
}

.play-icon {
  width: 34rpx;
  height: 34rpx;
  filter: brightness(0) invert(1);
}

.article-body {
  padding: 24rpx;
}

.article-title {
  font-size: 30rpx;
  line-height: 1.7;
  color: #1f2937;
}

.article-meta {
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #fb7185;
}

.loading-status {
  padding: 30rpx 0 60rpx;
  text-align: center;
  font-size: 24rpx;
  color: #9ca3af;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.36);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  z-index: 120;
}

.qa-modal {
  width: 100%;
  background: #fff;
  border-radius: 30rpx;
  padding: 32rpx;
  position: relative;
}

.modal-close {
  width: 58rpx;
  height: 58rpx;
  border-radius: 50%;
  background: #ffe4e6;
  color: #fb7185;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  width: 24rpx;
  height: 24rpx;
}

.qa-modal .modal-close {
  position: absolute;
  right: 22rpx;
  top: 22rpx;
}

.modal-q {
  font-size: 40rpx;
  color: #f43f5e;
  margin: 22rpx 0 16rpx;
  line-height: 1.6;
}

.modal-a {
  font-size: 31rpx;
  line-height: 1.86;
  color: #6b7280;
}

.modal-btn {
  margin-top: 28rpx;
}

.ai-drawer {
  position: fixed;
  inset: 0;
  background: #fff9f9;
  z-index: 140;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.ai-drawer.open {
  transform: translateX(0);
}

.ai-header {
  padding: 100rpx 24rpx 14rpx;
  border-bottom: 1rpx solid #fecdd3;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-back {
  width: 100rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #fb7185;
  font-size: 28rpx;
}

.back-icon {
  width: 32rpx;
  height: 32rpx;
}

.ai-title {
  font-size: 40rpx;
  color: #fb7185;
}

.ai-messages {
  flex: 1;
  height: 0;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.loading-history {
  text-align: center;
  padding: 20rpx;
  color: #9ca3af;
  font-size: 26rpx;
}

.msg-wrap {
  margin-bottom: 14rpx;
  display: flex;
  width: 100%;
  box-sizing: border-box;
}

.msg-wrap.ai {
  justify-content: flex-start;
}

.msg-wrap.user {
  justify-content: flex-end;
}

.msg {
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  font-size: 29rpx;
  line-height: 1.72;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-sizing: border-box;
}

.msg.ai {
  max-width: 70%;
  background: #fff;
  border: 1rpx solid #ffe4e6;
  color: #4b5563;
  text-align: left;
}

.msg.user {
  max-width: 70%;
  background: #fb7185;
  color: #fff;
  text-align: center;
}

.loading-dots {
  display: flex;
  gap: 8rpx;
  margin-top: 10rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #fb7185;
  animation: dotPulse 1.4s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.ai-preset-row {
  padding: 8rpx 18rpx;
  display: flex;
  gap: 10rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.preset {
  display: inline-block;
  background: #ffe4e6;
  color: #fb7185;
  border-radius: 9999rpx;
  padding: 10rpx 16rpx;
  font-size: 26rpx;
}

.ai-input-row {
  display: flex;
  gap: 10rpx;
  padding: 14rpx 18rpx calc(18rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #fecdd3;
}

.ai-input {
  flex: 1;
  min-height: 78rpx;
  border-radius: 18rpx;
  background: #fff;
  border: 1rpx solid #fecdd3;
  padding: 0 18rpx;
  font-size: 29rpx;
}

.send {
  width: 78rpx;
  height: 78rpx;
  border-radius: 18rpx;
  background: #fb7185;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-icon {
  width: 30rpx;
  height: 30rpx;
  filter: brightness(0) invert(1);
}

.fade-in {
  animation: fadeIn 0.5s ease both;
}

.reveal {
  animation: rise 0.55s ease both;
}

.pop-in {
  animation: popIn 0.22s ease both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes rise {
  from { opacity: 0; transform: translateY(14rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
</style>
