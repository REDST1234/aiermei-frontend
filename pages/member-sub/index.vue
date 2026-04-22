<template>
  <view class="page sub-page">
    <view class="head">
        <view class="back" @click="goBack">
          <image class="back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
        </view>
      <view class="head-title">{{ title }}</view>
    </view>

    <view class="body" v-if="type === 'evaluation'">
      <view class="card center">
        <view class="tip">请给本次服务打分</view>
        <view class="stars">
          <text class="star" :class="{ on: index <= rating }" v-for="index in 5" :key="index" @click="rating = index">*</text>
        </view>
      </view>
      <view class="card">
        <view class="tip">评价内容</view>
        <textarea class="textarea" v-model="content" placeholder="请输入评价内容..." />
      </view>
      <button class="submit" :class="{ disabled: rating === 0 }" @click="submitEvaluationAction">提交评价</button>
      <view class="done" v-if="submitted">提交成功，感谢你的反馈</view>
    </view>

    <view class="body" v-else-if="type === 'hotline'">
      <view class="card hotline" v-for="item in hotlines" :key="item.number">
        <view>
          <view class="tip">{{ item.label }}</view>
          <view class="hotline-number">{{ item.number }}</view>
        </view>
        <view class="call" @click="call(item.number)">
          <image class="call-icon" src="/static/icons/phone.svg" mode="aspectFit" />
        </view>
      </view>
      <view class="card center" v-if="serviceQrCodeUrl">
        <view class="tip">{{ serviceQrTips || '扫码联系顾问' }}</view>
        <image class="qr" :src="serviceQrCodeUrl" mode="aspectFill" />
      </view>
    </view>

    <view class="body faq-body" v-else-if="type === 'faq'">
      <!-- 入口卡片 -->
      <view v-if="!faqCategory">
        <view class="faq-entry" v-for="cat in faqCategories" :key="cat.id" @click="selectFaqCategory(cat.id, cat.name)">
          <view class="faq-entry-text">{{ cat.name }}</view>
          <image class="faq-entry-arrow" src="/static/icons/arrow-right.svg" mode="aspectFit" />
        </view>
      </view>
      <!-- 问题列表 -->
      <view v-else>
        <view class="faq-back" @click="faqCategory = ''">
          <image class="faq-back-icon" src="/static/icons/arrow-left.svg" mode="aspectFit" />
          <text>{{ faqCategoryName }}</text>
        </view>
        <view class="faq-item" v-for="(item, idx) in faqItems" :key="item.id" @click="toggleFaq(idx)">
          <view class="faq-header">
            <view class="faq-q">{{ item.title }}</view>
            <image class="faq-arrow" :class="{ expanded: expandedFaq === idx }" src="/static/icons/arrow-down.svg" mode="aspectFit" />
          </view>
          <view class="faq-a" v-if="expandedFaq === idx">{{ item.content }}</view>
        </view>
      </view>
    </view>

    <view class="body" v-else-if="type === 'package'">
      <view class="card package" v-for="item in suites" :key="item.id" @click="openSuite(item.id)">
        <image :src="item.coverImage || item.images?.[0]" class="pkg-cover" mode="aspectFill" />
        <view class="pkg-title">{{ item.name }}</view>
        <view class="pkg-desc">{{ item.size }} / {{ item.features.join(' | ') }}</view>
        <view class="pkg-price">{{ item.priceLabel }}</view>
      </view>
    </view>

    <view class="body" v-else-if="type === 'coupon'">
      <view class="card coupon" v-for="item in coupons" :key="item.id">
        <view class="left-bar" :class="{ off: item.status !== 'unused' }" />
        <view>
          <view class="q">{{ item.name }}</view>
          <view class="a">到期 {{ item.expiry }}</view>
        </view>
        <view class="coupon-right">
          <view class="coupon-money">{{ item.valueLabel }}</view>
          <view class="coupon-state" :class="{ off: item.status !== 'unused' }">{{ item.status === 'unused' ? '可用' : '已过期' }}</view>
        </view>
      </view>
    </view>

    <view class="body" v-else-if="type === 'postpartum'">
      <view class="card service" v-for="item in services" :key="item.id">
        <view class="row-between">
          <view class="q">{{ item.name }}</view>
          <view class="status" :class="{ doneStatus: item.status === 'completed' }">{{ item.status === 'pending' ? '待服务' : '已完成' }}</view>
        </view>
        <view class="a">{{ item.expert }} / {{ item.time }}</view>
      </view>
    </view>

    <view class="body complaint-body" v-else-if="type === 'complaint'">
      <view class="card">
        <view class="tip">联系人信息（选填）</view>
        <view class="contact-row">
          <input
            class="contact-input"
            v-model="contactName"
            placeholder="姓名"
            maxlength="20"
          />
          <input
            class="contact-input"
            v-model="contactPhone"
            type="number"
            placeholder="手机号"
            maxlength="11"
          />
        </view>
      </view>
      <view class="card">
        <view class="tip">问题类型</view>
        <view class="type-grid">
          <view class="type-item" :class="{ active: complaintType === t.value }" v-for="t in complaintTypes" :key="t.value" @click="complaintType = t.value">{{ t.label }}</view>
        </view>
      </view>
      <view class="card">
        <view class="tip">问题描述</view>
        <textarea class="textarea" v-model="content" placeholder="请输入你的建议或投诉..." />
      </view>
      <button class="submit" :class="{ disabled: !content.trim() }" @click="submitComplaintAction">提交建议</button>
      <view class="done" v-if="submitted">提交成功，我们会尽快联系你</view>
    </view>

    <view class="body" v-else>
      <view class="card center">页面开发中...</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getFaqCategories, getFaqItems, getMemberCoupons, getServiceHotlines, getPostpartumServices, submitComplaint, submitEvaluation } from '@/api/modules/member';
import { getSuites } from '@/api/modules/center';
import { trackPath } from '@/store/session';
import type { Coupon, PostpartumService, FaqCategory, FaqItem, Suite, HotlineInfo } from '@/types/domain';

const type = ref('evaluation');
const rating = ref(0);
const content = ref('');
const submitted = ref(false);
const complaintType = ref<string>('SERVICE_QUALITY');
const contactName = ref<string>('');
const contactPhone = ref<string>('');
const complaintTypes = [
  { value: 'SERVICE_QUALITY', label: '服务质量' },
  { value: 'FACILITY_ENVIRONMENT', label: '环境设施' },
  { value: 'CATERING_SUGGESTION', label: '餐饮建议' },
  { value: 'OTHER', label: '其他' }
];

const faqCategories = ref<FaqCategory[]>([]);
const faqItems = ref<FaqItem[]>([]);
const faqCategory = ref<string>('');
const faqCategoryName = ref<string>('');
const suites = ref<Suite[]>([]);
const coupons = ref<Coupon[]>([]);
const services = ref<PostpartumService[]>([]);
const hotlines = ref<HotlineInfo[]>([]);
const serviceQrCodeUrl = ref<string>('');
const serviceQrTips = ref<string>('');
const expandedFaq = ref<number | null>(null);

const titleMap: Record<string, string> = {
  evaluation: '服务评价',
  faq: '常见问题',
  package: '套餐详情',
  hotline: '服务热线',
  coupon: '我的优惠券',
  postpartum: '产后服务',
  complaint: '投诉建议'
};

const title = computed(() => titleMap[type.value] || '详情');

function goBack() {
  uni.navigateBack();
}

async function submitEvaluationAction() {
  if (rating.value === 0) return;
  try {
    await submitEvaluation({
      score: rating.value,
      content: content.value || undefined
    });
    submitted.value = true;
  } catch (e) {
    uni.showToast({ title: '提交失败', icon: 'none' });
  }
}

async function submitComplaintAction() {
  if (!content.value.trim()) return;
  try {
    await submitComplaint({
      content: content.value,
      complaintType: complaintType.value as any,
      contactName: contactName.value || undefined,
      phone: contactPhone.value || undefined
    });
    submitted.value = true;
  } catch (e) {
    uni.showToast({ title: '提交失败', icon: 'none' });
  }
}

function call(phone: string) {
  uni.makePhoneCall({ phoneNumber: phone.replace(/-/g, '') });
}

function openSuite(id: string) {
  uni.navigateTo({ url: `/pages/suite-details/index?id=${id}` });
}

function toggleFaq(idx: number) {
  expandedFaq.value = expandedFaq.value === idx ? null : idx;
}

async function selectFaqCategory(categoryId: string, name: string) {
  faqCategory.value = categoryId;
  faqCategoryName.value = name;
  try {
    const res = await getFaqItems(categoryId);
    faqItems.value = res.data;
  } catch (e) {
    console.error('Failed to load FAQ items:', e);
  }
}

async function loadByType() {
  if (type.value === 'faq') {
    try {
      const res = await getFaqCategories();
      faqCategories.value = res.data;
    } catch (e) {
      console.error('Failed to load FAQ categories:', e);
    }
  }
  if (type.value === 'package') {
    try {
      const res = await getSuites();
      suites.value = res.data;
    } catch (e) {
      console.error('Failed to load suites:', e);
    }
  }
  if (type.value === 'coupon') {
    try {
      const res = await getMemberCoupons();
      coupons.value = res.data;
    } catch (e) {
      console.error('Failed to load coupons:', e);
    }
  }
  if (type.value === 'postpartum') {
    try {
      const res = await getPostpartumServices();
      services.value = res.data;
    } catch (e) {
      console.error('Failed to load postpartum services:', e);
    }
  }
  if (type.value === 'hotline') {
    try {
      const res = await getServiceHotlines();
      hotlines.value = res.data.hotlines;
      serviceQrCodeUrl.value = res.data.serviceQrCodeUrl;
      serviceQrTips.value = res.data.serviceQrTips;
    } catch (e) {
      console.error('Failed to load hotlines:', e);
    }
  }
}

onLoad(async (query) => {
  type.value = String(query?.id || 'evaluation');
  trackPath(`会员子页:${type.value}`);
  await loadByType();
});
</script>

<style scoped>
.sub-page {
  background: #f5f5f0;
  min-height: 100vh;
}

.head {
  display: flex;
  align-items: center;
  padding: var(--top-safe-offset) 24rpx 16rpx;
  gap: 8rpx;
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

.body {
  padding: 0 24rpx 60rpx;
}

.card {
  position: relative;
  background: #fff;
  border: 1rpx solid rgba(17, 24, 39, 0.1);
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.card.center {
  text-align: center;
}

.tip {
  color: #9ca3af;
  font-size: 22rpx;
  margin-bottom: 10rpx;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 12rpx;
}

.star {
  font-size: 58rpx;
  color: #e5e7eb;
}

.star.on {
  color: #111827;
}

.textarea {
  width: 100%;
  min-height: 240rpx;
  font-size: 27rpx;
  line-height: 1.75;
}

.submit {
  width: 100%;
  min-height: 94rpx;
  background: #111827;
  color: #fff;
  font-size: 30rpx;
  letter-spacing: 4rpx;
}

.submit.disabled {
  opacity: 0.35;
}

.done {
  margin-top: 16rpx;
  text-align: center;
  color: #6b7280;
  font-size: 28rpx;
}

.hotline {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hotline-number {
  font-size: 36rpx;
  color: #111827;
}

.call {
  width: 74rpx;
  height: 74rpx;
  background: #111827;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.call-icon {
  width: 28rpx;
  height: 28rpx;
  filter: brightness(0) invert(1);
}

.qr {
  width: 360rpx;
  height: 360rpx;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.q {
  font-size: 28rpx;
  color: #1f2937;
}

.a {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.6;
}

.arrow {
  width: 16rpx;
  height: 16rpx;
  opacity: 0.4;
}

.package {
  overflow: hidden;
}

.pkg-cover {
  width: 100%;
  height: 320rpx;
  margin-bottom: 12rpx;
}

.pkg-title {
  font-size: 32rpx;
  color: #111827;
}

.pkg-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.6;
}

.pkg-price {
  margin-top: 10rpx;
  font-size: 30rpx;
  color: #111827;
}

.coupon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 28rpx;
}

.left-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8rpx;
  background: #111827;
}

.left-bar.off {
  background: #d1d5db;
}

.coupon-right {
  text-align: right;
}

.coupon-money {
  font-size: 36rpx;
  color: #111827;
}

.coupon-state {
  margin-top: 6rpx;
  font-size: 20rpx;
  border: 1rpx solid rgba(17, 24, 39, 0.15);
  padding: 4rpx 10rpx;
  display: inline-block;
}

.coupon-state.off {
  color: #9ca3af;
  border-color: #e5e7eb;
}

.service .row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status {
  font-size: 22rpx;
  color: #111827;
  border: 1rpx solid rgba(17, 24, 39, 0.15);
  padding: 6rpx 12rpx;
}

.status.doneStatus {
  color: #9ca3af;
  border-color: #e5e7eb;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.type-item {
  min-height: 88rpx;
  border: 1rpx solid rgba(17, 24, 39, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #6b7280;
}

.type-item.active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

/* 联系人信息行 */
.contact-row {
  display: flex;
  gap: 20rpx;
}

.contact-input {
  flex: 1;
  min-height: 76rpx;
  border: 1rpx solid rgba(17, 24, 39, 0.12);
  border-radius: 8rpx;
  padding: 0 18rpx;
  font-size: 28rpx;
  background: #f9fafb;
}

/* 投诉建议页面样式 */
.body.complaint-body {
  padding-top: 0;
  margin-top: 20rpx;
}

.complaint-body .card {
  padding: 28rpx;
}

.complaint-body .tip {
  font-size: 26rpx;
  margin-bottom: 16rpx;
}

.complaint-body .textarea {
  min-height: 280rpx;
  font-size: 30rpx;
}

.faq-item {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  overflow: hidden;
}

.faq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
}

.faq-q {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.faq-arrow {
  width: 24rpx;
  height: 24rpx;
  opacity: 0.5;
  transition: transform 0.3s ease;
}

.faq-arrow.expanded {
  transform: rotate(180deg);
}

.faq-a {
  padding: 0 32rpx 28rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}

.faq-body {
  padding-top: 40rpx;
}

.faq-entry {
  background: #fff;
  border-radius: 16rpx;
  padding: 36rpx 32rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.faq-entry-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.faq-entry-sub {
  font-size: 26rpx;
  color: #999;
  margin-top: 8rpx;
}

.faq-entry-arrow {
  width: 24rpx;
  height: 24rpx;
  opacity: 0.4;
}

.faq-back {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 0 30rpx;
  font-size: 30rpx;
  color: #666;
}

.faq-back-icon {
  width: 24rpx;
  height: 24rpx;
  opacity: 0.6;
}
</style>