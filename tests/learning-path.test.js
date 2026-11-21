import assert from 'node:assert/strict';
import test from 'node:test';
import {missions,nextMission,unlocked,restoreProgress} from '../src/learning-path.js';

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
