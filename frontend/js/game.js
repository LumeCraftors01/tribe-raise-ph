// ===================================================
// TRIBE OF RAISE PH — Core Game State & Logic
// ===================================================

const GameState = (() => {

  // ---- Player State ----
  let player = {
    id:       null,
    name:     'Bayani',
    level:    7,
    xp:       450,
    xpNext:   1000,
    trophies: 820,
    clan:     { id: 'clan_001', name: 'Lakandula Warriors', role: 'Member', level: 3 },
    shield:   0,
    isGuest:  false,
  };

  let resources = { ...CONFIG.RESOURCES.START };

  let buildings = [];
  let decorations = [];
  let grid = {};
  let activeTroops = [];
  let stars = [];

  let researchDone  = new Set();
  let buildMode     = false;
  let buildSelected = null;

  // ---- Timers ----
  let resourceTick = null;
  let dayNightTick = null;
  let weatherTick  = null;
  let chatMockTick = null;

  // ---- Day/Night State ----
  let dayPhaseIndex = 1; // 'day'
  const PHASES = CONFIG.DAY_NIGHT.PHASES;

  // ==========================
  // INITIALIZATION
  // ==========================
  function init(playerData) {
    if (playerData) Object.assign(player, playerData);
    document.getElementById('playerName').textContent = player.name;
    buildDefaultVillage();
    buildDecorations();
    startResourceTick();
    startDayNightCycle();
    startWeatherCycle();
    updateResourceUI();
    updateQuestUI();
    updateResearchUI();
    updateClanUI();
    updateLeaderboardUI();
    ChatSystem.init();
  }

  // ==========================
  // DEFAULT VILLAGE LAYOUT
  // ==========================
  function buildDefaultVillage() {
    buildings = [
      // Main Hall (center)
      { id: 'b1', buildingId: 'tribal_hall', col: 9, row: 8, size: 2, level: 3, hp: 3000, maxHp: 5000, icon: '🏯', isMain: true, produces: {} },
      // Economy
      { id: 'b2', buildingId: 'gold_mine',   col: 5, row: 7, size: 1, level: 2, hp: 400,  maxHp: 400,  icon: '⛏️', produces: { gold: 100 } },
      { id: 'b3', buildingId: 'lumber_camp', col: 7, row: 12, size: 1, level: 1, hp: 350,  maxHp: 350,  icon: '🪵', produces: { wood: 80  } },
      { id: 'b4', buildingId: 'farm',        col: 13, row: 9, size: 1, level: 2, hp: 300,  maxHp: 300,  icon: '🌾', produces: { food: 90  } },
      { id: 'b5', buildingId: 'storage',     col: 11, row: 12, size: 1, level: 1, hp: 600, maxHp: 600,  icon: '🏪', produces: {} },
      // Military
      { id: 'b6', buildingId: 'barracks',    col: 6, row: 10, size: 1, level: 2, hp: 800,  maxHp: 800,  icon: '⚔️', produces: {} },
      { id: 'b7', buildingId: 'archer_camp', col: 13, row: 6, size: 1, level: 1, hp: 700,  maxHp: 700,  icon: '🏹', produces: {} },
      // Defense
      { id: 'b8', buildingId: 'cannon_tower', col: 7, row: 6, size: 1, level: 2, hp: 900, maxHp: 900,   icon: '💣', produces: {} },
      { id: 'b9', buildingId: 'watch_tower',  col: 12, row: 13, size: 1, level: 1, hp: 600, maxHp: 600, icon: '🗼', produces: {} },
      // Walls ring
      ...generateWallRing(8, 7, 4),
      // Special
      { id: 'b20', buildingId: 'clan_hall',  col: 15, row: 10, size: 1, level: 1, hp: 2000, maxHp: 2000, icon: '🏰', produces: {} },
    ];

    // Mark grid
    buildings.forEach(b => {
      grid[`${b.col},${b.row}`] = { type: 'building', ref: b };
    });
  }

  function generateWallRing(centerCol, centerRow, radius) {
    const walls = [];
    let wId = 10;
    for (let c = centerCol - radius; c <= centerCol + radius; c++) {
      walls.push(makeWall(wId++, c, centerRow - radius));
      walls.push(makeWall(wId++, c, centerRow + radius));
    }
    for (let r = centerRow - radius + 1; r < centerRow + radius; r++) {
      walls.push(makeWall(wId++, centerCol - radius, r));
      walls.push(makeWall(wId++, centerCol + radius, r));
    }
    return walls;
  }

  function makeWall(id, col, row) {
    return { id: `wall_${id}`, buildingId: 'wall', col, row, size: 1, level: 1, hp: 500, maxHp: 500, icon: '🧱', produces: {} };
  }

  function buildDecorations() {
    const trees = [
      [1,1],[2,3],[1,5],[3,1],[0,4],[4,0],[17,1],[18,3],[16,2],[19,5],
      [1,17],[2,15],[0,14],[3,18],[17,17],[16,15],[18,16],[19,14],
    ];
    const deco_icons = ['🌴', '🌿', '🎋', '🌳'];
    decorations = trees.map(([col, row], i) => ({
      col, row, icon: deco_icons[i % deco_icons.length]
    }));
  }

  // ==========================
  // RESOURCE SYSTEM
  // ==========================
  function startResourceTick() {
    resourceTick = setInterval(() => {
      buildings.forEach(b => {
        if (!b.produces) return;
        Object.entries(b.produces).forEach(([res, amount]) => {
          const earned = amount * (b.level || 1);
          resources[res] = Math.min(resources[res] + earned, getStorageCap(res));
        });
      });
      updateResourceUI();
    }, CONFIG.RESOURCES.TICK_MS);
  }

  function getStorageCap(res) {
    const storageLvl = (buildings.find(b => b.buildingId === 'storage') || {}).level || 1;
    const base = { gold: 20000, wood: 20000, food: 10000, stone: 10000, gems: 999 };
    return (base[res] || 10000) * storageLvl;
  }

  function spendResources(cost) {
    for (const [res, amount] of Object.entries(cost)) {
      if ((resources[res] || 0) < amount) return false;
    }
    for (const [res, amount] of Object.entries(cost)) {
      resources[res] -= amount;
    }
    updateResourceUI();
    return true;
  }

  function updateResourceUI() {
    const fmt = n => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;
    const ids  = { gold: 'resGold', wood: 'resWood', food: 'resFood', stone: 'resStone', gems: 'resGems' };
    Object.entries(ids).forEach(([res, elId]) => {
      const el = document.getElementById(elId);
      if (el) {
        el.textContent = fmt(Math.floor(resources[res] || 0));
        el.classList.add('resource-pop');
        setTimeout(() => el.classList.remove('resource-pop'), 500);
      }
    });

    // Fill bars
    const fills = {
      gold:  { el: '.gold-fill',  cap: getStorageCap('gold')  },
      wood:  { el: '.wood-fill',  cap: getStorageCap('wood')  },
      food:  { el: '.food-fill',  cap: getStorageCap('food')  },
      stone: { el: '.stone-fill', cap: getStorageCap('stone') },
    };
    Object.entries(fills).forEach(([res, { el, cap }]) => {
      const fill = document.querySelector(el);
      if (fill) fill.style.width = `${Math.min(100, (resources[res] / cap) * 100)}%`;
    });
  }

  // ==========================
  // DAY / NIGHT CYCLE
  // ==========================
  function startDayNightCycle() {
    const phaseMs = CONFIG.DAY_NIGHT.CYCLE_MS / PHASES.length;
    dayNightTick = setInterval(() => {
      dayPhaseIndex = (dayPhaseIndex + 1) % PHASES.length;
      const phase = PHASES[dayPhaseIndex];
      IsoEngine.setDayPhase(phase);
      applyDayNightOverlay(phase);
      UI.showNotif(`🌅 ${phase.charAt(0).toUpperCase() + phase.slice(1)} has arrived`, 'info');
    }, phaseMs);
  }

  function applyDayNightOverlay(phase) {
    const overlay = document.getElementById('dayNightOverlay');
    if (!overlay) return;
    overlay.className = `daynight-layer ${phase}-overlay`;
  }

  // ==========================
  // WEATHER SYSTEM
  // ==========================
  function startWeatherCycle() {
    const types   = CONFIG.WEATHER.TYPES;
    const weights = CONFIG.WEATHER.WEIGHTS;

    function pickWeather() {
      let total = weights.reduce((a, b) => a + b, 0);
      let rand  = Math.random() * total;
      for (let i = 0; i < weights.length; i++) {
        rand -= weights[i];
        if (rand <= 0) return types[i];
      }
      return types[0];
    }

    weatherTick = setInterval(() => {
      const w = pickWeather();
      IsoEngine.setWeather(w);
      applyWeather(w);
    }, CONFIG.WEATHER.CHANGE_MS);
  }

  function applyWeather(type) {
    const overlay = document.getElementById('weatherOverlay');
    if (!overlay) return;
    overlay.className = 'weather-layer';
    if (type === 'rain')   overlay.classList.add('rain-effect');
    if (type === 'fog')    overlay.classList.add('fog-effect');
  }

  // ==========================
  // TILE CLICK
  // ==========================
  function handleTileClick(col, row) {
    if (buildMode && buildSelected) {
      placeBuildingAt(col, row, buildSelected);
      return;
    }

    const key = `${col},${row}`;
    const cell = grid[key];
    if (cell && cell.type === 'building') {
      showBuildingPopup(cell.ref);
    }
  }

  // ==========================
  // BUILD SYSTEM
  // ==========================
  function enterBuildMode(buildingDef) {
    buildMode     = true;
    buildSelected = buildingDef;
    UI.showNotif(`📍 Tap a tile to place ${buildingDef.name}`, 'info');
  }

  function exitBuildMode() {
    buildMode     = false;
    buildSelected = null;
  }

  function placeBuildingAt(col, row, def) {
    // Check bounds
    if (col < 1 || row < 1 || col >= CONFIG.CANVAS.GRID_W-1 || row >= CONFIG.CANVAS.GRID_H-1) {
      UI.showNotif('Cannot place here — too close to the edge!', 'error');
      return;
    }

    // Check occupied
    if (grid[`${col},${row}`]) {
      UI.showNotif('That tile is already occupied!', 'error');
      return;
    }

    // Check resources
    if (!spendResources(def.cost)) {
      UI.showNotif('Not enough resources!', 'error');
      return;
    }

    const newBuilding = {
      id: `b_${Date.now()}`,
      buildingId: def.id,
      col, row,
      size: 1,
      level: 1,
      hp: def.hp,
      maxHp: def.hp,
      icon: def.icon,
      produces: def.produces || {},
      underConstruction: true,
      constructTimer: 30,
      constructMax:   30,
    };

    buildings.push(newBuilding);
    grid[`${col},${row}`] = { type: 'building', ref: newBuilding };

    // Construction timer
    let timer = 30;
    const interval = setInterval(() => {
      timer--;
      newBuilding.constructTimer = timer;
      if (timer <= 0) {
        newBuilding.underConstruction = false;
        clearInterval(interval);
        UI.showNotif(`✅ ${def.name} construction complete!`, 'success');
        QuestSystem.progress('q2', 1);
      }
    }, 1000);

    exitBuildMode();
    UI.showNotif(`🔨 Building ${def.name}...`, 'info');
    API.saveBuildings(buildings);
  }

  function upgradeBuilding(building) {
    const def  = findBuildingDef(building.buildingId);
    if (!def) return;
    if (building.level >= def.maxLevel) {
      UI.showNotif('Max level reached!', 'info');
      return;
    }

    const cost = {
      gold: 500 * building.level,
      wood: 200 * building.level,
    };

    if (!spendResources(cost)) {
      UI.showNotif('Not enough resources to upgrade!', 'error');
      return;
    }

    building.level++;
    building.maxHp = Math.floor(building.maxHp * 1.2);
    building.hp    = building.maxHp;

    // More production per level
    if (building.produces) {
      Object.keys(building.produces).forEach(r => {
        building.produces[r] = Math.floor(building.produces[r] * 1.15);
      });
    }

    UI.showNotif(`⬆️ ${def.name} upgraded to Level ${building.level}!`, 'success');
    closePopup();
    API.saveBuildings(buildings);
  }

  function findBuildingDef(id) {
    for (const cat of Object.values(CONFIG.BUILDINGS)) {
      const found = cat.find(b => b.id === id);
      if (found) return found;
    }
    return null;
  }

  // ==========================
  // BUILDING POPUP
  // ==========================
  function showBuildingPopup(b) {
    const def = findBuildingDef(b.buildingId);
    if (!def) return;

    document.getElementById('popupIcon').textContent = b.icon;
    document.getElementById('popupName').textContent = `${def.name} (Lv ${b.level})`;

    const stats = document.getElementById('popupStats');
    stats.innerHTML = `
      <div class="stat-item"><div class="stat-label">HP</div><div class="stat-val">${b.hp} / ${b.maxHp}</div></div>
      <div class="stat-item"><div class="stat-label">Level</div><div class="stat-val">${b.level} / ${def.maxLevel}</div></div>
      ${b.produces ? Object.entries(b.produces).map(([r, v]) =>
        `<div class="stat-item"><div class="stat-label">${r}</div><div class="stat-val">+${v}/tick</div></div>`
      ).join('') : ''}
      ${def.defense ? `<div class="stat-item"><div class="stat-label">Defense</div><div class="stat-val">${def.defense * b.level}</div></div>` : ''}
    `;

    const actions = document.getElementById('popupActions');
    const upgCost = { gold: 500 * b.level, wood: 200 * b.level };
    actions.innerHTML = `
      <button class="btn-upgrade" onclick="GameState.upgradeBuilding(GameState.findBuildingById('${b.id}'))">
        ⬆️ Upgrade (🪙${upgCost.gold.toLocaleString()})
      </button>
      ${b.produces && Object.keys(b.produces).length > 0
        ? `<button class="btn-collect" onclick="UI.collectResource('${b.id}')">💰 Collect</button>`
        : ''}
    `;

    document.getElementById('buildingPopup').classList.remove('hidden');
  }

  window.closePopup = () => {
    document.getElementById('buildingPopup').classList.add('hidden');
  };

  function findBuildingById(id) {
    return buildings.find(b => b.id === id);
  }

  // ==========================
  // TROOP SYSTEM
  // ==========================
  function trainTroop(troopDef) {
    if (!spendResources(troopDef.cost)) {
      UI.showNotif('Not enough resources to train!', 'error');
      return;
    }

    const slot = document.getElementById('troopQueue');
    const el   = document.createElement('div');
    el.style.cssText = `
      width:32px;height:32px;background:rgba(255,140,0,0.2);
      border:1px solid rgba(255,140,0,0.4);border-radius:6px;
      display:flex;align-items:center;justify-content:center;font-size:18px;
      position:relative;overflow:hidden;
    `;
    el.innerHTML = `
      ${troopDef.icon}
      <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:#FFB347;
        animation:troopTrainBar ${troopDef.trainTime}s linear forwards;transform-origin:left;"></div>
    `;

    // Inject keyframe
    if (!document.getElementById('trainStyle')) {
      const s = document.createElement('style');
      s.id = 'trainStyle';
      s.textContent = '@keyframes troopTrainBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}';
      document.head.appendChild(s);
    }

    if (slot) slot.appendChild(el);

    setTimeout(() => {
      el.remove();
      UI.showNotif(`✅ ${troopDef.name} training complete!`, 'success');
      QuestSystem.progress('q4', 1);
    }, troopDef.trainTime * 1000);

    UI.showNotif(`⚔️ Training ${troopDef.name}...`, 'info');
  }

  // ==========================
  // QUEST UPDATES
  // ==========================
  function updateQuestUI() {
    const content = document.getElementById('questContent');
    if (!content) return;
    const list = document.createElement('div');
    list.className = 'quest-list';
    CONFIG.QUESTS.forEach(q => {
      const pct = Math.min(100, (q.progress / q.target) * 100);
      const done = q.progress >= q.target;
      const div = document.createElement('div');
      div.className = 'quest-item';
      div.innerHTML = `
        <div class="quest-item-header">
          <span class="quest-icon">${q.icon}</span>
          <span class="quest-name">${q.name}</span>
          <span class="quest-reward">
            ${Object.entries(q.reward).map(([k,v]) =>
              k === 'gold' ? `🪙${v}` : k === 'gems' ? `💎${v}` : k === 'xp' ? `✨${v}XP` : `${k}:${v}`
            ).join(' ')}
          </span>
        </div>
        <div class="quest-desc">${q.desc}</div>
        <div class="quest-progress-bar">
          <div class="quest-progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="quest-progress-text">${done ? '✅ Complete!' : `${q.progress} / ${q.target}`}</div>
      `;
      list.appendChild(div);
    });
    content.innerHTML = '';
    content.appendChild(list);
  }

  function updateResearchUI() {
    const content = document.getElementById('researchContent');
    if (!content) return;
    const tree = document.createElement('div');
    tree.className = 'research-tree';
    Object.entries(CONFIG.RESEARCH).forEach(([cat, items]) => {
      const catDiv = document.createElement('div');
      catDiv.className = 'research-category';
      catDiv.innerHTML = `<div class="research-category-title">${cat.toUpperCase()}</div>`;
      const grid = document.createElement('div');
      grid.className = 'research-grid';
      items.forEach(item => {
        const done = researchDone.has(item.id);
        const div = document.createElement('div');
        div.className = `research-item${done ? ' researched' : ''}`;
        div.innerHTML = `
          <div class="research-icon">${item.icon}</div>
          <div class="research-name">${item.name}</div>
          <div class="research-cost">${done ? '✅ Done' : `🪙${item.cost.gold || 0}`}</div>
        `;
        if (!done) div.onclick = () => doResearch(item);
        grid.appendChild(div);
      });
      catDiv.appendChild(grid);
      tree.appendChild(catDiv);
    });
    content.innerHTML = '';
    content.appendChild(tree);
  }

  function doResearch(item) {
    if (!spendResources(item.cost)) {
      UI.showNotif('Not enough resources for research!', 'error');
      return;
    }
    researchDone.add(item.id);
    UI.showNotif(`🔮 ${item.name} researched! ${item.desc}`, 'success');
    updateResearchUI();
  }

  function updateClanUI() {
    const content = document.getElementById('clanContent');
    if (!content) return;
    const mockMembers = [
      { name: 'BayaniLaki', role: 'Leader',  trophies: 4820, avatar: '⚔️' },
      { name: player.name,  role: 'Member',  trophies: player.trophies, avatar: '🏹' },
      { name: 'HaringBundok', role: 'Elder', trophies: 4480, avatar: '🗡️' },
      { name: 'DiwataNG',   role: 'Member',  trophies: 4320, avatar: '🔮' },
      { name: 'LakiSaLabas', role: 'Member', trophies: 4180, avatar: '⚓' },
    ];
    content.innerHTML = `
      <div class="clan-info">
        <div class="clan-banner">
          <div class="clan-banner-icon">🏰</div>
          <div class="clan-banner-name">${player.clan.name}</div>
          <div class="clan-banner-level">Level ${player.clan.level} • ${mockMembers.length} Members</div>
        </div>
        <div class="clan-members">
          ${mockMembers.map(m => `
            <div class="clan-member">
              <div class="clan-member-avatar">${m.avatar}</div>
              <div class="clan-member-name">${m.name}</div>
              <div class="clan-member-role">${m.role}</div>
              <div class="clan-member-trophies">🏆 ${m.trophies.toLocaleString()}</div>
            </div>
          `).join('')}
        </div>
        <button class="btn-primary" style="margin-top:12px;width:100%;font-size:0.8rem;" onclick="UI.showNotif('Clan War launching soon!','info')">
          ⚔️ Start Clan War
        </button>
      </div>
    `;
  }

  function updateLeaderboardUI() {
    const content = document.getElementById('leaderboardContent');
    if (!content) return;
    const list = document.createElement('div');
    list.className = 'leaderboard-list';
    CONFIG.MOCK_PLAYERS.forEach((p, i) => {
      const rank = i + 1;
      const rankClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
      const el = document.createElement('div');
      el.className = 'lb-entry';
      el.innerHTML = `
        <div class="lb-rank ${rankClass}">${rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}</div>
        <div class="lb-avatar">${p.avatar}</div>
        <div class="lb-info">
          <div class="lb-name">${p.name}</div>
          <div class="lb-clan">${p.clan}</div>
        </div>
        <div class="lb-score">🏆 ${p.trophies.toLocaleString()}</div>
      `;
      list.appendChild(el);
    });
    content.appendChild(list);
  }

  // Expose for external access
  return {
    init,
    handleTileClick,
    enterBuildMode,
    exitBuildMode,
    upgradeBuilding,
    trainTroop,
    findBuildingById,
    spendResources,
    get buildings()    { return buildings; },
    get decorations()  { return decorations; },
    get grid()         { return grid; },
    get activeTroops() { return activeTroops; },
    get stars()        { return stars; },
    set stars(v)       { stars = v; },
    get resources()    { return resources; },
    get player()       { return player; },
    updateQuestUI,
    updateResearchUI,
    updateClanUI,
    updateLeaderboardUI,
  };
})();
