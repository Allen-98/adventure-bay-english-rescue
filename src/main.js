import './style.css';
import './mission.css';
import './rescue-look.css';
import { startMission } from './mission.js';
import { createAudio } from './audio.js';
import { harborView } from './harbor.js';
import { icon, crest } from './icons.js';

const missions = [
  {id:'letters', name:'雾里的鸭宝宝', tag:'字母救援', english:'A · B', cue:'两只鸭宝宝在浮台等船。帮路马点亮靠岸灯！', call:'dispatchLetters', badge:'浮台领航章', symbol:'anchor'},
  {id:'colors', name:'红蓝引航船', tag:'颜色救援', english:'Red · Blue', cue:'海湾里有两艘船。听路马的电台，给需要帮助的小船引航。', call:'dispatchColors', badge:'海湾引航章', symbol:'wave'},
  {id:'radio', name:'空中的小电台', tag:'句子救援', english:'The duck is…', cue:'天天从空中看不清乘客。用对讲机告诉她，小动物在哪里。', call:'dispatchRadio', badge:'电台指挥章', symbol:'radio'}
];
const key = 'adventure-bay-english-v1';
let stored;
try {stored=JSON.parse(localStorage.getItem(key));} catch {}
function cleanCount(v) {return Number.isSafeInteger(v) && v>0 ? v : 0;}
const save = {
  completed:Object.fromEntries(missions.map(m => [m.id,cleanCount(stored?.completed?.[m.id])])),
  muted:stored?.muted===true,
  history:Array.isArray(stored?.history) ? stored.history.slice(-15) : []
};
function persist(){try{localStorage.setItem(key,JSON.stringify(save));}catch{}}
const main=document.querySelector('#main');
const mast=document.querySelector('#mast');
const book=document.querySelector('#book');
const audio=createAudio();
audio.setMuted(save.muted);
const art=name=>window.rescueAsset?.('art/'+name+'.webp') ?? './art/'+name+'.webp';
const image=(name, cls='',alt='')=>'<img draggable="false" class="'+cls+'" src="'+art(name)+'" alt="'+alt+'">';
let stage='home', current=null, world=null, run=null, launchTimer=0, returnFocus=null;
let notes=[];
const progress=()=>missions.filter(m=>save.completed[m.id]>0).length;
const next=()=>missions.find(m=>!save.completed[m.id]) || missions[0];
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function discard() {
  clearTimeout(launchTimer);launchTimer=0;
  run?.dispose(); run=null;
  world?.dispose();world=null;
  audio.stop();
}
function soundButton(){
  return '<button class="round-control" data-ui="sound" aria-label="'+(save.muted?'打开声音':'关闭声音')+'" aria-pressed="'+(!save.muted)+'">'+icon(save.muted?'mute':'sound')+'</button>';
}
function header(){
  const inGame=stage!=='home';
  mast.innerHTML='<div class="mast-inner"><div class="identity">'+crest+'<span><b>冒险湾救援队</b><small>ADVENTURE BAY</small></span></div>'+
    (inGame ? '<div class="header-context">'+current.name+'</div>' : '')+
    '<div class="hud">'+(inGame ? '<button class="head-btn" data-ui="home">'+icon('home')+'<span>回到基地</span></button>' : '<button class="head-btn journal" data-ui="book">'+icon('book')+'<span>救援手册</span></button>')+
    (stage==='mission'||stage==='dispatch'?'<button class="round-control" data-ui="replay" aria-label="再听一次">'+icon('listen')+'</button>':'')+soundButton()+'</div></div>';
}
function preview(id) {
  if(id==='letters')return '<span class="thumb is-letters"><span class="card-buoy">'+image('buoy')+'<b>A</b></span>'+image('duck','card-duck')+'</span>';
  if(id==='colors')return '<span class="thumb is-colors">'+image('boat-blue','tiny-blue')+image('boat-red','tiny-red')+'<i class="waterline"></i></span>';
  return '<span class="thumb is-radio"><i class="radio-wave"></i>'+image('skye','card-skye')+'</span>';
}
function harborBell() {
  const hero=main.querySelector('.hero');
  if(!hero || !save.completed.letters) return;
  audio.effect('bell');
  const ducks=hero.querySelector('.bay-ducks');
  ducks.getAnimations().forEach(animation=>animation.cancel());
  ducks.animate(reduced()?[{opacity:1},{opacity:1}]:[
    {opacity:0,transform:'translate(-75%, 10px)'},
    {opacity:1,transform:'translate(-30%, -4px)',offset:0.22},
    {opacity:1,transform:'translate(12%, 2px)',offset:0.82},
    {opacity:0,transform:'translate(30%, 5px)'}
  ],{duration:reduced()?1300:2600});
}
function home() {
  discard(); stage='home';current=null;header();window.scrollTo(0,0);
  main.innerHTML='<section class="hero"><div class="harbor-stage" aria-hidden="true"><div class="hero-wash"></div></div><div class="hero-inner"><div class="chapter"><span class="live-dot"></span>第一章<span class="chapter-line"></span>冒险湾码头</div>'+
    '<h1>冒险湾<br><em>英文救援队</em></h1><p>队长，和路马一起去码头救援吧！</p><button class="go" data-ui="play">'+icon('radio')+'接听呼叫'+icon('arrow')+'</button></div>'+
    (save.completed.letters ? '<div class="bay-ducks" aria-hidden="true">'+image('duck')+image('duck')+'</div><button class="harbor-bell" data-ui="bell">'+icon('bell')+'和小鸭打招呼</button>' : '<div class="call-sign">'+icon('anchor')+'水上救援犬 · 路马</div>')+'</section>'+
    '<section class="missions"><div class="section-title"><div><span class="board-flag">'+icon('flag')+'</span><h2>码头任务</h2></div><button class="book-progress" data-ui="book">'+icon('medal')+'救援徽章 <b>'+progress()+' / 3</b></button></div><div class="cards">'+missions.map(m =>
    '<button class="mission-card" data-mission="'+m.id+'">'+preview(m.id)+'<span class="card-copy"><span class="card-tag">'+m.tag+'</span><strong>'+m.name+'</strong><small lang="en">'+m.english+'</small></span><span class="card-next">'+icon(save.completed[m.id]?'check':'chevron')+'</span></button>').join('')+'</div></section>';
  main.querySelector('.missions').style.setProperty('--bay-postcard','url("'+art('harbor')+'")');
  world=harborView(main.querySelector('.harbor-stage'),art,reduced());
}
function dispatch(m){
  discard();stage='dispatch';current=m;notes=[];header();window.scrollTo(0,0);
  main.innerHTML='<section class="call-scene"><div class="harbor-stage"></div><div class="call-layout"><div class="dispatch-card"><div class="incoming"><span class="live-dot"></span>码头来电</div><div class="dispatch-avatar">'+image(m.id==='radio'?'skye':'zuma')+'</div><h1>'+m.name+'</h1><p>'+m.cue+'</p><button class="go" data-ui="launch">'+icon('flag')+'出动！'+icon('arrow')+'</button></div></div></section>';
  world=harborView(main.querySelector('.harbor-stage'),art,reduced());
  audio.speak(m.call);
}
function launch(){
  if(stage!=='dispatch'||launchTimer) return;
  const button=main.querySelector('[data-ui=launch]');button.disabled=true;
  audio.stop();audio.effect('launch');world.sail();
  launchTimer=window.setTimeout(()=>{launchTimer=0;field();},reduced()?60:700);
}
function field(){
  discard();stage='mission';header();main.innerHTML='<section id="field" aria-label="救援现场"></section>';
  run=startMission({id:current.id,root:main.firstElementChild,art,saved:{completed:{...save.completed},visits:save.completed[current.id]},speak:key=>audio.speak(key),stopAudio:()=>audio.stop(),finish:finishMission,
    record:(key,detail)=>notes.push({key,value:String(detail?.value||''),independent:detail?.independent===true})});
}
function finishMission(){
  if(stage!=='mission')return;
  discard();stage='done';save.completed[current.id]++;
  save.history.push({id:current.id,actions:notes.length,independent:notes.filter(n=>n.independent).length,last:notes.at(-1)});
  save.history=save.history.slice(-15);persist();header();
  main.innerHTML='<section class="done-view"><div class="done-card"><span class="badge big">'+icon(current.symbol)+'</span><p class="done-caption">救援完成</p><h1>'+current.badge+'</h1><p>谢谢你，队长！这枚徽章已经收进救援手册。</p><button class="go" data-ui="home">'+icon('home')+'回到基地</button><button class="quiet" data-ui="again">'+icon('replay')+'再玩一次</button></div></section>';
  main.querySelector('.done-view').style.backgroundImage='url("'+art('harbor')+'")';audio.speak('missionDone');
}
function openBook(){
  returnFocus=document.activeElement;
  const last=save.history.at(-1);
  const lastMission=missions.find(m=>m.id===last?.id);
  book.innerHTML='<div class="book-top"><span>'+icon('book')+'队长的救援手册</span><button class="round-control" data-ui="close" aria-label="关闭手册">'+icon('close')+'</button></div><h2>我的救援徽章</h2><p>完成码头任务，把这次出勤的徽章带回家。</p><div class="badge-row">'+missions.map(m=>'<div class="badge-item '+(save.completed[m.id]?'earned':'')+'"><span class="badge">'+icon(m.symbol)+'</span><b>'+m.badge+'</b><small>'+ (save.completed[m.id]?'已完成 '+save.completed[m.id]+' 次':'等待出勤')+'</small></div>').join('')+'</div><div class="parent-note"><b>陪玩小记</b><p>'+(lastMission?'上次玩了《'+lastMission.name+'》，记录了 '+cleanCount(last.actions)+' 次任务行动，其中 '+cleanCount(last.independent)+' 次独立完成。':'可以先陪孩子听一次电台，再让他自己选。点耳机能重听当前线索。')+'</p></div>';
  book.showModal();
  if (lastMission && last?.last?.value) {
    const text=book.querySelector('.parent-note p');
    text.textContent='上次在《'+lastMission.name+'》里，'+ (last.id==='radio'?'孩子发出了“'+last.last.value+'”':'孩子最后选中了 '+last.last.value)+'。'+(last.last.independent?'这一步没有触发额外提示。':'这一步有示范、提示或再次尝试。');
  }
}
document.addEventListener('click',e=>{
  if(e.target===book){const r=book.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)book.close();return;}
  const btn=e.target.closest('button');if(!btn)return;
  if(btn.dataset.mission){audio.unlock();dispatch(missions.find(m=>m.id===btn.dataset.mission));return;}
  const action=btn.dataset.ui;if(!action)return;
  audio.unlock();
  if(action==='play')dispatch(next());
  if(action==='launch')launch();
  if(action==='home')home();
  if(action==='again')dispatch(current);
  if(action==='book')openBook();
  if(action==='bell')harborBell();
  if(action==='close')book.close();
  if(action==='replay'){if(stage==='mission')run?.replay();else if(stage==='dispatch')audio.speak(current.call);}
  if(action==='sound'){save.muted=!save.muted;audio.setMuted(save.muted);persist();header();mast.querySelector('[data-ui=sound]').focus({preventScroll:true});if(!save.muted){if(stage==='home')audio.speak('intro');else if(stage==='mission')run?.replay();else if(stage==='dispatch')audio.speak(current.call);}}
});
book.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.stop();});
home();
