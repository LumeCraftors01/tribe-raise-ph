// ===================================================
// TRIBE OF RAISE PH — Utilities
// ===================================================

const Utils = {
  formatNumber(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
    return String(n);
  },

  clamp(val, min, max) { return Math.min(max, Math.max(min, val)); },

  lerp(a, b, t) { return a + (b - a) * t; },

  randomBetween(min, max) { return min + Math.random() * (max - min); },

  randomInt(min, max) { return Math.floor(Utils.randomBetween(min, max + 1)); },

  weightedRandom(items, weights) {
    let total = weights.reduce((a, b) => a + b, 0);
    let rand  = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      rand -= weights[i];
      if (rand <= 0) return items[i];
    }
    return items[items.length - 1];
  },

  distanceSq(ax, ay, bx, by) {
    return (ax - bx) ** 2 + (ay - by) ** 2;
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  },

  generateId() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  },

  debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  },

  deepClone(obj) { return JSON.parse(JSON.stringify(obj)); },
};
