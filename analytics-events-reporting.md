# 用户行为事件上报接口说明（当前实现）

更新时间：2026-04-21

## 1. 接口现状

### 1.1 上报接口

- 方法与路径：`POST /api/v1/analytics/events/batch`
- 用途：批量写入用户行为埋点（落库表：`analytics_event`）
- 返回：`accepted`（成功写入条数）+ `deduplicated`（按 `eventId` 去重条数）

### 1.2 鉴权现状（重要）

- 当前实现通过 `@RequestAttribute(CURRENT_UID)` 读取用户 UID。
- 该属性由鉴权拦截器在 Bearer token 校验通过后写入。
- 结论：当前上报接口实际要求携带 `Authorization: Bearer <token>`。
- 若不带 token，请求会在参数绑定阶段失败（当前会落到通用异常，返回 `code=5000`，属于已知待优化点）。

### 1.3 请求体结构

```json
{
  "events": [
    {
      "eventId": "evt_xxx",
      "eventType": "PAGE_VIEW",
      "path": "/pages/index/index",
      "pathName": "首页",
      "occurredAt": "2026-04-21T20:00:00+08:00",
      "durationSeconds": 12,
      "metadata": {
        "source": "app_launch"
      }
    }
  ]
}
```

字段约束（后端当前校验）：

- `events`：必填，且不能为空数组
- `eventId`：必填，字符串；全局唯一（数据库唯一索引 `uk_event_id`）
- `eventType`：必填，枚举
- `path`：必填，字符串
- `occurredAt`：必填，`ISO8601`（建议带 `+08:00`）
- `pathName`/`durationSeconds`/`metadata`：可选

### 1.4 支持的事件类型

- `PAGE_VIEW`
- `CLICK`
- `LOGIN`
- `APPOINTMENT_INTENT`
- `ARTICLE_VIEW`
- `AI_CHAT`

### 1.5 metadata 设计原则（商业化视角）

- `eventType` 定义行为骨架，`metadata` 承载商业线索。
- 后端当前对 `metadata` 为“透传 JSON 存储”，不做字段白名单校验；前端可按本文档补充高价值字段。
- 推荐优先级：
  1. 预约意向：补齐意向套餐、价格锚点、意向等级
  2. 文章浏览：补齐文章业务标签（`tags`）
  3. 页面访问/点击：补齐 UTM 归因参数
  4. AI_CHAT：保持极简，仅用于行为时间轴打点

## 2. 处理逻辑（后端）

- `uid` 不从前端 body 传入，而是从 token 解析后的请求上下文注入。
- `eventId` 重复时不报错，计入 `deduplicated`。
- `metadata` 会序列化为 JSON 字符串存入 `metadata_json`。
- 单条 `metadata` 序列化失败时，该条事件仍会继续尝试入库（仅 metadata 可能为空）。

## 3. 响应格式

### 3.1 成功响应

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "accepted": 3,
    "deduplicated": 1
  },
  "requestId": "f493f7cb-9f5d-4bc8-9f5d-167f8f7f6c2b",
  "timestamp": "2026-04-21T20:01:05+08:00"
}
```

### 3.2 常见失败响应

参数错误（如缺少 `eventType`）：

```json
{
  "code": 4000,
  "message": "events[0].eventType: eventType is required",
  "data": null
}
```

未携带 token（当前实现现状）：

```json
{
  "code": 5000,
  "message": "系统繁忙，请稍后重试",
  "data": null
}
```

## 4. 各事件上报样例

以下为“单事件批量上报”示例（每次 `events` 只放 1 条，便于调试）。

### 4.1 PAGE_VIEW（页面访问）

```json
{
  "events": [
    {
      "eventId": "evt_page_20260421_0001",
      "eventType": "PAGE_VIEW",
      "path": "/pages/index/index",
      "pathName": "首页",
      "occurredAt": "2026-04-21T20:05:00+08:00",
      "durationSeconds": 18,
      "metadata": {
        "source": "external_link",
        "referrer": "xiaohongshu",
        "utm_source": "xiaohongshu",
        "utm_medium": "kol_post",
        "utm_campaign": "2026_spring_promo"
      }
    }
  ]
}
```

### 4.2 CLICK（点击事件）

```json
{
  "events": [
    {
      "eventId": "evt_click_20260421_0001",
      "eventType": "CLICK",
      "path": "/pages/center/index",
      "pathName": "月子中心",
      "occurredAt": "2026-04-21T20:05:12+08:00",
      "metadata": {
        "elementName": "预约到店顾问",
        "elementId": "btn-book-consultant",
        "sourceId": "banner_1775432100002",
        "utm_source": "xiaohongshu",
        "utm_medium": "kol_post",
        "utm_campaign": "2026_spring_promo"
      }
    }
  ]
}
```

### 4.3 LOGIN（登录行为）

```json
{
  "events": [
    {
      "eventId": "evt_login_20260421_0001",
      "eventType": "LOGIN",
      "path": "/pages/member/index",
      "pathName": "会员",
      "occurredAt": "2026-04-21T20:06:40+08:00",
      "metadata": {
        "loginMethod": "wechat_miniapp",
        "result": "success"
      }
    }
  ]
}
```

### 4.4 APPOINTMENT_INTENT（预约意向）

```json
{
  "events": [
    {
      "eventId": "evt_appoint_20260421_0001",
      "eventType": "APPOINTMENT_INTENT",
      "path": "/pages/poster/detail",
      "pathName": "海报详情",
      "occurredAt": "2026-04-21T20:07:05+08:00",
      "metadata": {
        "sourceType": "banner",
        "sourceId": "1775432100002",
        "consultantName": "顾问A",
        "targetPackage": "尊享28天江景套房",
        "estimatedPrice": 108000,
        "intentLevel": "HIGH"
      }
    }
  ]
}
```

### 4.5 ARTICLE_VIEW（文章浏览）

```json
{
  "events": [
    {
      "eventId": "evt_article_20260421_0001",
      "eventType": "ARTICLE_VIEW",
      "path": "/pages/content/article",
      "pathName": "文章详情",
      "occurredAt": "2026-04-21T20:07:40+08:00",
      "durationSeconds": 95,
      "metadata": {
        "sourceId": "1775432100002",
        "title": "剖宫产后多久能恢复",
        "category": "postpartum",
        "tags": [
          "侧切恢复",
          "伤口感染",
          "产后抑郁"
        ]
      }
    }
  ]
}
```

说明：`ARTICLE_VIEW` 建议携带 `sourceId + tags`，后端/模型可直接提取兴趣与痛点，减少二次 NLP 成本。

### 4.6 AI_CHAT（AI 对话）

```json
{
  "events": [
    {
      "eventId": "evt_ai_20260421_0001",
      "eventType": "AI_CHAT",
      "path": "/pages/content/index",
      "pathName": "AI专家问答",
      "occurredAt": "2026-04-21T20:08:20+08:00",
      "metadata": {
        "sessionId": "chat_2045888650524950529"
      }
    }
  ]
}
```

说明：`AI_CHAT` 建议保持极简，仅作为用户行为时间轴打点，不建议继续堆叠工程排障字段（如 `messageLength`）。

## 5. 联调建议（前端）

- 批量发送建议：每批 10-20 条。
- `eventId` 必须全局唯一，重试时复用同一个 `eventId`。
- 时间统一使用客户端本地时间的 ISO8601 带时区格式。
- 若收到 `4000`，直接修正字段后重发；若鉴权失败，先恢复登录态再上报。

## 6.字段速查（推荐）

### 6.1 APPOINTMENT_INTENT（高优先级）

- `targetPackage`: 用户意向套餐名
- `estimatedPrice`: 价格锚点（单位建议：元，若你们全链路统一分则用分）
- `intentLevel`: `LOW/MEDIUM/HIGH`

### 6.2 ARTICLE_VIEW（高优先级）

- `tags`: 来自 CMS 的文章业务标签数组
- `category`: 保持小写业务分类（如 `postpartum`）

### 6.3 PAGE_VIEW / CLICK（中高优先级）

- `utm_source`
- `utm_medium`
- `utm_campaign`

### 6.4 AI_CHAT（低优先级）

- 仅保留 `sessionId` 或等价会话标识

## 7. 前端上报推荐逻辑

业务侧触发的事件先压入本地队列。满足以下任一条件时，立即打包发起 POST 请求并清空队列：
   - 队列满 `20` 条。
   - 距离上次发送满 `30` 秒。
   - 监听到应用切后台或页面卸载（如小程序的 `onHide`/`onUnload`），立刻全量上报。

## 8. 前端核心事件触发时机与位置建议

为了保证捕获到最高质量的业务语义，请前端按以下生命周期或交互回调点植入 `tracker.track()` 代码：

- **`PAGE_VIEW` (页面访问)**：建议统一拦截。写在全局路由守卫（如 Vue Router 的 `afterEach`）或小程序全局混入的 `onShow` 钩子中。
- **`ARTICLE_VIEW` (文章浏览)**：**必须采用“离开时上报”**。写在文章详情页的 `onHide` / `onUnload` 钩子中，并在此刻计算进入到离开的 `durationSeconds`（停留时长）一并上报。
- **`APPOINTMENT_INTENT` (预约意向)**：绑定在转化漏斗的最深处。如“获取底价”、“立即预约”、“联系专属顾问”等核心按钮的 `@click` 回调中；或在【月子套房详情页】内设置定时器，用户停留满 30 秒自动触发。
- **`LOGIN` (登录状态)**：写在调用后端授权/登录接口后，且明确收到业务成功码（如 `code: 0`）的 `Promise.resolve` 回调中。
- **`AI_CHAT` (对话打卡)**：写在用户点击发送按钮，且消息气泡成功渲染上屏的回调函数中。
- **`CLICK` (业务高优点击)**：仅针对不跳转页面、不调核心接口，但具有分析价值的 UI 元素。如点击海报，设施内容按钮，等 `@click` 事件。

