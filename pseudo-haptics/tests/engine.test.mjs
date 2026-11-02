import test from 'node:test';
import assert from 'node:assert/strict';
import { History, advanceWithZone, liftDisplay, projectLift, unwrapAngle } from '../engine.js';

for(const delay of [0,50,100,200,400,500])test(`${delay}ms: input is not applied before the deadline`,()=>{
  const h=new History(0,{x:0});h.push(1000,{x:1});if(delay)assert.equal(h.at(1000+delay-.001,delay).x,0);assert.equal(h.at(1000+delay,delay).x,1);
});
test('irregular samples preserve a short impulse and do not interpolate into the future',()=>{
  const h=new History(0,{x:0});h.push(47,{x:1});h.push(53,{x:0});assert.equal(h.at(146,100).x,0);assert.equal(h.at(147,100).x,1);assert.equal(h.at(152,100).x,1);assert.equal(h.at(153,100).x,0);
});
test('long idle input retains the previous anchor',()=>{const h=new History(0,{x:0});h.push(10,{x:2});h.push(20000,{x:4});assert.equal(h.at(20020,500).x,2);h.reset(19500,{x:9});assert.equal(h.at(20020,500).x,9);});
test('gain one preserves both axes',()=>{assert.deepEqual(advanceWithZone({x:200,y:200},500,120,1),{x:700,y:320});});
test('gain zone affects the y axis as well as the x axis',()=>{assert.deepEqual(advanceWithZone({x:500,y:200},0,200,.25),{x:500,y:250});});
test('one large crossing equals many small samples',()=>{
  for(const direction of [-1,1])for(const gain of [.2,.35,.5,1,1.5]){
    const start={x:direction>0?300:800,y:200};const big=advanceWithZone(start,direction*500,100,gain);let small={...start};for(let i=0;i<100;i++)small=advanceWithZone(small,direction*5,1,gain);
    assert.ok(Math.abs(big.x-small.x)<1e-6,`x ${direction} ${gain}: ${big.x}, ${small.x}`);assert.ok(Math.abs(big.y-small.y)<1e-6);
  }
});
test('entry and exit at exact zone boundaries use the correct gain',()=>{
  assert.equal(advanceWithZone({x:400,y:200},100,0,.5).x,450);assert.equal(advanceWithZone({x:400,y:200},-100,0,.5).x,300);
  assert.equal(advanceWithZone({x:660,y:200},100,0,.5).x,760);assert.equal(advanceWithZone({x:660,y:200},-100,0,.5).x,610);
});
test('gain never escapes the interaction bounds',()=>{const p=advanceWithZone({x:500,y:200},10000,-20000,.3);assert.ok(p.x<=970&&p.x>=30&&p.y>=70&&p.y<=490);});
test('lift-only mode follows delayed ascent and prevents upward jump during descent',()=>{
  assert.equal(liftDisplay(.8,.4,.3,1,true),.4);assert.equal(liftDisplay(.7,.5,.4,-1,true),.4);assert.equal(liftDisplay(.2,.7,.4,-1,true),.2);assert.equal(liftDisplay(.2,.7,.4,-1,false),.7);
});
test('hand and camera gains vary independently; baseline is hand1/view0',()=>{
  assert.deepEqual(projectLift(.5,.6,.3),{hand:.3,camera:.15});assert.deepEqual(projectLift(.5,1,0),{hand:.5,camera:0});assert.deepEqual(projectLift(.5,1,-.4),{hand:.5,camera:-.2});
});
test('rotation unwrapping crosses 180 degrees continuously',()=>{assert.ok(Math.abs(unwrapAngle(179*Math.PI/180,-179*Math.PI/180)-181*Math.PI/180)<1e-10);});
