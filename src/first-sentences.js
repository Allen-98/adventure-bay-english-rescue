import {icon} from './icons.js';
import './first-sentences.css';

const pictures={
  duck:   {art:'duck',        label:'a duck', key:'aDuck',  sentence:'seeDuck'},
  cat:    {art:'cat',         label:'a cat',  key:'aCat',   sentence:'seeCat'},
  apple:  {art:'fruit-apple', label:'apples', key:'apples', sentence:'likeApples'},
  banana: {art:'fruit-banana',label:'bananas',key:'bananas',sentence:'likeBananas'}
};

export function startFirstSentence({lesson,root,art,saved,speak,effect,stopAudio,record,finish}){
  const camera=lesson.id==='spotter';
  const options=camera?['duck','cat']:['apple','banana'];
  const targets=saved.visits%2?[...options].reverse():options;
  const frame=camera?'I see':'I like';
  const frameKey=camera?'seeFrame':'likeFrame';
  const help=camera?'spotterHelp':'picnicHelp';
  const discoveries=new Set();
  const delivered=[];
  let chosen='',tasted='',attempts=0,assisted=false,phase=camera?'compose':'taste',running=true;
  let cue=[help];
  const say=keys=>{cue=Array.isArray(keys)?keys:[keys];return speak(cue);};
  const img=(key,cls='')=>'<img class="'+cls+'" src="'+art(key)+'" alt="" draggable="false">';
  const target=()=>targets[delivered.length];
  const fullText=word=>frame+' '+pictures[word].label+'.';
  function photo(word){
    return '<span class="snap-print">'+img(pictures[word].art)+'<small>'+pictures[word].label+'</small></span>';
  }
  function view(){
    if(camera){
      const animal=chosen&&['sending','done'].includes(phase)?chosen:target();
      return '<button class="snap-lens" data-sentence="subject" aria-label="听听镜头里是谁" '+(phase==='compose'?'':'disabled')+'><i></i>'+img(pictures[animal].art,'snap-subject')+'<i></i><span>'+icon('sound')+'</span></button>';
    }
    const dish=chosen||tasted;
    return '<div class="picnic-cloth"><div class="picnic-plate">'+(dish?img(pictures[dish].art,'picnic-dish'):'')+'</div>'+img('zuma','picnic-host')+'</div>';
  }
  function draw(){
    const line=chosen?fullText(chosen):frame+' …';
    const done=phase==='done',sending=phase==='sending';
    const hint=done?(camera?'照片都收到了！':'野餐篮装好啦！'):
      sending?(camera?'咔嚓！天天拍到了。':'路马收到订单啦。'):
      phase==='taste'?'尝一尝两种水果，听听它们的名字。':
      attempts && !chosen?'看看镜头，再发一次消息。':
      chosen?'点对讲机，把这句话说给队友听。':
      camera?'镜头里是谁？点图片告诉天天。':'你喜欢哪一种？这次由你点单。';
    const choices=options.map(word=>{
      const picture=pictures[word];
      return '<button class="sentence-word" data-piece="'+word+'" aria-pressed="'+(chosen===word)+'" '+(done||sending?'disabled':'')+'>'+img(picture.art)+'<span>'+picture.label+'</span>'+(phase==='taste'&&discoveries.has(word)?'<i>✓</i>':'')+'</button>';
    }).join('');
    root.innerHTML='<section class="early-sentence '+(camera?'camera-task':'picnic-task')+'" data-phase="'+phase+'">'+
      '<div class="sentence-task-name">'+img(camera?'skye':'zuma')+'<div><small>句子救援</small><h2>'+lesson.name+'</h2></div></div>'+
      '<div class="sentence-world">'+view()+(camera?'<div class="snap-album">'+delivered.map(photo).join('')+'</div>':'')+'</div>'+
      '<div class="sentence-desk"><p aria-live="polite">'+hint+'</p>'+
      (done?'<div class="sentence-delivered">'+line+'</div><button class="go" data-sentence="finish">'+icon('medal')+'完成救援</button>':
      '<div class="sentence-strip"><button data-sentence="frame" aria-label="听句型 '+frame+'">'+icon('listen')+' '+frame+'</button><strong>'+ (chosen?pictures[chosen].label+'.':'…')+'</strong></div>'+
      '<div class="sentence-tray">'+choices+'<button class="sentence-send" data-sentence="send" aria-label="发送整句话" '+(!chosen||sending?'disabled':'')+'>'+icon('radio')+'<span>发送</span></button></div>')+'</div></section>';
    root.firstElementChild.style.setProperty('--station','url("'+art(camera?'harbor':'station-orchard')+'")');
  }
  async function click(event){
    const button=event.target.closest('button');
    if(!running || !button || button.disabled)return;
    const action=button.dataset.sentence;
    if(action==='finish' && phase==='done'){finish();return;}
    if(phase==='sending'||phase==='done')return;
    if(action==='subject'){assisted=true;say(pictures[target()].key);return;}
    if(action==='frame'){say(frameKey);return;}
    const word=button.dataset.piece;
    if(options.includes(word)){
      if(phase==='taste'){
        tasted=word;
        discoveries.add(word);
        if(discoveries.size===options.length)phase='compose';
        draw();say(phase==='compose'?[pictures[word].key,frameKey]:pictures[word].key);
      }else{
        chosen=word;draw();say([frameKey,pictures[word].key,'sayTogether']);
      }
      return;
    }
    if(action!=='send'||phase!=='compose'||!chosen)return;
    if(camera&&chosen!==target()){
      attempts++;chosen='';draw();say(['spotterHelp',pictures[target()].key]);return;
    }
    phase='sending';draw();
    record('sentence-'+lesson.id,{value:fullText(chosen),independent:attempts===0&&!assisted});
    const report=say(pictures[chosen].sentence);
    effect('bell');
    await Promise.all([report,new Promise(resolve=>setTimeout(resolve,700))]);
    if(!running)return;
    delivered.push(chosen);
    if(!camera || delivered.length===targets.length){
      phase='done';draw();
    }else{
      attempts=0;assisted=false;chosen='';phase='compose';draw();say([help,frameKey]);
    }
  }
  root.addEventListener('click',click);draw();say([help,frameKey]);
  return {
    replay(){if(phase!=='sending')return speak(cue);},
    dispose(){running=false;root.removeEventListener('click',click);stopAudio();}
  };
}
