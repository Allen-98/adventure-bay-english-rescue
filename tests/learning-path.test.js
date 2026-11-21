import assert from 'node:assert/strict';
import test from 'node:test';
import {existsSync} from 'node:fs';
import {missions,nextMission,unlocked,restoreProgress,applyCredits,chapterTasks} from '../src/learning-path.js';
import {listeningRounds} from '../src/vocabulary.js';
import {newWordLessons,cap,wordArt,wordAudio} from '../src/word-lessons.js';

test('every new mission requires the full preceding path',()=>{
  const save=restoreProgress();
  assert.equal(missions.filter(m=>m.pair).flatMap(m=>m.pair).join(''),'abcdefghijklmnopqrstuvwxyz');
  for(const [index,mission] of missions.entries()){
    assert.equal(nextMission(save),mission);
    assert.deepEqual(missions.filter(m=>unlocked(save,m.id)),missions.slice(0,index+1));
    save.completed[mission.id]=1;
  }
  assert.equal(nextMission(save),undefined);
});

test('legacy free-play awards cannot skip the alphabet, vocabulary or sentences',()=>{
  const old={completed:{letters:2,colors:3,radio:2},muted:true};
  const save=restoreProgress(null,old);
  assert.equal(save.muted,true);
  assert.equal(save.completed['letters-ab'],2);
  assert.equal(nextMission(save).id,'letters-cd');
  assert.equal(unlocked(save,'colors'),false);
  assert.equal(save.completed.radio,0);
  assert.equal(old.completed.radio,2);
});

test('isolated completion flags after a missing prerequisite stay locked',()=>{
  const input={version:2,completed:{'letters-ab':1,'letters-yz':1,colors:1,radio:1}};
  const save=restoreProgress(input);
  assert.equal(nextMission(save).id,'letters-cd');
  assert.equal(save.completed.colors,0);
  assert.equal(unlocked(save,'radio'),false);
});

test('earned 0.2 awards survive the insertion of new lessons and unlock in sequence',()=>{
  const oldIds=missions.filter(m=>!newWordLessons.includes(m)).map(m=>m.id);
  const old={version:2,completed:Object.fromEntries(oldIds.map(id=>[id,2]))};
  let save=restoreProgress(old);
  assert.equal(nextMission(save).id,'flag-sun');
  assert.equal(unlocked(save,'radio'),false);
  assert.equal(save.credits.radio,2);
  for(const lesson of newWordLessons){
    assert.equal(nextMission(save).id,lesson.id);
    save.completed[lesson.id]=1;
    applyCredits(save);
    save=restoreProgress(JSON.parse(JSON.stringify(save)));
  }
  assert.equal(save.completed.radio,2);
  assert.equal(save.completed.places,2);
  assert.equal(nextMission(save),undefined);
  assert.deepEqual(save.credits,{});
});

test('the three reviews hear every target, with choices from different teaching pairs',()=>{
  assert.equal(chapterTasks('words').length,16);
  for(const lesson of newWordLessons.filter(l=>l.review)){
    const rounds=listeningRounds(lesson.words,true);
    assert.deepEqual(rounds.map(r=>r.word).sort(),[...lesson.words].sort());
    for(const r of rounds){
      assert.equal(r.choices.length,2);
      assert.ok(r.choices.includes(r.word));
      const other=r.choices.find(w=>w!==r.word);
      assert.notEqual(Math.floor(lesson.words.indexOf(other)/2),Math.floor(lesson.words.indexOf(r.word)/2));
    }
  }
});

test('all review words were introduced first and have the required recordings and images',()=>{
  const assets=new URL('../public/',import.meta.url);
  function asset(path){assert.ok(existsSync(new URL(path,assets)),path);}
  const learned={color:['red','blue'],fruit:[],family:[]};
  for(const lesson of newWordLessons){
    const {topic,words}=lesson;
    if(lesson.review)assert.deepEqual(words,learned[topic]);
    else{
      assert.equal(words.length,2);
      learned[topic].push(...words);
    }
    asset('audio/'+lesson.call+'.mp3');
    for(const word of words){
      asset('audio/'+wordAudio(topic,word)+'.mp3');
      const img=wordArt(topic,word);
      if(img)asset('art/'+img+'.webp');
      if(topic==='fruit')asset('audio/order'+cap(word)+'.mp3');
      if(topic==='family')for(const prefix of ['familyCn','family','gift'])asset('audio/'+prefix+cap(word)+'.mp3');
    }
  }
  for(const name of ['station-orchard','station-family','family-mimi'])asset('art/'+name+'.webp');
  assert.deepEqual(Object.values(learned).map(words=>new Set(words).size),[8,8,6]);
});
