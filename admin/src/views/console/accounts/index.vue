<template>
  <div class="console-page account-management">
    <div class="page-header">
      <div class="page-title">账号管理</div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增账号
      </el-button>
    </div>

    <div class="console-panel">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="员工账号" name="staff">
          <account-table 
            ref="staffTable" 
            role="staff" 
            @edit="handleEdit" 
          />
        </el-tab-pane>
        <el-tab-pane label="管理员账号" name="admin">
          <account-table 
            ref="adminTable" 
            role="admin" 
            @edit="handleEdit" 
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑账号' : '新增账号'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
        class="account-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="请输入登录用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-input v-model="form.avatar" placeholder="头像URL" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="初始密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="8-32位，须含字母与数字" />
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-select v-model="form.permissions" placeholder="请选择权限集">
            <el-option label="全部权限 (*)" value="*" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AccountTable from './components/AccountTable.vue'
import * as accountApi from '@/api/modules/account'

const activeTab = ref('staff')
const staffTable = ref()
const adminTable = ref()

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = reactive({
  id: '',
  username: '',
  name: '',
  avatar: '',
  password: '',
  permissions: '*'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,32}$/, message: '密码须为8-32位且同时包含字母与数字', trigger: 'blur' }
  ]
}

const handleTabChange = () => {
  // 切换Tab时自动刷新对应表格由子组件自处理或通过ref触发
}

const handleAdd = () => {
  isEdit.value = false
  form.id = ''
  form.username = ''
  form.name = ''
  form.avatar = ''
  form.password = ''
  form.permissions = '*'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  form.id = row.id
  form.username = row.username
  form.name = row.name
  form.avatar = row.avatar
  form.permissions = Array.isArray(row.permissions) ? (row.permissions[0] || '*') : (row.permissions || '*')
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          if (activeTab.value === 'staff') {
            await accountApi.updateStaffAccount(form.id, { ...form, permissions: [form.permissions] })
          } else {
            await accountApi.updateAdminAccount(form.id, { ...form, permissions: [form.permissions] })
          }
          ElMessage.success('更新成功')
        } else {
          if (activeTab.value === 'staff') {
            await accountApi.createStaffAccount({ ...form, permissions: [form.permissions] })
          } else {
            await accountApi.createAdminAccount({ ...form, permissions: [form.permissions] })
          }
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        // 刷新对应列表
        if (activeTab.value === 'staff') staffTable.value?.fetchData()
        else adminTable.value?.fetchData()
      } catch (error) {
        console.error(error)
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.account-management {
  .account-form {
    padding: 10px 20px 0 0;
  }
}
</style>
