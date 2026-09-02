/* 公式仕分けくん スコアモード */
(function(){
  const LIMIT=30000;
  let points=0, combo=0, answered=0, started=0, timer=null, finished=false;
  const $=s=>document.querySelector(s);
  function ensureUI(){
    if(!$('#scoreModeStyle')){const st=document.createElement('style');st.id='scoreModeStyle';st.textContent='.scoreMode{background:#eef4ff;border-radius:14px;padding:10px 14px;margin:8px 0;font-weight:900}.scoreFlash{animation:scorePop .22s ease}@keyframes scorePop{50%{transform:scale(1.12)}}';document.head.appendChild(st)}
    const top=$('.quiz-top');
    if(top&&!$('#liveScore')){const box=document.createElement('span');box.className='scoreMode';box.id='liveScore';box.textContent='⭐ 0点　🔥 0コンボ';top.insertBefore(box,top.firstChild)}
  }
  function update(){const e=$('#liveScore');if(e){e.textContent='⭐ '+points+'点　🔥 '+combo+'コンボ';e.classList.remove('scoreFlash');void e.offsetWidth;e.classList.add('scoreFlash')}}
  function finish(){if(finished)return;finished=true;clearInterval(timer);const key='kousiki-highscore-'+(window.L||1);const old=Number(localStorage.getItem(key)||0);if(points>old)localStorage.setItem(key,String(points));}
  function start(){points=0;combo=0;answered=0;finished=false;started=Date.now();clearInterval(timer);ensureUI();update();timer=setInterval(()=>{if(Date.now()-started>=LIMIT)finish()},100)}
  function hook(){
    ensureUI();
    const startBtn=$('#start');
    if(startBtn&&!startBtn.dataset.scoreHook){startBtn.dataset.scoreHook='1';startBtn.addEventListener('click',()=>setTimeout(start,0))}
    const choices=$('#choices');
    if(choices&&!choices.dataset.scoreHook){choices.dataset.scoreHook='1';choices.addEventListener('click',e=>{const b=e.target.closest('.choice');if(!b||b.disabled||finished)return;answered++;const correct=b.classList.contains('correct');if(correct){combo++;points+=10+Math.min(combo-1,9)*2}else{combo=0}update();if(Date.now()-started>=LIMIT)finish()})}
    const next=$('#nextBtn');if(next&&!next.dataset.scoreHook){next.dataset.scoreHook='1';next.addEventListener('click',()=>{if(Date.now()-started>=LIMIT)finish()})}
  }
  const mo=new MutationObserver(hook);mo.observe(document.documentElement,{childList:true,subtree:true});
  hook();
  window.addEventListener('beforeunload',finish);
})();
