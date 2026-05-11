// ===================================================
// TRIBE OF RAISE PH — Particle Engine
// Fire, sparks, smoke, rain, collectibles
// ===================================================

const ParticleEngine = (() => {

  let particles = [];

  const TYPES = {
    fire: {
      count: 3,
      life: () => 40 + Math.random() * 30,
      vx:   () => (Math.random() - 0.5) * 0.6,
      vy:   () => -(1 + Math.random() * 1.5),
      size: () => 3 + Math.random() * 4,
      color: (t) => {
        const p = t / 70;
        if (p < 0.3) return `rgba(255,220,50,${1-p})`;
        if (p < 0.6) return `rgba(255,120,20,${1-p})`;
        return `rgba(180,40,0,${(1-p)*0.5})`;
      },
    },
    smoke: {
      count: 1,
      life: () => 60 + Math.random() * 40,
      vx:   () => (Math.random() - 0.5) * 0.3,
      vy:   () => -(0.4 + Math.random() * 0.6),
      size: () => 5 + Math.random() * 8,
      color: (t) => `rgba(100,100,100,${0.15 * (1 - t/100)})`,
    },
    spark: {
      count: 2,
      life: () => 20 + Math.random() * 15,
      vx:   () => (Math.random() - 0.5) * 3,
      vy:   () => -(2 + Math.random() * 2),
      size: () => 1.5 + Math.random() * 2,
      color: () => `rgba(255,230,50,0.9)`,
    },
    gold: {
      count: 6,
      life: () => 50 + Math.random() * 20,
      vx:   () => (Math.random() - 0.5) * 2,
      vy:   () => -(1.5 + Math.random() * 2),
      size: () => 4 + Math.random() * 3,
      color: (t) => `rgba(255,215,0,${1 - t/70})`,
    },
    leaf: {
      count: 2,
      life: () => 80 + Math.random() * 40,
      vx:   () => (Math.random() - 0.5) * 1.5,
      vy:   () => -(0.2 + Math.random() * 0.5),
      size: () => 5 + Math.random() * 4,
      color: (t) => `rgba(80,160,40,${0.7 * (1 - t/120)})`,
    },
    explosion: {
      count: 12,
      life: () => 30 + Math.random() * 20,
      vx:   () => (Math.random() - 0.5) * 6,
      vy:   () => -(2 + Math.random() * 4),
      size: () => 4 + Math.random() * 6,
      color: (t) => {
        const p = t / 50;
        if (p < 0.4) return `rgba(255,200,50,${1-p})`;
        return `rgba(255,80,0,${(1-p)*0.8})`;
      },
    },
  };

  // Emit particles at a world position
  function emit(type, worldX, worldY, count = null) {
    const def = TYPES[type];
    if (!def) return;
    const n = count !== null ? count : def.count;
    for (let i = 0; i < n; i++) {
      particles.push({
        type,
        x:    worldX,
        y:    worldY,
        vx:   def.vx(),
        vy:   def.vy(),
        life: 0,
        maxLife: def.life(),
        size: def.size(),
        color: def.color,
      });
    }
  }

  // Auto fire particles on torch/fire buildings
  function autoEmit(buildings, time) {
    if (Math.floor(time / 100) % 2 !== 0) return;
    buildings.forEach(b => {
      if (b.underConstruction) return;
      if (['cannon_tower', 'barracks', 'tribal_hall'].includes(b.buildingId)) {
        const { x, y } = IsoEngine.isoToScreen(b.col, b.row);
        emit('fire', x, y - 20, 2);
        if (Math.random() < 0.2) emit('spark', x, y - 22, 1);
      }
    });
  }

  function update(time) {
    autoEmit(GameState.buildings, time);
    particles = particles.filter(p => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.life += 1;
      p.vx   *= 0.98;
      p.size *= 0.995;
      return p.life < p.maxLife;
    });
  }

  function draw(ctx, camera) {
    particles.forEach(p => {
      const sx = p.x * camera.zoom + camera.x;
      const sy = p.y * camera.zoom + camera.y;
      const sz = p.size * camera.zoom;

      ctx.save();
      ctx.globalAlpha = 1;
      ctx.fillStyle   = p.color(p.life);
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(0.5, sz), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // Burst effects (called from combat, collection, etc.)
  function burstGold(worldX, worldY)     { emit('gold',      worldX, worldY); }
  function burstExplosion(worldX, worldY){ emit('explosion', worldX, worldY); }
  function burstSmoke(worldX, worldY)    { emit('smoke',     worldX, worldY, 4); }
  function burstLeaves(worldX, worldY)   { emit('leaf',      worldX, worldY, 5); }

  // Screen-space damage number
  function spawnDamageNumber(x, y, amount, type = 'damage') {
    const layer = document.getElementById('floatingNumbers');
    if (!layer) return;
    const el = document.createElement('div');
    el.className = `dmg-number${type === 'heal' ? ' heal' : type === 'gold' ? ' gold' : ''}`;
    el.textContent = type === 'damage' ? `-${amount}` : type === 'heal' ? `+${amount}` : `+${amount}🪙`;
    el.style.left = `${x}px`;
    el.style.top  = `${y}px`;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }

  return { update, draw, emit, burstGold, burstExplosion, burstSmoke, burstLeaves, spawnDamageNumber };
})();
