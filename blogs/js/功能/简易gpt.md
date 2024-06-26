---
title: 简易gpt
date: 2024-06-19
tags:
 - css
categories:
 - 简易gpt
---

## 简易gpt
```js
<!DOCTYPE html>
<html>

<head>
  <title>Stream Chat</title>
  <style>
    #conversation-history {
      margin-bottom: 1rem;
      border: 1px solid #ccc;
      padding: 0.5rem;
      min-height: 50px;
    }

    .user-message {
      color: #007BFF;
    }

    .assistant-message {
      color: #28A745;
    }

    /* Loading spinner styles */
    #loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  </style>
</head>

<body>
  <div id="conversation-history"></div>

  <input type="text" id="input">
  <button id="chat-btn" onclick="chat()">chat</button>
  <div id="result"></div>

  <script>
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer sk-UgtZ6M4qw7Ycfzok0cC1E8C690A04b92B38e381c4c5661D5");

    // 历史对话记录
    let conversationHistory = [{ role: "system", content: "You are a helpful assistant." }];
    let isLoading = false;

    function chatClickAction() {
      openLoading();
      document.getElementById("input").value = ''
      // disable 按钮
      document.querySelector("#chat-btn").disabled = true;
    }

    function chat() {
      const userInput = document.getElementById("input").value;
      const messageId = `user-${Date.now()}`;

      conversationHistory.push({ role: "user", content: userInput });
      appendToConversationHistory("user", userInput, messageId);
      chatClickAction();

      const requestOptions = {
        method: 'POST', headers,
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: conversationHistory,
          stream: true
        }),
      };

      fetch("https://ai98.vip/v1/chat/completions", requestOptions)
        .then(async response => {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let partialMessage = ""; // Partial message from the stream
          let aiMessage = ''
          // 消息id，用于标识消息div
          const messageId = `assistant-${Date.now()}`;

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log("Stream complete");
              conversationHistory.push({ role: "assistant", content: aiMessage });
              document.querySelector("#chat-btn").disabled = false;
              return;
            }
            if (isLoading) closeLoading();

            const chunk = decoder.decode(value, { stream: true });
            let messages = (partialMessage + chunk).split("\n");
            partialMessage = messages.pop();

            // 过滤数组里的空字符串
            messages = messages.filter(message => message);

            for (const message of messages) {
              if (!message) continue; // 忽略空字符串
              if (message === "data: [DONE]") {
                break;
              }
              const jsonStartIndex = message.indexOf("{");
              const jsonData = message.slice(jsonStartIndex);
              const dataObject = JSON.parse(jsonData);

              const aiResponse = dataObject.choices[0].delta.content;
              if (aiResponse) {
                aiMessage += aiResponse;
                console.log(aiResponse);
                appendToConversationHistory("assistant", aiMessage, messageId);
              }

            }
          }
        })
        .catch(error => console.log('error', error));
    }

    function appendToConversationHistory(role, content, messageElementId) {
      const historyContainer = document.getElementById("conversation-history");

      let messageElement = document.getElementById(messageElementId);
      if (!messageElement) {
        messageElement = document.createElement("div");
        messageElement.id = messageElementId;
        messageElement.classList.add(`${role}-message`);
      }
      messageElement.textContent = `${role}: ${content}`;
      historyContainer.appendChild(messageElement);
    };

    function openLoading() {
      isLoading = true;
      // 创建loading 节点
      const loadingElement = document.createElement("div");
      loadingElement.id = "loading";
      loadingElement.style.display = "inline-block";
      // 挂在到historyContainer
      document.getElementById("conversation-history").appendChild(loadingElement);
    }

    function closeLoading() {
      isLoading = false;
      // 删除loading节点
      document.getElementById("loading").remove();
    }
  </script>
</body>

</html>
```