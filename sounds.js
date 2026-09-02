// 公式仕分けくん 音サウンド
// Web Audio APIで、正解・不正解・スタート・コンボ・タイムアップ・クリアを再生します。
(() => {
  if (window.KousikiSound) return;
  let ctx = null;
  let combo = 0;

  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const tone = (f, t, d, type = 'sine', level = .22) => {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(.0001, c.currentTime + t);
    g.gain.exponentialRampToValueAtTime(level, c.currentTime + t + .015);
    g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + t + d);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + t);
    o.stop(c.currentTime + t + d + .02);
  };

  const recipes = {
    correct: [[659,0,.20,'sine',.26],[880,.10,.42,'sine',.23]],
    wrong: [[220,0,.28,'triangle',.24],[145,.16,.40,'triangle',.21]],
    start: [[392,0,.20,'sawtooth',.14],[523,.15,.20,'sawtooth',.16],[784,.30,.55,'sawtooth',.18]],
    clear: [[523,0,.14,'sine',.16],[659,.12,.14,'sine',.16],[784,.24,.14,'sine',.17],[1047,.36,.70,'sine',.22]],
    alarm: [[330,0,.22,'square',.17],[330,.30,.34,'square',.17]],
    combo3: [[523,0,.12,'triangle',.14],[659,.09,.12,'triangle',.14],[784,.18,.30,'triangle',.17]],
    combo5: [[523,0,.11,'sine',.15],[659,.09,.11,'sine',.15],[784,.18,.11,'sine',.15],[1047,.27,.48,'sine',.20]],
    comboBreak: [[262,0,.20,'triangle',.13]]
  };

  const play = name => (recipes[name] || []).forEach(x => tone(...x));

  const sound = {
    play,
    correct() {
      combo++;
      play(combo >= 5 && combo % 5 === 0 ? 'combo5' : combo >= 3 && combo % 3 === 0 ? 'combo3' : 'correct');
    },
    wrong() {
      if (combo > 0) play('comboBreak');
      combo = 0;
      play('wrong');
    },
    reset() { combo = 0; }
  };

  window.KousikiSound = sound;

  // 既存のHTML/JavaScriptを変更せず、画面上の操作を拾って音を付ける。
  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const id = b.id || '';
    const cls = b.className || '';
    const text = (b.textContent || '').trim();

    if (id === 'start' || id === 'studyStart' || text.includes('スタート')) {
      sound.reset();
      play('start');
      return;
    }
    if (id === 'quit' || text === 'やめる') {
      sound.reset();
      return;
    }
    if (cls.includes('choice')) {
      setTimeout(() => {
        if (b.classList.contains('correct')) sound.correct();
        else if (b.classList.contains('wrong')) sound.wrong();
      }, 20);
      return;
    }
    if (id === 'retryBtn' || id === 'againBtn') {
      sound.reset();
      play('start');
    }
  });

  // タイムアップを検知。
  let lastTimer = '';
  const observer = new MutationObserver(() => {
    const timer = document.querySelector('#timer');
    if (!timer) return;
    const value = timer.textContent || '';
    if (lastTimer && /0(?:\.0)?秒/.test(value) && !/0\.\d+秒/.test(value)) play('alarm');
    lastTimer = value;
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
