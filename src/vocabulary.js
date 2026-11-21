const pairs={
  passengers:[['duck','Duck','wDuck'],['cat','Cat','wCat']],
  places:[['boat-blue','Boat','wBoat'],['dock','Dock','wDock']]
};

export function startVocabulary({id,root,art,saved,speak,stopAudio,record,finish}){
  const items=pairs[id];
  const seen=new Set();
  const order=Math.random()<.5?[0,1]:[1,0];
  let phase='explore',round=0,tries=0,lastSpeech=[],disposed=false,revision=0;
  let layout=saved.visits%2?[1,0]:[0,1];
  let feedback='';
  function say(keys){lastSpeech=keys;return speak(keys);}
  function replay(){if(!disposed)return speak(lastSpeech);}
  function draw(){
    const title=id==='passengers'?'给乘客报到':'寻找停靠点';
    const caption=phase==='explore'?'碰一碰两张图片，听听它们的名字。':phase==='ready'?'两张都听过了，再来听音找一找。':phase==='done'?'找齐了，按队徽交班。':'听电台，找到它就点一下。';
    root.innerHTML='<section class="vocab-scene"><div class="vocab-heading"><small>码头单词救援</small><h2>'+title+'</h2></div><div class="vocab-options">'+layout.map(i=>{
      const [img,name]=items[i];
      return '<button class="vocab-object" data-item="'+i+'" aria-label="'+name+'" '+(['ready','done','moving'].includes(phase)?'disabled':'')+'><img src="'+art(img)+'" alt=""><span>'+
        (phase==='explore'?(seen.has(i)?'✓ '+name:'♪'):phase==='done'?'✓':feedback==='hit'&&i===order[round]?'✓':'♪')+'</span></button>';
    }).join('')+'</div><div class="vocab-footer"><p aria-live="polite">'+(feedback==='retry'?'再听一次电台，试试看。':feedback==='hit'?'找到了！':caption)+'</p>'+
      (phase==='ready'?'<button class="go" data-vocab="listen">▶ 听电台</button>':phase==='done'?'<button class="go" data-vocab="finish">★ 完成救援</button>':'')+'</div></section>';
    root.firstElementChild.style.backgroundImage='url("'+art('harbor')+'")';
  }
  function listen(){phase='identify';feedback='';tries=0;draw();say(['vocabListen',items[order[round]][2]]);}
  async function click(e){
    const b=e.target.closest('button');
    if(disposed||!b||b.disabled)return;
    if(b.dataset.vocab==='finish' && phase==='done'){dispose();finish();return;}
    if(b.dataset.vocab==='listen' && phase==='ready'){layout.reverse();listen();return;}
    if(b.dataset.item===undefined)return;
    const i=Number(b.dataset.item);
    if(phase==='explore'){
      seen.add(i);if(seen.size===2)phase='ready';
      draw();say(items[i][2]);return;
    }
    if(phase!=='identify')return;
    if(i!==order[round]){tries++;feedback='retry';draw();say(['vocabRetry',items[order[round]][2]]);return;}
    const version=++revision;
    phase='moving';feedback='hit';draw();
    record('word-'+items[i][0],{value:items[i][1],independent:tries===0});
    await Promise.all([say(items[i][2]),new Promise(resolve=>setTimeout(resolve,600))]);
    if(disposed||revision!==version)return;
    if(round===1){phase='done';feedback='';draw();say('thanks');return;}
    round++;if(Math.random()<.5)layout.reverse();listen();
  }
  function dispose(){disposed=true;revision++;root.removeEventListener('click',click);stopAudio();}
  root.addEventListener('click',click);draw();say('vocabTouch');
  return {replay,dispose};
}
