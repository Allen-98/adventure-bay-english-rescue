import {newWordLessons} from './word-lessons.js';

export const chapters = [
  {id:'letters',name:'字母救援',summary:'听辨 A–Z',symbol:'anchor'},
  {id:'words',name:'单词救援',summary:'颜色、水果、家人和码头',symbol:'wave'},
  {id:'sentences',name:'句子救援',summary:'看见什么、喜欢什么、在哪里',symbol:'radio'}
];

const letterBriefs=[
  ['ab','木板救援桥','听字母选木板，把桥上的缺口补好，让小鸭过河。','修桥小能手','anchor'],
  ['cd','果园捉迷藏','掀开字母果箱，帮小狗找到藏起来的动物。','寻踪小能手','flag'],
  ['ef','雾灯转转台','转动灯头，对准字母开灯，给小船引航。','灯塔领航员','wave'],
  ['gh','果园小火车','为大写字母车头接上小写车厢，把水果送走。','小小列车长','flag'],
  ['ij','冰河脚印','走有指定字母的冰块，带狗狗一步步过河。','冰河向导','wave'],
  ['kl','小狗邮局','把小队的信投进听到的字母邮箱。','快乐邮递员','home'],
  ['mn','回声小乐队','先听再敲，用两面字母鼓把节奏回给小队。','节奏小鼓手','listen'],
  ['op','云朵水果篮','戳破字母气球，把飘走的水果接回篮子。','云朵采收员','medal'],
  ['qr','钥匙开门','找到字母钥匙，打开围栏让小动物出来。','小小开锁匠','lock'],
  ['st','花园喷水站','连压字母水泵，帮口渴的小花喝足水。','花园守护员','wave'],
  ['uv','升降救援队','开升降机，把平台停到指定字母楼层接朋友。','升降机队长','flag'],
  ['wx','雪窗擦擦乐','擦掉字母窗上的霜花，找到屋里的朋友。','雪地观察员','home'],
  ['yz','星空领航员','找到听到的字母星座，连起闪亮的小星星。','星空领航员','medal']
];
const letters=letterBriefs.map(([code,name,cue,badge,symbol])=>({
  id:'letters-'+code,kind:'letters',chapter:'letters',pair:[...code],
  english:[...code.toUpperCase()].join(' · '),name,cue,badge,symbol,
  call:'letterIntro'+code.toUpperCase(),tag:'字母救援'
}));
export const missions=[
  ...letters,
  {id:'colors',kind:'colors',chapter:'words',topic:'color',name:'红蓝引航船',english:'Red · Blue',cue:'听路马的电台，给指定颜色的船引航。',call:'dispatchColors',badge:'海湾引航章',symbol:'wave'},
  ...newWordLessons,
  {id:'passengers',kind:'vocabulary',chapter:'words',topic:'harbor',words:['duck','cat'],name:'给乘客报到',english:'Duck · Cat',cue:'认一认小鸭和小猫，再听英文帮乘客报到。',call:'dispatchPassengers',badge:'乘客接待章',symbol:'flag'},
  {id:'places',kind:'vocabulary',chapter:'words',topic:'harbor',words:['boat','dock'],name:'寻找停靠点',english:'Boat · Dock',cue:'路马需要熟悉停靠点，听英语找到小船和码头。',call:'dispatchPlaces',badge:'码头向导章',symbol:'anchor'},
  {id:'spotter',kind:'firstSentence',chapter:'sentences',name:'天天的观察相机',english:'I see a duck.',cue:'帮天天找一找小动物，用英语说说你看见了谁。',call:'dispatchSpotter',badge:'小小观察员章',symbol:'flag'},
  {id:'picnic',kind:'firstSentence',chapter:'sentences',name:'我的野餐订单',english:'I like apples.',cue:'挑一份喜欢的水果，用英语告诉伙伴，准备野餐。',call:'dispatchPicnic',badge:'野餐伙伴章',symbol:'medal'},
  {id:'radio',kind:'radio',chapter:'sentences',name:'空中的小电台',english:'The duck is…',cue:'把小乘客和它所在的地方连成一句话，告诉天天去哪里接它。',call:'dispatchRadio',badge:'电台指挥章',symbol:'radio'}
];

export const saveKey='adventure-bay-english-v4';
export const previousKey='adventure-bay-english-v3';
export const v2Key='adventure-bay-english-v2';
export const legacyKey='adventure-bay-english-v1';
const count=n=>Number.isSafeInteger(n)&&n>0?n:0;
export function chapterTasks(chapter){return missions.filter(m=>m.chapter===chapter);}

export function nextMission(save,chapter=save.lastChapter){
  return chapterTasks(chapter).find(m=>!save.completed[m.id]);
}

export function unlocked(save,id){
  const mission=missions.find(m=>m.id===id);
  if(!mission)return false;
  for(const task of chapterTasks(mission.chapter)){
    if(task.id===id)return true;
    if(!save.completed[task.id])return false;
  }
  return false;
}

// Apply previously earned awards only when this project's earlier lessons are complete.
export function applyCredits(save){
  for(const chapter of chapters){
    for(const {id} of chapterTasks(chapter.id)){
      if(save.credits[id]){
        save.completed[id]=Math.max(save.completed[id],save.credits[id]);
        delete save.credits[id];
      }
      if(!save.completed[id])break;
    }
  }
}

// Read each project in its original lesson order first. Inserted prerequisites may
// delay an earned award, whereas isolated flags beyond a gap in the old order are invalid.
function sourceOrder(chapter,version){
  if(version===2 && chapter==='words')return ['colors','passengers','places'];
  if(version<4 && chapter==='sentences')return ['radio'];
  return chapterTasks(chapter).map(m=>m.id);
}

export function restoreProgress(current,legacy){
  const version=[2,3,4].includes(current?.version)?current.version:1;
  const saved=version===1?legacy:current;
  const credits={};
  function award(id,value){
    const earned=count(value);
    if(earned)credits[id]=Math.max(credits[id]??0,earned);
  }
  if(version>1){
    for(const chapter of chapters){
      for(const id of sourceOrder(chapter.id,version)){
        const earned=count(saved.completed?.[id]);
        if(!earned)break;
        award(id,earned);
      }
    }
    if(version>=3){
      for(const id of ['passengers','places','radio'])award(id,saved.credits?.[id]);
    }
  }
  if(version<4){
    award('letters-ab',legacy?.completed?.letters);
    award('colors',legacy?.completed?.colors);
    award('radio',legacy?.completed?.radio);
  }
  const history=Array.isArray(saved?.history)?saved.history.slice(-18)
    .filter(entry=>entry && typeof entry==='object')
    .map(entry=>entry.id==='letters'?{...entry,id:'letters-ab'}:entry)
    .filter(entry=>missions.some(m=>m.id===entry.id)):[];
  const lastPlayed=missions.find(m=>m.id===history.at(-1)?.id)?.chapter;
  const lastChapter=chapters.some(c=>c.id===saved?.lastChapter)?saved.lastChapter:(lastPlayed??'letters');
  const completed=Object.fromEntries(missions.map(m=>[m.id,0]));
  const result={version:4,completed,credits,muted:saved?.muted===true,history,lastChapter};
  applyCredits(result);
  return result;
}
