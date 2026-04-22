# 前端二轮交接文档

更新时间：2026-04-21

## 本轮结论

1. 首轮“AI 抽屉滑不动/滑不下去”修复已验证有效。  
2. 新发现问题：历史消息在 AI 页面出现倒序渲染。

## 问题1：（滚动问题）

涉及文件：`pages/content/index.vue`

1. `scroll-view` 从 `scrollTop` 强绑定改为 `scroll-into-view` 锚点滚动，避免与手势滚动抢控制。  
2. `ai-drawer` 增加 `height: 100vh` 与 `overflow: hidden`。  
3. `ai-messages` 增加 `height: 0`、`min-height: 0`，修复 flex 场景滚动容器高度计算问题。  
4. 增加底部锚点 `bottomAnchorId`，自动滚到底部改为滚动到锚点。

## 问题2：历史消息倒序渲染

### 现象

1. 每轮对话的历史内容顺序颠倒，出现“新消息在前、旧消息在后”。

### 原因

1. 后端历史接口当前已按 `seqNo` 升序返回。  
2. 前端在 `loadHistoryMessages` 里仍执行了 `.reverse()`，导致再次反转。

### 处理结果

已在前端去掉反转逻辑：

1. `historyMessages` 不再执行 `.reverse()`。  
2. 保留“分页历史插入头部”的逻辑：`messages = [...historyMessages, ...messages]`。

## 验收建议

1. 打开 AI 页，加载历史后确认顺序为“旧 -> 新”。  
2. 上滑加载更多历史后，消息顺序保持连续且不跳序。  
3. 发送新消息后，消息出现在底部且可继续向上查看历史。

## 问题3：投诉反馈联系人字段未完整接入

### 现象

1. 用户在提交投诉时，前端页面当前无法完整填写并提交联系人姓名、电话。

### 当前接口现状（后端）

1. `POST /api/v1/feedback/complaints` 当前已支持字段：`contactName`、`phone`、`content`、`relatedService`、`complaintType`。  
2. `contactName`、`phone` 当前均可留空，不做必填校验。

### 对接建议

1. 前端先补齐投诉表单字段绑定：`contactName`、`phone`。  
2. 本期不引入匿名开关，用户不想留联系方式时直接留空即可。  
3. 管理端查看投诉时，联系方式为空按“未填写”展示。

## 问题4：Admin 文档已对齐，当前缺口在前端管理端接入（FAQ/中心板块/热线）

### 现象

1. 后端接口已按 `doc/admin-api-spec.md` 完成对齐（FAQ 配置、中心板块配置、热线配置）。  
2. 当前主要缺口在前端管理端：页面入口、请求接线与联调开关尚未完整切换到后端真接口。  
3. 因此前端管理端暂未完整跑通“新增/编辑/下线/排序”等操作链路。  
4. 该问题当前优先级较低，暂不影响本轮主链路联调。  

## 问题5：AI 对话发送成功后未自动定位到底部

### 现象

1. 当历史消息较长时，用户发送消息成功后，列表未自动滚动到最底部。  
2. 用户需要手动下滑，才能看到 AI 最新回复。

### 影响

1. 用户误以为 AI 未返回或卡住，降低对话连续性体验。  
2. 在流式返回场景中，新增内容不在可视区域，体验断层明显。

### 对接建议

1. 在“发送成功后追加用户消息”时触发一次滚底。  
2. 统一使用 `scroll-into-view` 指向底部锚点，避免 `scrollTop` 与手势滚动冲突。  
3. 增加“仅当用户当前接近底部时自动滚动”的保护，避免用户上滑查看历史时被强制拉回。

## 问题6：前端缺少用户资料更新入口（`PUT /users/me` 未接入）

### 现象

1. 前端当前仅调用 `GET /api/v1/users/me` 拉取资料。  
2. 未发现用户资料编辑页与 `PUT /api/v1/users/me` 调用链路，导致姓名/头像/手机号/孕产信息无法提交更新。

### 后端接口可用性

1. 后端已提供：`PUT /api/v1/users/me`。  
2. 鉴权方式：`Authorization: Bearer <token>`。  
3. 更新成功后，返回最新用户资料快照（与 `GET /users/me` 的 `data` 结构一致）。

### 前端接入约束（新增）

1. 小程序端需新增“编辑个人信息”入口与页面，至少支持修改：`name`、`avatar`、`phone`、`pregnancyType`、`pregnancyDate`。  
2. 用户标签（`tags`）属于后台画像字段，**仅可在管理后台展示**，对小程序 C 端用户不可视。  
3. 小程序端页面与埋点中不得展示 `tags`；管理后台可按业务需要使用该字段。

### `PUT /users/me` 响应格式（给前端）

成功响应（`code=0`）：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "uid": "2044403270772477953",
    "name": "王小美",
    "avatar": "https://cdn.xxx/avatar.png",
    "phone": "13800001234",
    "memberLevel": "gold",
    "isLoggedIn": true,
    "pregnancyInfo": {
      "type": "postpartum",
      "date": "2026-04-01"
    },
    "lastActive": "2026-04-21T18:20:30+08:00"
  },
  "requestId": "6d8f9f86-3b3f-43c0-8f9b-4374f0a8d0d1",
  "timestamp": "2026-04-21T18:20:30+08:00"
}
```

常见失败响应：

1. 未登录/登录失效：`code=4003`。  
2. 参数非法（如 `pregnancyType` 传入未知值）：`code=4000`。

## 问题7：管理员后台当前仍为 Mock，可切后端真接口联调

### 现象

1. 管理员后台当前大部分数据来自前端 Mock 层，未实际请求后端管理接口。  
2. 页面在 Mock 模式下可运行，但无法验证真实鉴权、分页、状态流转与落库结果。

### 当前结论

1. 后端管理接口已具备联调基础能力，现阶段可切换为真实后端联调。  
2. 本轮建议：先从“内容管理、反馈管理、FAQ/Hotline 管理”切真；订单相关仍按低优先级处理。

### 对接建议

1. 管理后台提供环境开关，支持 `mock=false` 后直连后端。  
2. 将管理员请求基准地址统一到 `/api/v1/admin/**`。  
3. 先保留 Mock 兜底，仅在联调环境关闭；避免影响日常演示与回归。  
4. 联调阶段重点核对：响应字段、分页参数、状态更新后的二次查询一致性。

## 问题8：文章互动接口（点赞/取消点赞/浏览量）已就绪，前端需接入

### 现状

1. 后端已新增文章互动写接口：浏览量统计、点赞与取消点赞。  
2. 前端文章卡片/详情页当前尚未完整接入“阅读上报 + 点赞按钮 + 状态切换 + 计数回写”。

### 后端接口（可联调）

1. 点赞：`POST /api/v1/content/articles/{id}/likes`  
2. 取消点赞：`DELETE /api/v1/content/articles/{id}/likes`  
3. 浏览量上报：`POST /api/v1/content/articles/{id}/views`  
4. 鉴权说明：  
   - 点赞/取消点赞需 `Authorization: Bearer <token>`；未登录返回 `code=4003`。  
   - 浏览量上报可匿名调用。  
5. 返回结构：统一响应包 + `ArticleStatsResponse`（`articleId/likes/views/liked`）。

### 前端接入建议

1. 文章详情页进入后调用一次 `POST /articles/{id}/views` 上报浏览并刷新 `views`。  
2. 文章详情页新增点赞按钮（未点赞态 / 已点赞态）。  
3. 首次渲染可使用文章详情中的 `likes/views`；互动后以写接口返回为准回写本地状态。  
4. 点赞成功后将 `liked=true`、`likes` 更新为返回值；取消点赞同理。  
5. 若点赞接口返回 `4003`，引导用户先登录再点赞。

### 响应格式（给前端）

点赞成功（`POST`）：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "articleId": "1775432100002",
    "likes": 128,
    "views": 3460,
    "liked": true
  },
  "requestId": "2f7d9a13-99dc-4fc0-bfd1-3d16b7d4a1c7",
  "timestamp": "2026-04-21T20:15:30+08:00"
}
```

取消点赞成功（`DELETE`）：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "articleId": "1775432100002",
    "likes": 127,
    "views": 3460,
    "liked": false
  },
  "requestId": "82b6e695-9e8f-4a06-a6f4-f2fb0d3a9554",
  "timestamp": "2026-04-21T20:16:08+08:00"
}
```

浏览量上报成功（`POST /views`）：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "articleId": "1775432100002",
    "likes": 127,
    "views": 3461,
    "liked": null
  },
  "requestId": "6a5e7f42-2921-4b35-8294-12d6d257e2a1",
  "timestamp": "2026-04-21T20:17:22+08:00"
}
```
