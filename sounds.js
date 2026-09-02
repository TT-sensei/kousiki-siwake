// 公式仕分けくん 音サウンド
// 解いている間は無音。スタート・タイムアップ・クリアだけ再生します。
(() => {
  if (window.KousikiSound) return;
  let ctx = null;

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
    start: [[392,0,.20,'sawtooth',.14],[523,.15,.20,'sawtooth',.16],[784,.30,.55,'sawtooth',.18]],
    clear: [[523,0,.14,'sine',.16],[659,.12,.14,'sine',.16],[784,.24,.14,'sine',.17],[1047,.36,.70,'sine',.22]],
    alarm: [[330,0,.22,'square',.17],[330,.30,.34,'square',.17]]
  };

  const play = name => (recipes[name] || []).forEach(x => tone(...x));
  const sound = { play, correct(){}, wrong(){}, reset(){} };
  window.KousikiSound = sound;

  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const id = b.id || '';
    const text = (b.textContent || '').trim();
    if (id === 'start' || id === 'studyStart' || text.includes('スタート')) play('start');
  });

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
