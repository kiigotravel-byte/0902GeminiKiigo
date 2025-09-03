let player = null;
let currentTimeout = null; // 全域變數，記住目前的 setTimeout

const guideData = {
  tokyo: {
    video: "https://www.youtube.com/embed/2hPXq2mST9c?autoplay=1&mute=1&controls=0&enablejsapi=1",
    streetView: "https://www.google.com/maps/embed?pb=!4v1756622617255!6m8!1m7!1snRmnFGQ2CpyC5o_wlaxyAA!2m2!1d35.71454654451259!2d139.7963861154865!3f120.94509166189933!4f3.9030638107967945!5f0.7820865974627469",
    description: "歡迎來到東京！淺草寺是東京最古老的寺廟，以宏偉的雷門和熱鬧的仲見世商店街聞名。這裡能感受江戶時代的歷史氣息，是體驗日本傳統文化的必訪之地。"
  },
  paris: {
    video: "https://www.youtube.com/embed/DRs9sZsbqk8?autoplay=1&mute=1&controls=0&enablejsapi=1",
    streetView: "https://www.google.com/maps/embed?pb=!3m2!1szh-TW!2stw!4v1756612371122!5m2!1szh-TW!2stw!6m8!1m7!1sdfENQnZZlU9IL9dpsL2vZw!2m2!1d48.87288605079138!2d2.298015202438827!3f321.1215475645093!4f13.241292293783047!5f0.7820865974627469",
    description: "巴黎，浪漫之都。從艾菲爾鐵塔到塞納河畔，每一步都是藝術。"
  },
  newyork: {
    video: "https://www.youtube.com/embed/vfB6rAlV9Xc?autoplay=1&mute=1&controls=0&enablejsapi=1",
    streetView: "https://www.google.com/maps/embed?pb=!4v1756614611062!6m8!1m7!1sV01CzJtXMB1gowklFyWYxg!2m2!1d40.6889394235882!2d-74.0436586512201!3f301.39951565568145!4f12.347447164451012!5f0.7820865974627469",
    description: "紐約是世界的交匯點，無論是時代廣場還是中央公園，都充滿活力。"
  }
};
// ✅ YouTube API 載入完成後會自動呼叫這個函式
function onYouTubeIframeAPIReady() {
  // 預設載入第一個地點（可選）
  loadStreetView();
}



function loadStreetView() {
  const place = document.getElementById("place").value;
  const videoContainer = document.getElementById("videoPreview");
  const videoFrame = videoContainer.querySelector("iframe");
  const streetView = document.getElementById("streetViewFrame");
  const description = document.getElementById("placeDescription");

  const data = guideData[place];


  // ✅ 清除前一次的延遲任務
  if (currentTimeout) {
    clearTimeout(currentTimeout);
    currentTimeout = null;
  }

  // ✅ 清空影片來源，避免殘留
  videoFrame.src = "";

  if (!data) {
    description.textContent = "目前尚未支援此地點的導覽。";
    videoContainer.style.display = "none";
    streetView.style.display = "none";
    hideCloseButton();
    return;
  }

  // ✅ 即時更新導覽說明
  description.textContent = data.description;

  if (data.video) {
    videoFrame.src = data.video;
    videoContainer.style.display = "block";
    streetView.style.display = "none";

    showCloseButton(); // 顯示跳過影片按鈕

    // ✅ 排定 16 秒後自動切換街景
    currentTimeout = setTimeout(() => {
      transitionToStreetView(data.streetView);
    }, 16000);
  } else {
    transitionToStreetView(data.streetView);
  }
}

// ✅ 封裝街景切換邏輯
function transitionToStreetView(streetViewURL) {
  const videoContainer = document.getElementById("videoPreview");
  const streetView = document.getElementById("streetViewFrame");

  videoContainer.classList.add("fade-out");

  setTimeout(() => {
    videoContainer.style.display = "none";
    videoContainer.classList.remove("fade-out");

    streetView.src = streetViewURL;
    streetView.style.display = "block";
    streetView.classList.add("fade-in");

    setTimeout(() => {
      streetView.classList.remove("fade-in");
    }, 1000);
  }, 1000);

  hideCloseButton(); // 隱藏跳過影片按鈕
}

// ✅ 使用者手動關閉影片
function closeVideoManually() {
  const place = document.getElementById("place").value;
  const data = guideData[place];
  if (data && data.streetView) {
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      currentTimeout = null;
    }
    transitionToStreetView(data.streetView);
  }
}

// ✅ 顯示 / 隱藏「跳過影片」按鈕
function showCloseButton() {
  let btn = document.getElementById("closeVideoBtn");
  const selector = document.querySelector(".location-selector");

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "closeVideoBtn";
    btn.textContent = "跳過影片，直接看街景";
    btn.className = "skip-button";
    btn.onclick = closeVideoManually;
    selector.appendChild(btn);
  } else {
    btn.style.display = "inline-block";
  }
}


function hideCloseButton() {
  const btn = document.getElementById("closeVideoBtn");
  if (btn) {
    btn.style.display = "none";
  }
}

// ===== 🤖 AI 聊天機器人功能 =====
let chatVisible = false;

// 切換聊天窗口顯示/隱藏
function toggleChat() {
  const chatContainer = document.getElementById('chatContainer');
  chatVisible = !chatVisible;
  chatContainer.style.display = chatVisible ? 'flex' : 'none';
}

// 處理 Enter 鍵發送消息
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

// 發送用戶消息 (修正後的程式碼)
async function sendMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();

  if (message === '') return;

  addMessage(message, 'user');
  input.value = '';

  showTypingIndicator();

  try {
    const res = await fetch('https://kiigo-ai-backend.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    hideTypingIndicator();
    addMessage(data.reply, 'bot');

  } catch (error) {
    hideTypingIndicator();
    addMessage("抱歉，伺服器連線失敗。", "bot");
  }
}

// 添加消息到聊天視窗
function addMessage(message, sender) {
  const messagesContainer = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
  messageDiv.innerHTML = message;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 顯示打字指示器
function showTypingIndicator() {
  const messagesContainer = document.getElementById('chatMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-indicator';
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 隱藏打字指示器
function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}