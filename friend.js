const { ipcRenderer } = require("electron");
const timeSchedule = require("./timeSchedule.js");
const aiService = require("./aiService.js");

const friendConfig = {
  imageSrc: "./assets/lucy.png",
  fallbackEmoji: "👧",
  bubbleHideMs: 2600,
  messages: [
    "你好呀，我是你的好朋友 Lucy~",
    "写代码辛苦啦，记得活动一下肩膀。",
    "喝口水吧，我会一直陪着你。",
    "要不要休息 5 分钟？"
  ],
  activities: {
    idle: "activity-idle",
    talk: "activity-talk"
  }
};

class DesktopFriend {
  constructor(config) {
    this.config = config;
    this.friendWrap = document.getElementById("friend-wrap");
    this.friendBubble = document.getElementById("friend-bubble");
    this.friendImage = document.getElementById("friend-image");
    this.friendFallback = document.getElementById("friend-fallback");
    this.chatInputWrap = document.getElementById("chat-input-wrap");
    this.chatInput = document.getElementById("chat-input");

    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.bubbleTimer = null;
    this.clickTimer = null;
    this.clickCount = 0;
    this.imageCanvas = null;
    this.imageCanvasCtx = null;
  }

  init() {
    this.applyConfig();
    this.bindEvents();
    this.setActivity("idle");
    this.startTimeScheduler();

    window.friendApi = {
      say: (text) => this.showBubble(text),
      setImageSource: (src) => this.setImageSource(src)
    };
  }

  applyConfig() {
    this.friendFallback.textContent = this.config.fallbackEmoji;
    this.setImageSource(this.config.imageSrc);
  }

  // 检测点击位置是否在图片的非透明区域
  isClickOnImage(e) {
    // 如果是 emoji fallback，直接返回 true
    if (this.friendImage.style.display === "none") {
      return true;
    }

    // 如果图片还未加载完成，返回 true（允许点击）
    if (!this.imageCanvas || !this.friendImage.complete) {
      return true;
    }

    // 获取点击位置相对于图片的坐标
    const rect = this.friendImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 坐标超出图片范围
    if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) {
      return false;
    }

    // 获取 canvas 上对应位置的像素数据
    const scaleX = this.imageCanvas.width / rect.width;
    const scaleY = this.imageCanvas.height / rect.height;
    const canvasX = Math.floor(x * scaleX);
    const canvasY = Math.floor(y * scaleY);

    try {
      const pixel = this.imageCanvasCtx.getImageData(canvasX, canvasY, 1, 1).data;
      const alpha = pixel[3]; // Alpha 通道值 (0-255)
      
      // 透明度大于 30 认为是有效区域
      return alpha > 30;
    } catch (err) {
      // 如果获取像素失败，允许点击
      return true;
    }
  }

  // 创建图片的 canvas 副本用于透明度检测
  createImageCanvas() {
    if (!this.friendImage.complete || this.friendImage.naturalWidth === 0) {
      return;
    }

    this.imageCanvas = document.createElement("canvas");
    this.imageCanvas.width = this.friendImage.naturalWidth;
    this.imageCanvas.height = this.friendImage.naturalHeight;
    this.imageCanvasCtx = this.imageCanvas.getContext("2d");
    
    try {
      this.imageCanvasCtx.drawImage(this.friendImage, 0, 0);
    } catch (err) {
      console.warn("无法创建图片 canvas:", err);
      this.imageCanvas = null;
      this.imageCanvasCtx = null;
    }
  }

  bindEvents() {
    const stopNativeDrag = (e) => e.preventDefault();
    this.friendWrap.addEventListener("dragstart", stopNativeDrag);
    this.friendImage.addEventListener("dragstart", stopNativeDrag);
    document.addEventListener("dragover", stopNativeDrag);
    document.addEventListener("drop", stopNativeDrag);

    this.friendWrap.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      
      // 检查是否点击在图片的非透明区域
      if (!this.isClickOnImage(e)) {
        return;
      }
      
      e.preventDefault();

      this.isDragging = true;

      ipcRenderer.send("friend-drag-start");
    });

    document.addEventListener("mouseup", () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      ipcRenderer.send("friend-drag-end");
    });

    window.addEventListener("blur", () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      ipcRenderer.send("friend-drag-end");
    });

    document.addEventListener("mousemove", () => {
      if (!this.isDragging) return;
      ipcRenderer.send("friend-drag-move");
    });

    this.friendWrap.addEventListener("click", (e) => {
      // 检查是否点击在图片的非透明区域
      if (!this.isClickOnImage(e)) {
        return;
      }
      
      this.clickCount++;
      
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
      }
      
      this.clickTimer = setTimeout(() => {
        if (this.clickCount === 1) {
          // 单击：显示随机消息
          const text = this.pickMessage();
          this.showBubble(text);
          this.setActivity("talk");
          setTimeout(() => this.setActivity("idle"), 400);
        } else if (this.clickCount === 2) {
          // 双击：打开聊天输入框
          this.toggleChatInput();
        }
        this.clickCount = 0;
      }, 250);
    });

    // 聊天输入框事件
    this.chatInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        await this.handleChatInput();
      } else if (e.key === "Escape") {
        this.hideChatInput();
      }
    });

    // 点击输入框外部关闭
    document.addEventListener("click", (e) => {
      if (!this.chatInputWrap.contains(e.target) && 
          !this.friendImage.contains(e.target) &&
          !this.friendFallback.contains(e.target)) {
        this.hideChatInput();
      }
    });
  }

  pickMessage() {
    const i = Math.floor(Math.random() * this.config.messages.length);
    return this.config.messages[i];
  }

  showBubble(text) {
    this.friendBubble.textContent = text;
    this.friendBubble.classList.add("show");

    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    
    // 根据文字长度动态计算显示时间
    // 基础时间3秒 + 每10个字符1秒，最少3秒，最多15秒
    const baseTime = 3000;
    const timePerChar = 100; // 每个字符100ms
    const calculatedTime = baseTime + (text.length * timePerChar);
    const displayTime = Math.min(Math.max(calculatedTime, 3000), 15000);
    
    this.bubbleTimer = setTimeout(() => {
      this.friendBubble.classList.remove("show");
    }, displayTime);
  }

  setActivity(name) {
    const classes = Object.values(this.config.activities);
    this.friendImage.classList.remove(...classes);

    const className = this.config.activities[name];
    if (className) this.friendImage.classList.add(className);
  }

  setImageSource(src) {
    this.friendImage.onerror = () => {
      this.friendImage.style.display = "none";
      this.friendFallback.style.display = "block";
    };

    this.friendImage.onload = () => {
      this.friendImage.style.display = "block";
      this.friendFallback.style.display = "none";
      
      // 图片加载完成后创建 canvas 用于透明度检测
      this.createImageCanvas();
    };

    this.friendImage.src = src;
  }

  toggleChatInput() {
    if (this.chatInputWrap.classList.contains("show")) {
      this.hideChatInput();
    } else {
      this.showChatInput();
    }
  }

  showChatInput() {
    this.chatInputWrap.classList.add("show");
    this.chatInput.focus();
  }

  hideChatInput() {
    this.chatInputWrap.classList.remove("show");
    this.chatInput.value = "";
  }

  async handleChatInput() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    // 清空输入框
    this.chatInput.value = "";
    this.hideChatInput();

    // 显示思考中...
    this.showBubble("让我想想...");
    this.setActivity("talk");

    try {
      // 调用 AI 服务
      const reply = await aiService.chat(message);
      
      // 显示 AI 回复
      setTimeout(() => {
        this.showBubble(reply);
        this.setActivity("talk");
        setTimeout(() => this.setActivity("idle"), 400);
      }, 500);
    } catch (error) {
      console.error("聊天错误:", error);
      setTimeout(() => {
        this.showBubble("抱歉，我现在有点累了，等会再聊好吗？");
        this.setActivity("idle");
      }, 500);
    }
  }

  startTimeScheduler() {
    const triggeredToday = new Set();
    
    const checkSchedule = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDay = now.getDay(); // 0=周日, 1=周一, ..., 6=周六
      const isWeekday = currentDay >= 1 && currentDay <= 5;
      const isWeekend = currentDay === 0 || currentDay === 6;
      
      const checkKey = `${now.toDateString()}-${currentTime}`;
      
      // 避免同一时间点重复触发
      if (triggeredToday.has(checkKey)) return;
      
      let messageToShow = null;
      
      // 检查特定星期几的提醒
      if (timeSchedule.specific) {
        const specificReminder = timeSchedule.specific.find(
          item => item.day === currentDay && item.time === currentTime
        );
        if (specificReminder) {
          messageToShow = specificReminder.message;
        }
      }
      
      // 检查工作日/周末提醒
      if (!messageToShow) {
        if (isWeekday && timeSchedule.weekday) {
          const weekdayReminder = timeSchedule.weekday.find(item => item.time === currentTime);
          if (weekdayReminder) {
            messageToShow = weekdayReminder.message;
          }
        } else if (isWeekend && timeSchedule.weekend) {
          const weekendReminder = timeSchedule.weekend.find(item => item.time === currentTime);
          if (weekendReminder) {
            messageToShow = weekendReminder.message;
          }
        }
      }
      
      // 检查每日提醒
      if (!messageToShow && timeSchedule.daily) {
        const dailyReminder = timeSchedule.daily.find(item => item.time === currentTime);
        if (dailyReminder) {
          messageToShow = dailyReminder.message;
        }
      }
      
      // 显示消息
      if (messageToShow) {
        this.showBubble(messageToShow);
        this.setActivity("talk");
        setTimeout(() => this.setActivity("idle"), 400);
        triggeredToday.add(checkKey);
      }
      
      // 每天零点清空已触发记录
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        triggeredToday.clear();
      }
    };
    
    // 每30秒检查一次
    setInterval(checkSchedule, 30000);
    // 立即检查一次
    checkSchedule();
  }
}

new DesktopFriend(friendConfig).init();
