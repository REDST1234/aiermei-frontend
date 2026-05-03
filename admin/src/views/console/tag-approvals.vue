<template>
  <div class="console-page">
    <div class="page-header">
      <h1 class="page-title">标签审批池</h1>
    </div>

    <div class="card console-panel panel">
      <div class="toolbar">
        <el-select v-model="query.status" clearable placeholder="状态" style="width: 150px" @change="loadList">
          <el-option label="待审批" value="PENDING" />
          <el-option label="已通过" value="APPROVED" />
          <el-option label="已拒绝" value="REJECTED" />
          <el-option label="已并入" value="MERGED" />
        </el-select>
        <el-input v-model="query.keyword" clearable placeholder="标签名" style="width: 220px" @keyup.enter="loadList" />
        <el-button type="primary" @click="loadList">查询</el-button>
      </div>

      <el-table :data="list" v-loading="loading">
        <el-table-column prop="tagName" label="标签名" min-width="180" />

        <el-table-column prop="mentionCount" label="提及数" width="100" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="lastSeenAt" label="最后出现" min-width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row.pendingId)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="total, prev, pager, next, sizes"
        @current-change="loadList"
        @size-change="loadList"
      />
    </div>

    <el-drawer v-model="drawerVisible" title="审批详情" size="60%" destroy-on-close>
      <template v-if="detail">
        <div class="detail-grid">
          <div><b>标签:</b> {{ detail.tagName }}</div>
          <div><b>参考原因:</b> {{ detail.aiReason || '-' }}</div>
          <div><b>候选数:</b> {{ detail.candidateCount }}</div>
        </div>

        <div class="section-title">候选标签建议</div>
        <el-table :data="detail.candidates" size="small" class="candidate-table" border-radius="8px">
          <el-table-column label="排名" width="80" align="center">
            <template #default="{ row }">
              <span :class="['rank-tag', `rank-${row.rankNo}`]">{{ row.rankNo }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="tagName" label="候选标签" min-width="150">
            <template #default="{ row }">
              <span class="candidate-name">{{ row.tagName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="相似度" width="180">
            <template #default="{ row }">
              <div class="similarity-wrapper">
                <el-progress 
                  :percentage="Math.round(row.similarity * 100)" 
                  :stroke-width="8"
                  :color="getSimilarityColor(row.similarity)"
                  :format="(p: number) => p + '%'"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>



        <div class="actions">
          <el-select v-model="reviewAction" style="width: 140px">
            <el-option label="通过" value="APPROVE" />
            <el-option label="拒绝" value="REJECT" />
            <el-option label="并入" value="MERGE" />
          </el-select>
          <el-select v-if="reviewAction === 'MERGE'" v-model="targetTagCode" style="width: 240px" placeholder="选择合并目标">
            <el-option v-for="item in detail.candidates" :key="item.tagCode" :label="item.tagName" :value="item.tagCode" />
          </el-select>
          <el-input v-model="reviewDescription" style="width: 220px" placeholder="备注（可选）" />
          <el-button type="primary" :loading="reviewing" @click="submitReview">提交审批</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getTagPendingDetail,
  getTagPendingList,
  reviewTagPending
} from '@/api/modules/admin-console'
import type { TagPendingDetail, TagPendingItem } from '@/types'

const loading = ref(false)
const list = ref<TagPendingItem[]>([])
const total = ref(0)
const query = ref({ status: 'PENDING', keyword: '', page: 1, pageSize: 20 })

const drawerVisible = ref(false)
const detail = ref<TagPendingDetail | null>(null)

const reviewAction = ref<'APPROVE' | 'REJECT' | 'MERGE'>('APPROVE')
const targetTagCode = ref('')
const reviewDescription = ref('')
const reviewing = ref(false)

async function loadList() {
  loading.value = true
  try {
    const res = await getTagPendingList(query.value)
    list.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

async function openDetail(pendingId: string) {
  drawerVisible.value = true
  const detailRes = await getTagPendingDetail(pendingId)
  detail.value = detailRes.data
  reviewAction.value = 'APPROVE'
  targetTagCode.value = detail.value.candidates[0]?.tagCode || ''
  reviewDescription.value = ''
}

async function submitReview() {
  if (!detail.value) return
  if (reviewAction.value === 'MERGE' && !targetTagCode.value) {
    ElMessage.warning('并入操作需要选择目标标签')
    return
  }

  reviewing.value = true
  try {
    await reviewTagPending(detail.value.pendingId, {
      action: reviewAction.value,
      targetTagCode: reviewAction.value === 'MERGE' ? targetTagCode.value : undefined,
      description: reviewDescription.value || undefined
    })
    ElMessage.success('审批已提交')
    drawerVisible.value = false
    await loadList()
  } finally {
    reviewing.value = false
  }
}

function getSimilarityColor(similarity: number) {
  if (similarity >= 0.8) return '#67C23A'
  if (similarity >= 0.5) return '#409EFF'
  return '#E6A23C'
}

onMounted(loadList)
</script>

<style scoped lang="scss">
.panel { padding: 16px; }
.toolbar { display: flex; gap: 10px; margin-bottom: 12px; }
.detail-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px; 
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
  
  & > div:last-child {
    padding-left: 40px;
  }
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 24px 0 12px;
  color: #303133;
  display: flex;
  align-items: center;
  &::before {
    content: '';
    width: 4px;
    height: 16px;
    background: #409eff;
    border-radius: 2px;
    margin-right: 8px;
  }
}
.candidate-table {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  border-radius: 8px;
  overflow: hidden;
}
.rank-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  &.rank-1 { background: #fef0f0; color: #f56c6c; }
  &.rank-2 { background: #fdf6ec; color: #e6a23c; }
  &.rank-3 { background: #f0f9eb; color: #67c23a; }
  background: #f4f4f5;
  color: #909399;
}
.candidate-name {
  font-weight: 500;
  color: #303133;
}
.similarity-wrapper {
  padding-right: 12px;
}
.actions { 
  display: flex; 
  gap: 10px; 
  margin-top: 24px; 
  align-items: center; 
  flex-wrap: wrap;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
