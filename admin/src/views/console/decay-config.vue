<template>
  <div class="console-page">
    <div class="page-header"><h1 class="page-title">行为热度衰减设置</h1></div>

    <div class="card console-panel panel intro">
      <div class="intro-title">怎么理解这三个参数？</div>
      <div class="intro-item"><b>初始热度</b>：行为发生时的初始权重，目前统一锁定为 100%（即参数值为 1.0）。</div>
      <div class="intro-item"><b>降温速度</b>：分数随时间下降的快慢，越大降得越快。</div>
      <div class="intro-item"><b>最低保留值</b>：再久也保留的最低分，避免完全归零。</div>
      <div class="intro-tip">提示：因系统标签衰减均以百分比（%）形式展示，初始权重统一锁定为 1.0 (100%) 不可修改。</div>
    </div>

    <div class="card console-panel panel">
      <el-table :data="rows" v-loading="loading">
        <el-table-column prop="eventLabel" label="行为类型" min-width="160" />
        <el-table-column label="业务解释" min-width="220">
          <template #default="{ row }">{{ row.desc }}</template>
        </el-table-column>
        <el-table-column label="初始热度" width="180">
          <template #default="{ row }">
            <el-input-number :model-value="1" disabled :precision="1" style="width: 120px" />
          </template>
        </el-table-column>
        <el-table-column label="降温速度" min-width="150">
          <template #default="{ row }">
            <el-input-number v-model="row.lambda" :precision="6" :step="0.001" />
          </template>
        </el-table-column>
        <el-table-column label="最低保留值" min-width="160">
          <template #default="{ row }">
            <el-input-number v-model="row.minWeight" :precision="3" :step="0.01" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="saveRow(row)">保存</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getDecayConfigList, updateDecayConfig } from '@/api/modules/admin-console'
import type { DecayConfigItem } from '@/types'

type DecayUiRow = DecayConfigItem & { desc: string }

const loading = ref(false)
const rows = ref<DecayUiRow[]>([])

const descMap: Record<string, string> = {
  PAGE_VIEW: '用户浏览页面后的基础关注热度',
  CLICK: '用户点击关键按钮后的短期兴趣热度',
  ARTICLE_VIEW: '用户深度阅读内容后的内容兴趣热度',
  AI_CHAT: '用户与AI咨询后的需求热度',
  APPOINTMENT_INTENT: '用户表达预约意向后的高价值热度'
}

async function load() {
  loading.value = true
  try {
    const res = await getDecayConfigList()
    rows.value = res.data.map((item) => ({
      ...item,
      desc: descMap[item.eventType] || '该行为对应的热度衰减配置'
    }))
  } finally {
    loading.value = false
  }
}

async function saveRow(row: DecayUiRow) {
  await updateDecayConfig(row.eventType, {
    initialWeight: row.initialWeight,
    lambda: row.lambda,
    minWeight: row.minWeight
  })
  ElMessage.success(`已保存「${row.eventLabel}」参数`)
}

onMounted(load)
</script>

<style scoped lang="scss">
.panel { padding: 16px; }
.intro { margin-bottom: 14px; }
.intro-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #111827; }
.intro-item { color: #4b5563; line-height: 1.8; font-size: 13px; }
.intro-tip { 
  margin-top: 12px; 
  padding: 8px 12px; 
  background: #eff6ff; 
  color: #1e40af; 
  border-radius: 6px; 
  font-size: 12px;
  border-left: 4px solid #3b82f6;
}
</style>
