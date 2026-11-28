import './vocabulary-scenes.css';
import {cap,familyNames,listeningRounds,palette,topics,wordArt,wordAudio,workshops} from './word-lessons.js';

const handles={flag:'pullFlag',kite:'flyKite',scale:'pressScale',juice:'pressBlender',cool:'closeCooler',photo:'takePhoto',gift:'pickGift'};
const fruitColors={grape:'#854daa',strawberry:'#e96578'};

export function startVocabulary({lesson,root,art,saved,speak,stopAudio,effect,record,finish}){
  const {words,review=false,topic}=lesson;
  const station=workshops[lesson.id], {mode}=station;
  const rounds=listeningRounds(words,review), seen=new Set(), delivered=[];
  let layout=saved.visits%2?[...words].reverse():[...words];
  let phase='explore',round=0,tries=0,selected='',feedback='',lastSpeech=[],disposed=false;
  let pointerStart=null;

  function say(keys){lastSpeech=Array.isArray(keys)?keys:[keys];return speak(lastSpeech);}
  function replay(){if(!disposed)return speak(lastSpeech);}
  function nameKey(word){return wordAudio(topic,word);}
  function request(word){
    if(mode==='gift' || mode==='ticket')return 'gift'+cap(word);
    if(topic==='family')return 'family'+cap(word);
    if(['serve','juice'].includes(mode))return 'order'+cap(word);
    return nameKey(word);
  }
  function image(name,css=''){return '<img class="'+css+'" src="'+art(name)+'" alt="" draggable="false">';}
  function colored(word,shape){
    return '<i class="swatch '+shape+'" aria-hidden="true" style="--swatch:'+palette[word]+'"><i></i></i>';
  }
  function picture(word,mini=false){
    if(topic==='color')return colored(word,{flag:'signal-flag',kite:'ws-kite',lamp:'ws-lamp',ring:'life-ring'}[mode]);
    return image(wordArt(topic,word),mini?'receipt-img':'object-art');
  }
  function option(word){
    const teaching=phase==='explore' && seen.has(word);
    const hit=selected===word && ['operate','moving','done'].includes(phase);
    let decoration='';
    if(mode==='tree')decoration=image(word==='banana'?'word-banana-plant':'word-apple-tree','ws-plant');
    if(mode==='ticket'&&hit)decoration=image('word-ticket','ws-given');
    if(mode==='gift'&&hit)decoration=image('word-gift','ws-given');
    if(mode==='photo'&&hit)decoration='<i class="ws-corners"></i>';
    const label=teaching?(topic==='family'?familyNames[word]+' · '+cap(word):cap(word)):hit?'✓':'♪';
    const enabled=['explore','identify'].includes(phase);
    return '<button class="vocab-object'+(hit?' picked':'')+(teaching?' learned':'')+'" data-word="'+word+'" aria-label="'+cap(word)+'" '+(enabled?'':'disabled')+'>'+
      decoration+picture(word)+'<span class="word-label">'+label+'</span></button>';
  }
  function workshop(){
    const active=phase==='operate'||phase==='arm';
    const landed=!!selected && ['moving','done'].includes(phase);
    const loaded=!!selected && (landed||phase==='operate');
    let prop=station.prop;
    if(mode==='cool' && landed)prop='word-cooler-lid';
    if(mode==='serve')prop=round%2?'cat':'duck';
    const item=selected||delivered.at(-1);
    let detail='';
    if(mode==='flag')detail='<i class="ws-rope"></i>'+(landed?'<i class="ws-lifted">'+picture(item,true)+'</i>':'');
    if(mode==='kite' && landed)detail='<i class="ws-flying">'+picture(item,true)+'</i>';
    if(mode==='lamp' && landed)detail='<i class="ws-beam" style="--swatch:'+palette[item]+'"></i>'+image('boat-blue','ws-sailing');
    if(mode==='ring' && landed)detail='<i class="ws-thrown">'+picture(item,true)+'</i>';
    if(mode==='tree' && landed)detail=image(wordArt(topic,item),'ws-catch');
    if(mode==='scale' && loaded)detail=image(wordArt(topic,item),'ws-weigh')+(landed?'<i class="ws-dial"></i>':'');
    if(mode==='juice' && loaded)detail=landed?'<i class="ws-juice" style="--juice:'+fruitColors[item]+'"></i>':image(wordArt(topic,item),'ws-blend');
    if(mode==='cool' && phase==='operate')detail=image(wordArt(topic,item),'ws-packed');
    if(mode==='serve' && landed)detail='<i class="ws-plate">'+picture(item,true)+'</i>';
    if(mode==='photo' && landed)detail='<i class="ws-print">'+picture(item,true)+'</i>';
    if(mode==='gift' && phase==='identify')detail='<i class="ws-hand">✓</i>';
    if(mode==='ticket' && landed)detail=image('boat-blue','ws-ticket-boat');
    if(mode==='party'&&landed)detail=image(wordArt(topic,item),'ws-seated');
    if(mode==='board'&&landed)detail=image(wordArt(topic,item),'ws-passenger');
    if(mode==='locate'&&landed)detail='<i class="ws-pin">⌖</i>'+image(wordArt(topic,item),'ws-harbor-target');
    const available=active?' data-vocab="operate" aria-label="'+station.act+'"':' disabled';
    const hold=mode==='gift'&&phase==='identify'?' ws-carrying':'';
    return '<button type="button" class="ws-machine'+(active?' ws-active':'')+(landed?' ws-landed':'')+hold+'"'+available+'>'+
      image(prop,'ws-prop')+detail+(active?'<b class="ws-use">☞ '+station.act+'</b>':'')+'</button>';
  }
  function prompt(){
    if(phase==='moving')return station.success;
    if(phase==='done')return '这一站的任务全部完成！';
    if(feedback==='retry')return '再听一下，找找它在哪里。';
    if(phase==='operate'||phase==='arm')return station.act+'。';
    if(phase==='explore')return seen.size===words.length?'都听过了，出发吧！':topic==='family'?'点一位家人，听米米介绍。':'摸一摸两边，听听它们的英文。';
    if(topic==='family')return '听米米说，这次是哪位家人？';
    return topic==='color'?'听电台，要找哪种颜色？':topic==='fruit'?'听一听，这次要哪种水果？':'听英语，找到它。';
  }
  function draw(){
    const focus=root.contains(document.activeElement)?document.activeElement.dataset.word:null;
    const speaker=topic==='family'?'family-mimi':topic==='fruit'?(round%2?'cat':'duck'):(mode==='kite'?'skye':'zuma');
    const cargo=delivered.map(w=>'<i class="cargo-item">'+picture(w,true)+'</i>').join('');
    root.innerHTML='<section class="vocab-scene ws-scene lesson-'+topic+' ws-'+mode+'" data-phase="'+phase+'" data-round="'+round+'">'+
      '<header class="vocab-heading">'+image(speaker,'mimi-portrait')+'<div><small>'+topics[topic].station+'</small><h2>'+lesson.name+'</h2></div></header>'+
      '<div class="ws-play"><div class="vocab-options">'+layout.map(option).join('')+'</div>'+workshop()+'</div>'+
      '<div class="vocab-footer">'+(phase!=='explore'?'<div class="delivery-progress"><div class="cargo">'+cargo+'</div><b>'+delivered.length+' / '+rounds.length+'</b></div>':'')+
      '<p aria-live="polite">'+prompt()+'</p>'+
      (phase==='explore' && seen.size===words.length?'<button class="go" data-vocab="listen">▶ 出发</button>':phase==='done'?'<button class="go" data-vocab="finish">★ 完成救援</button>':'')+'</div></section>';
    const backdrop={fruit:'station-orchard',family:'station-family'}[topic]||'harbor';
    root.firstElementChild.style.backgroundImage='linear-gradient(180deg,#19455c12,#f5f1cd0d 70%,#36514b2b),url("'+art(backdrop)+'")';
    if(focus)root.querySelector('[data-word="'+focus+'"]:not(:disabled)')?.focus({preventScroll:true});
  }
  function listen(first=false){
    phase=station.step==='arm'?'arm':'identify';feedback='';selected='';tries=0;
    layout=rounds[round].choices;draw();
    if(phase==='arm'){say('pickGift');return;}
    const cue=request(rounds[round].word);
    say(first?[station.voice,cue]:cue);
  }
  async function deliver(){
    phase='moving';feedback='';delivered.push(selected);draw();
    record('word-'+topic+'-'+selected,{value:cap(selected),independent:tries===0});
    const speech=say(nameKey(selected));
    effect?.(station.effect);
    await Promise.all([speech,new Promise(resolve=>setTimeout(resolve,900))]);
    if(disposed)return;
    if(round===rounds.length-1){phase='done';draw();say('thanks');return;}
    round++;listen();
  }
  function useMachine(){
    if(phase==='arm'){phase='identify';draw();say(request(rounds[round].word));return;}
    if(phase==='operate')deliver();
  }
  function choose(word){
    if(!layout.includes(word))return;
    if(phase==='explore'){
      const firstVisit=!seen.has(word);
      seen.add(word);draw();
      const cues=topic==='family'?['familyCn'+cap(word),'family'+cap(word),nameKey(word)]:[nameKey(word)];
      if(firstVisit && seen.size===words.length)cues.push('readyToHelp');
      say(cues);
      return;
    }
    if(phase!=='identify')return;
    const expected=rounds[round].word;
    if(word!==expected){tries++;feedback='retry';draw();say(['vocabRetry',request(expected)]);return;}
    selected=word;feedback='';
    if(station.step==='operate'){phase='operate';draw();say(handles[mode]);}
    else deliver();
  }
  function click(e){
    const b=e.target.closest('button');
    if(disposed||!b||b.disabled)return;
    if(b.dataset.vocab==='finish' && phase==='done'){dispose();finish();return;}
    if(b.dataset.vocab==='listen' && phase==='explore' && seen.size===words.length){
      rounds[0].choices=[...layout].reverse();listen(true);return;
    }
    if(b.dataset.vocab==='operate'){useMachine();return;}
    choose(b.dataset.word);
  }
  // The rope, kite and branches support gestures and a single tap on the same target.
  function gestureStart(e){
    const el=e.target.closest('button:not(:disabled)');
    if(!el)return;
    if(mode==='tree' && el.dataset.word || ['flag','kite'].includes(mode) && el.dataset.vocab==='operate'){
      pointerStart={id:e.pointerId,x:e.clientX,y:e.clientY,el};
    }
  }
  function gestureEnd(e){
    const start=pointerStart;pointerStart=null;
    if(!start || start.id!==e.pointerId || !root.contains(start.el))return;
    if(Math.hypot(e.clientX-start.x,e.clientY-start.y)<22)return;
    if(start.el.dataset.vocab==='operate')useMachine();
    else choose(start.el.dataset.word);
  }
  function gestureCancel(){pointerStart=null;}
  function dispose(){
    disposed=true;root.removeEventListener('click',click);
    root.removeEventListener('pointerdown',gestureStart);root.removeEventListener('pointerup',gestureEnd);
    root.removeEventListener('pointercancel',gestureCancel);stopAudio();
  }
  root.addEventListener('click',click);root.addEventListener('pointerdown',gestureStart);
  root.addEventListener('pointerup',gestureEnd);root.addEventListener('pointercancel',gestureCancel);
  if(review)listen(true);
  else {draw();say(topic==='family'?'familyTouch':topic==='fruit'?'fruitTouch':'vocabTouch');}
  return {replay,dispose};
}
