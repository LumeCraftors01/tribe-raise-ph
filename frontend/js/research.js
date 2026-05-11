// ===================================================
// TRIBE OF RAISE PH — Research System
// Delegates to GameState, stub for expansion
// ===================================================

const ResearchSystem = (() => {
  function isResearched(id) {
    return GameState._researchDone ? GameState._researchDone.has(id) : false;
  }

  function getBonus(type) {
    // Returns multiplier bonus based on researched items
    const bonuses = {
      production: 1.0,
      troopDmg:   1.0,
      troopSpeed: 1.0,
      wallHp:     1.0,
      towerRange: 1.0,
    };
    // Future: scan researched and apply modifiers
    return bonuses[type] || 1.0;
  }

  return { isResearched, getBonus };
})();
