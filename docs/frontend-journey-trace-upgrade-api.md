# Journey 行为路径溯源升级与联调问题对接文档

更新时间：2026-05-02  
适用端：管理员/员工客户详情页「行为路径与日志」  
接口：`GET /api/v1/staff/customers/{uid}/journey`（主）  
兼容旧接口：`GET /api/v1/analytics/users/{uid}/journey`

## 1. 背景与问题

### 1.1 现状问题
1. `/journey` 返回中仍出现英文页面名（如 `Member Subpage`、`Magazine Detail`、`Poster Detail`、`Article Detail`）。
2. 溯源信息过于粗糙，当前只展示 `path + timestamp`，无法看出点击了什么、看了哪篇文章、AI 会话来自哪里。
3. `metadataJson` 有数据但未被有效展示，前端无法直接用于诊断。

### 1.2 本次目标
1. 历史与新增数据统一运行时中文化展示（不改历史库）。
2. `journey.paths[]` 返回结构化溯源信息，前端可直接渲染。
3. 兼容旧前端：旧字段 `path/timestamp` 继续保留。

---

## 2. 接口契约变更（向后兼容）

### 2.1 路径不变
1. `GET /api/v1/staff/customers/{uid}/journey?limit=100`
2. 兼容：`GET /api/v1/analytics/users/{uid}/journey?limit=100`

### 2.2 `paths[]` 新旧字段对照

| 字段 | 旧版 | 新版 | 说明 |
|---|---|---|---|
| `path` | ✅ | ✅ | 兼容字段，当前已返回中文展示名 |
| `timestamp` | ✅ | ✅ | 事件时间 |
| `rawPath` | ✅ | ✅ | 原始路径（去 query/hash 后） |
| `displayName` | ❌ | ✅ | 标准化后的中文页面名（建议前端优先展示） |
| `eventId` | ❌ | ✅ | 行为事件ID |
| `eventType` | ❌ | ✅ | 事件类型（PAGE_VIEW/CLICK/ARTICLE_VIEW/AI_CHAT...） |
| `pathName` | ❌ | ✅ | 入库原始页面名（可能历史英文） |
| `durationSeconds` | ❌ | ✅ | 最长单次停留时长（秒，聚合后语义） |
| `totalDurationSeconds` | ❌ | ✅ | 总停留时长（秒，聚合后统计） |
| `metadata` | ❌ | ✅ | 解析后的 metadata 对象 |
| `context` | ❌ | ✅ | 后端生成的结构化摘要文案 |
| `repeatCount` | ❌ | ✅ | 同段去重聚合次数，默认 1 |

### 2.3 响应示例

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "uid": "2044403270772477953",
    "lastActive": "2026-04-28T15:50:12+08:00",
    "tags": ["高活跃用户", "内容依赖型"],
    "paths": [
      {
        "path": "文章详情",
        "displayName": "文章详情",
        "rawPath": "/pages/content/detail",
        "eventId": "E_202604281520001",
        "eventType": "ARTICLE_VIEW",
        "pathName": "Article Detail",
        "durationSeconds": 18,
        "totalDurationSeconds": 43,
        "metadata": {
          "articleId": "A_102",
          "title": "产后恢复饮食建议",
          "category": "postpartum"
        },
        "context": "浏览文章「产后恢复饮食建议」（分类：postpartum）3次，总停留 43 秒，最长单次 18 秒",
        "repeatCount": 3,
        "timestamp": "2026-04-28T15:20:11+08:00"
      }
    ]
  },
  "requestId": "xxxx"
}
```

---

## 3. 页面名中文映射规则

### 3.1 解析优先级（固定）
1. `path` 标准映射（优先级最高）
2. `metadata.pageName/page_name/pathName/title` 映射
3. `event.pathName` 映射
4. fallback（`rawPath` 或 `未知页面`）

### 3.2 重点英文别名修复
1. `Member Subpage -> 会员页`
2. `Magazine Detail -> 杂志详情`
3. `Poster Detail -> 海报详情`
4. `Article Detail -> 文章详情`
5. `suite detail / Suite Detail -> 套房详情`

说明：本次为运行时修复，不回填历史数据库。

---

## 4. 溯源内容（context）生成规则

1. `PAGE_VIEW`：`浏览了「{页面}」{count}次，总停留 {total}s，最长单次 {max}s`
2. `CLICK`：`在「{页面}」点击了「{elementName/elementId}」`
3. `ARTICLE_VIEW`：`浏览文章「{title}」（分类：{category}）{count}次，总停留 {total}s，最长单次 {max}s`
4. `APPOINTMENT_INTENT`：`在「{页面}」表达预约意向（可带套餐/意向等级）`
5. `AI_CHAT`：`在 AI 对话中产生交互（sessionId=..., msgId=...）`
6. 其他事件：`发生了 {eventType} 行为`

注意：
1. `metadata` 解析失败时接口不报错，返回空对象并记 `warn`。
2. 不回传冗长正文，控制响应体大小与隐私风险。
3. 浏览类事件（`PAGE_VIEW/ARTICLE_VIEW`）停留 `<10s` 不单独展示，但会计入同段聚合的 `repeatCount` 与 `totalDurationSeconds`。

---

## 5. 前端渲染建议（兼容旧字段）

### 5.1 建议展示层级
1. 第一行：`displayName`（无则 `path`）
2. 第二行：`context`
3. 第三行：`timestamp`
4. 展开区：`metadata`（key-value，默认折叠）

### 5.2 向后兼容策略
1. 老版本若仅读 `path/timestamp`，不受影响。
2. 新版本优先读取新增字段，不存在时自动降级到旧字段。

---

## 6. 回归验证清单

### 6.1 中英文映射
1. 历史英文样本全部转中文。
2. 大小写变体（`member subpage`）可命中。

### 6.2 metadata 展示
1. `ARTICLE_VIEW` 能看到 `articleId/title/category`。
2. `CLICK` 能看到 `elementName/elementId`。
3. `AI_CHAT` 能看到 `sessionId/msgId` 摘要。

### 6.3 去重效果
1. 同类型、同路径 key 且连续 5 分钟内重复访问聚合为一段，`repeatCount > 1`。
2. 不同文章 `articleId` 不被误合并。

### 6.4 兼容性
1. 老前端页面不改代码也可正常显示。
2. 新前端读取新增字段无空指针/渲染报错。

---

## 7. 常见问题与排查

1. `displayName` 为空  
先看 `rawPath/pathName/metadata.pageName` 是否为空；再查后端日志是否有 `journey_metadata_parse_failed`。

2. 仍显示英文  
确认是否命中旧 mock 数据；确认请求路径是否走真实 `/staff/customers/{uid}/journey`。

3. `metadata` 为空对象  
可能是历史事件未上报 metadata 或 metadata 非法 JSON；后端会保底返回 `{}`。

4. `repeatCount` 总是 1  
检查是否同一路径且 5 秒内、且关键 metadata 键一致；否则不会聚合。

---

## 8. 关联缺失 CRUD 已补齐（员工端）

说明：本节是对本期“缺失 CRUD”问题的补充，避免前端继续走 mock/本地假数据。

### 8.1 预设问题（Preset Question）CRUD

前缀：`/api/v1/staff/content/preset-questions`

1. `GET /api/v1/staff/content/preset-questions`
2. `GET /api/v1/staff/content/preset-questions/{questionId}`
3. `POST /api/v1/staff/content/preset-questions`
4. `PUT /api/v1/staff/content/preset-questions/{questionId}`
5. `DELETE /api/v1/staff/content/preset-questions/{questionId}`

请求字段（POST/PUT）：

```json
{
  "question": "产后多久可以开始运动？",
  "answer": "建议先评估恢复情况，再循序渐进。",
  "category": "postpartum",
  "sortNo": 10
}
```

权限要求：
1. 读：`base.view` 或 `content.edit` 或 `*`
2. 写：`content.edit` 或 `*`

---

### 8.2 产后服务（Postpartum Service）CRUD

前缀：`/api/v1/staff/postpartum-services`

1. `GET /api/v1/staff/postpartum-services`
2. `GET /api/v1/staff/postpartum-services/{serviceId}`
3. `POST /api/v1/staff/postpartum-services`
4. `PUT /api/v1/staff/postpartum-services/{serviceId}`
5. `DELETE /api/v1/staff/postpartum-services/{serviceId}`

请求字段（POST/PUT）：

```json
{
  "uid": "2044403270772477953",
  "orderId": "order_001",
  "serviceName": "盆底修复评估",
  "appointmentTime": "2026-05-03T14:00:00+08:00",
  "durationMinutes": 45,
  "expertName": "王护理师",
  "status": "scheduled"
}
```

权限要求：
1. 读：`base.view` 或 `employee.portal` 或 `*`
2. 写：`employee.portal` 或 `*`

---

### 8.3 与 `/journey` 的关系

1. 以上两组 CRUD 是本期员工端数据维护能力补齐；`/journey` 仍只负责行为轨迹查询与展示。
2. 前端联调时建议先切换到真实 CRUD，再校验 `/journey` 中 `ARTICLE_VIEW/APPOINTMENT_INTENT` 的溯源展示。
