// ===================================================
// TRIBE OF RAISE PH — Troops & Combat System
// ===================================================

const CombatSystem = (() => {

  let battleActive = false;
  let battleTick   = null;
  let deployedTroops = [];
  let enemyBuildings = [];

  // ---- Deploy troops during attack ----
  function deployTroop(troopDef, col, row) {
    const { x, y } = IsoEngine.isoToScreen(col, row);
    const troop = {
      id:      Utils.generateId(),
      troopId: troopDef.id,
      icon:    troopDef.icon,
      hp:      troopDef.hp,
      maxHp:   troopDef.hp,
      dmg:     troopDef.dmg,
      speed:   troopDef.speed,
      range:   troopDef.range,
      screenX: x,
      screenY: y,
      targetX: x,
      targetY: y,
      target:  null,
      state:   'moving', // moving | attacking | dead
      attackCooldown: 0,
    };
    deployedTroops.push(troop);
    GameState.activeTroops.push(troop);

    ParticleEngine.burstSmoke(x, y);
    return troop;
  }

  // ---- Simple AI pathfinding (greedy nearest target) ----
  function findTarget(troop) {
    const buildings = enemyBuildings.filter(b => b.hp > 0);
    if (!buildings.length) return null;

    let nearest = null, nearestDist = Infinity;
    buildings.forEach(b => {
      const { x, y } = IsoEngine.isoToScreen(b.col, b.row);
      const dist = Utils.distanceSq(troop.screenX, troop.screenY, x, y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest     = b;
      }
    });
    return nearest;
  }

  // ---- Battle Tick ----
  function startBattle(opponentBuildings) {
    battleActive   = true;
    enemyBuildings = opponentBuildings.map(b => ({ ...b }));

    battleTick = setInterval(() => {
      if (!battleActive) return;

      deployedTroops.forEach(t => {
        if (t.state === 'dead') return;
        if (t.hp <= 0) {
          t.state = 'dead';
          const idx = GameState.activeTroops.indexOf(t);
          if (idx > -1) GameState.activeTroops.splice(idx, 1);
          return;
        }

        t.attackCooldown = Math.max(0, t.attackCooldown - 1);

        // Find target
        if (!t.target || t.target.hp <= 0) t.target = findTarget(t);
        if (!t.target) return;

        const tgt = t.target;
        const { x: tx, y: ty } = IsoEngine.isoToScreen(tgt.col, tgt.row);
        const dist = Math.hypot(t.screenX - tx, t.screenY - ty);
        const rangePixels = t.range * 40;

        if (dist <= rangePixels) {
          // Attack
          t.state = 'attacking';
          if (t.attackCooldown === 0) {
            const dmg = t.dmg + Utils.randomInt(-5, 5);
            tgt.hp    = Math.max(0, tgt.hp - dmg);
            t.attackCooldown = 30;

            // Visual effects
            ParticleEngine.spawnDamageNumber(tx + 20, ty - 20, dmg, 'damage');
            if (tgt.hp <= 0) {
              ParticleEngine.burstExplosion(tx, ty);
              UI.showNotif(`💥 Destroyed ${tgt.icon} ${tgt.buildingId}!`, 'success');
              // Remove from enemy list
              enemyBuildings = enemyBuildings.filter(b => b !== tgt);
            }
          }
        } else {
          // Move toward target
          t.state = 'moving';
          const angle = Math.atan2(ty - t.screenY, tx - t.screenX);
          t.screenX += Math.cos(angle) * t.speed * 1.5;
          t.screenY += Math.sin(angle) * t.speed * 1.5;
        }
      });

      // Check win condition
      if (enemyBuildings.every(b => b.hp <= 0)) {
        endBattle(true);
      }
      // Check loss (all troops dead)
      if (GameState.activeTroops.length === 0 && deployedTroops.length > 0) {
        endBattle(false);
      }
    }, 100);
  }

  function endBattle(victory) {
    battleActive = false;
    clearInterval(battleTick);
    deployedTroops = [];
    GameState.activeTroops.length = 0;

    if (victory) {
      const loot = {
        gold:  Utils.randomInt(500, 2000),
        wood:  Utils.randomInt(300, 1000),
        food:  Utils.randomInt(200, 800),
      };
      Object.entries(loot).forEach(([res, val]) => {
        GameState.resources[res] += val;
      });
      GameState.player.trophies += Utils.randomInt(20, 40);
      GameState.updateResourceUI?.();
      QuestSystem.progress('q1', 1);
      UI.showNotif(`🏆 VICTORY! Looted: 🪙${loot.gold} 🪵${loot.wood} 🌾${loot.food}`, 'success');
    } else {
      GameState.player.trophies = Math.max(0, GameState.player.trophies - Utils.randomInt(10, 25));
      UI.showNotif('💔 Defeat! Your warriors have fallen. Rebuild and try again!', 'error');
    }

    API.updateTrophies(GameState.player.trophies);
  }

  // ---- Simulate Quick Attack (for MVP matchmaking) ----
  function simulateQuickBattle(opponent) {
    const playerStrength  = GameState.player.trophies + GameState.player.level * 50;
    const enemyStrength   = opponent.trophies;
    const winChance       = playerStrength / (playerStrength + enemyStrength);
    const victory         = Math.random() < winChance;
    endBattle(victory);
  }

  return { deployTroop, startBattle, endBattle, simulateQuickBattle };
})();
