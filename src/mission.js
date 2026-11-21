const glyphPaths = {
  waves: '<path d="M2 9c3 3 5 3 8 0 3 3 5 3 8 0 2 2 3 2 4 1M2 16c3 3 5 3 8 0 3 3 5 3 8 0 2 2 3 2 4 1"/>',
  radio: '<path d="m7 7 9-5M6 8h13v13H6zM9 12h7m-7 3h7m-7 3h3"/>',
  signal: '<circle cx="12" cy="12" r="2"/><path d="M7.5 7.5a6 6 0 0 0 0 9m9-9a6 6 0 0 1 0 9M4 4a11 11 0 0 0 0 16M20 4a11 11 0 0 1 0 16"/>',
  link: '<path d="m4 14 4-4a4 4 0 0 1 6 0m6 0-4 4a4 4 0 0 1-6 0m-2-1 8-2"/>',
  bell: '<path d="M5 17h14l-2-3v-4a5 5 0 0 0-10 0v4l-2 3ZM10 20c1 2 3 2 4 0M12 3V2"/>',
  bridge: '<path d="M2 18h20M5 18V7m14 11V7M5 9c4 4 10 4 14 0m-10 2v7m6-7v7"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  ear: '<path d="M5 12a7 7 0 1 1 12.6 4.3c-2.5 2-3 2.2-3.7 4.2-.9 2.5-5 2.3-5.7-.4M9 12a3 3 0 0 1 6 0c0 1.8-1 2.4-2 3"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  light: '<path d="M6 17h12l-1-5a5 5 0 0 0-10 0l-1 5ZM4 20h16M12 2v2M3 7l2 1m16-1-2 1"/>'
};

function glyph(name) {
  return '<svg class="ms-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + glyphPaths[name] + '</svg>';
}

const missionInfo = {
  letters: ['雾里的鸭宝宝', '路马'],
  colors: ['红蓝引航船', '路马'],
  radio: ['空中的小电台', '天天']
};
const sampleText = {red:'Red', blue:'Blue', duck:'The duck', cat:'The cat', is:'is', inBoat:'in the boat', onDock:'on the dock'};
const animalName = {duck:'小鸭', cat:'小猫'};
const placeName = {inBoat:'船里', onDock:'码头上'};
const sentenceKey = {
  duck: {inBoat:'duckBoat', onDock:'duckDock'},
  cat: {inBoat:'catBoat', onDock:'catDock'}
};

export function startMission({id, pair = ['a', 'b'], root, speak, stopAudio, finish, art, saved, record}) {
  if (!missionInfo[id]) throw new Error('Unknown mission: ' + id);
  if (id === 'letters' && (!Array.isArray(pair) || pair.length !== 2 || pair[0] === pair[1] || !pair.every(v=>typeof v === 'string' && /^[a-z]$/.test(v)))) {
    throw new Error('A letter lesson requires two different lowercase letters.');
  }
  const visits = Number(saved?.visits || 0);
  const world = document.createElement('section');
  world.className = 'ms-world ms-' + id;
  world.style.backgroundImage = 'url("' + art('harbor') + '")';
  world.style.setProperty('--buoy-art', 'url("' + art('buoy') + '")');
  root.replaceChildren(world);
  let finished = false;
  let phase = id === 'radio' ? 'compose' : id === 'colors' ? 'explore' : 'choose';
  let round = 0;
  let stepTimer, hintTimer;
  let actionVersion = 0;
  let slot = 0;
  let note = '';
  let mistakes = 0;
  let hints = 0;
  let showHint = false;
  let destination = '';
  let lastChoice = '';
  let crewX = 48;
  let previousCrewX = crewX;
  const knownColors = new Set();
  const aboard = new Set();
  const words = ['', '', ''];
  const radioMap = visits % 2 ? {cat:'inBoat', duck:'onDock'} : {duck:'inBoat', cat:'onDock'};
  const colors = visits % 2 ? ['blue', 'red'] : ['red', 'blue'];
  const reversePair = id === 'letters' ? [pair[1], pair[0]] : [];
  const practiceLanes = visits % 2 ? reversePair : pair;
  const listeningLanes = visits % 2 ? pair : reversePair;
  const letterCalls = id === 'letters' ? [...pair, ...(Math.random() < .5 ? pair : reversePair)] : [];
  let currentAudio = [];

  function image(name, className = '') {
    const img = document.createElement('img');
    img.src = art(name);
    img.alt = '';
    img.className = className;
    img.draggable = false;
    return img.outerHTML;
  }
  function cancelTimers() {
    clearTimeout(stepTimer);
    clearTimeout(hintTimer);
  }
  function narrate(keys) {
    currentAudio = Array.isArray(keys) ? keys : [keys];
    if (!finished) return Promise.resolve(speak(currentAudio.length === 1 ? currentAudio[0] : currentAudio)).catch(() => {});
    return Promise.resolve();
  }
  function replay() {
    if (!finished && currentAudio.length) narrate(currentAudio);
  }
  function schedule(delay, fn) {
    const version = actionVersion;
    clearTimeout(stepTimer);
    stepTimer = setTimeout(() => {
      if (!finished && version === actionVersion) fn();
    }, delay);
  }
  function transition() {
    cancelTimers();
    actionVersion++;
    showHint = false;
    note = '';
    lastChoice = '';
  }
  function setupHint() {
    clearTimeout(hintTimer);
    if (phase !== 'choose' && phase !== 'compose' && phase !== 'explore') return;
    const version = actionVersion;
    hintTimer = setTimeout(() => {
      if (version !== actionVersion || finished) return;
      hints++;
      showHint = true;
      draw();
    }, 20000);
  }
  function observe(key, value, coached = false) {
    record?.(key, {value, independent: !coached && hints === 0 && mistakes === 0, hints, mistakes});
    hints = 0;
    mistakes = 0;
  }
  function setReady() {
    transition();
    phase = 'bell';
    crewX = 50;
    draw();
    narrate('arrived');
  }
  function finishGame() {
    if (finished) return;
    dispose();
    finish();
  }
  function dispose() {
    if (finished) return;
    finished = true;
    actionVersion++;
    cancelTimers();
    stopAudio?.();
    world.removeEventListener('click', click);
    world.remove();
  }
  function target() {
    return id === 'letters' ? letterCalls[round] : [colors[0], colors[0], colors[1]][round];
  }
  function lanes() {
    if (id === 'letters') return round < 2 ? practiceLanes : listeningLanes;
    if (phase === 'explore' || round === 0) return ['red','blue'];
    return ['blue','red'];
  }
  function stageInstruction() {
    if (note) return note;
    if (phase === 'bell') return '小队到齐！按船铃回塔。';
    if (phase === 'board') return '找到啦！放下踏板接它上船。';
    if (phase === 'boarding') return '踏板放好啦，小伙伴正在上船。';
    if (phase === 'moving') {
      if (id === 'colors') return '引航灯亮了，小船正在靠岸。';
      return round < 2 ? '浮台的灯亮啦！' : '路马出发，靠岸接朋友！';
    }
    if (phase === 'look') return '天天去看看，听听现场回报。';
    if (id === 'letters') return round < 2 ? '听听 '+target().toUpperCase()+'，点亮它的浮台。' : '听电台，找到呼叫的浮台。';
    if (id === 'colors') return phase === 'explore' ? '点一点两艘船，听听颜色。' : '听请求，点亮那艘船的引航灯。';
    if (words.every(Boolean)) return '消息组好了，点对讲机发送。';
    return ['谁在等我们？先选一位小伙伴。','点连接词，把消息接起来。','它在哪里？选一个地点。'][slot];
  }
  function heroPanel() {
    const total = id === 'radio' ? 2 : 4;
    let progress = id === 'colors' ? (phase === 'explore' ? 0 : round + 1) : id === 'radio' ? aboard.size : round;
    if (phase === 'bell') progress = total;
    const dots = Array.from({length:total}, (_, i) => '<i class="' + (i < progress ? 'done' : i === progress ? 'now' : '') + '"></i>').join('');
    const label=id==='letters'?'字母浮台 · '+pair.join(' / ').toUpperCase():'冒险湾码头';
    return '<header class="ms-scene-head"><div class="ms-area-mark">' + glyph('pin') + '<span>'+label+'</span></div><h2>' + missionInfo[id][0] + '</h2><div class="ms-progress" aria-label="任务进度 ' + progress + ' / ' + total + '">' + dots + '</div></header>';
  }
  function speechLine() {
    return '<div class="ms-speech" aria-live="polite"><span class="ms-portrait">' + image(id === 'radio' ? 'skye':'zuma') + '</span><div><small>' + missionInfo[id][1] + ' · 现场电台</small><strong>' + stageInstruction() + '</strong></div></div>';
  }
  function letterWorld() {
    return '<div class="ms-lanes">' + lanes().map((v, i) => {
      const lit = phase === 'moving' && destination === v;
      const active = phase === 'choose';
      const guided = active && (round < 2 || showHint) && target() === v;
      const fog = round >= 2 && !lit && phase !== 'bell';
      const letter = v.toUpperCase();
      return '<button type="button" class="ms-buoy ms-lane ms-lane-' + i + (lit ? ' lit':'') + (guided ? ' guide':'') + (lastChoice === v ? ' inspect':'') + '" data-act="choose" data-v="' + v + '" aria-label="浮台 ' + letter + '"' + (!active?' disabled':'') + '><span class="ms-beam"></span><span class="ms-buoy-light"></span><b class="ms-letter">' + letter + '</b><span class="ms-float"><i></i></span>' + (fog ? '<i class="ms-mist"></i>' : !aboard.has(v) ? image('duck','ms-buoy-duck'):'') + '</button>';
    }).join('') + '</div>';
  }
  function colorWorld() {
    return '<div class="ms-lanes">' + lanes().map((v, i) => {
      const enabled = phase === 'choose' || phase === 'explore';
      const inspected = phase === 'explore' && knownColors.has(v);
      const guide = showHint && (phase === 'explore' ? !knownColors.has(v) : v === target());
      return '<button type="button" class="ms-color-boat ms-lane ms-lane-' + i + (guide?' guide':'') + (phase === 'moving' && destination === v ? ' sailing':'') + '" data-act="choose" data-v="' + v + '" aria-label="' + sampleText[v] + ' boat"' + (enabled?'':' disabled') + '>' + image('boat-' + v,'ms-hull') + '<span class="ms-boat-sound">' + glyph(inspected?'check':phase === 'explore'?'ear':'light') + '</span></button>';
    }).join('') + '</div>';
  }
  function radioWorld() {
    const boatActor = Object.keys(radioMap).find(key=>radioMap[key] === 'inBoat');
    const dockActor = Object.keys(radioMap).find(key=>radioMap[key] === 'onDock');
    function occupant(animal) {
      return aboard.has(animal) ? '' : image(animal,'ms-radio-animal');
    }
    const atBoat = destination === 'inBoat';
    const skyCamera = destination ? '<div class="ms-sky-camera '+ (atBoat?'to-boat':'to-dock') + '"><i class="ms-sky-beam"></i><span>' + image('skye') + '</span></div>' : '';
    return '<div class="ms-position-scene"><div class="ms-location ms-location-boat' + (atBoat?' spotlight':'') + '">' + image('boat-blue','ms-location-object') + occupant(boatActor) + image('boat-blue','ms-front-hull') + '</div><div class="ms-location ms-location-dock' + (destination === 'onDock'?' spotlight':'') + '">' + image('dock','ms-location-object') + occupant(dockActor) + '</div>' + skyCamera + '</div>';
  }
  function crew() {
    const riders = [...aboard].map((v,i)=>image(id === 'radio' ? v:'duck','ms-rider rider-' + i)).join('');
    const crewStyle = '--crew-x:' + crewX + '%;--crew-from:' + previousCrewX + '%';
    previousCrewX = crewX;
    return '<div class="ms-crew" style="' + crewStyle + '">' + image('zuma-boat','ms-crew-boat') + (id === 'colors'?'':riders) + '</div>';
  }
  const wordGroups = [['duck','cat'],['is'],['inBoat','onDock']];
  function wordIcon(v) {
    if (v === 'is') return glyph('link');
    if (v === 'inBoat') return image('boat-blue','ms-word-img');
    if (v === 'onDock') return image('dock','ms-word-img');
    return image(v,'ms-word-img');
  }
  function radioConsole() {
    const complete = words.every(Boolean);
    const chips = words.map((v,i)=>'<button type="button" class="ms-slot' + (slot===i?' current':'') + '" data-act="edit" data-v="' + i + '" aria-label="' + (v?'修改 '+sampleText[v]:'选择'+['动物','连接词','地点'][i]) + '">' + (v?wordIcon(v):'<i>'+['1','2','3'][i]+'</i>') + '<span>' + (v?sampleText[v]:['谁','连接','在哪里'][i]) + '</span></button>').join('');
    const bank = slot >= 3 ? '' : wordGroups[slot].map(v=>{
      const hint = showHint && (slot === 0 ? !aboard.has(v) : slot === 2 ? radioMap[words[0]] === v : true);
      return '<button type="button" class="ms-word' + (hint?' guide':'') + '" data-act="word" data-v="' + v + '">' + wordIcon(v) + '<strong>' + sampleText[v] + '</strong></button>';
    }).join('');
    return '<div class="ms-console"><div class="ms-console-line"><div class="ms-slots">' + chips + '</div><button type="button" class="ms-send" data-act="send" aria-label="发送电台消息"' + (complete?'':' disabled') + '>' + glyph('radio') + '<span>发送</span></button></div>' + (slot<3?'<div class="ms-bank">' + bank + '</div>':'') + '</div>';
  }
  function endButton() {
    if (!['bell','board'].includes(phase)) return '';
    return '<button type="button" class="ms-captain-action" data-act="' + phase + '">' + glyph(phase==='bell'?'bell':'bridge') + '<span>' + (phase==='bell'?'按船铃回塔':'放下踏板') + '</span></button>';
  }
  function draw() {
    if (finished) return;
    const prev = document.activeElement;
    const focusAction = world.contains(prev) ? prev.dataset.act : '';
    const focusValue = focusAction ? prev.dataset.v : '';
    world.dataset.phase = phase;
    world.dataset.round = round;
    world.innerHTML = heroPanel() + (id==='radio'?radioWorld():id==='colors'?colorWorld():letterWorld()) + crew() + '<div class="ms-controls">' + speechLine() + (id==='radio' && phase === 'compose' ? radioConsole() : endButton()) + '</div>';
    if (focusAction) {
      const selector = '[data-act="' + focusAction + '"]' + (focusValue === undefined ? '' : '[data-v="' + focusValue + '"]');
      world.querySelector(selector)?.focus({preventScroll:true});
    }
  }
  function playerChoose(v) {
    if (phase === 'explore') {
      transition();
      knownColors.add(v);
      note = knownColors.size === 1 ? '再碰碰另一艘船，听它叫什么。':'两种颜色都听过啦，准备引航！';
      narrate(v);
      draw();
      if (knownColors.size === 2) {
        phase = 'colorBrief';
        draw();
        schedule(1350, () => {
          transition(); phase = 'choose'; draw(); narrate(['colorListen', target()+'Boat']); setupHint();
        });
      } else setupHint();
      return;
    }
    if (phase !== 'choose') return;
    transition();
    lastChoice = v;
    if (v !== target()) {
      mistakes++;
      showHint = mistakes >= 2;
      if (showHint) hints++;
      note = id === 'letters' ? '看看这个浮台，再听一次呼叫。' : '看看这艘船，再听听船长的请求。';
      draw();
      narrate(id === 'letters' ? ['checkLetter', target()] : ['checkColor', target()+'Boat']);
      setupHint();
      return;
    }
    if (id === 'letters') observe('letter-'+v.toUpperCase(),v.toUpperCase(),round<2);
    else observe('color-'+v,sampleText[v]);
    phase = 'moving';
    destination = v;
    crewX = lanes().indexOf(v) === 0 ? 32 : 68;
    draw();
    narrate(v);
    schedule(1350, () => {
      if (id === 'letters' && round >= 2) aboard.add(v);
      if (round === (id === 'letters' ? 3 : 2)) return setReady();
      transition(); round++; phase = 'choose'; destination=''; crewX=50;
      draw();
      if (id === 'letters') narrate(round===2 ? ['cnTryLetter',target()] : target());
      else narrate(['colorListen', target()+'Boat']);
      setupHint();
    });
  }
  function wordSelected(v) {
    if (phase !== 'compose' || !wordGroups[slot]?.includes(v)) return;
    transition();
    words[slot] = v;
    slot = words.findIndex(w=>!w);
    if (slot < 0) slot = 3;
    draw();
    narrate(slot === 3 ? [v,'radioSend'] : v);
    setupHint();
  }
  function sendRadio() {
    if (phase !== 'compose' || !words.every(Boolean)) return;
    transition();
    const animal = words[0], where = words[2];
    const key = sentenceKey[animal][where];
    phase = 'look'; destination = where; crewX = where === 'inBoat' ? 31 : 68;
    draw();
    const version = actionVersion;
    const outcome = () => {
      transition();
      if (radioMap[animal] !== where || aboard.has(animal)) {
        mistakes++;
        phase = 'compose';
        if (aboard.has(animal)) { words[0]=''; slot=0; note='这位乘客已经上船啦，再找另一位。'; }
        else { words[2]=''; slot=2; note='现场和消息不一样，再看一眼。'; }
        destination=''; crewX=48;
        draw(); narrate(aboard.has(animal) ? 'otherAnimal' : 'radioCheck'); setupHint(); return;
      }
      observe('radio-message', sampleText[animal] + ' is ' + sampleText[where] + '.');
      phase = 'board';
      draw(); narrate('board');
    };
    Promise.all([narrate(key), new Promise(resolve => schedule(1250, resolve))]).then(() => {
      if (!finished && actionVersion === version) outcome();
    });
  }
  function board() {
    if (phase !== 'board') return;
    transition();
    phase = 'boarding';
    draw();
    const bounds = world.getBoundingClientRect();
    const actor = world.querySelector('.ms-location.spotlight .ms-radio-animal');
    const animal = actor.getBoundingClientRect();
    const vessel = world.querySelector('.ms-crew').getBoundingClientRect();
    const source = {x: animal.left + animal.width / 2, y: animal.top + animal.height * .89};
    const arrival = {x: vessel.left + vessel.width * .38, y: vessel.top + vessel.height * .65};
    const dx = source.x - arrival.x;
    const dy = source.y - arrival.y;
    const plank = document.createElement('div');
    plank.className = 'ms-boarding-plank';
    Object.assign(plank.style, {
      left: (arrival.x - bounds.left) + 'px', top: (arrival.y - bounds.top) + 'px',
      width: Math.hypot(dx,dy) + 'px'
    });
    plank.style.setProperty('--plank-angle', Math.atan2(dy,dx) + 'rad');
    const movingActor = actor.cloneNode();
    movingActor.className = 'ms-boarding-animal';
    actor.style.visibility = 'hidden';
    Object.assign(movingActor.style, {
      width: animal.width + 'px', height: animal.height + 'px', left: (animal.left - bounds.left) + 'px',
      top: (animal.top - bounds.top) + 'px'
    });
    movingActor.style.setProperty('--hop-x', -dx + 'px');
    movingActor.style.setProperty('--hop-y', -dy + 'px');
    world.append(plank,movingActor);
    narrate('thanks');
    schedule(1150, () => {
      aboard.add(words[0]); words.fill(''); slot=0; destination='';
      if (aboard.size === 2) return setReady();
      transition();
      phase='compose'; crewX=50; note='第一位上船啦！再给另一位发消息。';
      draw(); narrate('radioIntro'); setupHint();
    });
  }
  function click(event) {
    const button = event.target.closest('button[data-act]');
    if (!button || button.disabled || finished) return;
    const {act, v} = button.dataset;
    if (act==='choose') playerChoose(v);
    else if (act==='word') wordSelected(v);
    else if (act==='edit' && phase === 'compose') {
      const wanted = Number(v);
      const firstEmpty = words.findIndex(word=>!word);
      if (firstEmpty >= 0 && wanted > firstEmpty) { narrate('radioOrder'); return; }
      transition(); slot=wanted;
      draw(); narrate(words[slot] || 'radioOrder'); setupHint();
    }
    else if (act==='send') sendRadio();
    else if (act==='board') board();
    else if (act==='bell' && phase==='bell') finishGame();
  }
  world.addEventListener('click',click);
  draw();
  narrate(id === 'letters'?['cnPracticeLetter',target()]:id === 'colors'?'colorIntro':['radioIntro',sentenceKey.duck[radioMap.duck]]);
  setupHint();
  return {replay, dispose};
}
