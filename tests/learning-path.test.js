import assert from 'node:assert/strict';
import test from 'node:test';
import {existsSync} from 'node:fs';
import {chapters,missions,nextMission,unlocked,restoreProgress,applyCredits,chapterTasks} from '../src/learning-path.js';
import {newWordLessons,cap,wordArt,wordAudio,listeningRounds,workshops} from '../src/word-lessons.js';

test('fresh accounts may start any project, and each project unlocks one lesson at a time',()=>{
  const starts=['letters-ab','colors','spotter'];
  for(const chapter of chapters){
    const save=restoreProgress();
    assert.deepEqual(missions.filter(m=>unlocked(save,m.id)).map(m=>m.id),starts);
    assert.equal(unlocked(save,'unknown'),false);
    for(const [index,mission] of chapterTasks(chapter.id).entries()){
      assert.equal(nextMission(save,chapter.id),mission);
      assert.deepEqual(chapterTasks(chapter.id).filter(m=>unlocked(save,m.id)),chapterTasks(chapter.id).slice(0,index+1));
      save.completed[mission.id]++;
    }
    assert.equal(nextMission(save,chapter.id),undefined);
    for(const other of chapters.filter(c=>c.id!==chapter.id)){
      assert.deepEqual(chapterTasks(other.id).filter(m=>unlocked(save,m.id)),[chapterTasks(other.id)[0]]);
    }
  }
});

test('switching projects and replaying finished lessons preserves each frontier on reload',()=>{
  const save=restoreProgress();
  save.completed.spotter=2;
  save.completed.colors=1;
  save.lastChapter='sentences';
  const restored=restoreProgress(JSON.parse(JSON.stringify(save)));
  assert.equal(nextMission(restored).id,'picnic');
  assert.equal(nextMission(restored,'words').id,'flag-sun');
  assert.equal(nextMission(restored,'letters').id,'letters-ab');
  assert.equal(restored.completed.spotter,2);
  assert.ok(unlocked(restored,'spotter'));
  assert.equal(unlocked(restored,'radio'),false);
});

test('v1 free-play awards are carried forward, including ones a v3 migration omitted',()=>{
  const legacy={completed:{letters:2,colors:3,radio:2},muted:true,history:[{id:'letters'}]};
  for(const previous of [null,{version:3,completed:{'letters-ab':4},history:[{id:'colors'}]}]){
    const save=restoreProgress(previous,legacy);
    assert.equal(save.muted,previous?false:true);
    assert.equal(save.completed['letters-ab'],previous?4:2);
    assert.equal(save.completed.colors,3);
    assert.equal(save.lastChapter,previous?'words':'letters');
    assert.equal(save.credits.radio,2);
    assert.equal(save.completed.radio,0);
    assert.equal(unlocked(save,'radio'),false);
    save.completed.spotter=1;
    save.completed.picnic=1;
    applyCredits(save);
    assert.equal(save.completed.radio,2);
    assert.ok(unlocked(save,'radio'));
  }
  assert.equal(legacy.history[0].id,'letters');
});

test('a gap invalidates later completion flags only in that project',()=>{
  const save=restoreProgress({version:4,lastChapter:'missing',
    completed:{'letters-ab':1,'letters-yz':1,colors:2,spotter:1,radio:1},
    history:[null,42,{id:'missing'},{id:'colors'}],credits:{'letters-yz':99}});
  assert.equal(nextMission(save,'letters').id,'letters-cd');
  assert.equal(save.lastChapter,'words');
  assert.equal(save.completed.colors,2);
  assert.equal(save.completed.spotter,1);
  assert.equal(save.completed['letters-yz'],0);
  assert.equal(save.completed.radio,0);
  assert.deepEqual(save.credits,{});
});

test('v2 lessons earn credit behind inserted prerequisites in the corresponding project',()=>{
  const oldIds=[...chapterTasks('letters').map(m=>m.id),'colors','passengers','places','radio'];
  const old={version:2,completed:Object.fromEntries(oldIds.map(id=>[id,2]))};
  let save=restoreProgress(old);
  assert.equal(nextMission(save,'words').id,'flag-sun');
  assert.deepEqual(save.credits,{passengers:2,places:2,radio:2});
  for(const lesson of newWordLessons){
    assert.equal(nextMission(save,'words').id,lesson.id);
    save.completed[lesson.id]=1;
    applyCredits(save);
    save=restoreProgress(JSON.parse(JSON.stringify(save)));
  }
  assert.equal(save.completed.passengers,2);
  assert.equal(save.completed.places,2);
  assert.equal(nextMission(save,'words'),undefined);
  assert.equal(save.completed.radio,0);
  assert.deepEqual(save.credits,{radio:2});
});

test('v3 deferred awards survive reloads and the old radio award becomes available after the new introductions',()=>{
  const old={version:3,completed:{'letters-ab':2,colors:2},credits:{passengers:2,places:1,radio:3}};
  let save=restoreProgress(old);
  save.completed.spotter++;
  applyCredits(save);
  save=restoreProgress(JSON.parse(JSON.stringify(save)));
  assert.equal(nextMission(save,'sentences').id,'picnic');
  save.completed.picnic++;
  applyCredits(save);
  assert.deepEqual(save.credits,{passengers:2,places:1});
  assert.equal(save.completed.radio,3);
  assert.equal(nextMission(save,'sentences'),undefined);
  const allV3=restoreProgress({version:3,completed:Object.fromEntries(missions.map(m=>[m.id,2]))});
  assert.equal(nextMission(allV3,'letters'),undefined);
  assert.equal(nextMission(allV3,'words'),undefined);
  assert.equal(nextMission(allV3,'sentences').id,'spotter');
  assert.deepEqual(allV3.credits,{radio:2});
});

test('the alphabet pairs keep stable IDs and each has its own rescue briefing',()=>{
  const lessons=chapterTasks('letters');
  assert.equal(lessons.flatMap(m=>m.pair).join(''),'abcdefghijklmnopqrstuvwxyz');
  for(const field of ['name','cue','call','badge']){
    assert.equal(new Set(lessons.map(m=>m[field])).size,13);
  }
  for(const m of lessons)assert.equal(m.id,'letters-'+m.pair.join(''));
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

test('each vocabulary workshop has its own interaction and packaged props and voice cues',()=>{
  const lessons=chapterTasks('words').filter(m=>m.kind==='vocabulary');
  const assets=new URL('../public/',import.meta.url);
  const modes=new Set();
  for(const lesson of lessons){
    const station=workshops[lesson.id];
    assert.ok(station,lesson.id);
    assert.ok(!modes.has(station.mode),lesson.id);
    modes.add(station.mode);
    assert.ok(existsSync(new URL('art/'+station.prop+'.webp',assets)),station.prop);
    assert.ok(existsSync(new URL('audio/'+station.voice+'.mp3',assets)),station.voice);
  }
  for(const lesson of missions)assert.ok(existsSync(new URL('audio/'+lesson.call+'.mp3',assets)),lesson.id);
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
