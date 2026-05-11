// ===================================================
// TRIBE OF RAISE PH — Chat System
// Global / Clan / System channels
// ===================================================

const ChatSystem = (() => {

  let currentTab = 'global';
  let mockInterval = null;
  let messageHistory = { global: [], clan: [], system: [] };
  let mockIdx = 0;

  function init() {
    addSystemMessage('⚔️ Welcome to Tribe of Raise PH! Build your village, raise your tribe!');
    addSystemMessage('🏆 Season 3 has begun! Compete for top clan rankings!');
    addSystemMessage(`🌟 ${GameState.player.name} has entered the realm.`);

    // Start mock chat messages
    mockInterval = setInterval(() => {
      const msg = CONFIG.MOCK_CHAT[mockIdx % CONFIG.MOCK_CHAT.length];
      mockIdx++;
      addGlobalMessage(msg.user, msg.avatar, msg.text);
    }, CONFIG.CHAT.MOCK_INTERVAL);

    renderMessages();
  }

  function addGlobalMessage(user, avatar, text) {
    const msg = { user, avatar, text, time: Date.now(), channel: 'global' };
    messageHistory.global.push(msg);
    if (messageHistory.global.length > CONFIG.CHAT.HISTORY_LIMIT) {
      messageHistory.global.shift();
    }
    if (currentTab === 'global') renderMessages();
  }

  function addClanMessage(user, avatar, text) {
    const msg = { user, avatar, text, time: Date.now(), channel: 'clan' };
    messageHistory.clan.push(msg);
    if (currentTab === 'clan') renderMessages();
  }

  function addSystemMessage(text) {
    const msg = { user: 'SYSTEM', avatar: '📢', text, time: Date.now(), channel: 'system', isSystem: true };
    messageHistory.system.push(msg);
    messageHistory.global.push(msg);
    if (currentTab === 'global' || currentTab === 'system') renderMessages();
  }

  function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const msgs = messageHistory[currentTab] || [];
    container.innerHTML = msgs.slice(-50).map(m => `
      <div class="chat-msg${m.isSystem ? ' system' : ''}">
        <div class="chat-msg-avatar">${m.avatar}</div>
        <div class="chat-msg-body">
          ${!m.isSystem ? `<div class="chat-msg-user">${m.user}</div>` : ''}
          <div class="chat-msg-text">${escapeHtml(m.text)}</div>
        </div>
      </div>
    `).join('');

    // Auto-scroll
    container.scrollTop = container.scrollHeight;
  }

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.chat-tabs .tab-btn').forEach(b => {
      b.classList.toggle('active', b.textContent.toLowerCase() === tab);
    });
    renderMessages();
  }

  function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    if (text.length > CONFIG.CHAT.MAX_LENGTH) {
      UI.showNotif('Message too long! Max 120 characters.', 'error');
      return;
    }

    const player = GameState.player;
    if (currentTab === 'clan') {
      addClanMessage(player.name, '🏹', text);
    } else {
      addGlobalMessage(player.name, '🏹', text);
    }

    input.value = '';
    API.sendChatMessage({ channel: currentTab, text });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  function destroy() {
    clearInterval(mockInterval);
  }

  // Global bindings
  window.sendChat = sendMessage;
  window.switchChatTab = switchTab;

  return { init, addGlobalMessage, addClanMessage, addSystemMessage, switchTab, sendMessage, destroy };
})();
