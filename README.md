# 🏯 Tribe of Raise PH
### Ancient Malaya Tribal MMO — v1.0.0 MVP

---

## 📁 Project Structure

```
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
```

---

## 🚀 Quick Start (Frontend Only)

The game **works offline/locally** with no backend required.
All data is saved to `localStorage`.

1. Open `index.html` in any modern browser
2. Click **"Play as Guest"** or register a new account
3. The game loads instantly with a default tribal village

---

## 🖥️ Full Stack Deployment

### Requirements
- PHP 8.1+
- MySQL 8.0+
- Apache / Nginx with mod_rewrite
- Node.js 18+ (optional, for WebSocket gateway)

### Steps

```bash
# 1. Clone / upload files to your web server
cp -r tribe-of-raise-ph/ /var/www/html/

# 2. Create MySQL database
mysql -u root -p < database/schema.sql

# 3. Configure environment
cp backend/config/database.php.example backend/config/database.php
# Edit DB_HOST, DB_NAME, DB_USER, DB_PASS, JWT_SECRET

# 4. Set permissions
chmod 755 backend/api/
chmod 644 backend/config/*.php

# 5. Configure Apache .htaccess (or Nginx)
# See nginx.conf.example below
```

### Nginx Config Example
```nginx
server {
    listen 80;
    server_name tribeofraiserph.com;
    root /var/www/html/tribe-of-raise-ph;
    index index.html;

    location /backend/api/ {
        try_files $uri $uri/ =404;
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Environment Variables
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tribe_of_raise_ph
DB_USER=torph_user
DB_PASS=your_secure_password
JWT_SECRET=your_256bit_random_secret
APP_ENV=production
```

---

## 🎮 Gameplay Features (MVP)

| Feature               | Status  |
|-----------------------|---------|
| Isometric 3D Map      | ✅ Done |
| Login / Register      | ✅ Done |
| Guest Mode            | ✅ Done |
| Resource System       | ✅ Done |
| Base Building         | ✅ Done |
| Drag & Place          | ✅ Done |
| Upgrade Buildings     | ✅ Done |
| Day/Night Cycle       | ✅ Done |
| Weather Effects       | ✅ Done |
| Particle Effects      | ✅ Done |
| Chat System           | ✅ Done |
| Quest System          | ✅ Done |
| Research Tree         | ✅ Done |
| Clan System (UI)      | ✅ Done |
| Leaderboard           | ✅ Done |
| Matchmaking (mock)    | ✅ Done |
| Combat System         | ✅ Done |
| LocalStorage Save     | ✅ Done |
| MySQL Persistence     | ✅ Done |
| Anti-cheat validation | ✅ Done |
| Rate limiting         | ✅ Done |
| Mobile responsive     | ✅ Done |

---

## 🔮 Roadmap — Future Updates

These are already structured into the codebase for easy addition:

- 🚢 **Naval Battles** — Ocean tile combat system
- 🐉 **Mythical Creatures** — Naga, Tikbalang, Manananggal units
- 🗺️ **World Map Conquest** — Multi-island territory control
- 💱 **Trading Economy** — Player-to-player resource marketplace
- 🎃 **Seasonal Events** — Limited-time quests and rewards
- 🎨 **Cosmetics** — Village skins, troop outfits, banner designs
- 🏅 **Battle Pass** — Monthly progressive reward track
- 🏰 **Guild Kingdoms** — Mega-alliance territory wars
- ⚔️ **Cross-Server Wars** — Region vs region tournaments
- 📱 **Mobile App** — Capacitor.js or React Native export

---

## 🔒 Security Notes

- All user input sanitized with `sanitizeString()` / prepared statements
- Passwords hashed with bcrypt (cost 12)
- JWT tokens with 7-day expiry and HMAC-SHA256 signature
- Rate limiting on all endpoints (stricter on auth)
- Anti-cheat resource validation on all save endpoints
- CORS whitelist configurable per environment
- SQL injection prevention via PDO prepared statements only

---

## 📱 Mobile Optimization

- Isometric canvas scales via `camera.zoom`
- Touch drag + pinch-to-zoom supported
- Bottom nav optimized for thumb reach
- Font sizes use `clamp()` for fluid scaling
- Panels slide in from right (mobile-native UX)
- `prefers-reduced-motion` respected

---

## 🎨 Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | HTML5 + CSS3 + Vanilla JS (ES6+) |
| Renderer   | Canvas 2D (Isometric)   |
| Backend    | PHP 8.1 (REST API)      |
| Database   | MySQL 8.0               |
| Auth       | JWT (custom HMAC-SHA256)|
| Persistence| MySQL + localStorage    |
| Fonts      | Cinzel Decorative + Raleway (Google Fonts) |

---

*Tribe of Raise PH — Built with 🔥 for the Filipino gaming community*
