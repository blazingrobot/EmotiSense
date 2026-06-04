/* ============================================================
   EmotiSense — app.js
   ============================================================ */

/* ===== GLOBAL STATE ===== */
const state = {
  learnerName: '',
  introStep: 0,
  currentModule: 0,
  modulesCompleted: [false, false, false],
  scores: [0, 0, 10],
  currentScore: 0,
  feedbackCallback: null,
  currentGameStep: 0, // Added missing property
};

/* ===== EMOTIONS DATA ===== */
const emotions = [
  { face: '😄', name: 'happiness', label: 'Happiness' },
  { face: '😢', name: 'sadness',   label: 'Sadness'   },
  { face: '😠', name: 'anger',     label: 'Anger'     },
  { face: '😨', name: 'fear',      label: 'Fear'      },
  { face: '🤢', name: 'disgust',   label: 'Disgust'   },
  { face: '😲', name: 'surprise',  label: 'Surprise'  },
];

/* ===== PAGE NAVIGATION ===== */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) {
    page.classList.add('active');
    window.scrollTo(0, 0);
  }
}

/* ===== FLOATING BUBBLES (Hero) ===== */
function createBubbles() {
  const wrap = document.getElementById('heroBubbles');
  if (!wrap) return;
  const colors = ['#F9E79F','#A7C7E7','#82C9A3','#F4A261','#C3B1E1'];
  for (let i = 0; i < 18; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = 30 + Math.random() * 80;
    b.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${8 + Math.random() * 12}s;
      animation-delay:${Math.random() * 10}s;
    `;
    wrap.appendChild(b);
  }
}

/* ===== INTRO FLOW ===== */
const introSteps = [
  { text: "Hello My friend, my name is EMI! Let's play a Game! 🎉", showInput: false },
  { text: "What should I call you? 😊",                              showInput: true  },
  { text: '',                                                         showInput: false },
  { text: "Let's Start now! Are you ready? 🚀",                      showInput: false },
];

function introNext() {
  const step = state.introStep;

  if (step === 1) {
    const nameInput = document.getElementById('learnerName');
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.style.borderColor = 'var(--red)';
      return;
    }
    state.learnerName = name;
    introSteps[2].text = `Hello ${name}! Welcome to EmotiSense! 🌟 I will be your friend for today! 💙`;
  }

  state.introStep++;

  if (state.introStep >= introSteps.length) {
    document.getElementById('introScreen').style.display = 'none';
    document.getElementById('gameHub').classList.add('active');
    document.getElementById('hubGreeting').textContent = `Hello, ${state.learnerName}! 👋`;
    return;
  }

  const s = introSteps[state.introStep];
  document.getElementById('emiBubble').textContent = s.text;

  if (s.showInput) {
    document.getElementById('nameInputWrap').classList.remove('hidden');
  } else {
    document.getElementById('nameInputWrap').classList.add('hidden');
  }

  if (state.introStep === introSteps.length - 1) {
    document.getElementById('introNextBtn').textContent = "Let's Go! 🚀";
  }
}

/* ===== MODULE START ===== */
function startModule(n) {
  state.currentModule = n;
  state.currentGameStep = 0;
  state.currentScore = 0;
  document.getElementById('currentScore').textContent = 0;
  document.getElementById('gameHub').classList.remove('active');
  document.getElementById('gameArea').classList.remove('hidden');

  const titles = [
    '',
    'Module 1: Emotion Recognition',
    'Module 2: Social Simulations',
    'Module 3: Calming Activities',
  ];
  document.getElementById('gameAreaTitle').textContent = titles[n];

  if (n === 1) renderModule1();
  if (n === 2) renderModule2();
  if (n === 3) renderModule3();
}

function backToHub() {
  // Clean up any ongoing timers/audio when going back
  clearInterval(simTimerInterval);
  if (isOceanPlaying) {
    stopOceanWaves();
    isOceanPlaying = false;
  }
  document.getElementById('gameArea').classList.add('hidden');
  document.getElementById('gameHub').classList.add('active');
}

/* ===== STAR BURST ===== */
function spawnStars(x, y) {
  const wrap = document.getElementById('starsWrap');
  if (!wrap) return;
  ['⭐','✨','🌟','💫'].forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'star';
    const angle = (i / 4) * Math.PI * 2;
    const dist  = 60 + Math.random() * 60;
    el.style.cssText = `left:${x}px; top:${y}px; --dx:${Math.cos(angle)*dist}px; --dy:${Math.sin(angle)*dist}px;`;
    el.textContent = s;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 900);
  });
}

/* ===== FEEDBACK OVERLAY ===== */
function showFeedback(correct, cb) {
  const overlay = document.getElementById('feedbackOverlay');
  document.getElementById('feedbackEmoji').textContent = correct ? '🎉' : '💪';
  document.getElementById('feedbackText').textContent  = correct ? 'Great Job!'    : 'Almost There!';
  document.getElementById('feedbackSub').textContent   = correct
    ? 'You got it right! You are amazing! ⭐'
    : 'That is okay! Keep trying, you are doing great!';
  state.feedbackCallback = cb;
  overlay.classList.add('show');
}

function addScore(pts) {
  state.currentScore += pts;
  document.getElementById('currentScore').textContent = state.currentScore;
}

/* ============================================================
   MODULE 1 — EMOTION RECOGNITION
   ============================================================ */

const m1Games = ['guessEmotion', 'facialMatching', 'situationAnalysis'];
let m1GameIdx = 0;

function renderModule1() {
  m1GameIdx = 0;
  renderM1Game();
}

function renderM1Game() {
  if (m1GameIdx >= m1Games.length) {
    state.scores[0] = state.currentScore;
    finishModule(1);
    return;
  }
  const g = m1Games[m1GameIdx];
  if (g === 'guessEmotion')      renderGuessEmotion(0);
  if (g === 'facialMatching')    renderFacialMatching();
  if (g === 'situationAnalysis') renderSituation(0);
}

/* ---------- Game 1a: Guess My Emotion ---------- */
const guessRounds = [
  { face: '😄', answer: 'happiness' },
  { face: '😢', answer: 'sadness'   },
  { face: '😠', answer: 'anger'     },
  { face: '😨', answer: 'fear'      },
  { face: '🤢', answer: 'disgust'   },
];

function renderGuessEmotion(round) {
  if (round >= guessRounds.length) { m1GameIdx++; renderM1Game(); return; }

  const q       = guessRounds[round];
  const choices = shuffle([...emotions.map(e => e.name)]).slice(0, 6);
  if (!choices.includes(q.answer)) choices[0] = q.answer;
  const shuffled = shuffle(choices);

  document.getElementById('gameContent').innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <span style="background:var(--blue);border-radius:50px;padding:6px 18px;font-weight:700;font-size:.9rem">
        🎭 Game 1: Guess My Emotion — Round ${round + 1}/${guessRounds.length}
      </span>
    </div>
    <div class="emotion-card">
      <span class="emotion-face">${q.face}</span>
      <p class="emotion-prompt">What emotion am I showing? 🤔</p>
      <div class="emotion-choices">
        ${shuffled.map(c => `<button class="choice-btn" onclick="checkGuess('${c}','${q.answer}',${round})">${capitalize(c)}</button>`).join('')}
      </div>
    </div>`;
}

function checkGuess(chosen, answer, round) {
  document.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent.toLowerCase() === answer)                           b.classList.add('correct');
    else if (b.textContent.toLowerCase() === chosen && chosen !== answer) b.classList.add('wrong');
  });
  const correct = chosen === answer;
  if (correct) { addScore(2); spawnStars(window.innerWidth / 2, 200); }
  showFeedback(correct, () => renderGuessEmotion(round + 1));
}

/* ---------- Game 1b: Facial Matching ---------- */
const matchPairs = [
  { face: '😄', label: 'Happy'  },
  { face: '😢', label: 'Sad'    },
  { face: '😠', label: 'Angry'  },
  { face: '😨', label: 'Afraid' },
];
let matchSelected = null;
let matchDone     = 0;

function renderFacialMatching() {
  matchSelected = null; matchDone = 0;
  const shuffledFaces  = shuffle([...matchPairs]);
  const shuffledLabels = shuffle([...matchPairs]);

  document.getElementById('gameContent').innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <span style="background:var(--blue);border-radius:50px;padding:6px 18px;font-weight:700;font-size:.9rem">
        🔗 Game 2: Facial Expression Matching
      </span>
    </div>
    <div style="background:#fff;border-radius:32px;box-shadow:var(--shadow);padding:36px;margin-bottom:16px;">
      <p style="text-align:center;font-weight:800;font-size:1.1rem;margin-bottom:24px">Match the face to the correct emotion! 😊</p>
      <div class="matching-grid">
        <div class="match-col" id="facesCol">
          ${shuffledFaces.map(p => `
            <div class="match-item" data-face="${p.label}" onclick="matchClick(this,'face')">
              <span class="face-big">${p.face}</span>
            </div>`).join('')}
        </div>
        <div class="match-col" id="labelsCol">
          ${shuffledLabels.map(p => `
            <div class="match-item" data-label="${p.label}" onclick="matchClick(this,'label')">
              ${p.label}
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function matchClick(el, type) {
  if (el.classList.contains('matched')) return;

  if (!matchSelected) {
    el.classList.add('selected');
    matchSelected = { el, type };
    return;
  }

  if (matchSelected.type === type) {
    matchSelected.el.classList.remove('selected');
    el.classList.add('selected');
    matchSelected = { el, type };
    return;
  }

  const faceEl  = type === 'face'  ? el : matchSelected.el;
  const labelEl = type === 'label' ? el : matchSelected.el;
  const faceKey  = faceEl.dataset.face;
  const labelKey = labelEl.dataset.label;
  matchSelected.el.classList.remove('selected');

  if (faceKey === labelKey) {
    faceEl.classList.add('matched'); labelEl.classList.add('matched');
    addScore(2); spawnStars(window.innerWidth / 2, 300);
    matchDone++;
    if (matchDone >= matchPairs.length) {
      setTimeout(() => { m1GameIdx++; renderM1Game(); }, 800);
    }
  } else {
    faceEl.style.background  = '#ffe0da';
    labelEl.style.background = '#ffe0da';
    setTimeout(() => { faceEl.style.background = ''; labelEl.style.background = ''; }, 600);
  }
  matchSelected = null;
}

/* ---------- Game 1c: Situation Analysis ---------- */
const situations = [
  {
    emoji: '🍚🎉👨‍👩‍👧‍👦',
    title: 'Fiesta sa Barangay',
    desc: 'It is the barangay fiesta! The whole family is eating lechon, dancing, and laughing together in the plaza. Everyone is happy and celebrating.',
    answer: 'happiness',
    choices: ['Happiness','Sadness','Anger','Fear'],
  },
  {
    emoji: '🎂🎁😲',
    title: 'Surprise Birthday',
    desc: 'A child walks into the house and all their relatives shout Surprise for their birthday. There are balloons, bibingka, and gifts on the table!',
    answer: 'surprise',
    choices: ['Happiness','Disgust','Surprise','Fear'],
  },
  {
    emoji: '⛈️🕯️😨',
    title: 'Bagyo sa Gabi',
    desc: 'There is a strong bagyo at night. The electricity went out and a child is alone in the dark room hearing loud thunder and heavy rain hitting the roof.',
    answer: 'fear',
    choices: ['Surprise','Fear','Sadness','Anger'],
  },
];

function renderSituation(idx) {
  if (idx >= situations.length) { m1GameIdx++; renderM1Game(); return; }
  const s = situations[idx];

  document.getElementById('gameContent').innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <span style="background:var(--blue);border-radius:50px;padding:6px 18px;font-weight:700;font-size:.9rem">
        🖼️ Game 3: Situation Analysis — ${idx + 1}/${situations.length}
      </span>
    </div>
    <div class="situation-card">
      <div class="situation-img">${s.emoji}</div>
      <div class="situation-body">
        <h3 class="situation-title">${s.title}</h3>
        <p class="situation-text">${s.desc}</p>
        <p style="font-weight:800;margin-bottom:16px">What emotion is shown in this situation?</p>
        <div class="situation-choices">
          ${s.choices.map(c => `<button class="choice-btn" onclick="checkSituation('${c.toLowerCase()}','${s.answer}',${idx})">${c}</button>`).join('')}
        </div>
      </div>
    </div>`;
}

function checkSituation(chosen, answer, idx) {
  document.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent.toLowerCase() === answer) b.classList.add('correct');
    else if (b.textContent.toLowerCase() === chosen) b.classList.add('wrong');
  });
  const correct = chosen === answer;
  if (correct) { addScore(1); spawnStars(window.innerWidth / 2, 300); }
  showFeedback(correct, () => renderSituation(idx + 1));
}

/* ============================================================
   MODULE 2 — SOCIAL SIMULATIONS
   ============================================================ */

const simScenarios = [
  {
    emoji: '👵🛒🚶',
    title: 'Lola sa Palengke',
    desc: 'An old lola is carrying heavy bags of groceries from the palengke. She looks tired and is struggling to walk.',
    choices: [
      { text: '🤝 Help lola carry her bags and walk with her', correct: true  },
      { text: '🏃 Walk past quickly and ignore her',           correct: false },
      { text: '📱 Keep scrolling your phone',                  correct: false },
      { text: '😴 Pretend you did not notice her',             correct: false },
    ],
  },
  {
    emoji: '🏫👧📖',
    title: 'Walang Kasama sa Grupo',
    desc: 'Your teacher said to form groups for an activity, but one classmate is left alone with no group. She looks sad and embarrassed.',
    choices: [
      { text: '💁 Invite her to join your group',          correct: true  },
      { text: '🙈 Ignore her and stay with your barkada',  correct: false },
      { text: '😂 Laugh and whisper to your friends',      correct: false },
      { text: '🏃 Pretend you did not see her',            correct: false },
    ],
  },
  {
    emoji: '🎤😰📜',
    title: 'Nakalimutang Script sa Program',
    desc: 'It is your school Linggo ng Wika program. Your classmate forgot their spoken poetry piece and is about to go on stage. They look very panicked.',
    choices: [
      { text: '📋 Share your copy and quietly help them rehearse', correct: true  },
      { text: '🤷 Say it is not your problem',                     correct: false },
      { text: '😂 Laugh and tell others about it',                 correct: false },
      { text: '📢 Tell the teacher without offering to help',      correct: false },
    ],
  },
  {
    emoji: '🍚🧹🏠',
    title: 'Tulong sa Bahay',
    desc: 'After dinner, your nanay asks you to wash the dishes and sweep the floor. You are tired from school but she just came home from a long day of work.',
    choices: [
      { text: '🧽 Help po nanay and do your best',       correct: true  },
      { text: '📺 Say you are busy watching telenovela', correct: false },
      { text: '😤 Complain and go to your room',         correct: false },
      { text: '🛌 Pretend to be asleep on the couch',    correct: false },
    ],
  },
];

let simIdx           = 0;
let simTimerInterval = null; // Kept for cleanup but no longer used for countdown

function renderModule2() {
  simIdx = 0;
  renderSim();
}

function renderSim() {
  if (simIdx >= simScenarios.length) {
    state.scores[1] = state.currentScore;
    finishModule(2);
    return;
  }

  clearInterval(simTimerInterval); // Clean up any existing interval
  const s = simScenarios[simIdx];

  document.getElementById('gameContent').innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <span style="background:var(--blue);border-radius:50px;padding:6px 18px;font-weight:700;font-size:.9rem">
        🤝 Scenario ${simIdx + 1}/${simScenarios.length}
      </span>
    </div>
    <div class="sim-card">
      <div class="sim-scene">${s.emoji}</div>
      <h3 class="sim-title">${s.title}</h3>
      <p class="sim-desc">${s.desc}</p>
      <p style="font-weight:800;margin-bottom:16px">What is the BEST thing to do?</p>
      <div class="sim-choices">
        ${s.choices.map((c, i) => `<button class="sim-choice" onclick="checkSim(${i},${c.correct})">${c.text}</button>`).join('')}
      </div>
    </div>`;
}

function checkSim(idx, correct) {
  clearInterval(simTimerInterval); // Clean up any interval (for safety)
  document.querySelectorAll('.sim-choice').forEach((b, i) => {
    b.disabled = true;
    if (simScenarios[simIdx].choices[i].correct) b.classList.add('correct');
    else if (i === idx && !correct)              b.classList.add('wrong');
  });
  if (correct) { addScore(2); spawnStars(window.innerWidth / 2, 300); }
  showFeedback(correct, () => { simIdx++; renderSim(); });
}

/* ============================================================
   MODULE 3 — CALMING ACTIVITIES
   ============================================================ */

let breathPhase    = 'idle';
let breathTimer    = null;
let isOceanPlaying = false;
let audioCtx       = null;
let oceanSource    = null;
let oceanGain      = null;

function renderModule3() {
  // Clean up any existing audio when re-rendering
  if (isOceanPlaying) {
    stopOceanWaves();
    isOceanPlaying = false;
  }
  
  document.getElementById('gameContent').innerHTML = `
    <div style="text-align:center;margin-bottom:20px">
      <span style="background:var(--blue);border-radius:50px;padding:6px 18px;font-weight:700;font-size:.9rem">
        🌊 Module 3: Calming Activities
      </span>
    </div>
    <div class="calming-card">
      <h3 style="font-family:var(--font-head);font-size:1.6rem;font-weight:800;margin-bottom:8px">Let's Calm Down 🌿</h3>
      <p style="color:#5a6a7a;margin-bottom:28px">Take a deep breath and relax. Follow the circle!</p>

      <div class="breathing-circle" id="breathCircle" onclick="startBreath()">
        <span id="breathText">Tap to Start</span>
      </div>
      <div class="breath-label" id="breathLabel">Breathing Exercise</div>
      <div class="breath-sub"   id="breathSub">Tap the circle to begin</div>

      <button class="ocean-btn" id="oceanBtn" onclick="toggleOcean()">🌊 Play Ocean Waves</button>

      <div style="margin-top:32px">
        <p style="font-weight:800;margin-bottom:16px;font-size:1rem">Fidget Activities — Tap them! 🎉</p>
        <div class="fidget-grid">
          <button class="fidget-btn" style="background:var(--yellow)" onclick="fidgetClick(this)">🌟</button>
          <button class="fidget-btn" style="background:var(--blue)"   onclick="fidgetClick(this)">💙</button>
          <button class="fidget-btn" style="background:#d5f5e3"       onclick="fidgetClick(this)">🌿</button>
          <button class="fidget-btn" style="background:#fde8d8"       onclick="fidgetClick(this)">🎈</button>
          <button class="fidget-btn" style="background:var(--purple)" onclick="fidgetClick(this)">🪷</button>
        </div>
      </div>

      <button class="btn-primary" style="margin-top:40px;width:100%;justify-content:center;" onclick="finishCalming()">
        ✅ I feel calm! Finish Module
      </button>
    </div>`;
}

function startBreath() {
  const circle = document.getElementById('breathCircle');
  const label  = document.getElementById('breathLabel');
  const sub    = document.getElementById('breathSub');
  const txt    = document.getElementById('breathText');
  clearTimeout(breathTimer);

  if (breathPhase === 'idle' || breathPhase === 'exhale') {
    breathPhase = 'inhale';
    circle.className = 'breathing-circle inhale';
    txt.textContent   = 'Breathe In';
    label.textContent = 'Inhale... 🌬️';
    sub.textContent   = 'Breathe in slowly for 4 seconds';

    breathTimer = setTimeout(() => {
      breathPhase = 'hold';
      circle.className = 'breathing-circle';
      txt.textContent   = 'Hold';
      label.textContent = 'Hold... ⏸';
      sub.textContent   = 'Hold your breath for 2 seconds';

      breathTimer = setTimeout(() => {
        breathPhase = 'exhale';
        circle.className = 'breathing-circle exhale';
        txt.textContent   = 'Breathe Out';
        label.textContent = 'Exhale... 💨';
        sub.textContent   = 'Breathe out slowly for 4 seconds';

        breathTimer = setTimeout(() => {
          breathPhase = 'idle';
          circle.className = 'breathing-circle';
          txt.textContent   = 'Tap Again';
          label.textContent = 'Great job! 🌟';
          sub.textContent   = 'Tap to do another breathing cycle';
        }, 4000);
      }, 2000);
    }, 4000);
  }
}

function toggleOcean() {
  const btn = document.getElementById('oceanBtn');
  if (!btn) return;
  
  if (!isOceanPlaying) {
    playOceanWaves();
    btn.textContent = '🔇 Stop Ocean Waves';
    btn.classList.add('playing');
    isOceanPlaying = true;
  } else {
    stopOceanWaves();
    btn.textContent = '🌊 Play Ocean Waves';
    btn.classList.remove('playing');
    isOceanPlaying = false;
  }
}

function playOceanWaves() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioCtx.sampleRate * 4;
    const buffer     = audioCtx.createBuffer(2, bufferSize, audioCtx.sampleRate);

    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    }

    oceanSource = audioCtx.createBufferSource();
    oceanSource.buffer = buffer;
    oceanSource.loop   = true;

    oceanGain = audioCtx.createGain();
    oceanGain.gain.setValueAtTime(0, audioCtx.currentTime);
    oceanGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 2);

    const filter = audioCtx.createBiquadFilter();
    filter.type            = 'lowpass';
    filter.frequency.value = 400;

    const lfo     = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = 0.12;
    lfoGain.gain.value  = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(oceanGain.gain);
    lfo.start();

    oceanSource.connect(filter);
    filter.connect(oceanGain);
    oceanGain.connect(audioCtx.destination);
    oceanSource.start();
  } catch (e) {
    console.log('Audio not supported:', e);
    isOceanPlaying = false;
  }
}

function stopOceanWaves() {
  try {
    if (oceanGain) {
      oceanGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
    }
    setTimeout(() => { 
      if (oceanSource) {
        oceanSource.stop(); 
        oceanSource = null;
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close();
        audioCtx = null;
      }
    }, 1100);
  } catch (e) {
    console.log('Error stopping audio:', e);
  }
}

function fidgetClick(btn) {
  btn.style.transform = 'scale(1.4) rotate(20deg)';
  const rect = btn.getBoundingClientRect();
  spawnStars(rect.left + rect.width/2, rect.top + rect.height/2);
  setTimeout(() => (btn.style.transform = ''), 300);
}

function finishCalming() {
  stopOceanWaves();
  isOceanPlaying = false;
  state.scores[2] = 10;
  addScore(5);
  finishModule(3);
}

/* ============================================================
   MODULE FINISH & UNLOCK
   ============================================================ */

function finishModule(n) {
  state.modulesCompleted[n - 1] = true;
  const completed = state.modulesCompleted.filter(Boolean).length;

  document.getElementById('progressBar').style.width = (completed / 3 * 100) + '%';
  document.getElementById('progressLabel').textContent = `${completed} of 3 modules completed`;

  if (n === 1) unlockModule(2);
  if (n === 2) unlockModule(3);

  const card = document.getElementById('mod' + n + 'Card');
  if (card && !card.querySelector('.mc-badge')) {
    const badge = document.createElement('span');
    badge.className   = 'mc-badge';
    badge.textContent = '✅ Done';
    card.appendChild(badge);
  }

  document.getElementById('gameArea').classList.add('hidden');
  document.getElementById('gameHub').classList.add('active');

  if (completed === 3) setTimeout(showResults, 700);
}

function unlockModule(n) {
  const card = document.getElementById('mod' + n + 'Card');
  if (!card) return;
  card.classList.remove('locked');
  const lockBadge = card.querySelector('.lock-badge');
  if (lockBadge) lockBadge.remove();
  card.setAttribute('onclick', `startModule(${n})`);
}

/* ============================================================
   RESULTS
   ============================================================ */

function showResults() {
  document.getElementById('resultsName').textContent = state.learnerName;
  document.getElementById('score1').textContent      = state.scores[0];
  document.getElementById('score2').textContent      = state.scores[1];
  document.getElementById('score3').textContent      = state.scores[2];

  const total = state.scores[0] + state.scores[1] + state.scores[2];
  const pct   = Math.min(100, Math.round((total / 39) * 100));
  document.getElementById('overallScore').textContent = pct + '%';
  showPage('results');
}

function downloadPDF() {
  const s     = state;
  const total = s.scores[0] + s.scores[1] + s.scores[2];
  const pct   = Math.min(100, Math.round((total / 39) * 100));
  const date  = new Date().toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' });

  const html = `
    <html>
    <head>
      <title>EmotiSense Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #2C3E50; }
        h1   { color: #5DADE2; margin-bottom: 4px; }
        h2   { color: #2C3E50; font-size: 1rem; font-weight: normal; margin-bottom: 24px; }
        table{ width:100%; border-collapse:collapse; margin:24px 0; }
        th,td{ border:1px solid #ddd; padding:12px; text-align:left; }
        th   { background:#A7C7E7; }
        .total  { font-size:1.4rem; font-weight:bold; color:#5DADE2; }
        .remark { margin-top:8px; }
        .footer { margin-top:40px; color:#aaa; font-size:.85rem; border-top:1px solid #eee; padding-top:16px; }
      </style>
    </head>
    <body>
      <h1>EmotiSense Learning Report</h1>
      <h2>Learner: <strong>${s.learnerName}</strong> &nbsp;|&nbsp; Date: ${date}</h2>
      <table>
        <tr><th>Module</th><th>Activity</th><th>Score</th><th>Total</th></tr>
        <tr><td>Module 1</td><td>Emotion Recognition</td><td>${s.scores[0]}</td><td>21</td></tr>
        <tr><td>Module 2</td><td>Social Simulations</td><td>${s.scores[1]}</td><td>8</td></tr>
        <tr><td>Module 3</td><td>Calming Activities</td><td>${s.scores[2]}</td><td>10</td></tr>
      </table>
      <p class="total">Overall Score: ${total}/39 (${pct}%)</p>
      <p class="remark">${pct >= 80 ? 'Excellent performance!' : pct >= 60 ? 'Good job! Keep practicing.' : 'Keep going! Practice makes perfect.'}</p>
      <div class="footer">
        <p>EmotiSense | Building brighter, empathetic futures.</p>
        <p>contact@emotiscense.com | +63 (2) 8123 4567</p>
        <p>2026 EmotiSense Foundation. This report is for educational purposes only and does not replace professional therapy, diagnosis, or clinical treatment.</p>
      </div>
    </body>
    </html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.print();
}

function restartGame() {
  // Clean up audio if playing
  if (isOceanPlaying) {
    stopOceanWaves();
    isOceanPlaying = false;
  }
  
  state.learnerName      = '';
  state.introStep        = 0;
  state.modulesCompleted = [false, false, false];
  state.scores           = [0, 0, 10];
  state.currentScore     = 0;

  ['mod1Card','mod2Card','mod3Card'].forEach((id, i) => {
    const c = document.getElementById(id);
    if (!c) return;
    c.className = 'module-card' + (i > 0 ? ' locked' : '');
    const badge = c.querySelector('.mc-badge');
    if (badge) badge.remove();
    if (i > 0) {
      if (!c.querySelector('.lock-badge')) {
        const lb = document.createElement('span');
        lb.className   = 'lock-badge';
        lb.textContent = '🔒 Locked';
        c.prepend(lb);
      }
      c.removeAttribute('onclick');
    }
  });

  document.getElementById('progressBar').style.width   = '0%';
  document.getElementById('progressLabel').textContent = '0 of 3 modules completed';
  document.getElementById('gameHub').classList.remove('active');
  document.getElementById('gameArea').classList.add('hidden');
  
  const introScreen = document.getElementById('introScreen');
  if (introScreen) introScreen.style.display = '';
  
  document.getElementById('emiBubble').textContent     = "Hello My friend, my name is EMI! Let's play a Game! 🎉";
  document.getElementById('nameInputWrap').classList.add('hidden');
  document.getElementById('introNextBtn').textContent  = 'Next ➜';
  state.introStep = 0;
  showPage('learning');
}

/* ============================================================
   UTILITY
   ============================================================ */
function shuffle(arr)  { 
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  createBubbles();
  const feedbackBtn = document.getElementById('feedbackNextBtn');
  if (feedbackBtn) {
    feedbackBtn.addEventListener('click', () => {
      document.getElementById('feedbackOverlay').classList.remove('show');
      if (state.feedbackCallback) {
        const cb = state.feedbackCallback;
        state.feedbackCallback = null;
        cb();
      }
    });
  }
});
