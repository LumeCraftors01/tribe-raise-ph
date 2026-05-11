// ===================================================
// TRIBE OF RAISE PH — API Layer
// REST API client with localStorage fallback
// ===================================================

const API = (() => {

  const BASE = CONFIG.API.BASE_URL;
  const TIMEOUT = CONFIG.API.TIMEOUT;

  // ---- Storage Keys ----
  const KEYS = {
    session:   'torph_session',
    player:    'torph_player',
    buildings: 'torph_buildings',
    resources: 'torph_resources',
    quests:    'torph_quests',
    research:  'torph_research',
    settings:  'torph_settings',
  };

  // ---- Generic Fetch Wrapper ----
  async function request(endpoint, method = 'GET', body = null) {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const opts = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Session': getSession() || '',
        },
        signal: controller.signal,
      };
      if (body) opts.body = JSON.stringify(body);

      const res  = await fetch(`${BASE}/${endpoint}`, opts);
      const data = await res.json();
      clearTimeout(timeout);
      return data;
    } catch (err) {
      clearTimeout(timeout);
      // Silently fall back to local storage
      return null;
    }
  }

  // ---- Session ----
  function getSession()         { return localStorage.getItem(KEYS.session); }
  function setSession(token)    { localStorage.setItem(KEYS.session, token); }
  function clearSession()       { localStorage.removeItem(KEYS.session); }
  function isLoggedIn()         { return !!getSession(); }

  // ---- Auth ----
  async function login(username, password) {
    const res = await request('auth/login.php', 'POST', { username, password });
    if (res && res.success) {
      setSession(res.token);
      if (localStorage.getItem('torph_remember') === '1') {
        localStorage.setItem('torph_username', username);
      }
      return { success: true, player: res.player };
    }
    // Offline fallback: accept any login
    const mockToken = `guest_${Utils.generateId()}`;
    setSession(mockToken);
    return {
      success: true,
      player: {
        name: username,
        level: 1,
        xp: 0,
        xpNext: 1000,
        trophies: 0,
        clan: { id: null, name: 'No Clan', role: 'None', level: 0 },
      },
    };
  }

  async function register(username, email, password) {
    const res = await request('auth/register.php', 'POST', { username, email, password });
    if (res && res.success) return { success: true };
    // Fallback
    return { success: true };
  }

  async function loginGuest() {
    const guestName = `Guest_${Utils.randomInt(1000, 9999)}`;
    const mockToken = `guest_${Utils.generateId()}`;
    setSession(mockToken);
    return {
      success: true,
      player: {
        name:    guestName,
        level:   1,
        xp:      0,
        xpNext:  1000,
        trophies:0,
        clan:    { id: null, name: 'No Clan', role: 'None', level: 0 },
        isGuest: true,
      },
    };
  }

  function logout() {
    clearSession();
    localStorage.removeItem('torph_username');
  }

  // ---- Game Data Persistence ----
  async function saveBuildings(buildings) {
    localStorage.setItem(KEYS.buildings, JSON.stringify(buildings));
    await request('game/save_buildings.php', 'POST', { buildings });
  }

  async function loadBuildings() {
    const local = localStorage.getItem(KEYS.buildings);
    if (local) return JSON.parse(local);
    const res = await request('game/load_buildings.php');
    return res ? res.buildings : null;
  }

  async function saveResources(resources) {
    localStorage.setItem(KEYS.resources, JSON.stringify(resources));
    await request('game/save_resources.php', 'POST', { resources });
  }

  async function loadResources() {
    const local = localStorage.getItem(KEYS.resources);
    if (local) return JSON.parse(local);
    const res = await request('game/load_resources.php');
    return res ? res.resources : null;
  }

  async function saveQuests(quests) {
    localStorage.setItem(KEYS.quests, JSON.stringify(quests));
    await request('game/save_quests.php', 'POST', { quests });
  }

  async function saveResearch(researchSet) {
    const arr = [...researchSet];
    localStorage.setItem(KEYS.research, JSON.stringify(arr));
    await request('game/save_research.php', 'POST', { research: arr });
  }

  // ---- Player Profile ----
  async function loadProfile() {
    const res = await request('player/profile.php');
    return res ? res.player : null;
  }

  async function updateTrophies(trophies) {
    await request('player/update_trophies.php', 'POST', { trophies });
  }

  // ---- Matchmaking ----
  async function findMatch(playerTrophies) {
    const res = await request('match/find.php', 'POST', { trophies: playerTrophies });
    if (res && res.opponent) return res.opponent;
    // Mock opponent
    const mock = CONFIG.MOCK_PLAYERS[Utils.randomInt(0, CONFIG.MOCK_PLAYERS.length - 1)];
    return {
      name:     mock.name,
      trophies: mock.trophies,
      clan:     mock.clan,
      level:    mock.level,
    };
  }

  // ---- Chat ----
  async function sendChatMessage({ channel, text }) {
    await request('chat/send.php', 'POST', { channel, text, player: GameState.player.name });
  }

  async function fetchChatHistory(channel) {
    const res = await request(`chat/history.php?channel=${channel}`);
    return res ? res.messages : [];
  }

  // ---- Leaderboard ----
  async function fetchLeaderboard() {
    const res = await request('leaderboard/top.php');
    return res ? res.players : CONFIG.MOCK_PLAYERS;
  }

  // ---- Clan ----
  async function fetchClan(clanId) {
    const res = await request(`clan/get.php?id=${clanId}`);
    return res ? res.clan : null;
  }

  async function createClan(name) {
    return await request('clan/create.php', 'POST', { name });
  }

  async function joinClan(clanId) {
    return await request('clan/join.php', 'POST', { clanId });
  }

  // ---- Anti-cheat Validation ----
  async function validateAction(action, payload) {
    return await request('security/validate.php', 'POST', { action, payload });
  }

  return {
    login, register, loginGuest, logout,
    isLoggedIn, getSession,
    saveBuildings, loadBuildings,
    saveResources, loadResources,
    saveQuests, saveResearch,
    loadProfile, updateTrophies,
    findMatch,
    sendChatMessage, fetchChatHistory,
    fetchLeaderboard,
    fetchClan, createClan, joinClan,
    validateAction,
  };
})();
