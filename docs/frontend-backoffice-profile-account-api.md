# 管理后台个人信息与账号管理联调文档

更新时间：2026-05-01  
适用：管理后台单登录页（管理员/员工）

## 1. 个人信息（管理员/员工）

### 1.1 管理员
1. `GET /api/v1/admin/auth/me`
2. `PUT /api/v1/admin/auth/me`
3. `PUT /api/v1/admin/auth/password`
4. `POST /api/v1/admin/auth/logout`

### 1.2 员工
1. `POST /api/v1/staff/auth/login`
2. `GET /api/v1/staff/auth/me`
3. `PUT /api/v1/staff/auth/me`
4. `PUT /api/v1/staff/auth/password`
5. `POST /api/v1/staff/auth/logout`

### 1.3 请求/响应要点
1. `PUT /auth/me` 仅允许修改：`name`, `avatar`。
2. `PUT /auth/password` 入参：
   - `oldPassword`
   - `newPassword`
   - `confirmPassword`
3. 改密成功后，后端会失效当前账号全部会话，前端需跳转登录页。
4. 登录响应保持：
   - `token`
   - `principalType`（`ADMIN` / `STAFF`）
   - `user`（含 `id/username/name/avatar/role/onlineStatus/permissions/createdAt/lastLoginAt`）

## 2. 账号管理（管理员域）

### 2.1 员工账号
1. `GET /api/v1/admin/accounts/staff?page=1&pageSize=10&keyword=&status=`
2. `GET /api/v1/admin/accounts/staff/{staffId}`
3. `POST /api/v1/admin/accounts/staff`
4. `PUT /api/v1/admin/accounts/staff/{staffId}`
5. `PUT /api/v1/admin/accounts/staff/{staffId}/status`
6. `PUT /api/v1/admin/accounts/staff/{staffId}/password:reset`
7. `DELETE /api/v1/admin/accounts/staff/{staffId}`

### 2.2 管理员账号
1. `GET /api/v1/admin/accounts/admins?page=1&pageSize=10&keyword=&status=`
2. `GET /api/v1/admin/accounts/admins/{adminId}`
3. `POST /api/v1/admin/accounts/admins`
4. `PUT /api/v1/admin/accounts/admins/{adminId}`
5. `PUT /api/v1/admin/accounts/admins/{adminId}/status`
6. `PUT /api/v1/admin/accounts/admins/{adminId}/password:reset`
7. `DELETE /api/v1/admin/accounts/admins/{adminId}`

### 2.3 账号字段
通用响应对象（列表/详情）：
1. `id`
2. `username`
3. `name`
4. `avatar`
5. `role`（`admin` / `staff`）
6. `status`（`ENABLED` / `DISABLED`）
7. `onlineStatus`（`ONLINE` / `OFFLINE`，按 Redis 会话实时计算）
8. `permissions`（字符串数组）
9. `createdAt`, `updatedAt`, `lastLoginAt`, `lastLoginIp`

## 3. 状态流与安全约束

1. 账号创建默认 `ENABLED`。
2. 禁止禁用或删除当前登录账号。
3. 禁止删除最后一个 `ENABLED` 管理员账号。
4. 重置密码仅返回成功与时间，不返回明文密码。
5. 密码策略：
   - 长度 8-32
   - 必须同时包含字母与数字

## 4. 兼容与错误码

1. 管理员登录路径保持 `POST /api/v1/admin/auth/login`。
2. 员工登录路径为 `POST /api/v1/staff/auth/login`。
3. 未登录/会话失效：`code=4003`。
4. 业务拒绝（权限/状态/规则约束）：`code=4001`。
5. 参数校验失败：`code=4000`。
