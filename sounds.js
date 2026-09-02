// sounds-recipe- の音レシピから、公式仕分けくん用に使用。
// 正解・不正解・コンボ・タイムアップ・スタート・クリアをWeb Audioで再生します。
(() => {
  let ctx = null;
  const getCtx = () => ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f, t, d, type='sine', level=.22) => {
    const c = getCtx();
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(level, c.currentTime + t);
    g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + t + d);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + t);
    o.stop(c.currentTime + t + d);
  };
  const play = name => {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
    const recipes = {
      correct: [[659,0,.22,'sine',.28],[880,.1,.45,'sine',.25]],
      wrong: [[220,0,.35,'triangle',.25],[145,.18,.44,'triangle',.23]],
      start: [[392,0,.24,'sawtooth',.16],[523,.16,.24,'sawtooth',.18],[784,.32,.62,'sawtooth',.2]],
      clear: [[523,0,.14,'sine',.16],[659,.12,.14,'sine',.16],[784,.24,.14,'sine',.17],[1047,.36,.72,'sine',.22]],
      alarm: [[330,0,.26,'square',.18],[330,.34,.36,'square',.18]],
      combo3: [[523,0,.13,'triangle',.15],[659,.1,.13,'triangle',.15],[784,.2,.32,'triangle',.18]],
      combo5: [[523,0,.12,'sine',.16],[659,.1,.12,'sine',.16],[784,.2,.12,'sine',.16],[1047,.3,.5,'sine',.2]],
      comboBreak: [[262,0,.22,'triangle',.13]]
    };
    (recipes[name] || []).forEach(x => tone(...x));
  };
  window.KousikiSound = { play };
})();
