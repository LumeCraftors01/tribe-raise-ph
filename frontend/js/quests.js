// ===================================================
// TRIBE OF RAISE PH — Quest System
// ===================================================

const QuestSystem = (() => {

  // Progress a quest by ID
  function progress(questId, amount = 1) {
    const quest = CONFIG.QUESTS.find(q => q.id === questId);
    if (!quest) return;
    if (quest.progress >= quest.target) return;

    quest.progress = Math.min(quest.target, quest.progress + amount);

    if (quest.progress >= quest.target) {
      completeQuest(quest);
    } else {
      UI.showNotif(`📋 Quest progress: ${quest.name} (${quest.progress}/${quest.target})`, 'info');
    }

    GameState.updateQuestUI();
    API.saveQuests(CONFIG.QUESTS);
  }

  function completeQuest(quest) {
    // Grant rewards
    Object.entries(quest.reward).forEach(([res, amount]) => {
      if (res === 'xp') {
        addXP(amount);
      } else if (GameState.resources[res] !== undefined) {
        GameState.resources[res] += amount;
      }
    });

    const rewardText = Object.entries(quest.reward)
      .map(([k, v]) => k === 'xp' ? `✨${v}XP` : k === 'gold' ? `🪙${v}` : k === 'gems' ? `💎${v}` : `${k}+${v}`)
      .join(' ');

    UI.showNotif(`🎉 Quest Complete: "${quest.name}"! Rewards: ${rewardText}`, 'success');
    showQuestCompleteEffect();
  }

  function addXP(amount) {
    const p = GameState.player;
    p.xp += amount;
    if (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level++;
      p.xpNext = Math.floor(p.xpNext * 1.3);
      UI.showNotif(`🌟 LEVEL UP! You are now Level ${p.level} — ${getLevelTitle(p.level)}!`, 'success');
      showLevelUpEffect();
    }
    // Update XP bar
    const xpFill = document.querySelector('.xp-fill');
    if (xpFill) xpFill.style.width = `${Math.min(100, (p.xp / p.xpNext) * 100)}%`;
    const lvlEl = document.querySelector('.player-level');
    if (lvlEl) lvlEl.textContent = `Lvl ${p.level} — ${getLevelTitle(p.level)}`;
  }

  function getLevelTitle(level) {
    const titles = [
      '', 'Baguhan', 'Mandirigma', 'Kawal', 'Bayani',
      'Datu', 'Paramount Datu', 'Lakan', 'Rajah', 'Sultan', 'Hari',
      'Hari ng mga Hari', 'Bathala', 'Diwata', 'Anito', 'Diyos ng Digma'
    ];
    return titles[Math.min(level, titles.length - 1)] || 'Diyos ng Digma';
  }

  function showQuestCompleteEffect() {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      font-family:'Cinzel',serif;font-size:1.8rem;color:#FFD700;
      text-shadow:0 0 30px rgba(255,215,0,0.8);
      animation:bounceIn 0.5s ease,fadeOut 0.5s ease 2s forwards;
      z-index:9999;pointer-events:none;text-align:center;
      background:rgba(0,0,0,0.7);padding:20px 40px;border-radius:12px;
      border:2px solid rgba(255,183,77,0.5);
    `;
    el.innerHTML = '⭐ QUEST COMPLETE! ⭐';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function showLevelUpEffect() {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);
      font-family:'Cinzel Decorative',serif;font-size:2.2rem;
      background:linear-gradient(135deg,#FFD700,#FF8C00);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      filter:drop-shadow(0 0 20px rgba(255,215,0,0.9));
      animation:bounceIn 0.6s ease,fadeOut 0.5s ease 2.5s forwards;
      z-index:9999;pointer-events:none;text-align:center;
    `;
    el.innerHTML = '🌟 LEVEL UP! 🌟';
    document.body.appendChild(el);

    // Add fadeOut keyframe if not present
    if (!document.getElementById('fadeOutStyle')) {
      const s = document.createElement('style');
      s.id = 'fadeOutStyle';
      s.textContent = '@keyframes fadeOut{from{opacity:1}to{opacity:0}}';
      document.head.appendChild(s);
    }

    setTimeout(() => el.remove(), 3200);
  }

  return { progress, addXP, getLevelTitle };
})();
