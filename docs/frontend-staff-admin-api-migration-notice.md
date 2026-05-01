# 前端接口迁移告知（Admin -> Staff）

更新时间：2026-05-01  
适用范围：`aiermei-frontend/admin`（单登录页不变）

## 1. 变更背景

当前前端已经有“管理员菜单/员工菜单”分流，但员工页面大量调用 `/api/v1/admin/*`。  
本次后端已开始双轨迁移：新增 `/api/v1/staff/*`，并保留一段兼容期。

本期目标：
1. 前端可继续使用旧接口，不强制当天切换。
2. 新接口可直接联调，逐步完成员工域切换。
3. 兼容期结束后，员工再调 `/admin/*` 将被拒绝。

## 2. 兼容窗口与配置

后端配置项：
1. `aiermei.staff.admin-api-compat-enabled`（默认 `true`）
2. `aiermei.staff.admin-api-compat-deadline`（默认 `2099-12-31`，建议环境化配置为实际迁移截止日）

兼容期内：
1. 员工调用 `/admin/*` 允许通过，但会记录告警日志。
2. 部分旧写接口会返回响应头：
   - `X-API-Deprecated: true`
   - `X-API-Replacement: /api/v1/staff/...`

兼容期后：
1. 若 `admin-api-compat-enabled=false` 或当前日期超过 `admin-api-compat-deadline`，员工调用 `/admin/*` 将被拒绝。

## 3. 接口迁移清单

### 3.1 已支持（员工只读）
1. `GET /api/v1/staff/customers`（旧：`GET /api/v1/admin/customers`）
2. `GET /api/v1/staff/customers/{uid}`（旧：`GET /api/v1/admin/customers/{uid}`）
3. `GET /api/v1/staff/customers/{uid}/tags`（旧：`GET /api/v1/admin/customers/{uid}/tags`）
4. `GET /api/v1/staff/customers/{uid}/tags/{tagCode}/trace`（旧：`GET /api/v1/admin/customers/{uid}/tags/{tagCode}/trace`）
5. `GET /api/v1/staff/customers/{uid}/journey`（旧：`GET /api/v1/analytics/users/{uid}/journey`）
6. `GET /api/v1/staff/scoring-weights`（已存在）
7. `GET /api/v1/staff/content/categories|articles|articles/{id}|magazines|suites`
8. `GET /api/v1/staff/centers/home|facilities|sections`
9. `GET /api/v1/staff/faq/categories|items|items/{id}`
10. `GET /api/v1/staff/service/hotlines`
11. `GET /api/v1/staff/coupons|coupons/{id}`
12. `GET /api/v1/staff/orders|orders/stats|orders/{id}`
13. `GET /api/v1/staff/articles/{articleId}/tags`

### 3.2 已支持（员工写）
1. `POST /api/v1/staff/users/{uid}/analysis`（旧：`POST /api/v1/admin/users/{uid}/analysis`）
2. `GET /api/v1/staff/customers/{uid}/manual-score`（旧：`GET /api/v1/admin/customers/{uid}/manual-score`）
3. `POST /api/v1/staff/customers/{uid}/manual-score:confirm`（旧：`POST /api/v1/admin/customers/{uid}/manual-score:confirm`）
4. `GET /api/v1/staff/customers/{uid}/tag-corrections`（旧：`GET /api/v1/admin/customers/{uid}/tag-corrections`）
5. `POST /api/v1/staff/customers/{uid}/tags`（旧：`POST /api/v1/admin/customers/{uid}/tags`）
6. `DELETE /api/v1/staff/customers/{uid}/tags/{tagCode}`（旧：`DELETE /api/v1/admin/customers/{uid}/tags/{tagCode}`）
7. `POST|PUT|DELETE /api/v1/staff/content/categories/*`
8. `POST|PUT|DELETE /api/v1/staff/content/articles/*`
9. `POST|PUT|DELETE /api/v1/staff/content/magazines/*`
10. `POST|PUT|DELETE /api/v1/staff/content/suites/*`
11. `PUT /api/v1/staff/centers/home`
12. `POST|PUT|DELETE /api/v1/staff/centers/facilities/*`
13. `POST|PUT|DELETE /api/v1/staff/centers/sections/*`
14. `POST|PUT|DELETE /api/v1/staff/faq/categories/*`
15. `POST|PUT|DELETE /api/v1/staff/faq/items/*`
16. `PUT|POST|DELETE /api/v1/staff/service/hotlines/*`
17. `POST|PUT|DELETE /api/v1/staff/coupons/*` 与 `PUT /status`
18. `POST|PUT /api/v1/staff/orders/{id}/confirm|cancel|refund|remark`
19. `POST /api/v1/staff/articles/{articleId}/extract-tags`
20. `POST|DELETE /api/v1/staff/articles/{articleId}/tags/*`

### 3.3 管理员专属（保持 `/admin`）
1. `/api/v1/admin/tag-pending/**`
2. `/api/v1/admin/scoring-weights`（写）
3. `/api/v1/admin/decay-config/**`
4. `/api/v1/admin/dashboard/traffic-sources`
5. `/api/v1/admin/centers/facilities/**`

### 3.4 已进入兼容告警的旧运营域（/admin）
以下旧路径在兼容期内仍可调用，但响应会带迁移头：
1. `/api/v1/admin/content/**`
2. `/api/v1/admin/centers/**`
3. `/api/v1/admin/faq/**`
4. `/api/v1/admin/service/hotlines/**`
5. `/api/v1/admin/coupons/**`
6. `/api/v1/admin/orders/**`
7. `/api/v1/admin/articles/**`

## 4. 登录响应变化（已生效）

`POST /api/v1/admin/auth/login` 响应新增字段：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "token": "xxx",
    "principalType": "ADMIN",
    "user": {
      "id": "admin_001",
      "role": "admin",
      "permissions": ["*"]
    }
  }
}
```

说明：
1. `principalType` 为后端统一身份语义字段，前端后续可用于路由与能力收敛。
2. 本期仍保持单登录页，不要求前端调整登录流程。

## 5. 错误码与前端处理

1. `4003`：未登录/会话失效，前端应回登录页（现有逻辑已覆盖）。
2. `4001`：业务拒绝（包括兼容期后员工访问 `/admin/*` 的无权限场景）。
3. HTTP 状态码可能仍为 200（统一业务包裹），前端需以 `code` 字段为准。

## 6. 前端切换建议（按批次）

1. 第一批：`customers`、`journey`、`tags trace` 切到 `/staff`。
2. 第二批：`analysis`、`manual-score`、`tag add/remove` 切到 `/staff`。
3. 保持管理员治理页继续调用 `/admin/*`，不要迁移到 `/staff`。
