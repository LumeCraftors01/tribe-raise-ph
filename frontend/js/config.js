// ===================================================
// TRIBE OF RAISE PH — Game Configuration
// ===================================================

const CONFIG = {
  GAME: {
    NAME:    'Tribe of Raise PH',
    VERSION: '1.0.0',
    BUILD:   'MVP-Alpha',
  },

  API: {
    BASE_URL:  './backend/api',
    TIMEOUT:   10000,
    RETRY:     3,
  },

  CANVAS: {
    TILE_W:  64,   // isometric tile width
    TILE_H:  32,   // isometric tile height
    GRID_W:  20,   // columns
    GRID_H:  20,   // rows
    ZOOM_MIN: 0.5,
    ZOOM_MAX: 2.0,
    ZOOM_DEFAULT: 1.0,
  },

  RESOURCES: {
    START: { gold: 5000, wood: 3000, food: 2000, stone: 1000, gems: 50 },
    TICK_MS: 5000,   // resource production tick every 5s
  },

  DAY_NIGHT: {
    CYCLE_MS: 600000,  // 10-minute full cycle
    PHASES: ['dawn', 'day', 'dusk', 'night'],
  },

  WEATHER: {
    CHANGE_MS: 180000,  // change every 3 minutes
    TYPES: ['clear', 'cloudy', 'rain', 'fog', 'storm'],
    WEIGHTS: [40, 25, 20, 10, 5],
  },

  CHAT: {
    MAX_LENGTH:    120,
    HISTORY_LIMIT: 100,
    MOCK_INTERVAL: 8000,
  },

  MATCHMAKING: {
    SEARCH_MIN_MS: 3000,
    SEARCH_MAX_MS: 8000,
  },

  BUILDINGS: {
    economy: [
      { id: 'gold_mine',    name: 'Gold Mine',     icon: '⛏️',  cost: { gold: 500, wood: 200 },  produces: { gold: 100 }, maxLevel: 10, hp: 400, category: 'economy' },
      { id: 'lumber_camp',  name: 'Lumber Camp',   icon: '🪵',  cost: { gold: 400, wood: 100 },  produces: { wood: 80  }, maxLevel: 10, hp: 350, category: 'economy' },
      { id: 'farm',         name: 'Rice Farm',     icon: '🌾',  cost: { gold: 300, wood: 150 },  produces: { food: 90  }, maxLevel: 10, hp: 300, category: 'economy' },
      { id: 'quarry',       name: 'Stone Quarry',  icon: '🪨',  cost: { gold: 600, wood: 250 },  produces: { stone: 60 }, maxLevel: 10, hp: 500, category: 'economy' },
      { id: 'storage',      name: 'Storage Hall',  icon: '🏪',  cost: { gold: 800, wood: 400 },  storage: true,           maxLevel: 10, hp: 600, category: 'economy' },
    ],
    military: [
      { id: 'barracks',     name: 'Barracks',         icon: '⚔️',  cost: { gold: 1000, wood: 500 },  trains: 'warrior',  maxLevel: 10, hp: 800, category: 'military' },
      { id: 'archer_camp',  name: 'Archer Camp',      icon: '🏹',  cost: { gold: 1200, wood: 600 },  trains: 'archer',   maxLevel: 10, hp: 700, category: 'military' },
      { id: 'spear_ground', name: 'Spear Ground',     icon: '🗡️',  cost: { gold: 900,  wood: 450 },  trains: 'spearman', maxLevel: 10, hp: 650, category: 'military' },
      { id: 'beast_pen',    name: 'Beast Pen',         icon: '🐘',  cost: { gold: 3000, wood: 1500, stone: 500 }, trains: 'beast', maxLevel: 5, hp: 1200, category: 'military', reqLevel: 5 },
    ],
    defense: [
      { id: 'wall',         name: 'Bamboo Wall',    icon: '🧱',  cost: { gold: 200,  wood: 300 },  defense: 150,  maxLevel: 10, hp: 500,  category: 'defense' },
      { id: 'cannon_tower', name: 'Cannon Tower',   icon: '💣',  cost: { gold: 1500, wood: 700,  stone: 300 }, defense: 400, maxLevel: 8, hp: 900, category: 'defense' },
      { id: 'watch_tower',  name: 'Watch Tower',    icon: '🗼',  cost: { gold: 800,  wood: 400 },  defense: 200,  maxLevel: 8, hp: 600,  category: 'defense' },
      { id: 'trap',         name: 'Bamboo Trap',    icon: '🪤',  cost: { gold: 300,  wood: 150 },  defense: 100,  maxLevel: 5, hp: 200,  category: 'defense' },
    ],
    special: [
      { id: 'tribal_hall',  name: 'Tribal Hall',    icon: '🏯',  cost: { gold: 0 },  special: true, maxLevel: 15, hp: 5000, category: 'special', isMain: true },
      { id: 'clan_hall',    name: 'Clan Hall',      icon: '🏰',  cost: { gold: 2000, wood: 1000, stone: 500 }, special: true, maxLevel: 5, hp: 2000, category: 'special', reqLevel: 3 },
      { id: 'research_temple', name: 'Research Temple', icon: '🔮', cost: { gold: 2500, wood: 1200, stone: 800 }, special: true, maxLevel: 8, hp: 1500, category: 'special', reqLevel: 4 },
    ],
  },

  TROOPS: [
    { id: 'warrior',  name: 'Tribal Warrior', icon: '🗡️', hp: 120, dmg: 30, speed: 1.2, range: 1, cost: { food: 50  }, trainTime: 30,  target: 'any' },
    { id: 'spearman', name: 'Spearman',        icon: '🔱', hp: 180, dmg: 45, speed: 0.9, range: 1.5, cost: { food: 80 }, trainTime: 45, target: 'any' },
    { id: 'archer',   name: 'Archer',           icon: '🏹', hp: 80,  dmg: 55, speed: 1.0, range: 4,   cost: { food: 70 }, trainTime: 40, target: 'any' },
    { id: 'bomber',   name: 'Bomber',           icon: '💣', hp: 60,  dmg: 120, speed: 0.8, range: 1,  cost: { food: 120 }, trainTime: 60, target: 'building' },
    { id: 'beast',    name: 'Beast Rider',      icon: '🐘', hp: 800, dmg: 150, speed: 1.5, range: 1,  cost: { food: 300, gold: 100 }, trainTime: 180, target: 'any', reqLevel: 5 },
  ],

  RESEARCH: {
    economy: [
      { id: 'faster_harvest', name: 'Swift Harvest',  icon: '⚡', desc: '+15% resource production', cost: { gold: 500 },  time: 60  },
      { id: 'big_storage',    name: 'Vast Granary',   icon: '🏺', desc: '+20% storage capacity',   cost: { gold: 700 },  time: 90  },
      { id: 'trade_routes',   name: 'Ocean Trade',    icon: '⚓', desc: '+10% gold from raids',    cost: { gold: 1000 }, time: 120 },
    ],
    military: [
      { id: 'iron_spears',  name: 'Iron Spears',    icon: '🔱', desc: '+20% troop damage',  cost: { gold: 800,  stone: 200 }, time: 90  },
      { id: 'war_chants',   name: 'War Chants',     icon: '🥁', desc: '+15% troop speed',   cost: { gold: 600 },             time: 75  },
      { id: 'beast_taming', name: 'Beast Taming',   icon: '🐘', desc: 'Unlock Beast Rider', cost: { gold: 2000, stone: 500 }, time: 300 },
    ],
    defense: [
      { id: 'thick_walls',  name: 'Thick Bamboo',  icon: '🧱', desc: '+25% wall HP',        cost: { gold: 700, wood: 300 }, time: 90  },
      { id: 'cannon_range', name: 'Long Barrel',   icon: '🎯', desc: '+20% tower range',     cost: { gold: 900, stone: 300 }, time: 120 },
      { id: 'trap_mastery', name: 'Trap Mastery',  icon: '🪤', desc: 'Double trap damage',   cost: { gold: 500 },            time: 60  },
    ],
    exploration: [
      { id: 'sea_charts',   name: 'Sea Charts',    icon: '🗺️', desc: 'Reveal world map',    cost: { gold: 1200 },           time: 150 },
      { id: 'scout_birds',  name: 'Scout Birds',   icon: '🦅', desc: '+2 scout range',       cost: { gold: 800 },            time: 100 },
    ],
  },

  QUESTS: [
    { id: 'q1', name: 'First Strike',    icon: '⚔️', desc: 'Win your first battle',      target: 1,  progress: 0, reward: { gold: 500, xp: 100  } },
    { id: 'q2', name: 'Builder\'s Path', icon: '🔨', desc: 'Build 5 structures',          target: 5,  progress: 3, reward: { gold: 300, wood: 200, xp: 80 } },
    { id: 'q3', name: 'Resource King',   icon: '🪙', desc: 'Collect 10,000 gold total',   target: 10000, progress: 4350, reward: { gems: 20, xp: 150 } },
    { id: 'q4', name: 'War Ready',       icon: '🏹', desc: 'Train 20 troops',             target: 20, progress: 8,  reward: { gold: 800, xp: 120  } },
    { id: 'q5', name: 'Clan Warrior',    icon: '🏰', desc: 'Join or create a clan',       target: 1,  progress: 0, reward: { gems: 10, xp: 200   } },
  ],

  MOCK_PLAYERS: [
    { name: 'BayaniLaki',     clan: 'Lakandula Warriors', trophies: 4820, avatar: '⚔️', level: 15 },
    { name: 'AnakNgBuwan',    clan: 'Sons of Maynila',    trophies: 4650, avatar: '🏹', level: 14 },
    { name: 'HaringBundok',   clan: 'Mountain Kings',     trophies: 4480, avatar: '🗡️', level: 13 },
    { name: 'DiwataNG',       clan: 'Mystic Tribe',       trophies: 4320, avatar: '🔮', level: 13 },
    { name: 'LakiSaLabas',    clan: 'Ocean Raiders',      trophies: 4180, avatar: '⚓', level: 12 },
    { name: 'WarriorPilipino',clan: 'Katipunan',          trophies: 4050, avatar: '🏯', level: 12 },
    { name: 'MakapantMna',    clan: 'Tribal Council',     trophies: 3920, avatar: '🌊', level: 11 },
    { name: 'TigerOfRaise',   clan: 'Raise PH Elites',    trophies: 3780, avatar: '🐯', level: 11 },
    { name: 'BabaenlisaPH',   clan: 'Forest Guardians',   trophies: 3650, avatar: '🌿', level: 10 },
    { name: 'SumulongBayan',  clan: 'Bayan Warriors',     trophies: 3500, avatar: '🦅', level: 10 },
  ],

  MOCK_CHAT: [
    { user: 'BayaniLaki',     avatar: '⚔️', text: 'Just defeated a Level 10 base! 🔥' },
    { user: 'DiwataNG',       avatar: '🔮', text: 'Beast Rider is OP in clan wars haha' },
    { user: 'AnakNgBuwan',    avatar: '🏹', text: 'Anyone want to join Lakandula Warriors? Open slots!' },
    { user: 'HaringBundok',   avatar: '🗡️', text: 'Research Temple just unlocked for me. Worth it!' },
    { user: 'LakiSaLabas',    avatar: '⚓', text: 'Clan war starts in 2 hours! GET READY MGA KASAMAHAN' },
    { user: 'WarriorPilipino',avatar: '🏯', text: 'Tip: Always upgrade walls before attacking!' },
    { user: 'TigerOfRaise',   avatar: '🐯', text: 'Server lagging? Or just me? 😅' },
    { user: 'MakapantMna',    avatar: '🌊', text: 'New season starts next week! More rewards coming!' },
  ],
};

// Freeze config to prevent accidental modification
Object.freeze(CONFIG);
