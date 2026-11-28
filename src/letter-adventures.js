import {icon} from './icons.js';
import './letter-adventures.css';

export const LETTER_BUDDIES = {
  ab:'letter-rubble', cd:'letter-tracker', ef:'zuma', gh:'letter-rocky', ij:'letter-everest',
  kl:'letter-chase', mn:'letter-marshall', op:'skye', qr:'letter-chase', st:'letter-rocky',
  uv:'letter-rubble', wx:'letter-everest', yz:'skye'
};

const scenes = {
  ab:['harbor','小砾','听字母，选一块木板。','桥板装好啦！'],
  cd:['station-orchard','小克','听字母，掀开果箱找朋友。','藏在这里呀！'],
  ef:['letter-sunset','路马','转动灯头，对准字母，再开灯。','灯亮了，小船看得到岸啦！'],
  gh:['station-orchard','灰灰','听车头的名字，接上小写字母车厢。','车厢接好了，送水果去！'],
  ij:['letter-snow','珠珠','听字母，踩冰块带我过河。','踩稳啦，再往前走！'],
  kl:['letter-bay','阿奇','听听收信的字母，点邮箱投信。','信投进去啦！'],
  mn:['letter-garden','毛毛','听完呼叫，在鼓上敲回来。','敲对啦！'],
  op:['letter-garden','天天','听字母，戳气球，把水果接回来。','接住水果啦！'],
  qr:['letter-bay','阿奇','听字母，找钥匙帮小动物开门。','门开啦，请进！'],
  st:['letter-garden','灰灰','听字母，连压两下水泵，把花浇开。','喝饱水，开花啦！'],
  uv:['letter-sunset','小砾','按箭头到字母楼层，再开门接朋友。','到站，小伙伴进来啦！'],
  wx:['letter-snow','珠珠','听字母，擦一擦那扇结霜的窗。','窗户亮了，你好呀！'],
  yz:['letter-night','天天','听字母，找到星座，连起闪亮的小星星。','星星连好啦！']
};
const guests = ['cat','duck','letter-puppy','duck'];
const fruit = ['fruit-apple','fruit-pear','fruit-orange','fruit-peach'];
const starPoints = {
  y:[[18,10],[50,49],[82,10],[50,91]],
  z:[[17,12],[83,12],[17,88],[83,88]]
};
const strokes = {y:[0,1,2,1,3],z:[0,1,2,3]};
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startLetterAdventure({lesson,root,art,speak,stopAudio,effect,finish,record}) {
  const pair = lesson.pair;
  const game = pair.join('');
  const [background,buddy,instruction,praise] = scenes[game];
  const world = document.createElement('section');
  world.className = 'la-world la-' + game;
  world.style.backgroundImage = 'url("' + art(background) + '")';
  world.innerHTML = '<header class="la-heading"><div class="la-titles"><span class="la-pair"></span><h1></h1></div><div class="la-progress"></div></header><div class="la-floor"><div class="la-stage"></div></div><footer class="la-radio"><img class="la-face" alt=""><div class="la-message"><small></small><strong aria-live="polite"></strong></div><button type="button" class="la-help" data-la="hint" aria-label="给我一点提示">'+icon('flag')+'<span>提示</span></button></footer>';
  root.replaceChildren(world);
  world.querySelector('h1').textContent = lesson.name;
  world.querySelector('.la-pair').textContent = pair.join(' · ').toUpperCase();
  world.querySelector('.la-face').src = art(LETTER_BUDDIES[game]);
  world.querySelector('.la-message small').textContent = buddy + '的电台';
  const stage = world.querySelector('.la-stage');
  const progress = world.querySelector('.la-progress');

  // Each letter appears once with a model and once without one. A drum echo
  // gradually grows into two sounds; the other adventures retain one request.
  const shuffled = Math.random() < .5 ? [...pair] : [...pair].reverse();
  const rounds = [[pair[0]],[pair[1]],shuffled.slice(0,1),shuffled.slice(1)];
  if (game === 'mn') { rounds[2] = shuffled; rounds[3] = [...shuffled].reverse(); }
  const firstLeft = Math.random() < .5 ? 0 : 1;
  const target = () => rounds[round][cursor];
  const coached = () => round < 2;
  const guided = () => coached() || hinted;
  const roundSlots = index => ['ef','uv','mn'].includes(game) || (index + firstLeft) % 2 === 0 ? pair : [...pair].reverse();
  const slots = () => roundSlots(round);
  let round = 0, cursor = 0, phase = 'choose', aim = 0, star = 0;
  let misses = 0, hinted = false, hintCount = 0, disposed = false;
  let note = '', hintTimer = 0, nextTimer = 0, strokeStart = null, ignoreClickUntil = 0;
  let audioKeys = [], showAnswer = '', tapCount = 0, liftTravel = '';
  let speechRun = 0, playingEcho = false;
  const installed = [];

  async function say(keys) {
    audioKeys = Array.isArray(keys) ? keys : [keys];
    const token = ++speechRun;
    if (disposed) return;
    if (game!=='mn' || phase!=='choose') {
      playingEcho=false;
      return Promise.resolve(speak(audioKeys)).catch(()=>{});
    }
    // Demonstrate the instruments in order. Independent rounds give every drum
    // its own pitch but keep the correct drums visually unmarked.
    const sequence = [...audioKeys];
    playingEcho=true;
    for(const key of sequence) {
      if(disposed || token!==speechRun) return;
      const speaking=Promise.resolve(speak(key)).catch(()=>{});
      if(pair.includes(key)) {
        sound('act'+key.toUpperCase());
        if(guided()&&!reducedMotion()) {
          const drum=stage.querySelector('[data-value="'+key+'"]');
          drum?.animate([{transform:'scale(1.05,.93)'},{transform:'none'}],{duration:200});
        }
      }
      await speaking;
    }
    if(token===speechRun) playingEcho=false;
  }
  function replay() { if (!disposed && audioKeys.length) say(audioKeys); }
  function sound(key = 'act' + game.toUpperCase()) { effect?.(key); }
  function cue() {
    if (phase === 'place') return '点亮光的缺口，放好木板。';
    if (phase === 'turn') return '点锁孔，把钥匙转一下。';
    if (phase === 'trace') return '点亮光的星星，跟着光走。';
    if (tapCount) return game === 'st' ? '再压一下，把水送过去！' : '再擦一下，看看谁在里面！';
    if (game === 'mn' && round >= 2) return '听两个字母，按相同顺序敲两面鼓。';
    return instruction;
  }
  function position(x,y,w,h) { return 'left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%'; }
  function pic(name,cls='') { return '<img alt="" draggable="false" class="'+cls+'" src="'+art(name)+'">'; }
  function prop(name,x,y,w,h,cls='') {
    return '<div class="la-item la-prop '+cls+'" style="'+position(x,y,w,h)+'">'+pic(name)+'</div>';
  }
  function shape(cls,x,y,w,h,inside='') {
    return '<div aria-hidden="true" class="la-item la-prop '+cls+'" style="'+position(x,y,w,h)+'">'+inside+'</div>';
  }
  function button(action,value,label,inside,x,y,w,h,cls='',hint=false) {
    const disabled = phase === 'success' || phase === 'beat';
    return '<button type="button" data-la="'+action+'" data-value="'+value+'" aria-label="'+label+'" class="la-item la-button '+cls+(hint && !disabled?' la-guide':'')+'" style="'+position(x,y,w,h)+'"'+(disabled?' disabled':'')+'>'+inside+'</button>';
  }
  function tag(v,small=false) { return '<b class="la-tag">'+(small?v:v.toUpperCase())+'</b>'; }
  function paired(make) { return slots().map((v,i)=>make(v,i,v === target())).join(''); }
  function letter(v,asset,x,y,w,h,cls='',small=false) {
    const guide = guided() && phase === 'choose' && target() === v;
    const hit = phase === 'success' && target() === v;
    return button('letter',v,'字母 '+(small?v:v.toUpperCase()),(asset?pic(asset):'')+tag(v,small),x,y,w,h,cls+(hit?' la-hit':''),guide);
  }
  function controls(action,v,label,mark,x,y,w,h,guide=false) {
    return button(action,v,label,'<span class="la-knob">'+mark+'</span>',x,y,w,h,'la-control',guide);
  }
  function fixedLabel(v,x,y) {
    return shape('la-marker',x,y,13,16,'<b>'+v.toUpperCase()+'</b>');
  }
  function bridge() {
    const count = installed.length;
    const planks = Array.from({length:4},(_,i)=>{
      const x = 17+22*i;
      if (i < count) return prop('letter-plank',x,42,23,21,'la-plank-set');
      if (phase === 'place' && i === count) return button('place','', '放桥板','<span>＋</span>',x,42,23,20,'la-gap la-active-gap',true);
      return shape('la-gap',x,42,23,20);
    }).join('');
    return shape('la-bridge-rail',50,41,89,15)+planks+prop('duck',8+21*count,26,16,29,phase==='success'?'la-cross':'')+
      (phase==='place'?prop('letter-plank',50,78,34,22,'la-carry'):paired((v,i)=>letter(v,'letter-plank',i?72:28,78,38,24,'la-board')));
  }
  function hide() {
    return paired((v,i,onTarget)=>{
      const x = i?72:28, open = phase === 'success' && onTarget;
      return (open?prop(guests[round],x,43,26,39,'la-pop-in'):'')+
        letter(v,'letter-crate',x,65,43,48,open?'la-crate la-open':'la-crate');
    });
  }
  function beam() {
    const light='<span class="la-beam-wrap '+(aim?'la-right':'la-left')+(phase==='success'?' la-bright':'')+'"><i></i></span>';
    return shape('la-lighthouse',50,51,41,77,light+pic('letter-tower'))+
      paired((v,i)=>fixedLabel(v,i?80:20,30))+
      prop('boat-blue',17,57,25,26,phase==='success' && !aim?'la-sail':'')+
      prop('boat-red',83,57,25,26,phase==='success' && aim?'la-sail':'')+
      controls('rotate','','转动灯头','↻',35,84,23,21,guided()&&slots()[aim]!==target())+
      controls('confirm','','打开灯光','☀',65,84,23,21,guided()&&slots()[aim]===target());
  }
  function train() {
    const moving = phase === 'success';
    return shape('la-track',50,48,98,5)+
      '<div class="la-train-group'+(moving?' la-depart':'')+'">'+prop('letter-engine',37,31,39,35)+
      (guided()||moving?fixedLabel(target(),41,28):'')+
      (moving?prop('letter-wagon',67,35,29,28)+prop(fruit[round],67,22,11,18):'')+'</div>'+
      paired((v,i)=>letter(v,'letter-wagon',i?73:27,75,42,35,'la-wagon',true));
  }
  function ice() {
    const heights = [72,54,36,18];
    const shore = [50,96];
    const path = installed.map((v,i)=>[roundSlots(i).indexOf(v)?72:28,heights[i]]);
    const [x,y] = path.at(-1)||shore;
    const [prevX,prevY] = path.at(-2)||shore;
    const fx = phase==='success'?'--hop-x:'+((prevX-x)/19*100)+'%;--hop-y:'+((prevY-y)/27*100)+'%':'';
    const dog = '<div class="la-item la-prop '+(phase==='success'?'la-hopper':'')+'" style="'+position(x,y-10,19,27)+';'+fx+'">'+pic('letter-everest')+'</div>';
    const trail = path.map(([px,py])=>prop('letter-ice',px,py,27,16)).join('');
    const choices = paired((v,i)=>letter(v,'letter-ice',i?72:28,heights[round],36,25,'la-floe'));
    return trail+(phase==='success'?'':choices)+dog;
  }
  function mail() {
    return paired((v,i,hit)=>{
      const x=i?73:27;
      return letter(v,'letter-mail',x,54,36,66,'la-post')+
        (hit&&phase==='success'?shape('la-envelope la-mailed',x-4,44,18,14):'');
    })+(phase==='success'?'':shape('la-envelope',50,84,23,19,'<i>♥</i>'));
  }
  function drums() {
    const beats = rounds[round].map((v,i)=>'<i class="'+(i<cursor?'done':'')+'">'+(coached()||hinted?v.toUpperCase():'♪')+'</i>').join('');
    return shape('la-music-score',50,24,50,20,beats)+paired((v,i)=>letter(v,'letter-drum',i?73:27,65,44,49,'la-drum'+(showAnswer===v?' la-strike':'')));
  }
  function balloons() {
    return paired((v,i,chosen)=>{
      const x = i?73:27, hit=phase==='success'&&chosen;
      return (hit?'':letter(v,'letter-balloon',x,36,35,54,'la-balloon '+(i?'la-azure':'')))+
        prop(fruit[round],x,hit?77:61,13,15,hit?'la-fruit-drop '+(i?'la-from-right':'la-from-left'):'');
    })+prop('letter-basket',50,84,33,28);
  }
  function keys() {
    const open=phase==='success';
    return prop(guests[round],50,30,28,38,open?'la-pop-in':'')+shape('la-fence '+(open?'la-open-gate':''),50,40,89,34,'<i></i><i></i>')+
      (phase==='turn'?button('turn','','转动锁孔',pic('letter-lock'),50,46,23,32,'la-keyhole',true):open?'':prop('letter-lock',50,46,23,32,'la-keyhole'))+
      (phase==='turn'?prop('letter-key',50,79,33,23,'la-carry'):paired((v,i)=>letter(v,'letter-key',i?73:27,81,39,24,'la-key')));
  }
  function garden() {
    const flowers = Array.from({length:4},(_,i)=>i<installed.length?prop('letter-flowers',28+i*15,28,18,27,i===round && phase==='success'?'la-bloom':''):shape('la-sprout',28+i*15,38,8,8,'<i></i>')).join('');
    return shape('la-bed',50,41,73,12)+flowers+paired((v,i)=>letter(v,'letter-pump',i?72:28,74,32,46,'la-pump'+(tapCount && v===target()?' la-working':'')))+
      (tapCount||phase==='success'?shape('la-water',slots().indexOf(target())?62:40,54,19,18,'<i>●</i><i>●</i><i>●</i>'):'');
  }
  function lift() {
    return shape('la-shaft',52,47,58,85)+paired((v,i)=>{
      const y=i?66:27;
      return shape('la-landing',63,y+11,37,6)+fixedLabel(v,77,y)+
        (phase==='success'&&aim===i?'':prop(guests[(round+i)%4],63,y-4,15,22));
    })+prop('letter-lift',42,aim?65:26,32,42,'la-cabin '+liftTravel)+
      (phase==='success'?prop(guests[(round+aim)%4],42,aim?66:27,16,22,'la-pop-in'):'')+
      controls('floor','0','上楼','↑',12,34,18,21,guided()&&aim!==0&&slots()[0]===target())+
      controls('floor','1','下楼','↓',12,64,18,21,guided()&&aim!==1&&slots()[1]===target())+
      controls('confirm','','开门接朋友','⇆',82,88,23,19,guided()&&slots()[aim]===target());
  }
  function frost() {
    return paired((v,i,chosen)=>{
      const clean=chosen&&(phase==='success'||tapCount);
      const inside = pic('letter-window')+pic(guests[(round+i)%4],'la-behind-window')+
        '<span class="la-frost '+(clean?(phase==='success'?'la-clear':'la-half-clear'):'')+'"></span>'+tag(v);
      return button('letter',v,'擦字母窗 '+v.toUpperCase(),inside,i?73:27,54,43,62,'la-pane',guided()&&chosen);
    });
  }
  function starChart() {
    if (phase!=='trace'&&phase!=='success') return paired((v,i)=>letter(v,null,i?72:28,52,31,38,'la-constellation'));
    const pts=starPoints[target()], order=strokes[target()];
    const coords = i=>pts[i].join(',');
    const skeleton=order.map(coords).join(' ');
    const lit=order.slice(0,star).map(coords).join(' ');
    const trace='<svg aria-hidden="true" class="la-lines" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="'+skeleton+'"/><polyline class="lit" points="'+lit+'"/></svg>';
    return '<div class="la-chart">'+trace+pts.map(([x,y],i)=>{
      const next=order[star]===i;
      return button('star',String(i),next?'下一颗闪亮的星星':'星星',next?'★':order.slice(0,star).includes(i)?'★':'✦',x,y,17,19,'la-star '+(next?'la-next-star':order.slice(0,star).includes(i)?'la-lit-star':''),next);
    }).join('')+'</div>';
  }
  const renderers={ab:bridge, cd:hide, ef:beam, gh:train, ij:ice, kl:mail, mn:drums, op:balloons, qr:keys, st:garden, uv:lift, wx:frost, yz:starChart};

  function draw() {
    world.dataset.phase=phase;
    stage.innerHTML=renderers[game]();
    const done=round+(phase==='success'?1:0);
    progress.setAttribute('aria-label','完成 '+done+' / 4');
    progress.innerHTML=Array.from({length:4},(_,i)=>'<i class="'+(i<done?'la-done':i===round?'la-now':'')+'"></i>').join('');
    const sample=guided() && phase==='choose' ? ' · '+target().toUpperCase() : '';
    world.querySelector('.la-message strong').textContent=phase==='success'?praise:note || cue()+sample;
    world.querySelector('.la-help').disabled=phase==='success'||phase==='beat';
  }
  function armHint() {
    clearTimeout(hintTimer);
    if (phase!=='choose' || guided()) return;
    hintTimer=window.setTimeout(()=>{ if(!disposed&&phase==='choose') hint(); },16000);
  }
  function hint() {
    if (phase==='success'||phase==='beat') return;
    if (!hinted) hintCount++;
    hinted=true;
    note='';
    draw(); replay();
  }
  function begin() {
    clearTimeout(hintTimer);
    phase='choose'; tapCount=0; cursor=0; star=0; liftTravel=''; missedReset();
    if (game==='ef'||game==='uv') aim=slots().indexOf(target())?0:1;
    draw();
    const opening = round === 0 ? ['letterIntro'+game.toUpperCase()] : round === 2 ? ['letterRequest'] : [];
    say([...opening,...rounds[round]]);
    armHint();
  }
  function missedReset() { misses=0; hintCount=0; hinted=false; note=''; showAnswer=''; }
  function retry() {
    misses++;
    if (misses>=2 && !hinted) { hinted=true; hintCount++; }
    note='再听一遍，慢慢找。';
    say(['letterRetry',...rounds[round].slice(cursor)]);
    draw(); armHint();
  }
  function substep(next,key) {
    phase=next; note=''; clearTimeout(hintTimer); draw(); say(key);
  }
  function success() {
    if (phase==='success'||disposed) return;
    clearTimeout(hintTimer);
    phase='success'; installed.push(target());
    record?.('letter-'+target(),{value:rounds[round].join(' '),independent:!coached()&&!hinted&&!misses,hints:hintCount,mistakes:misses});
    draw();
    const pronunciation = say(target());
    sound(game==='mn'?'act'+target().toUpperCase():undefined);
    // Accessible motion preferences shorten animation only. The transition waits
    // for the spoken feedback as well as the visual action to finish.
    const movement = new Promise(resolve=>{nextTimer=window.setTimeout(resolve,reducedMotion()?550:1400);});
    Promise.all([movement,pronunciation]).then(()=>{
      if(disposed) return;
      if (round===rounds.length-1) { dispose(); finish(); }
      else { round++; begin(); }
    });
  }
  function moveStar(v) {
    const route=strokes[target()];
    if (phase!=='trace'||Number(v)!==route[star]) return;
    star++; sound();
    if (star===route.length) success();
    else draw();
  }
  function choose(v) {
    if (phase!=='choose' || playingEcho) return;
    if (v!==target()) return retry();
    if (game==='ab') return substep('place','letterBridgePlace');
    if (game==='qr') return substep('turn','letterKeyTurn');
    if (game==='yz') return substep('trace','letterNextStar');
    if ((game==='st'||game==='wx') && tapCount===0) {
      tapCount=1; note=''; draw(); say(game==='st'?'letterPumpAgain':'letterWindowAgain'); sound(); return;
    }
    if (game==='mn' && cursor+1<rounds[round].length) {
      showAnswer=v; cursor++; phase='beat'; draw(); sound('act'+v.toUpperCase());
      nextTimer=window.setTimeout(()=>{if(disposed)return;phase='choose';showAnswer='';note='';draw();audioKeys=rounds[round].slice(cursor);armHint();},230);
      return;
    }
    success();
  }
  function click(e) {
    const el=e.target.closest('button[data-la]');
    if(!el||el.disabled||disposed||phase==='success'||phase==='beat')return;
    if(performance.now()<ignoreClickUntil && e.detail!==0) return;
    const {la,value}=el.dataset;
    if(la==='hint')return hint();
    if(la==='letter')return choose(value);
    if(la==='star')return moveStar(value);
    if(la==='place'&&phase==='place'||la==='turn'&&phase==='turn')return success();
    if(phase!=='choose')return;
    if(la==='rotate'||la==='floor'){
      const nextAim=la==='rotate'?1-aim:Number(value);
      liftTravel=la==='floor' && aim!==nextAim?(nextAim?'la-travel-down':'la-travel-up'):'';
      aim=nextAim;
      note=''; draw();
      // Moving the machine reads its position; replay always repeats the order.
      Promise.resolve(speak(slots()[aim])).catch(()=>{});
      audioKeys=['letterRequest',target()];
      sound('tap');
    } else if(la==='confirm'){
      if(slots()[aim]===target())success();else retry();
    }
  }
  function pointerDown(e) {
    const el=e.target.closest('[data-la]');
    if (!el || disposed || phase==='success' || (e.button!==undefined && e.button!==0)) return;
    if (game==='wx'&&el.dataset.la==='letter' || game==='yz'&&phase==='trace'&&el.dataset.la==='star') {
      strokeStart={x:e.clientX,y:e.clientY,v:el.dataset.value,id:e.pointerId,playing:false};
      if (game==='yz') moveStar(el.dataset.value);
    }
  }
  function pointerMove(e) {
    const stroke=strokeStart;
    if(!stroke||stroke.id!==e.pointerId||disposed) return;
    if (Math.hypot(e.clientX-stroke.x,e.clientY-stroke.y)<15) return;
    stroke.playing=true;
    if(game==='wx'){
      // A real wipe clears the panel in one stroke; tapping twice works as well.
      if(stroke.v===target())tapCount=1;
      choose(stroke.v); strokeStart=null; ignoreClickUntil=performance.now()+360;
    } else if(phase==='trace'){
      const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-la="star"]');
      if(el)moveStar(el.dataset.value);
    }
  }
  function pointerUp() {
    if(strokeStart?.playing)ignoreClickUntil=performance.now()+360;
    strokeStart=null;
  }
  function dispose() {
    if(disposed)return;
    disposed=true;
    clearTimeout(nextTimer);clearTimeout(hintTimer);
    world.removeEventListener('click',click);
    world.removeEventListener('pointerdown',pointerDown);
    window.removeEventListener('pointermove',pointerMove);
    window.removeEventListener('pointerup',pointerUp);
    window.removeEventListener('pointercancel',pointerUp);
    stopAudio?.();world.remove();
  }
  world.addEventListener('click',click);
  world.addEventListener('pointerdown',pointerDown);
  window.addEventListener('pointermove',pointerMove);
  window.addEventListener('pointerup',pointerUp);
  window.addEventListener('pointercancel',pointerUp);
  begin();
  return {dispose,replay};
}
