# 🌸 好朋友 Lucy - 你的智能桌面伙伴

<div align="center">

![Lucy](assets/lucy.png)

**一个温暖、贴心的桌面宠物应用，带有 AI 聊天功能**

`Electron` `AI` `Desktop Pet` `桌面助手`

</div>

---

## ✨ 项目简介

Lucy 是一个可爱的桌面宠物应用，她会陪伴在你的桌面上，提供贴心的问候、定时提醒，还能和你进行智能对话！基于 Electron 开发，支持窗口拖拽、系统托盘、后台运行等功能，是你工作学习时的温暖陪伴。

### 🎯 核心特性

- 🎨 **透明窗口设计** - 悬浮在桌面上，不遮挡其他应用
- 🖱️ **自由拖拽** - 随意移动 Lucy 到喜欢的位置
- 💬 **智能对话** - 接入 AI 模型，支持 OpenAI / Gemini / DeepSeek / Ollama
- ⏰ **定时提醒** - 支持每日、工作日、周末、特定日期的定时消息
- 🎭 **动画效果** - 闲置时轻轻浮动，说话时生动跳跃
- 🔔 **系统托盘** - 最小化到托盘，不干扰工作
- 🚀 **后台启动** - 使用 VBS 脚本静默启动，开机即可陪伴

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 运行应用

```bash
npm start
```

### 打包应用

```bash
npm run build
```

生成便携版 EXE 文件：`好朋友Lucy便携版.exe`

### 后台启动

双击运行 `启动.vbs` 文件，Lucy 会在后台静默启动，不显示命令窗口。

---

## 📖 功能详解

### 1️⃣ 基础交互

#### 🖱️ 单击
点击 Lucy 会随机显示一条温馨消息气泡：
- "你好呀，我是你的好朋友 Lucy~"
- "写代码辛苦啦，记得活动一下肩膀。"
- "喝口水吧，我会一直陪着你。"
- "要不要休息 5 分钟？"

#### 🖱️ 双击
打开聊天输入框，可以和 Lucy 进行 AI 对话：
- 输入消息后按 `Enter` 发送
- 按 `ESC` 或点击其他区域关闭输入框

#### 🖱️ 拖拽
按住 Lucy 可以拖动到桌面任意位置，采用增量计算，避免坐标偏移问题。

### 2️⃣ AI 聊天功能

Lucy 支持多种 AI 服务商，可在 `aiConfig.js` 中配置：

#### 支持的 AI 模型

| 服务商 | 配置标识 | 说明 |
|--------|---------|------|
| **DeepSeek** | `deepseek` | ModelScope API，国内访问友好 ⭐推荐 |
| **OpenAI** | `openai` | ChatGPT 系列模型 |
| **Google Gemini** | `gemini` | Gemini 系列模型，支持代理 |
| **Ollama** | `ollama` | 本地部署的开源模型 |
| **自定义 API** | `custom` | 兼容 OpenAI 格式的任意 API |

#### 配置示例

```javascript
const aiConfig = {
  provider: 'deepseek',  // 当前使用的服务商
  
  deepseek: {
    apiKey: 'your-api-key',
    apiUrl: 'https://api-inference.modelscope.cn/v1/chat/completions',
    model: 'deepseek-ai/DeepSeek-R1-0528',
    temperature: 0.7,
    maxTokens: 500
  },
  
  // ... 其他配置
};
```

#### AI 对话特性

- 🧠 **上下文记忆** - 保留最近 10 轮对话，支持连续对话
- ⚡ **流式响应** - 支持流式输出（部分模型）
- 🌐 **代理支持** - Gemini 模式下支持 HTTP 代理
- 💬 **智能气泡** - 根据回复长度自动调整显示时间（3-15秒）
- 🎯 **错误处理** - 网络失败时友好提示

### 3️⃣ 定时提醒功能

在 `timeSchedule.js` 中配置定时消息，支持多种类型：

#### 提醒类型

```javascript
module.exports = {
  // 每天固定时间提醒
  daily: [
    { time: '09:00', message: '早上好！新的一天开始啦~ ☀️' },
    { time: '12:00', message: '该吃午饭啦！记得好好休息哦~ 🍱' }
  ],
  
  // 仅工作日（周一到周五）
  weekday: [
    { time: '14:30', message: '下午容易困，站起来活动一下吧~ 💪' }
  ],
  
  // 仅周末（周六和周日）
  weekend: [
    { time: '10:00', message: '周末愉快！今天想做什么呢？🎉' }
  ],
  
  // 特定日期
  specific: [
    { month: 1, day: 1, time: '00:00', message: '新年快乐！🎆' }
  ]
};
```

#### 检测机制

- 每 30 秒检查一次当前时间
- 使用 Set 记录已触发的提醒，避免重复
- 跨日自动重置触发记录
- 支持精确到分钟级别的提醒

### 4️⃣ 系统托盘

右键点击托盘图标可以：
- 📌 **显示/隐藏窗口** - 快速切换显示状态
- ❌ **退出应用** - 完全关闭 Lucy

托盘图标使用 `assets/lucy.png`，可自定义替换。

---

## ⚙️ 配置文件说明

### 📁 文件结构

```
Friend/
├── main.js              # Electron 主进程
├── friend.js            # 渲染进程逻辑
├── index.html           # 界面结构和样式
├── aiConfig.js          # AI 服务配置 ⭐
├── aiService.js         # AI 服务实现
├── timeSchedule.js      # 定时提醒配置 ⭐
├── test-ai.js           # AI 连接测试工具
├── 启动.bat             # 启动脚本
├── 启动.vbs             # 静默启动脚本 ⭐
├── package.json         # 项目配置
└── assets/
    └── lucy.png         # Lucy 图片资源
```

### 🔧 主要配置

#### `aiConfig.js` - AI 配置

修改此文件切换不同的 AI 服务商，配置 API Key 和模型参数。

#### `timeSchedule.js` - 定时提醒

添加、修改或删除定时提醒消息。

#### `friendConfig` in `friend.js` - 基础配置

```javascript
const friendConfig = {
  imageSrc: "./assets/lucy.png",     // Lucy 图片路径
  fallbackEmoji: "👧",                // 备用 emoji
  messages: [/* 随机消息列表 */],    // 单击时的消息池
  bubbleHideMs: 2600                  // 气泡默认显示时间（已被动态计算替代）
};
```

---

## 🧪 测试 AI 连接

使用内置测试工具检查 AI 配置是否正确：

```bash
npm run test-ai
```

测试工具会：
1. ✅ 检查配置文件完整性
2. 🌐 测试 API 连接和认证
3. 💬 发送测试消息验证响应
4. 📊 显示详细的调试信息

---

## 🛠️ 技术栈

- **[Electron](https://www.electronjs.org/)** `^38.0.0` - 跨平台桌面应用框架
- **[Node.js](https://nodejs.org/)** - JavaScript 运行时
- **AI APIs** - OpenAI / Gemini / DeepSeek / Ollama
- **原生 CSS 动画** - 流畅的视觉效果
- **Windows VBS** - 静默启动脚本

### 核心特性实现

- **透明窗口** - `transparent: true` + `frame: false`
- **置顶显示** - `alwaysOnTop: true`
- **拖拽功能** - IPC 通信 + 增量位置计算
- **系统托盘** - Electron Tray API
- **HTTP 请求** - 原生 `https` 和 `http` 模块
- **代理支持** - HTTP Agent 配置

---

## 🎨 自定义 Lucy

### 更换图片

替换 `assets/lucy.png` 为你喜欢的图片：
- 建议尺寸：256×256 像素或更大
- 支持透明背景的 PNG 格式
- 图片会自动缩放到 256×256 显示

### 修改样式

编辑 `index.html` 中的 CSS 变量：

```css
:root {
  --friend-bubble-bg: rgba(255, 255, 255, 0.92);  /* 气泡背景色 */
  --friend-bubble-text: #333;                      /* 气泡文字颜色 */
  --friend-shadow: rgba(0, 0, 0, 0.15);            /* 阴影颜色 */
}
```

### 添加动画

在 `@keyframes` 中自定义动画效果，支持：
- `friend-float` - 闲置浮动动画
- `friend-talk` - 说话跳跃动画

---

## 📝 开发笔记

### 已知问题和解决方案

#### 1. 拖拽反向问题 ✅ 已解决
- **问题**：向右拖动到一定距离后，继续拖动会向左移动
- **原因**：使用 `offsetX/Y` 导致坐标系混乱
- **方案**：改用增量计算（delta），存储初始光标和窗口位置

#### 2. 气泡位置偏上 ✅ 已解决
- **问题**：聊天输入框隐藏时仍占据空间
- **方案**：添加 `display: none` 到隐藏状态

#### 3. Gemini API 连接问题 ✅ 已解决
- **问题**：网络错误、404 模型错误、认证失败
- **方案**：
  - 配置代理支持（`proxy: 'http://127.0.0.1:7897'`）
  - 使用 Header 传递 API Key（`x-goog-api-key`）
  - 模型名称使用 `gemini-1.5-flash` 等稳定版本

#### 4. 气泡显示时间不合理 ✅ 已解决
- **问题**：AI 长回复还没读完就消失
- **方案**：动态计算显示时间（基础 3 秒 + 每字 100ms，最长 15 秒）

### 推荐使用 DeepSeek

经过测试，推荐使用 **DeepSeek（ModelScope）** 作为默认 AI 后端：
- ✅ 国内访问速度快，无需代理
- ✅ OpenAI 格式兼容，配置简单
- ✅ 模型性能优秀，响应质量高
- ✅ 支持推理内容（reasoning_content）

---

## 📄 许可证

ISC License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

如果你有好的想法或发现了 Bug，请随时联系我。

---

## 💖 致谢

感谢所有为这个项目提供灵感和帮助的朋友们！

Lucy 会一直陪在你身边，做你最贴心的桌面伙伴~ 🌸

---

<div align="center">

**⭐ 如果你喜欢这个项目，请给它一个 Star吧 ⭐**


</div>
