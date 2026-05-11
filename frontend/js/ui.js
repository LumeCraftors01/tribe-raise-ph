// ===================================================
// TRIBE OF RAISE PH — UI Controller
// ===================================================

const UI = (() => {

  // ---- Notification System ----
  function showNotif(msg, type = 'info') {
    const stack = document.getElementById('notifStack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = `notif ${type}`;
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(() => el.remove(), 4100);
  }

  // ---- Panel Management ----
  const PANELS = {
    build:       'buildPanel',
    troops:      'troopsPanel',
    clan:        'clanPanel',
    chat:        'chatPanel',
    leaderboard: 'leaderboardPanel',
    attack:      null,   // modal
    research:    'researchPanel',
    quests:      'questPanel',
  };

  let openPanels = new Set();

  function setView(view) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === view);
    });

    if (view === 'village') {
      // Close all side panels
      Object.values(PANELS).forEach(id => { if (id) closePanel(id); });
      return;
    }

    if (view === 'attack') {
      startMatchmaking();
      return;
    }

    const panelId = PANELS[view];
    if (panelId) togglePanel(panelId);
  }

  window.setView = setView;

  function togglePanel(id) {
    const el = document.getElementById(id);
    if (!el) return;

    if (el.classList.contains('open')) {
      closePanel(id);
    } else {
      // Close others first (except chat)
      if (id !== 'chatPanel') {
        Object.values(PANELS).forEach(pid => {
          if (pid && pid !== id && pid !== 'chatPanel') closePanel(pid);
        });
      }
      el.classList.remove('hidden');
      requestAnimationFrame(() => el.classList.add('open'));
      openPanels.add(id);
    }
  }

  function closePanel(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('open');
    openPanels.delete(id);
    setTimeout(() => {
      if (!el.classList.contains('open')) el.classList.add('hidden');
    }, 320);
  }

  window.toggleMenu = (name) => {
    const panelMap = { clan: 'clanPanel', chat: 'chatPanel', leaderboard: 'leaderboardPanel', settings: null };
    const id = panelMap[name];
    if (id) togglePanel(id);
    else showNotif('Settings coming soon!', 'info');
  };

  window.closePanel = closePanel;

  // ---- Build Panel ----
  function renderBuildPanel(category = 'economy') {
    const grid = document.getElementById('buildGrid');
    if (!grid) return;
    const items = CONFIG.BUILDINGS[category] || [];
    grid.innerHTML = items.map(def => {
      const canAfford = Object.entries(def.cost).every(([r, v]) => (GameState.resources[r] || 0) >= v);
      const locked    = def.reqLevel && GameState.player.level < def.reqLevel;
      return `
        <div class="build-card${locked ? ' locked' : ''}" 
             onclick="${locked ? '' : `UI.selectBuilding('${def.id}')`}"
             title="${def.name}">
          <div class="build-card-icon">${def.icon}</div>
          <div class="build-card-name">${def.name}</div>
          <div class="build-card-cost" style="color:${canAfford ? 'var(--gold)' : '#CC4444'}">
            ${Object.entries(def.cost).map(([r, v]) =>
              r === 'gold'  ? `🪙${v.toLocaleString()}` :
              r === 'wood'  ? `🪵${v.toLocaleString()}` :
              r === 'stone' ? `🪨${v.toLocaleString()}` :
              r === 'food'  ? `🌾${v.toLocaleString()}` : ''
            ).join(' ')}
          </div>
          ${locked ? `<div style="font-size:0.55rem;color:#888;margin-top:2px">Lv${def.reqLevel} Required</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function selectBuilding(id) {
    let def;
    for (const cat of Object.values(CONFIG.BUILDINGS)) {
      def = cat.find(b => b.id === id);
      if (def) break;
    }
    if (!def) return;
    closePanel('buildPanel');
    GameState.enterBuildMode(def);
    showNotif(`📍 Tap any empty tile to place ${def.name}`, 'info');
  }

  window.UI = { showNotif, togglePanel, closePanel, renderBuildPanel, selectBuilding };

  // Build tab switching
  window.switchBuildTab = (cat) => {
    document.querySelectorAll('.panel-tabs .tab-btn').forEach(b => {
      b.classList.toggle('active', b.textContent.toLowerCase() === cat);
    });
    UI.renderBuildPanel(cat);
  };

  // Troop training panel
  function renderTroopsPanel() {
    const slots = document.getElementById('troopSlots');
    if (!slots) return;
    slots.innerHTML = CONFIG.TROOPS.map(t => `
      <div class="troop-card" onclick="GameState.trainTroop(CONFIG.TROOPS.find(x=>x.id==='${t.id}'))">
        <div class="troop-icon">${t.icon}</div>
        <div class="troop-name">${t.name}</div>
        <div class="troop-stats">
          ❤️ ${t.hp}  ⚔️ ${t.dmg}  🏃 ${t.speed}
          <br>🌾 ${t.cost.food} ${t.cost.gold ? `🪙${t.cost.gold}` : ''}
          <br>⏱ ${t.trainTime}s
        </div>
      </div>
    `).join('');
  }

  // Collect resource from building
  window.UI.collectResource = (buildingId) => {
    const b   = GameState.findBuildingById(buildingId);
    const def = b ? Object.values(CONFIG.BUILDINGS).flat().find(d => d.id === b.buildingId) : null;
    if (!b || !b.produces) return;

    let msg = '💰 Collected: ';
    Object.entries(b.produces).forEach(([res, amount]) => {
      const earned = amount * 5;
      GameState.resources[res] = Math.min(GameState.resources[res] + earned, 99999);
      msg += `${res} +${earned} `;
    });
    GameState.updateResourceUI && GameState.updateResourceUI?.();
    showNotif(msg, 'success');
    closePopup();
  };

  // Matchmaking
  let matchTimer = null;
  window.startMatchmaking = () => {
    const modal = document.getElementById('matchmakingModal');
    if (modal) modal.classList.remove('hidden');

    const messages = [
      'Searching for worthy opponents...',
      'Scanning nearby tribes...',
      'Found a strong enemy!',
      'Preparing battle arena...',
    ];
    let i = 0;
    const statusEl = document.getElementById('matchmakingStatus');
    matchTimer = setInterval(() => {
      if (statusEl) statusEl.textContent = messages[i % messages.length];
      i++;
    }, 1500);

    const delay = CONFIG.MATCHMAKING.SEARCH_MIN_MS +
      Math.random() * (CONFIG.MATCHMAKING.SEARCH_MAX_MS - CONFIG.MATCHMAKING.SEARCH_MIN_MS);

    setTimeout(() => {
      clearInterval(matchTimer);
      cancelMatchmaking();
      showNotif('⚔️ Enemy tribe found! Battle coming soon...', 'success');
      QuestSystem.progress('q1', 1);
    }, delay);
  };

  window.cancelMatchmaking = () => {
    clearInterval(matchTimer);
    const modal = document.getElementById('matchmakingModal');
    if (modal) modal.classList.add('hidden');
  };

  window.openShop = () => showNotif('💎 Gem Shop coming in next update!', 'gem');

  // Init
  function init() {
    renderBuildPanel('economy');
    renderTroopsPanel();
  }

  return { showNotif, togglePanel, closePanel, renderBuildPanel, selectBuilding, init };
})();
