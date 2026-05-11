// ===================================================
// TRIBE OF RAISE PH — Isometric Map Engine
// Clash of Clans-style 3D isometric renderer
// ===================================================

const IsoEngine = (() => {

  let canvas, ctx;
  let camera = { x: 0, y: 0, zoom: 1.0, targetZoom: 1.0 };
  let isDragging = false, lastMouse = { x: 0, y: 0 };
  let animFrame = null;
  let currentTime = 0;
  let weatherType = 'clear';
  let dayPhase = 'day';
  let hoveredCell = null;

  // === TILE DIMENSIONS ===
  const TW = CONFIG.CANVAS.TILE_W;
  const TH = CONFIG.CANVAS.TILE_H;
  const GRID_W = CONFIG.CANVAS.GRID_W;
  const GRID_H = CONFIG.CANVAS.GRID_H;

  // === COLOR PALETTES ===
  const GROUND_COLORS = {
    day:   { top: '#5DA83A', side: '#3D7A2A', dark: '#2D5A1B' },
    dusk:  { top: '#8A6A30', side: '#6A4A20', dark: '#4A2A10' },
    night: { top: '#2A4020', side: '#1A3015', dark: '#0A1808' },
    dawn:  { top: '#7A8A50', side: '#5A6A38', dark: '#3A4A20' },
  };

  const WATER_COLORS = {
    day:   ['#1A6B8A', '#2EA8CC', '#0A4D6E'],
    dusk:  ['#4A3A1A', '#8A6A2A', '#3A2A10'],
    night: ['#0A1A2A', '#0A2A3A', '#081520'],
    dawn:  ['#3A6A7A', '#5A9AAA', '#2A4A5A'],
  };

  // === INIT ===
  function init() {
    canvas = document.getElementById('gameCanvas');
    ctx    = canvas.getContext('2d');
    resize();
    setupEvents();
    centerCamera();
    loop();
  }

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function centerCamera() {
    const centerX = isoToScreen(GRID_W / 2, GRID_H / 2).x;
    const centerY = isoToScreen(GRID_W / 2, GRID_H / 2).y;
    camera.x = canvas.width  / 2 - centerX;
    camera.y = canvas.height / 3 - centerY;
  }

  // === COORDINATE CONVERSIONS ===
  function isoToScreen(col, row) {
    return {
      x: (col - row) * (TW / 2),
      y: (col + row) * (TH / 2),
    };
  }

  function screenToIso(sx, sy) {
    const wx = (sx - camera.x) / camera.zoom;
    const wy = (sy - camera.y) / camera.zoom;
    return {
      col: Math.floor((wx / (TW / 2) + wy / (TH / 2)) / 2),
      row: Math.floor((wy / (TH / 2) - wx / (TW / 2)) / 2),
    };
  }

  // === TILE DRAWING ===
  function drawTile(col, row, h, topColor, sideColorL, sideColorR, ctx) {
    const { x, y } = isoToScreen(col, row);
    const cx = x * camera.zoom + camera.x;
    const cy = y * camera.zoom + camera.y;
    const tw = TW * camera.zoom;
    const th = TH * camera.zoom;
    const elevation = h * camera.zoom;

    // Top face
    ctx.beginPath();
    ctx.moveTo(cx,          cy - elevation);
    ctx.lineTo(cx + tw / 2, cy + th / 2 - elevation);
    ctx.lineTo(cx,          cy + th - elevation);
    ctx.lineTo(cx - tw / 2, cy + th / 2 - elevation);
    ctx.closePath();
    ctx.fillStyle = topColor;
    ctx.fill();

    // Left face (dark)
    ctx.beginPath();
    ctx.moveTo(cx - tw / 2, cy + th / 2 - elevation);
    ctx.lineTo(cx,          cy + th - elevation);
    ctx.lineTo(cx,          cy + th);
    ctx.lineTo(cx - tw / 2, cy + th / 2);
    ctx.closePath();
    ctx.fillStyle = sideColorL;
    ctx.fill();

    // Right face (mid)
    ctx.beginPath();
    ctx.moveTo(cx + tw / 2, cy + th / 2 - elevation);
    ctx.lineTo(cx,          cy + th - elevation);
    ctx.lineTo(cx,          cy + th);
    ctx.lineTo(cx + tw / 2, cy + th / 2);
    ctx.closePath();
    ctx.fillStyle = sideColorR;
    ctx.fill();

    // Subtle tile outline
    ctx.beginPath();
    ctx.moveTo(cx,          cy - elevation);
    ctx.lineTo(cx + tw / 2, cy + th / 2 - elevation);
    ctx.lineTo(cx,          cy + th - elevation);
    ctx.lineTo(cx - tw / 2, cy + th / 2 - elevation);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // === WATER TILE ===
  function drawWater(col, row, time) {
    const { x, y } = isoToScreen(col, row);
    const cx = x * camera.zoom + camera.x;
    const cy = y * camera.zoom + camera.y;
    const tw = TW * camera.zoom;
    const th = TH * camera.zoom;
    const colors = WATER_COLORS[dayPhase] || WATER_COLORS.day;

    const wave = Math.sin(time * 0.002 + col * 0.4 + row * 0.4) * 2;

    const grad = ctx.createLinearGradient(cx - tw/2, cy, cx + tw/2, cy + th + wave);
    grad.addColorStop(0, colors[1]);
    grad.addColorStop(0.5, colors[0]);
    grad.addColorStop(1, colors[2]);

    ctx.beginPath();
    ctx.moveTo(cx,          cy + wave);
    ctx.lineTo(cx + tw / 2, cy + th / 2 + wave);
    ctx.lineTo(cx,          cy + th + wave);
    ctx.lineTo(cx - tw / 2, cy + th / 2 + wave);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // === HOVER HIGHLIGHT ===
  function drawHoverHighlight(col, row) {
    const { x, y } = isoToScreen(col, row);
    const cx = x * camera.zoom + camera.x;
    const cy = y * camera.zoom + camera.y;
    const tw = TW * camera.zoom;
    const th = TH * camera.zoom;

    ctx.beginPath();
    ctx.moveTo(cx,          cy);
    ctx.lineTo(cx + tw / 2, cy + th / 2);
    ctx.lineTo(cx,          cy + th);
    ctx.lineTo(cx - tw / 2, cy + th / 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,220,100,0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,200,0,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // === BUILDING RENDERER ===
  function drawBuilding(b, time) {
    const { x, y } = isoToScreen(b.col, b.row);
    const cx = x * camera.zoom + camera.x;
    const cy = y * camera.zoom + camera.y;
    const tw = TW * camera.zoom;
    const th = TH * camera.zoom;
    const size = (b.size || 1);
    const h = (b.level || 1) * 8 * camera.zoom;

    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.ellipse(cx, cy + th * size * 0.8, tw * 0.4 * size, th * 0.2 * size, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();

    // Base platform (elevated)
    ctx.save();
    const platColor = b.isMain
      ? (dayPhase === 'night' ? '#5A3010' : '#8A5020')
      : (dayPhase === 'night' ? '#2A1808' : '#5A3818');

    const sideL = dayPhase === 'night' ? '#1A0808' : '#3A2010';
    const sideR = dayPhase === 'night' ? '#200A08' : '#4A2818';

    drawTile(b.col, b.row, h + 12, platColor, sideL, sideR, ctx);
    ctx.restore();

    // Building emoji / icon
    const font   = Math.max(14, (b.size || 1) * 22 * camera.zoom);
    const bob    = Math.sin(time * 0.001 + b.col * 0.5) * 1.5;
    const drawX  = cx;
    const drawY  = cy - h - 12 * camera.zoom + bob;

    ctx.font      = `${font}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // Glow on main building
    if (b.isMain) {
      ctx.shadowBlur  = 20;
      ctx.shadowColor = '#FF8C00';
    }
    if (b.underConstruction) {
      ctx.globalAlpha = 0.6;
    }

    ctx.fillText(b.icon, drawX, drawY);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Construction timer
    if (b.underConstruction && b.constructTimer > 0) {
      const pct = 1 - b.constructTimer / b.constructMax;
      const barW = tw * 0.7;
      const barX = cx - barW / 2;
      const barY = drawY + 4;

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      roundRect(ctx, barX, barY, barW, 6 * camera.zoom, 3);
      ctx.fill();

      ctx.fillStyle = '#FFB347';
      roundRect(ctx, barX, barY, barW * pct, 6 * camera.zoom, 3);
      ctx.fill();
    }

    // Level badge
    if (b.level > 1) {
      const badgeX = cx + tw * 0.25;
      const badgeY = drawY - font * 0.6;
      ctx.fillStyle = '#B8860B';
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 8 * camera.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.font = `bold ${9 * camera.zoom}px Cinzel, serif`;
      ctx.fillText(b.level, badgeX, badgeY + 3 * camera.zoom);
    }

    // HP bar
    if (b.hp < b.maxHp) {
      const pct  = b.hp / b.maxHp;
      const barW = tw * 0.8;
      const barX = cx - barW / 2;
      const barY = cy - h + 2 * camera.zoom;

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      roundRect(ctx, barX, barY, barW, 4 * camera.zoom, 2);
      ctx.fill();

      const hpColor = pct > 0.5 ? '#00C853' : pct > 0.25 ? '#FF8F00' : '#D50000';
      ctx.fillStyle = hpColor;
      roundRect(ctx, barX, barY, barW * pct, 4 * camera.zoom, 2);
      ctx.fill();
    }
  }

  // === TROOP RENDERER (during battle preview) ===
  function drawTroop(t, time) {
    const sx = t.screenX * camera.zoom + camera.x;
    const sy = t.screenY * camera.zoom + camera.y;
    const bob = Math.sin(time * 0.003 + t.id * 0.7) * 2;

    ctx.font = `${20 * camera.zoom}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowBlur  = 8;
    ctx.shadowColor = 'rgba(255,100,0,0.4)';
    ctx.fillText(t.icon, sx, sy + bob);
    ctx.shadowBlur = 0;

    // HP
    const pct  = t.hp / t.maxHp;
    const barW = 20 * camera.zoom;
    const barX = sx - barW / 2;
    const barY = sy + 4;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, barX, barY, barW, 3 * camera.zoom, 1.5);
    ctx.fill();
    ctx.fillStyle = pct > 0.5 ? '#00C853' : '#FF8F00';
    roundRect(ctx, barX, barY, barW * pct, 3 * camera.zoom, 1.5);
    ctx.fill();
  }

  // === TREE / DECORATION ===
  function drawDecoration(col, row, icon, time) {
    const { x, y } = isoToScreen(col, row);
    const cx = x * camera.zoom + camera.x;
    const cy = y * camera.zoom + camera.y;
    const th = TH * camera.zoom;
    const sway = Math.sin(time * 0.0008 + col * 0.9 + row * 0.6) * 3;

    ctx.save();
    ctx.translate(cx, cy + th * 0.1);
    ctx.rotate(sway * Math.PI / 180);
    ctx.font = `${18 * camera.zoom}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(icon, 0, 0);
    ctx.restore();
  }

  // === STARS (night) ===
  function drawStars(time) {
    if (dayPhase !== 'night') return;
    ctx.save();
    const stars = GameState.stars || (GameState.stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5,
      r: Math.random() * 1.5 + 0.5,
      phase: Math.random() * Math.PI * 2,
    })));
    stars.forEach(s => {
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.001 + s.phase));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FFFDE7';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // === MAIN RENDER LOOP ===
  function loop(ts = 0) {
    currentTime = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Smooth zoom
    camera.zoom += (camera.targetZoom - camera.zoom) * 0.1;

    // Background gradient
    const bgColors = {
      day:   ['#1A4A6A', '#0A2840'],
      dusk:  ['#4A2A0A', '#2A1005'],
      night: ['#040814', '#020408'],
      dawn:  ['#2A3A4A', '#121820'],
    };
    const [bg1, bg2] = bgColors[dayPhase] || bgColors.day;
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, bg1);
    bg.addColorStop(1, bg2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Night stars
    drawStars(ts);

    const gColors = GROUND_COLORS[dayPhase] || GROUND_COLORS.day;

    // === RENDER GRID (painter's algorithm: back to front) ===
    const gs = GameState.grid || {};
    const decos = GameState.decorations || [];

    for (let row = 0; row < GRID_H; row++) {
      for (let col = 0; col < GRID_W; col++) {
        const key = `${col},${row}`;
        const cell = gs[key];

        // Water border ring
        const isEdge = col === 0 || row === 0 || col === GRID_W-1 || row === GRID_H-1;
        const isWater = isEdge || (cell && cell.type === 'water');

        if (isWater) {
          drawWater(col, row, ts);
        } else {
          drawTile(col, row, 0, gColors.top, gColors.dark, gColors.side, ctx);
        }

        // Hover
        if (hoveredCell && hoveredCell.col === col && hoveredCell.row === row && !isWater) {
          drawHoverHighlight(col, row);
        }
      }
    }

    // Decorations (trees, rocks)
    decos.forEach(d => drawDecoration(d.col, d.row, d.icon, ts));

    // Buildings (sorted by row for depth)
    const buildings = GameState.buildings || [];
    const sorted = [...buildings].sort((a, b) => (a.row + a.col) - (b.row + b.col));
    sorted.forEach(b => drawBuilding(b, ts));

    // Troops (battle mode)
    const troops = GameState.activeTroops || [];
    troops.forEach(t => drawTroop(t, ts));

    // Waterfall / torch particles on buildings
    if (ts % 3 < 1) ParticleEngine.update(ts);
    ParticleEngine.draw(ctx, camera);

    animFrame = requestAnimationFrame(loop);
  }

  // === INPUT EVENTS ===
  function setupEvents() {
    // Mouse drag
    canvas.addEventListener('mousedown', e => {
      isDragging = false;
      lastMouse = { x: e.clientX, y: e.clientY };
      canvas.addEventListener('mousemove', onDrag);
    });

    canvas.addEventListener('mouseup', e => {
      canvas.removeEventListener('mousemove', onDrag);
      if (!isDragging) {
        const rect = canvas.getBoundingClientRect();
        const iso  = screenToIso(e.clientX - rect.left, e.clientY - rect.top);
        GameState.handleTileClick(iso.col, iso.row);
      }
      isDragging = false;
    });

    function onDrag(e) {
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) isDragging = true;
      camera.x += dx;
      camera.y += dy;
      lastMouse = { x: e.clientX, y: e.clientY };
    }

    // Mouse move hover
    canvas.addEventListener('mousemove', e => {
      if (isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const iso  = screenToIso(e.clientX - rect.left, e.clientY - rect.top);
      if (iso.col >= 0 && iso.col < GRID_W && iso.row >= 0 && iso.row < GRID_H) {
        hoveredCell = iso;
      } else {
        hoveredCell = null;
      }
    });

    // Scroll zoom
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      camera.targetZoom = Math.max(
        CONFIG.CANVAS.ZOOM_MIN,
        Math.min(CONFIG.CANVAS.ZOOM_MAX, camera.targetZoom + delta)
      );
    }, { passive: false });

    // Touch support
    let lastTouchDist = 0;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        isDragging = false;
      } else if (e.touches.length === 2) {
        lastTouchDist = getTouchDist(e.touches);
      }
    });

    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastMouse.x;
        const dy = e.touches[0].clientY - lastMouse.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) isDragging = true;
        camera.x += dx;
        camera.y += dy;
        lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dist = getTouchDist(e.touches);
        const delta = (dist - lastTouchDist) * 0.005;
        camera.targetZoom = Math.max(CONFIG.CANVAS.ZOOM_MIN,
          Math.min(CONFIG.CANVAS.ZOOM_MAX, camera.targetZoom + delta));
        lastTouchDist = dist;
      }
    }, { passive: false });

    canvas.addEventListener('touchend', e => {
      if (!isDragging && e.changedTouches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        const t    = e.changedTouches[0];
        const iso  = screenToIso(t.clientX - rect.left, t.clientY - rect.top);
        GameState.handleTileClick(iso.col, iso.row);
      }
      isDragging = false;
    });

    window.addEventListener('resize', () => { resize(); centerCamera(); });
  }

  function getTouchDist(touches) {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  }

  // Rounded rect helper
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function setDayPhase(phase) { dayPhase = phase; }
  function setWeather(w)      { weatherType = w; }
  function getCameraZoom()    { return camera.zoom; }

  return { init, resize, setDayPhase, setWeather, getCameraZoom, isoToScreen, screenToIso };
})();
