# 📋 自动签到系统 (Auto Check-in)

一个开箱即用的网页版自动签到工具。添加你的课程，到点自动跳转到签到链接，再也不用担心忘记签到了。

## 功能

- **课程管理** — 添加、编辑、删除课程，支持课程名称、签到链接、星期、时间
- **自动签到** — 页面打开后，后台每秒检查时间，匹配即自动跳转签到
- **倒计时提醒** — 清晰显示下一个课程签到倒计时
- **位置授权** — 一键请求浏览器地理位置权限（部分签到页面需要）
- **数据持久化** — 所有课程数据保存在浏览器本地，关闭页面不丢失
- **每周循环** — 按星期+时间重复，无需重复设置
- **响应式设计** — 电脑、平板、手机都能用
- **推荐组合** 本project + 任何一个可以修改浏览器位置定位的拓展程序

## 在线使用

👉 **[https://tyleryang-1103.github.io/auto-checkin/](https://tyleryang-1103.github.io/auto-checkin/)**

打开即用，无需登录，无需后端。

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 使用方式

1. 打开页面，点击右下角 **+** 按钮添加课程
2. 填写课程名称、签到链接、星期几、上课时间
3. 点击顶部 **"请求位置权限"**（如果需要定位签到）
4. 保持页面打开，到时间自动跳转到签到链接 ✓

### 课程数据存储

所有课程数据保存在浏览器的 `localStorage` 中，清除浏览器数据会丢失。

## 技术栈

| 名称 | 用途 |
|------|------|
| [Vite](https://vitejs.dev/) | 构建工具 |
| [React 18](https://react.dev/) | UI 框架 |
| [MUI v5](https://mui.com/) | 组件库 |
| [Tailwind CSS v3](https://tailwindcss.com/) | 样式工具 |
| [Vitest](https://vitest.dev/) | 单元测试 |
| [GitHub Actions](https://github.com/features/actions) | CI/CD 自动部署 |

## 开发

```bash
# 运行测试
npm test
```

测试覆盖 storage 数据层、调度器逻辑和全部 UI 组件（39 个测试用例）。

## License

MIT
