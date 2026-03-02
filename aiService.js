// AI 服务模块
const aiConfig = require('./aiConfig.js');

class AIService {
  constructor() {
    this.config = aiConfig;
    this.conversationHistory = [];
    this.maxHistoryLength = 10; // 保留最近10条对话记录
  }

  // 发送消息到 AI
  async chat(userMessage) {
    if (!this.config.enabled) {
      return '聊天功能未启用哦~';
    }

    try {
      const provider = this.config.provider;
      
      if (provider === 'openai' || provider === 'custom' || provider === 'deepseek') {
        return await this.chatWithOpenAI(userMessage);
      } else if (provider === 'ollama') {
        return await this.chatWithOllama(userMessage);
      } else if (provider === 'gemini') {
        return await this.chatWithGemini(userMessage);
      } else {
        return '未知的 AI 服务商配置';
      }
    } catch (error) {
      console.error('AI 聊天错误:', error);
      console.error('错误详情:', error.message);
      
      // 返回更具体的错误信息
      if (error.message.includes('API 请求失败')) {
        return `API 调用失败，请检查网络和配置 (${error.message})`;
      }
      return '抱歉，我现在有点累了，等会再聊好吗？ 请按F12查看详细错误';
    }
  }

  // OpenAI 兼容接口
  async chatWithOpenAI(userMessage) {
    const providerConfig = this.config[this.config.provider];
    
    // 添加用户消息到历史
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    // 构建消息列表
    const messages = [
      {
        role: 'system',
        content: this.config.systemPrompt
      },
      ...this.conversationHistory
    ];

    console.log('发送请求到:', providerConfig.apiUrl);
    console.log('使用模型:', providerConfig.model);

    const response = await fetch(providerConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerConfig.apiKey}`
      },
      body: JSON.stringify({
        model: providerConfig.model,
        messages: messages,
        temperature: providerConfig.temperature,
        max_tokens: providerConfig.maxTokens
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 响应错误:', errorText);
      throw new Error(`API 请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API 响应:', data);
    
    // 兼容不同的响应格式
    const aiReply = data.choices?.[0]?.message?.content || 
                    data.candidates?.[0]?.content?.parts?.[0]?.text ||
                    '收到了但无法解析回复';

    // 添加 AI 回复到历史
    this.conversationHistory.push({
      role: 'assistant',
      content: aiReply
    });

    // 限制历史长度
    if (this.conversationHistory.length > this.maxHistoryLength * 2) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
    }

    return aiReply;
  }

  // Ollama 本地模型接口
  async chatWithOllama(userMessage) {
    const providerConfig = this.config.ollama;
    
    const response = await fetch(providerConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: providerConfig.model,
        messages: [
          {
            role: 'system',
            content: this.config.systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.message.content;
  }

  // 清空对话历史
  clearHistory() {
    this.conversationHistory = [];
  }

  // Google Gemini 原生 API
  async chatWithGemini(userMessage) {
    const providerConfig = this.config.gemini;
    const https = require('https');
    const http = require('http');
    const url = require('url');
    
    // 构建完整的对话上下文
    let conversationText = this.config.systemPrompt + '\n\n';
    
    // 添加历史对话
    for (const msg of this.conversationHistory) {
      if (msg.role === 'user') {
        conversationText += `用户: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        conversationText += `Lucy: ${msg.content}\n`;
      }
    }
    
    conversationText += `用户: ${userMessage}\nLucy: `;
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${providerConfig.model}:generateContent`;
    
    console.log('发送请求到 Gemini API');
    console.log('模型:', providerConfig.model);
    if (providerConfig.proxy) {
      console.log('使用代理:', providerConfig.proxy);
    }
    
    const requestData = JSON.stringify({
      contents: [{
        parts: [{
          text: conversationText
        }]
      }],
      generationConfig: {
        temperature: providerConfig.temperature,
        maxOutputTokens: providerConfig.maxTokens
      }
    });
    
    return new Promise((resolve, reject) => {
      const targetUrl = new URL(apiUrl);
      let options;
      let protocol;
      
      // 如果配置了代理，使用代理连接
      if (providerConfig.proxy) {
        const proxyUrl = new URL(providerConfig.proxy);
        
        options = {
          hostname: proxyUrl.hostname,
          port: proxyUrl.port || 80,
          path: apiUrl,
          method: 'POST',
          headers: {
            'Host': targetUrl.hostname,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestData),
            'x-goog-api-key': providerConfig.apiKey
          }
        };
        
        // 代理通常使用 http 连接到代理服务器
        protocol = http;
      } else {
        // 不使用代理，直接连接
        options = {
          hostname: targetUrl.hostname,
          path: targetUrl.pathname + targetUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': providerConfig.apiKey,
            'Content-Length': Buffer.byteLength(requestData)
          }
        };
        
        protocol = https;
      }
      
      const req = protocol.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log('Gemini API 响应状态:', res.statusCode);
          
          if (res.statusCode !== 200) {
            console.error('API 响应错误:', data);
            reject(new Error(`API 请求失败: ${res.statusCode} - ${data}`));
            return;
          }
          
          try {
            const result = JSON.parse(data);
            console.log('Gemini API 响应成功');
            
            const aiReply = result.candidates?.[0]?.content?.parts?.[0]?.text || '收到了但无法解析回复';
            
            // 添加到对话历史
            this.conversationHistory.push({
              role: 'user',
              content: userMessage
            });
            this.conversationHistory.push({
              role: 'assistant',
              content: aiReply
            });
            
            // 限制历史长度
            if (this.conversationHistory.length > this.maxHistoryLength * 2) {
              this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
            }
            
            resolve(aiReply);
          } catch (error) {
            console.error('解析响应失败:', error);
            reject(error);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('请求失败:', error);
        reject(error);
      });
      
      req.write(requestData);
      req.end();
    });
  }
}

module.exports = new AIService();
