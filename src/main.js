import './style.css';
import './mission.css';
import './rescue-look.css';
import { startMission } from './mission.js';
import { createAudio } from './audio.js';
import { harborView } from './harbor.js';
import { icon, crest } from './icons.js';

import { chapters, missions, restoreProgress, nextMission, unlocked, chapterTasks, saveKey, legacyKey } from './learning-path.js';
import { startVocabulary } from './vocabulary.js';
import './path.css';

function read(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}}
function load(){return restoreProgress(read(saveKey),read(legacyKey));}
let save=load();
function persist(){try{localStorage.setItem(saveKey,JSON.stringify(save));}catch{}}
const main=document.querySelector('#main');
const mast=document.querySelector('#mast');
const book=document.querySelector('#book');
const audio=createAudio();
audio.setMuted(save.muted);
// CSS custom properties resolve relative URLs against the compiled stylesheet.
// Provide a document-based URL so CSS backgrounds and image elements share the same art.
const art=name=>window.rescueAsset?.('art/'+name+'.webp') ?? new URL('art/'+name+'.webp',document.baseURI).href;
const image=(name, cls='',alt='')=>'<img draggable="false" class="'+cls+'" src="'+art(name)+'" alt="'+alt+'">';
let stage='home', current=null, world=null, run=null, launchTimer=0, returnFocus=null;
let notes=[];
const progress=()=>missions.filter(m=>save.completed[m.id]>0).length;
const next=()=>nextMission(save) || missions[0];
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
  if(!hero || !save.completed['letters-ab']) return;
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
function chapterCard(c,index){
  const tasks=chapterTasks(c.id);
  const first=tasks.find(m=>!save.completed[m.id])||tasks[0];
  const accessible=unlocked(save,first.id);
  const done=tasks.filter(m=>save.completed[m.id]).length;
  const state=accessible?(done===tasks.length?'已完成 · 可复习':'下一关 · '+first.name):['','完成 A–Z 后解锁','完成 3 个单词任务后解锁'][index];
  return '<button class="mission-card" data-mission="'+first.id+'" '+(accessible?'':'disabled')+'>'+preview(['letters','colors','radio'][index])+'<span class="card-copy"><span class="card-tag">阶段 '+(index+1)+' · '+done+'/'+tasks.length+'</span><strong>'+c.name+'</strong><small>'+state+'</small></span><span class="card-next">'+icon(accessible?'chevron':'lock')+'</span></button>';
}
function home() {
  discard(); stage='home';current=null;header();window.scrollTo(0,0);
  const active=next();
  main.innerHTML='<section class="hero"><div class="harbor-stage" aria-hidden="true"><div class="hero-wash"></div></div><div class="hero-inner"><div class="chapter"><span class="live-dot"></span>冒险湾码头<span class="chapter-line"></span>'+chapters.find(c=>c.id===active.chapter).name+'</div>'+
    '<h1>冒险湾<br><em>英文救援队</em></h1><p>'+(nextMission(save)?'本次出勤 · '+active.name:'全部救援完成，可以回到码头复习啦。')+'</p><button class="go" data-ui="play">'+icon('radio')+(progress()===0?'接听第一个呼叫':nextMission(save)?'继续救援':'复习字母')+icon('arrow')+'</button></div>'+
    (save.completed['letters-ab'] ? '<div class="bay-ducks" aria-hidden="true">'+image('duck')+image('duck')+'</div><button class="harbor-bell" data-ui="bell">'+icon('bell')+'和小鸭打招呼</button>' : '<div class="call-sign">'+icon('anchor')+'水上救援犬 · 路马</div>')+'</section>'+
    '<section class="missions"><div class="section-title"><div><span class="board-flag">'+icon('flag')+'</span><h2>学习路线</h2></div><button class="book-progress" data-ui="book">'+icon('book')+'全部任务 <b>'+progress()+' / '+missions.length+'</b></button></div><div class="cards">'+chapters.map(chapterCard).join('')+'</div><a class="game-hub" href="/games/" hidden>‹ 返回游戏项目</a></section>';
  main.querySelector('.game-hub').hidden=!['zhaocai7.cn','www.zhaocai7.cn'].includes(location.hostname);
  main.querySelector('.missions').style.setProperty('--bay-postcard','url("'+art('harbor')+'")');
  world=harborView(main.querySelector('.harbor-stage'),art,reduced());
}
function dispatch(m){
  if(!m || !unlocked(save,m.id)) return;
  if(book.open)book.close();
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
  const start=current.kind==='vocabulary'?startVocabulary:startMission;
  run=start({id:current.kind==='vocabulary'?current.id:current.kind,pair:current.pair,root:main.firstElementChild,art,saved:{completed:{...save.completed},visits:save.completed[current.id]},speak:key=>audio.speak(key),stopAudio:()=>audio.stop(),finish:finishMission,
    record:(key,detail)=>notes.push({key,value:String(detail?.value||''),independent:detail?.independent===true})});
}
function finishMission(){
  if(stage!=='mission')return;
  discard();stage='done';save.completed[current.id]++;
  save.history.push({id:current.id,actions:notes.length,independent:notes.filter(n=>n.independent).length,last:notes.at(-1)});
  save.history=save.history.slice(-15);persist();header();
  const after=missions[missions.indexOf(current)+1];
  main.innerHTML='<section class="done-view"><div class="done-card"><span class="badge big">'+icon(current.symbol)+'</span><p class="done-caption">救援完成</p><h1>'+current.badge+'</h1><p>'+(after?'下一关 · '+after.name:'队长完成了全部 '+missions.length+' 个任务！')+'</p>'+(after?'<button class="go" data-mission="'+after.id+'">'+icon('radio')+'接下一关</button>':'<button class="go" data-ui="home">'+icon('home')+'回到基地</button>')+'<button class="quiet" data-ui="again">'+icon('replay')+'再玩一次</button></div></section>';
  main.querySelector('.done-view').style.backgroundImage='url("'+art('harbor')+'")';audio.speak('missionDone');
}
function openBook(){
  returnFocus=document.activeElement;
  const last=save.history.at(-1);
  const lastMission=missions.find(m=>m.id===last?.id);
  const groups=chapters.map(c=>'<section class="path-group"><h3>'+c.name+' <small>'+c.summary+'</small></h3><div class="path-steps">'+chapterTasks(c.id).map(m=>'<button data-mission="'+m.id+'" '+(unlocked(save,m.id)?'':'disabled')+' class="'+(save.completed[m.id]?'earned':'')+'">'+icon(save.completed[m.id]?'check':unlocked(save,m.id)?'flag':'lock')+(m.kind==='letters'?m.english:m.name)+'</button>').join('')+'</div></section>');
  book.innerHTML='<div class="book-top"><span>'+icon('book')+'队长的救援手册</span><button class="round-control" data-ui="close" aria-label="关闭手册">'+icon('close')+'</button></div><h2>我的学习路线</h2><p>按顺序完成救援。已完成的任务可以随时重玩。</p>'+groups.join('')+'<div class="parent-note"><b>陪玩小记</b><p>从 A、B 开始，每次认识两个字母，再帮路马听音辨认。</p></div>';
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
window.addEventListener('storage',e=>{if(e.key!==saveKey)return;save=load();audio.setMuted(save.muted);if(stage==='home'){if(book.open)book.close();home();}});
book.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.stop();});
home();
