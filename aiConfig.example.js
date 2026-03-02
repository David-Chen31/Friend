// AI 配置文件示例
// 复制此文件为 aiConfig.js 并填入你的 API Key

const aiConfig = {
  // 当前使用的 AI 服务商
  // 可选值: 'openai', 'custom', 'ollama', 'gemini', 'deepseek'
  provider: 'deepseek',  // 推荐使用 DeepSeek

  // OpenAI 配置
  openai: {
    apiKey: 'your-openai-api-key-here', // 替换成你的 OpenAI API Key
    apiUrl: 'https://api.openai.com/v1/chat/completions', // 可以改为代理地址
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 150
  },

  // 自定义 API 配置（兼容 OpenAI 格式）
  custom: {
    apiKey: 'your-custom-api-key-here',
    apiUrl: 'https://your-api-endpoint.com/v1/chat/completions',
    model: 'your-model-name',
    temperature: 0.7,
    maxTokens: 150
  },

  // DeepSeek 配置（通过 ModelScope，兼容 OpenAI 格式）⭐推荐
  deepseek: {
    apiKey: 'your-modelscope-api-key-here',  // 在 ModelScope 获取
    apiUrl: 'https://api-inference.modelscope.cn/v1/chat/completions',
    model: 'deepseek-ai/DeepSeek-R1-0528',
    temperature: 0.7,
    maxTokens: 500  // DeepSeek 输出可能较长，增加限制
  },

  // Google Gemini 配置（原生 API）
  gemini: {
    apiKey: 'your-gemini-api-key-here',  // 在 Google AI Studio 获取
    model: 'gemini-1.5-flash',  // 或 gemini-pro, gemini-2.5-flash
    temperature: 0.7,
    maxTokens: 150,
    proxy: ''  // 如需代理，填入如：'http://127.0.0.1:7897'
  },

  // Ollama 本地模型配置
  ollama: {
    apiUrl: 'http://localhost:11434/api/chat',
    model: 'llama2',  // 或其他已安装的模型
    temperature: 0.7
  },

  // Lucy 的系统提示词
  systemPrompt: `你是 Lucy，用户的桌面好朋友。你的性格特点：
- 温柔、善良、体贴
- 喜欢用可爱的语气说话，偶尔使用 emoji
- 关心用户的健康和心情
- 会提醒用户休息、喝水、适当运动
- 回答要简洁，一般2-3句话以内
- 用第一人称"我"来称呼自己`,

  // 启用聊天功能
  enabled: true
};

module.exports = aiConfig;
