<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="brand">AI ER MEI</div>
        <div class="subtitle">月子中心管理后台</div>
      </div>
      
      <div class="login-type">
        <el-radio-group v-model="loginType" size="large">
          <el-radio-button value="staff">员工</el-radio-button>
          <el-radio-button value="admin">管理员</el-radio-button>
        </el-radio-group>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" class="login-form" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div v-if="showMockTips" class="mock-tips">
        <div class="mock-title">Mock 测试账号 ({{ loginType === 'admin' ? '管理员' : '员工' }})</div>
        <div v-if="loginType === 'admin'" class="mock-item">账号：<b>admin / admin123</b></div>
        <div v-else class="mock-item">账号：<b>staff / staff123</b></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { login as loginApi } from '@/api/modules/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const loginType = ref<'admin' | 'staff'>('staff')
const showMockTips = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK === 'true'

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await loginApi({
      username: form.username,
      password: form.password
    }, loginType.value)

    userStore.login(res.data.token, res.data.user)
    ElMessage.success('登录成功')

    const redirect = route.query.redirect as string | undefined
    if (redirect) {
      await router.push(redirect)
    } else {
      await router.push(userStore.isAdmin ? { name: 'AdminDashboard' } : { name: 'Dashboard' })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '登录失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #111827 0%, #374151 100%);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.brand {
  font-size: 32px;
  font-weight: 600;
  color: #111827;
  letter-spacing: 4px;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
  letter-spacing: 1px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.login-type {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.login-type :deep(.el-radio-button__inner) {
  width: 120px;
  border-radius: 8px !important;
  margin: 0 4px;
  border: 1px solid #dcdfe6 !important;
}

.login-type :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid #dcdfe6 !important;
}

.login-type :deep(.el-radio-button.is-active .el-radio-button__inner) {
  background-color: #111827;
  border-color: #111827 !important;
  color: #fff;
  box-shadow: none !important;
}

.login-btn {
  width: 100%;
  border-radius: 8px;
  font-size: 16px;
  letter-spacing: 2px;
}

.mock-tips {
  margin-top: 16px;
  padding: 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
}

.mock-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.mock-item {
  font-size: 13px;
  color: #475569;
  line-height: 1.7;
}
</style>
