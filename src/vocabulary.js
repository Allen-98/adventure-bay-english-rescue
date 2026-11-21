import {cap,familyNames,palette,topics,wordArt,wordAudio} from './word-lessons.js';

function shuffled(values){
  const result=[...values];
  for(let i=result.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}

// Review pairs cross the original two-word lessons so each cue has a fresh comparison.
export function listeningRounds(words,review){
  const targets=shuffled(words);
  return targets.map(word=>{
    const group=Math.floor(words.indexOf(word)/2);
    const others=words.filter((other,i)=>other!==word && (!review || Math.floor(i/2)!==group));
    const comparison=others[Math.floor(Math.random()*others.length)];
    return {word,choices:shuffled([word,comparison])};
  });
}

export function startVocabulary({lesson,root,art,saved,speak,stopAudio,record,finish}){
  const {words,review=false,topic}=lesson;
  const meta=topics[topic];
  const rounds=listeningRounds(words,review);
  const seen=new Set();
  let layout=saved.visits%2?[...words].reverse():[...words];
  let phase=review?'identify':'explore',round=0,tries=0,lastSpeech=[],disposed=false;
  let selected='',feedback='';
  const delivered=[];

  function nameKey(word){return wordAudio(topic,word);}
  function say(keys){lastSpeech=Array.isArray(keys)?keys:[keys];return speak(lastSpeech);}
  function replay(){if(!disposed)return speak(lastSpeech);}
  function request(word){
    if(topic==='family')return 'gift'+cap(word);
    if(review && topic==='fruit')return 'order'+cap(word);
    return nameKey(word);
  }
  function picture(word,mini=false){
    if(topic==='color'){
      const shape=review?'life-ring':'signal-flag';
      return '<i aria-hidden="true" class="swatch '+shape+'" style="--swatch:'+palette[word]+'"></i>';
    }
    const source=art(wordArt(topic,word));
    return '<img class="'+(mini?'receipt-img':'object-art')+'" alt="" draggable="false" src="'+source+'">';
  }
  function prompt(){
    if(feedback==='retry')return '再听一遍，试试另一张。';
    if(feedback==='hit')return meta.result;
    if(phase==='done')return meta.done;
    if(phase==='identify')return {family:'听米米说，礼物要交给谁？',fruit:'听客人点单，把水果装进篮子。',color:review?'听报色，把救生圈送回队里。':'听电台报色，升起对应的旗子。',harbor:'听电台，找到它就点一下。'}[topic];
    if(seen.size===words.length)return '都认识了！准备好就接任务。';
    return {family:'点相册里的照片，听米米介绍家人。',fruit:'碰碰水果，听听它的英文名字。',color:'碰碰信号旗，听听它的颜色。',harbor:'点一点两张图片，听听它们的名字。'}[topic];
  }
  function draw(){
    const focused=root.contains(document.activeElement)?document.activeElement.dataset.word:null;
    const disabled=phase==='done'||phase==='moving';
    const family=topic==='family';
    const options=layout.map(word=>{
      const teaching=phase==='explore' && seen.has(word);
      const label=teaching?(family?familyNames[word]+' · '+cap(word):cap(word)):'♪';
      const hit=feedback==='hit' && selected===word;
      return '<button class="vocab-object '+(hit?'picked':'')+'" data-word="'+word+'" aria-label="'+cap(word)+'" '+(disabled?'disabled':'')+'>'+
        picture(word)+'<span class="word-label">'+(hit?'✓':label)+'</span></button>';
    }).join('');
    const status=phase==='explore'?'认识新词':review?'主题复习':'听音出勤';
    const cargo=delivered.map(w=>'<i class="cargo-item">'+picture(w,true)+'</i>').join('');
    const customer=topic==='fruit' && phase!=='explore'?(round%2?'cat':'duck'):null;
    const speaker=family?'family-mimi':customer;
    root.innerHTML='<section class="vocab-scene lesson-'+topic+(review?' is-review':'')+'" data-phase="'+phase+'" data-round="'+round+'">'+
      '<header class="vocab-heading">'+(speaker?'<img class="mimi-portrait" src="'+art(speaker)+'" alt="'+(family?'小兔米米':customer==='duck'?'小鸭客人':'小猫客人')+'">':'')+
      '<div><small>'+meta.station+' · '+status+'</small><h2>'+lesson.name+'</h2></div></header>'+
      '<div class="vocab-options">'+options+'</div><div class="vocab-footer">'+
      (phase!=='explore'?'<div class="delivery-progress"><div class="cargo">'+cargo+'</div><b>'+delivered.length+' / '+rounds.length+'</b></div>':'')+
      '<p aria-live="polite">'+prompt()+'</p>'+
      (phase==='explore' && seen.size===words.length?'<button class="go" data-vocab="listen">▶ '+meta.action+'</button>':phase==='done'?'<button class="go" data-vocab="finish">★ 完成救援</button>':'')+
      '</div></section>';
    const backdrop={fruit:'station-orchard',family:'station-family'}[topic]||'harbor';
    root.firstElementChild.style.backgroundImage='url("'+art(backdrop)+'")';
    if(focused)root.querySelector('[data-word="'+focused+'"]:not(:disabled)')?.focus({preventScroll:true});
  }
  function listen(first=false){
    phase='identify';feedback='';selected='';tries=0;
    layout=rounds[round].choices;
    draw();
    const cue=request(rounds[round].word);
    say(first?[topic==='family'?'familyOrder':'reviewListen',cue]:cue);
  }
  async function click(e){
    const b=e.target.closest('button');
    if(disposed||!b||b.disabled)return;
    if(b.dataset.vocab==='finish' && phase==='done'){dispose();finish();return;}
    if(b.dataset.vocab==='listen' && phase==='explore' && seen.size===words.length){
      // Both choices move from their teaching positions on the first listening turn.
      rounds[0].choices=[...layout].reverse();listen(true);return;
    }
    const word=b.dataset.word;
    if(!layout.includes(word))return;
    if(phase==='explore'){
      seen.add(word);draw();
      say(topic==='family'?['familyCn'+cap(word),'family'+cap(word),nameKey(word)]:nameKey(word));
      return;
    }
    if(phase!=='identify')return;
    const expected=rounds[round].word;
    if(word!==expected){tries++;feedback='retry';draw();say(['vocabRetry',request(expected)]);return;}
    phase='moving';selected=word;feedback='hit';delivered.push(word);draw();
    record('word-'+topic+'-'+word,{value:cap(word),independent:tries===0});
    await Promise.all([say(nameKey(word)),new Promise(resolve=>setTimeout(resolve,650))]);
    if(disposed)return;
    if(round===rounds.length-1){phase='done';feedback='';draw();say('thanks');return;}
    round++;listen();
  }
  function dispose(){disposed=true;root.removeEventListener('click',click);stopAudio();}
  root.addEventListener('click',click);
  if(review)listen(true);
  else{draw();say(meta.intro);}
  return {replay,dispose};
}
