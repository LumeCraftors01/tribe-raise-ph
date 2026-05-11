tribe-of-raise-ph/
├── index.html                     # Main entry point (splash + game)
├── frontend/
│   ├── css/
│   │   ├── main.css               # Core tribal UI stylesheet
│   │   └── animations.css         # All keyframe animations & effects
│   └── js/
│       ├── config.js              # Game constants, building/troop data
│       ├── utils.js               # Utility functions
│       ├── particles.js           # Fire, smoke, explosion particle engine
│       ├── iso-engine.js          # Isometric tile renderer (CoC-style)
│       ├── buildings.js           # Auth flow, loading screen, splash
│       ├── troops.js              # (reserved for troop animations)
│       ├── combat.js              # Battle system & AI targeting
│       ├── ui.js                  # UI panels, notifications, HUD
│       ├── chat.js                # Chat system (global/clan/system)
│       ├── quests.js              # Quest tracking & rewards
│       ├── research.js            # Research tree
│       ├── api.js                 # REST API client (localStorage fallback)
│       └── game.js                # Core game state & orchestration
├── backend/
│   ├── config/
│   │   ├── database.php           # PDO connection
│   │   └── helpers.php            # JWT, CORS, rate limit, validation
│   └── api/
│       ├── auth/
│       │   ├── login.php          # POST /auth/login
│       │   └── register.php       # POST /auth/register
│       ├── game/
│       │   └── save_buildings.php # POST /game/save_buildings
│       └── leaderboard/
│           └── top.php            # GET /leaderboard/top
└── database/
    └── schema.sql                 # Full MySQL schema
