import type { UserProfile } from '@/types/domain';
import { defaultProfile } from '@/mock/data';

const PROFILE_KEY = 'aiermei_profile';
const TOKEN_KEY = 'aiermei_token';
const AI_SESSION_KEY = 'aiermei_ai_session';

export function getLocalProfile(): UserProfile {
  const raw = uni.getStorageSync(PROFILE_KEY);
  if (!raw) {
    uni.setStorageSync(PROFILE_KEY, defaultProfile);
    return defaultProfile;
  }
  return raw as UserProfile;
}

export function setLocalProfile(profile: UserProfile) {
  uni.setStorageSync(PROFILE_KEY, profile);
}

export function trackPath(path: string) {
  const profile = getLocalProfile();
  (profile.paths ??= []).push({ path, timestamp: Date.now() });
  profile.lastActive = Date.now();
  setLocalProfile(profile);
}

export function setLoginState(isLoggedIn: boolean, token?: string) {
  const profile = getLocalProfile();
  profile.isLoggedIn = isLoggedIn;
  setLocalProfile(profile);
  if (isLoggedIn && token) {
    saveToken(token);
  }
}

export function saveToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return uni.getStorageSync(TOKEN_KEY) || null;
}

export function clearToken() {
  uni.removeStorageSync(TOKEN_KEY);
}

export function clearSession() {
  clearToken();
  // 退出登录不清理 AI 会话映射，重登同账号可恢复
  // 重置 profile 为默认值
  uni.removeStorageSync(PROFILE_KEY);
}

/**
 * AI 会话管理（按 uid 维度存储）
 */
export function getAiSessionId(): string | null {
  const profile = getLocalProfile();
  if (!profile.isLoggedIn || !profile.uid) return null;

  const sessions = uni.getStorageSync(AI_SESSION_KEY) || {};
  return sessions[profile.uid] || null;
}

export function setAiSessionId(sessionId: string) {
  const profile = getLocalProfile();
  if (!profile.uid) return;

  const sessions = uni.getStorageSync(AI_SESSION_KEY) || {};
  sessions[profile.uid] = sessionId;
  uni.setStorageSync(AI_SESSION_KEY, sessions);
}

export function clearAiSessionId() {
  const profile = getLocalProfile();
  if (!profile.uid) return;

  const sessions = uni.getStorageSync(AI_SESSION_KEY) || {};
  delete sessions[profile.uid];
  uni.setStorageSync(AI_SESSION_KEY, sessions);
}
