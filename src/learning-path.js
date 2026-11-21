import {newWordLessons} from './word-lessons.js';

export const chapters = [
  {id:'letters',name:'字母救援',summary:'听辨 A–Z',symbol:'anchor'},
  {id:'words',name:'单词救援',summary:'颜色、水果、家人和码头',symbol:'wave'},
  {id:'sentences',name:'句子救援',summary:'组合电台消息',symbol:'radio'}
];

const alphabet='abcdefghijklmnopqrstuvwxyz';
const letters=Array.from({length:13},(_,i)=>{
  const pair=[...alphabet.slice(i*2,i*2+2)];
  const english=pair.join(' · ').toUpperCase();
  return {id:'letters-'+pair.join(''),kind:'letters',chapter:'letters',pair,english,
    name:'浮台 '+english,tag:'字母救援',cue:'这次值班负责 '+english+' 浮台。先认识字母，再听电台接小鸭。',
    call:'dispatchLetters',badge:english+' 领航章',symbol:'anchor'};
});
export const missions=[
  ...letters,
  {id:'colors',kind:'colors',chapter:'words',topic:'color',name:'红蓝引航船',english:'Red · Blue',cue:'听路马的电台，给指定颜色的船引航。',call:'dispatchColors',badge:'海湾引航章',symbol:'wave'},
  ...newWordLessons,
  {id:'passengers',kind:'vocabulary',chapter:'words',topic:'harbor',words:['duck','cat'],name:'给乘客报到',english:'Duck · Cat',cue:'认一认小鸭和小猫，再听英文帮乘客报到。',call:'dispatchPassengers',badge:'乘客接待章',symbol:'flag'},
  {id:'places',kind:'vocabulary',chapter:'words',topic:'harbor',words:['boat','dock'],name:'寻找停靠点',english:'Boat · Dock',cue:'路马需要熟悉停靠点，听英语找到小船和码头。',call:'dispatchPlaces',badge:'码头向导章',symbol:'anchor'},
  {id:'radio',kind:'radio',chapter:'sentences',name:'空中的小电台',english:'The duck is…',cue:'用学过的乘客和地点词组一条消息，告诉天天先接谁。',call:'dispatchRadio',badge:'电台指挥章',symbol:'radio'}
];

export const saveKey='adventure-bay-english-v3';
export const previousKey='adventure-bay-english-v2';
export const legacyKey='adventure-bay-english-v1';
const count=n=>Number.isSafeInteger(n)&&n>0?n:0;
export function restoreProgress(current,legacy){
  const old=![2,3].includes(current?.version);
  const saved=old?legacy:current;
  // The original prototype only covered A/B. Free-play word and sentence awards
  // stay in the original save and cannot satisfy the new sequential curriculum.
  const raw=old?{'letters-ab':saved?.completed?.letters}:saved?.completed;
  const credits={};
  const later=['passengers','places','radio'];
  if(current?.version===2){
    const oldOrder=[...letters.map(m=>m.id),'colors',...later];
    for(const id of oldOrder){
      if(!count(raw?.[id]))break;
      if(later.includes(id))credits[id]=count(raw[id]);
    }
  }else if(current?.version===3){
    for(const id of later)if(count(current.credits?.[id]))credits[id]=count(current.credits[id]);
  }
  let contiguous=true;
  const completed={};
  for(const m of missions){
    completed[m.id]=contiguous?count(raw?.[m.id]):0;
    if(!completed[m.id])contiguous=false;
  }
  const result={version:3,completed,credits,muted:saved?.muted===true,
    history:!old && Array.isArray(saved?.history)?saved.history.slice(-18):[]};
  applyCredits(result);
  return result;
}
export function applyCredits(save){
  for(const m of missions){
    if(save.credits[m.id]){save.completed[m.id]=Math.max(save.credits[m.id],save.completed[m.id]);delete save.credits[m.id];}
    if(!save.completed[m.id])break;
  }
}
export function nextMission(save){return missions.find(m=>!save.completed[m.id]);}
export function unlocked(save,id){
  const index=missions.findIndex(m=>m.id===id);
  return index>=0 && missions.slice(0,index).every(m=>save.completed[m.id]>0);
}
export function chapterTasks(chapter){return missions.filter(m=>m.chapter===chapter);}
