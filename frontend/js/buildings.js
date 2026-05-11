// ===================================================
// TRIBE OF RAISE PH — Auth & Splash Controller
// Login / Register / Guest / Loading
// ===================================================

// ---- Form Switching ----
function switchForm(form) {
  document.getElementById('loginForm').classList.toggle('active',    form === 'login');
  document.getElementById('registerForm').classList.toggle('active', form === 'register');
}
window.switchForm = switchForm;

// ---- Login ----
async function handleLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const remember = document.getElementById('rememberMe').checked;

  if (!username || !password) {
    showAuthError('Please enter your username and password.');
    return;
  }

  if (remember) localStorage.setItem('torph_remember', '1');
  else          localStorage.removeItem('torph_remember');

  setLoginLoading(true);
  const res = await API.login(username, password);
  setLoginLoading(false);

  if (res.success) {
    startGame(res.player);
  } else {
    showAuthError(res.message || 'Invalid credentials. Try again.');
  }
}
window.handleLogin = handleLogin;

// ---- Register ----
async function handleRegister() {
  const username = document.getElementById('regUser').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPass').value;
  const confirm  = document.getElementById('regConfirm').value;

  if (!username || !email || !password) {
    showAuthError('All fields are required.');
    return;
  }
  if (username.length < 3 || username.length > 20) {
    showAuthError('Tribe name must be 3–20 characters.');
    return;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    showAuthError('Tribe name can only contain letters, numbers, underscores.');
    return;
  }
  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters.');
    return;
  }
  if (password !== confirm) {
    showAuthError('Passwords do not match.');
    return;
  }
  if (!email.includes('@')) {
    showAuthError('Please enter a valid email address.');
    return;
  }

  setLoginLoading(true);
  const res = await API.register(username, email, password);
  setLoginLoading(false);

  if (res.success) {
    // Auto login after register
    const loginRes = await API.login(username, password);
    startGame(loginRes.player);
  } else {
    showAuthError(res.message || 'Registration failed. Please try again.');
  }
}
window.handleRegister = handleRegister;

// ---- Guest ----
async function handleGuest() {
  const res = await API.loginGuest();
  startGame(res.player);
}
window.handleGuest = handleGuest;

// ---- Auth Helpers ----
function showAuthError(msg) {
  const existing = document.querySelector('.auth-error');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'auth-error';
  el.style.cssText = `
    color:#FF6B6B;font-size:0.78rem;text-align:center;
    background:rgba(255,50,50,0.1);border:1px solid rgba(255,50,50,0.3);
    border-radius:6px;padding:8px 12px;animation:popIn 0.2s ease;
  `;
  el.textContent = '⚠ ' + msg;
  const activeForm = document.querySelector('.auth-form.active');
  if (activeForm) activeForm.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function setLoginLoading(loading) {
  const btns = document.querySelectorAll('.btn-primary');
  btns.forEach(b => {
    b.disabled = loading;
    b.style.opacity = loading ? '0.6' : '1';
    if (loading) b.querySelector('span').textContent = 'Loading...';
  });
  if (!loading) {
    btns.forEach(b => {
      const span = b.querySelector('span');
      if (span) span.textContent = span.dataset.orig || 'ENTER TRIBE';
    });
  }
}

// ---- Remember Me ----
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('torph_remember') === '1') {
    const saved = localStorage.getItem('torph_username');
    if (saved) document.getElementById('loginUser').value = saved;
    document.getElementById('rememberMe').checked = true;
  }
});

// ---- Enter/Submit on keypress ----
document.addEventListener('keypress', e => {
  if (e.key !== 'Enter') return;
  const loginActive = document.getElementById('loginForm').classList.contains('active');
  const regActive   = document.getElementById('registerForm').classList.contains('active');
  if (loginActive)  handleLogin();
  if (regActive)    handleRegister();
});

// ---- Game Launch Sequence ----
const LOADING_TIPS = [
  '💡 Build your Tribal Hall first to unlock new buildings!',
  '💡 Upgrade your walls before attacking other tribes!',
  '💡 Join a clan to participate in Clan Wars!',
  '💡 Research Temple unlocks powerful upgrades!',
  '💡 Beast Riders deal massive damage — train them early!',
  '💡 Use your Shield wisely — it protects your village from raids!',
  '💡 Donate troops to your clan to earn Clan XP!',
  '💡 The day/night cycle affects resource production rates!',
];

const LOADING_MESSAGES = [
  'Summoning ancient spirits...',
  'Weaving bamboo fortifications...',
  'Gathering forest resources...',
  'Awakening the tribal warriors...',
  'Charting ocean trade routes...',
  'Lighting the ceremonial torches...',
  'Carving the tribal totems...',
  'Preparing your village...',
];

async function startGame(playerData) {
  // Transition to loading screen
  const splash  = document.getElementById('splashScreen');
  const loading = document.getElementById('loadingScreen');

  splash.style.opacity = '0';
  splash.style.transition = 'opacity 0.5s ease';
  await delay(500);
  splash.classList.remove('active');
  loading.classList.add('active');

  // Animated loading sequence
  const bar     = document.getElementById('loadingBar');
  const textEl  = document.getElementById('loadingText');
  const tipEl   = document.getElementById('loadingTip');

  // Randomize tip
  tipEl.textContent = '💡 ' + LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];

  // Simulate loading steps
  const steps = [
    { pct: 10, msg: LOADING_MESSAGES[0] },
    { pct: 25, msg: LOADING_MESSAGES[1] },
    { pct: 40, msg: LOADING_MESSAGES[2] },
    { pct: 55, msg: LOADING_MESSAGES[3] },
    { pct: 70, msg: LOADING_MESSAGES[4] },
    { pct: 82, msg: LOADING_MESSAGES[5] },
    { pct: 92, msg: LOADING_MESSAGES[6] },
    { pct: 100, msg: 'Village ready!' },
  ];

  for (const step of steps) {
    bar.style.width = step.pct + '%';
    textEl.textContent = step.msg;
    await delay(280 + Math.random() * 200);
  }

  await delay(400);

  // Switch to game screen
  loading.style.opacity = '0';
  loading.style.transition = 'opacity 0.5s ease';
  await delay(500);
  loading.classList.remove('active');

  const gameScreen = document.getElementById('gameScreen');
  gameScreen.classList.add('active');
  gameScreen.style.opacity = '0';
  gameScreen.style.transition = 'opacity 0.6s ease';
  await delay(50);
  gameScreen.style.opacity = '1';

  // Init engine and game
  IsoEngine.init();
  UI.init();
  GameState.init(playerData);

  // Initialize particles
  window.addEventListener('resize', () => IsoEngine.resize());
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
