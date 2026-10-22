import test from 'node:test';
import assert from 'node:assert/strict';
import {compileTimeline,getDuration,poseAt,actions,emotions} from './storyboard.mjs';
const shot=(id,action='observe',duration=2,emotion='curious')=>({id,action,duration,emotion,caption:'测试故事'});
test('不同镜头时长连续拼接，没有间隙或重叠',()=>{
  const shots=[shot('a','observe',1),shot('b','jump',2.5),shot('c','celebrate',6)];
  const timeline=compileTimeline(shots);
  assert.equal(getDuration(shots),228);
  assert.deepEqual(timeline.map(s=>[s.from,s.to]),[[0,24],[24,84],[84,228]]);
});
test('全部动作首尾姿态衔接，后镜继承前镜的落点',()=>{
  const shots=Object.keys(actions).map((a,i)=>shot(String(i),a,1+i*.5));
  const timeline=compileTimeline(shots);
  for(let i=0;i<timeline.length;i++){
    const s=timeline[i],start=poseAt(s,0),end=poseAt(s,s.durationFrames-1);
    assert.ok(Math.abs(start.x-s.startX)<1e-9);
    assert.ok(Math.abs(end.x-s.endX)<1e-9,`${s.action} end`);
    assert.ok(Math.abs(end.y-500)<1e-9);
    if(i)assert.equal(s.startX,timeline[i-1].endX);
  }
});
test('插入失败影响下一次跳跃的出发点',()=>{
  const timeline=compileTimeline([shot('a','walk'),shot('b','fail'),shot('c','jump')]);
  assert.equal(timeline[0].endX,380);
  assert.equal(timeline[1].endX,355);
  assert.equal(timeline[2].startX,355);
  const mid=poseAt(timeline[1],24);
  assert.ok(mid.x>timeline[1].startX+100);
  assert.ok(mid.y<420);
});
test('重排改变后续路径，删除镜头重新累计时间',()=>{
  const a=compileTimeline([shot('a','hesitate'),shot('b','jump')]);
  const b=compileTimeline([shot('b','jump'),shot('a','hesitate')]);
  assert.equal(a[1].startX,190);
  assert.equal(b[0].startX,240);
  assert.equal(compileTimeline([shot('b','jump')])[0].from,0);
});
test('点亮状态跨镜头继承，重排后重新推导',()=>{
  assert.deepEqual(compileTimeline([shot('a','celebrate'),shot('b')]).map(s=>s.litBefore),[false,true]);
  assert.deepEqual(compileTimeline([shot('b'),shot('a','celebrate')]).map(s=>s.litBefore),[false,false]);
});
test('情绪影响身体姿态，同一帧可确定性重绘',()=>{
  const poses=Object.keys(emotions).map(emotion=>poseAt(compileTimeline([shot('a','observe',2,emotion)])[0],24));
  assert.equal(new Set(poses.map(p=>p.rotation)).size,5);
  assert.deepEqual(poses[0],poseAt(compileTimeline([shot('a')])[0],24));
});
test('最短和最长镜头所有帧有限，角色始终在舞台内',()=>{
  for(const duration of [1,6])for(const action of Object.keys(actions))for(const emotion of Object.keys(emotions)){
    const timeline=compileTimeline(Array.from({length:10},(_,i)=>shot(String(i),action,duration,emotion)));
    for(const s of timeline)for(let f=0;f<s.durationFrames;f++){
      const p=poseAt(s,f);
      assert.ok(Object.values(p).every(Number.isFinite));
      assert.ok(p.x>=130&&p.x<=1100);
    }
  }
});
test('组合动作在舞台边缘也不会越界或倒走',()=>{
  const timeline=compileTimeline([...Array.from({length:7},(_,i)=>shot(String(i),'jump')),shot('edge-fail','fail'),shot('retreat','hesitate'),shot('walk','walk')]);
  for(const s of timeline)for(let f=0;f<s.durationFrames;f++)assert.ok(poseAt(s,f).x<=1100);
  assert.ok(timeline.at(-1).endX>=timeline.at(-1).startX);
});
