import { TextureCursor, TEXTURE } from './texture.js';
import { History, clamp, liftDisplay, projectLift, unwrapAngle } from './engine.js';

const $ = id => document.getElementById(id);
const W = 1000, H = 560;
const C = { bg:'#0d1422', grid:'#2a3240', ink:'#f0f4f8', muted:'#7d8ba1', lime:'#00f2fe', orange:'#ffa16c', cyan:'#c084fc' };
const researchURL = 'https://www.amelab.vr.u-tokyo.ac.jp/research.html';
const DEMOS = {
  delay: {n:'01',title:'遅れてくるカーソル',en:'CURSOR DELAY',category:'TEMPORAL MAPPING',description:'マウスを止めても、カーソルが少し遅れてついてくる。動きの「重さ」は変わるでしょうか。',tip:'オレンジのカーソルで、円の的をクリック',try:'素早く左右に動かしてから止めてみましょう。最後に0msに戻して、感覚の違いを比べます。',overlay:'マウスを動かして、カーソルの遅れを体験。',trace:'左右の位置',tag:'基礎デモ',research:'動きと視覚フィードバックの関係',researchText:'手の運動と画面上の応答に時間のずれを加える、疑似触覚の基礎デモです。AMELabが扱う、手やアバターの見え方を操作する研究への導入として使えます。',url:researchURL,scope:'このカーソル課題は説明用に作成したものです。AMELabの論文中の課題を再現したものではなく、重さや抵抗の感じ方には個人差があります。',params:[{key:'delay',label:'カーソルの遅延',unit:'ms',min:0,max:400,step:10,value:100,presets:[0,50,100,200]}]},
  resistance: {n:'02',title:'テクスチャを感じるカーソル',en:'TEXTURE',category:'STICK & RELEASE',description:'白黒の縞を横切ると、境界でカーソルが一瞬止まり、再び動き出す。ガタガタした動きから、表面のテクスチャを感じるでしょうか。',tip:'白黒の縞を左右になぞり、効果あり／なしを比較',try:'一定の速さで縞を横切ってみましょう。「効果なし」では同じ縞の上を滑らかに動きます。Spaceを押している間も効果を外せます。',overlay:'白黒の縞をなぞって、テクスチャを体験。',trace:'左右の位置',tag:'基礎デモ / テクスチャ',research:'カーソルの動きから、表面の質感を考える',researchText:'白黒の縞の境界で短い停止と再開を繰り返し、表面の粗さや凹凸を視覚的な応答から感じさせるデモです。効果の有無で比較できます。',url:researchURL,scope:'移動距離を縮める倍率操作は行いません。境界で一時停止した後、入力位置に追いつきます。物理的な振動は発生せず、テクスチャの感じ方には個人差があります。',params:[]},
  cup: {n:'03',title:'持ち上げが遅れるカップ',en:'LIFT & DELAY',category:'ACTION PHASE',description:'カップを持ち上げるときの見え方を遅らせる。上げる動作と、下ろす動作を比べてみましょう。',tip:'画面内を押したまま上下にドラッグ',try:'上げる→止める→下ろす、を繰り返します。「持ち上げだけ」をオフにすると、下ろすときにも同じ遅延がかかります。',overlay:'押したまま上下にドラッグして、カップを持ち上げる。',trace:'持ち上げ高さ',tag:'関連研究 / 飲料体験',research:'ThickSipと、飲料体験のPseudo-haptics',researchText:'ThickSipは、VRでの手の見え方を操作して飲料体験を調べる研究です。このデモではカップの上下動に置き換え、持ち上げ中の時間的なずれを観察できます。',url:'https://doi.org/10.1145/3795011.3795026',scope:'飲用や口腔内の感覚、VRでの身体所有感は再現していません。研究条件そのものではなく、上昇・下降で視覚応答を変える説明用デモです。',params:[{key:'delay',label:'カップの遅延',unit:'ms',min:0,max:500,step:10,value:200,presets:[0,100,200,400]},{key:'liftOnly',label:'持ち上げだけ遅らせる',type:'toggle',value:true,note:'下ろす際は、上向きの跳びを防ぎながら入力の高さに合わせます。'}]},
  viewpoint: {n:'04',title:'視点が変える持ち上げ',en:'HAND × VIEWPOINT',category:'COUPLED MAPPING',description:'物体だけでなく、それを見る視点も動かす。手と背景の相対的な動きは、どう変わるでしょうか。',tip:'画面内を押したまま上下にドラッグ',try:'手の倍率を固定して、視点の倍率だけを変えてみましょう。床と物体の距離、画面上の持ち上がり方を見比べます。',overlay:'箱を持ち上げ、手と視点の倍率を比較。',trace:'手の上昇量',tag:'関連研究 / IEEE ISMAR 2025',research:'視点変化によるPseudo-haptics',researchText:'AMELabでは、仮想の手に加えて視点の上下移動も操作し、重さの知覚を変える研究を行っています。ここではマウスで箱を持ち上げながら、手と視点の倍率を独立に変更します。',url:'https://doi.org/10.1109/ismar67309.2025.00058',scope:'マウス操作を用いた投影図のデモです。頭部運動の計測やVR提示は行わず、元の実験の重さ知覚を再現・保証するものではありません。',params:[{key:'handGain',label:'手の移動倍率',unit:'×',min:.25,max:1.5,step:.05,value:.6,presets:[.5,1,1.5]},{key:'viewGain',label:'視点の移動倍率',unit:'×',min:-.5,max:.75,step:.05,value:.3,presets:[-.3,0,.3],note:'正：手と同じ方向に視点が上がる。負：逆方向に視点が動く。'}]},
  avatar: {n:'05',title:'手の回転とアバター',en:'AVATAR ROTATION',category:'BODY REPRESENTATION',description:'動かしたつもりの手と、見えている手の間に時間差がある。回転を切り返したときのずれを観察します。',tip:'押したまま左右にドラッグして、手を回す',try:'左右へ回し、止めてから反対向きに。入力ガイドを表示すると、入力とアバターの角度差を確認できます。',overlay:'押したまま左右にドラッグして、手の回転を操作。',trace:'回転角度',tag:'関連研究 / Scientific Reports 2022',research:'自己アバタの遅延と「ねじれ」の錯覚',researchText:'AMELabの関連研究では、手や腕の自己アバタの表示遅延が、ねじれの錯覚の方向に与える影響を調べています。このデモは、回転操作とアバター表示の時間差を可視化します。',url:'https://doi.org/10.1038/s41598-022-10543-y',scope:'マウスの左右移動を手の回転に対応付けた視覚デモです。腱への振動刺激は行わないため、研究で扱った運動錯覚そのものは再現しません。',params:[{key:'delay',label:'アバターの表示遅延',unit:'ms',min:0,max:500,step:10,value:200,presets:[0,100,200,400]},{key:'rotationGain',label:'回転の移動倍率',unit:'×',min:.5,max:1.5,step:.1,value:1,presets:[.5,1,1.5]}]}
};

let mode = 'delay', running = false, inStage = false, baseline = false, spaceHeld = false, showReference = false;
let config = {}, pointer = {x:230,y:280}, output = {...pointer}, previousPointer = null, drag = null;
const textureCursor = new TextureCursor(output);
let inputHeight = 0, outputHeight = 0, inputAngle = 0, outputAngle = 0, direction = 1;
let hits = 0, lifts = 0, reachedTop = false, targetIndex = 0, flashUntil = 0, messageTime = 0;
let pointerHistory = new History(0,pointer), heightHistory = new History(0,{h:0}), angleHistory = new History(0,{angle:0});
let records = [], traceTime = 0, lastFrame = performance.now(), fpsTime = lastFrame, frames = 0;
let transform = {scale:1,x:0,y:0}, lastInputAt = 0;
const stage = $('stage'), canvas = $('play-canvas'), ctx = canvas.getContext('2d'), traceCanvas = $('trace-canvas'), traceCtx = traceCanvas.getContext('2d');
const targets = [{x:780,y:280},{x:230,y:280},{x:730,y:170},{x:280,y:410},{x:800,y:390},{x:220,y:180}];
const effective = () => !baseline && !spaceHeld;
const $all = selector => [...document.querySelectorAll(selector)];
const status = text => $('status-message').textContent = text;

function format(value, unit) { return unit === '×' ? Number(value).toFixed(2) : String(Math.round(value)); }
function buildParameters() {
  const holder = $('parameters'); holder.replaceChildren();
  DEMOS[mode].params.forEach(p => {
    const group = document.createElement('div'); group.className = 'control-group';
    if (p.type === 'toggle') {
      group.innerHTML = `<label class="check-control"><input id="param-${p.key}" type="checkbox" ${config[p.key] ? 'checked' : ''}><span class="switch"></span><span>${p.label}</span></label><p class="small-note">${p.note}</p>`;
      holder.append(group); group.querySelector('input').addEventListener('change',e => {config[p.key]=e.target.checked;resetMotion();updateLabels();}); return;
    }
    group.innerHTML = `<label class="control-label" for="param-${p.key}">${p.label}<span>${p.unit}</span></label><div class="slider-row"><input id="param-${p.key}" type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${config[p.key]}"><output for="param-${p.key}">${format(config[p.key],p.unit)}</output></div><div class="preset-buttons" aria-label="${p.label}のプリセット">${p.presets.map(v=>`<button type="button" data-value="${v}" class="${Math.abs(v-config[p.key])<1e-6?'selected':''}">${format(v,p.unit)}</button>`).join('')}</div>${p.note?`<p class="small-note">${p.note}</p>`:''}`;
    holder.append(group);
    const input = group.querySelector('input'), output = group.querySelector('output');
    const setValue = value => {config[p.key]=Number(value);input.value=value;output.value=format(value,p.unit); group.querySelectorAll('[data-value]').forEach(b=>b.classList.toggle('selected',Math.abs(Number(b.dataset.value)-value)<1e-6));updateLabels();};
    input.addEventListener('input',e=>setValue(e.target.value));
    group.querySelectorAll('[data-value]').forEach(b=>b.addEventListener('click',()=>setValue(b.dataset.value)));
  });
}
function updateLabels() {
  const e=effective();
  $('effect-on').classList.toggle('selected',e);$('effect-on').setAttribute('aria-pressed',String(e));
  $('effect-off').classList.toggle('selected',!e);$('effect-off').setAttribute('aria-pressed',String(!e));
  $('fs-baseline').textContent=e?'効果なしと比較':'効果ありに戻す';
  if(mode==='resistance') {
    $('stage-condition').textContent=e?'TEXTURE · ON':'TEXTURE · OFF';
    $('metric-label').textContent='テクスチャ効果';$('metric-value').textContent=e?'あり':'なし';
    $('metric-note').textContent=e?'縞の境界で一瞬停止し、再び動き出します。':'同じ縞の上を、停止せず滑らかに動きます。';
  } else if(mode==='viewpoint') {
    $('stage-condition').textContent=`HAND ${(e?config.handGain:1).toFixed(2)}× / VIEW ${(e?config.viewGain:0).toFixed(2)}×`;
    $('metric-label').textContent='視点の移動倍率';$('metric-value').innerHTML=`${(e?config.viewGain:0).toFixed(2)}<small>×</small>`;
    $('metric-note').textContent='物体と背景の相対的な動きを比べます。時間遅延は0ms。';
  } else {
    const d=e?config.delay:0;$('stage-condition').textContent=`${DEMOS[mode].en} · ${d} ms${mode==='cup'&&config.liftOnly&&e?' / LIFT ONLY':''}`;
    $('metric-label').textContent='設定した追加遅延';$('metric-value').innerHTML=`${d}<small>ms</small>`;
    $('metric-note').textContent='0msは追加遅延なし。端末や画面の遅延は別に生じます。';
  }
}
function resetMotion() {
  const t=performance.now()-1500;
  pointerHistory.reset(t,pointer);heightHistory.reset(t,{h:inputHeight});angleHistory.reset(t,{angle:inputAngle});
  output={...pointer};textureCursor.reset(output);outputHeight=inputHeight;outputAngle=inputAngle;records=[];
}
function reset(announce=true) {
  pointer={x:230,y:280};output={...pointer};inputHeight=outputHeight=0;inputAngle=outputAngle=0;direction=1;
  drag=null;previousPointer=null;targetIndex=0;hits=0;lifts=0;reachedTop=false;resetMotion();
  if(announce)status('リセットしました。'+DEMOS[mode].tip);
}
// Only accept the five demo keys (ignore '#constructor', '#__proto__' etc. in the URL).
const isDemo = key => Object.prototype.hasOwnProperty.call(DEMOS, key);
function setDemo(key) {
  if(!isDemo(key))return;  mode=key;config=Object.fromEntries(DEMOS[key].params.map(p=>[p.key,p.value]));
  baseline=false;spaceHeld=false;running=false;inStage=false;stage.classList.remove('active');
  $('start-overlay').hidden=false;$('start-button').textContent='体験をはじめる ↗';$('stop-button').disabled=true;
  const d=DEMOS[key];
  $all('[data-demo]').forEach(b=>{b.classList.toggle('active',b.dataset.demo===key);if(b.dataset.demo===key)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});
  $('demo-kicker').textContent=`EXPERIMENT ${d.n} / ${d.category}`;$('demo-title').textContent=d.title;$('demo-description').textContent=d.description;
  $('stage-tip').textContent=d.tip;$('try-hint').textContent=d.try;$('overlay-copy').textContent=d.overlay;$('trace-label').textContent=d.trace+' / 直近3秒';
  $('research-tag').textContent=d.tag;$('research-title').textContent=d.research;$('research-description').textContent=d.researchText;$('research-link').href=d.url;$('scope-note').textContent=d.scope;
  $('run-status').textContent='READY TO EXPLORE';buildParameters();reset(false);updateLabels();status('開始ボタンを押してください。');
  try{history.replaceState(null,'','#'+key);}catch{}
}
function start() {
  running=true;inStage=false;$('start-overlay').hidden=true;$('stop-button').disabled=false;
  $('run-status').textContent='EXPERIMENT ACTIVE';stage.classList.add('active');stage.focus({preventScroll:true});reset(false);status(DEMOS[mode].tip+'。Spaceで基準と比較できます。');
}
function stop() {running=false;drag=null;spaceHeld=false;stage.classList.remove('active');$('start-overlay').hidden=false;$('start-button').textContent='もう一度体験する ↗';$('stop-button').disabled=true;$('run-status').textContent='PAUSED';updateLabels();status('体験を終了しました。通常のカーソルに戻りました。');}
function setBaseline(value) {baseline=value; resetMotion(); updateLabels();status(value?'基準条件：遅延なし・倍率1・視点移動なし。':'設定した効果に戻りました。');}

function position(event) {
  const r=canvas.getBoundingClientRect();
  return {x:clamp((event.clientX-r.left-transform.x)/transform.scale,30,970),y:clamp((event.clientY-r.top-transform.y)/transform.scale,70,490)};
}
function acceptPointer(event) {
  const p=position(event), now=performance.now();lastInputAt=now;
  if(!inStage){inStage=true;previousPointer=p;pointer={...p};if(mode==='delay'){output={...p};pointerHistory.reset(now-1500,p);}if(mode==='resistance'){output={...p};textureCursor.reset(p);}}
  if(mode==='delay') {pointer=p;pointerHistory.push(now,p);}
  else if(mode==='resistance') {
    pointer=p;
  } else if(drag) {
    if(mode==='cup'||mode==='viewpoint') {
      const h=clamp(drag.h+(drag.y-p.y)/290,0,1);
      if(Math.abs(h-inputHeight)>.0001)direction=h>inputHeight?1:-1;
      inputHeight=h;heightHistory.push(now,{h});
    } else {
      inputAngle=clamp(drag.angle+(p.x-drag.x)/310*Math.PI,-Math.PI*.8,Math.PI*.8);
      angleHistory.push(now,{angle:inputAngle});
    }
    pointer=p;
  } else pointer=p;
  previousPointer=p;
}
canvas.addEventListener('pointerenter',e=>{if(running&&e.pointerType==='mouse'){inStage=false;acceptPointer(e);stage.focus({preventScroll:true});}});
canvas.addEventListener('pointermove',e=>{if(!running)return;if(e.pointerType!=='mouse'&&!drag)return;acceptPointer(e);});
canvas.addEventListener('pointerleave',()=>{if(!drag){inStage=false;previousPointer=null;}});
canvas.addEventListener('pointerdown',e=>{
  if(!running)return;e.preventDefault();stage.focus({preventScroll:true});
  if(!inStage)acceptPointer(e);
  const p=position(e);drag={id:e.pointerId,x:p.x,y:p.y,h:inputHeight,angle:inputAngle};
  canvas.setPointerCapture(e.pointerId);
  if(e.pointerType==='mouse'&&(mode==='delay'||mode==='resistance'))hitTarget();
});
function release(e){if(drag?.id!==e.pointerId)return;if(e.type==='pointerup'&&e.pointerType!=='mouse'&&(mode==='delay'||mode==='resistance'))hitTarget();drag=null;const r=canvas.getBoundingClientRect();inStage=e.pointerType==='mouse'&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;if(!inStage)previousPointer=null;}
['pointerup','pointercancel','lostpointercapture'].forEach(name=>canvas.addEventListener(name,release));

function target(){return mode==='resistance'?{x:targetIndex%2===0?820:180,y:280}:targets[targetIndex%targets.length];}
function hitTarget(){const t=target();if(Math.hypot(output.x-t.x,output.y-t.y)<35){hits++;targetIndex++;flashUntil=performance.now()+260;status(`的に当たりました（${hits}回）。次の的へ。`);}else status('表示中のオレンジのカーソルを的に重ねてクリックしてください。');}
function cycleCounter(height=outputHeight){if(height>.84)reachedTop=true;if(reachedTop&&height<.12){lifts++;reachedTop=false;status(`${lifts}回、持ち上げて下ろしました。基準条件とも比べてみましょう。`);}}

function resize(){const r=stage.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);const scale=Math.min(r.width/W,r.height/H);transform={scale,x:(r.width-W*scale)/2,y:(r.height-H*scale)/2};const g=$('trace-canvas').getBoundingClientRect();traceCanvas.width=Math.round(g.width*dpr);traceCanvas.height=Math.round(g.height*dpr);}
new ResizeObserver(resize).observe(stage);new ResizeObserver(resize).observe(traceCanvas);

// Drawing helpers. All geometry is live Canvas 2D; no WebGL or external assets required.
function line(x1,y1,x2,y2,color=C.grid,width=1,dash=[]){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
function circle(x,y,r,fill,stroke=null,width=1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function rect(x,y,w,h,fill,stroke=null,r=0){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
function text(t,x,y,size=12,color=C.muted,align='left',font='monospace'){ctx.font=`${size}px ${font}`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(t,x,y);}
function path(points,fill,stroke=null,width=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function grid(){for(let x=60;x<=960;x+=40)for(let y=70;y<510;y+=40)circle(x,y,.8,'#343e50');line(60,280,940,280,'#353e4d',1,[3,7]);line(500,80,500,480,'#353e4d',1,[3,7]);}
function cursor(p,reference=false){ctx.save();ctx.translate(p.x,p.y);if(reference){circle(0,0,9,null,C.cyan,1.5);line(-14,0,14,0,C.cyan,1);line(0,-14,0,14,C.cyan,1);}else{ctx.shadowColor='#0007';ctx.shadowBlur=8;path([[0,0],[3,27],[10,20],[20,31],[27,26],[16,16],[27,13]],C.orange,'#ffcf9e',1.5);}ctx.restore();}
function targetDraw(now){const t=target();circle(t.x,t.y,35,'#90d1e10c',C.lime,1);circle(t.x,t.y,26,null,'#5d7091',1);circle(t.x,t.y,3,C.lime);text('TARGET',t.x,t.y+57,10,'#83aab4','center');if(now<flashUntil){circle(output.x,output.y,45,null,C.lime,3);}}
function drawDelay(now){grid();text('01',72,102,40,'#323d4f');text('MOVE  →  PAUSE  →  COMPARE',500,465,10,'#59657b','center');
  const visibleRecords=records.filter(p=>now-p.t<480);if(visibleRecords.length>1){ctx.beginPath();ctx.strokeStyle='#d99a6835';ctx.lineWidth=2;visibleRecords.forEach((p,i)=>{if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});ctx.stroke();}
  targetDraw(now);if(showReference){line(pointer.x,pointer.y,output.x,output.y,'#c084fc60',1,[4,6]);cursor(pointer,true);}cursor(output);
}
function drawResistance(now){
  grid();
  for(let x=TEXTURE.left,i=0;x<TEXTURE.right;x+=TEXTURE.width,i++)rect(x,TEXTURE.top,TEXTURE.width,TEXTURE.bottom-TEXTURE.top,i%2?'#080808':'#f5f5f5');
  text('TEXTURE',512,85,14,C.ink,'center');
  text(effective()?'効果あり':'効果なし',512,478,14,C.muted,'center');
  targetDraw(now);
  if(showReference){line(pointer.x,pointer.y,output.x,output.y,'#c084fc90',1,[4,6]);cursor(pointer,true);}
  cursor(output);
}
function cupShape(x,y,ghost=false){ctx.save();ctx.translate(x,y);if(ghost){ctx.globalAlpha=.45;ctx.strokeStyle=C.cyan;ctx.setLineDash([7,6]);ctx.lineWidth=2;ctx.strokeRect(-58,-105,116,102);ctx.restore();return;}
  ctx.save();ctx.shadowColor='#0005';ctx.shadowBlur=20;rect(-60,-108,120,108,'#d7e5e9',null,12);ctx.restore();
  ctx.beginPath();ctx.ellipse(0,-107,60,15,0,0,Math.PI*2);ctx.fillStyle='#dcf0f5';ctx.fill();ctx.beginPath();ctx.ellipse(0,-107,48,9,0,0,Math.PI*2);ctx.fillStyle='#8d654d';ctx.fill();
  ctx.beginPath();ctx.ellipse(63,-63,29,31,0,-Math.PI*.5,Math.PI*.5);ctx.strokeStyle='#ccdee2';ctx.lineWidth=13;ctx.stroke();
  text('AME',-1,-55,16,'#81979c','center');line(-43,-28,35,-28,'#b5c7cc',1);
  // A hand supports the cup from below; the forearm stays attached to its visual height.
  path([[48,16],[83,2],[145,4],[172,21],[164,42],[97,37],[66,35],[22,27],[-5,13],[-1,4],[19,8]],'#e7b691','#f0c9a8',1);
  rect(152,9,130,40,'#6c7a91',null,9);line(163,13,163,45,'#94b3bb',2);ctx.restore();
}
function drawCup(){const ground=449;for(let i=0;i<6;i++)line(160,ground+i*13,850,ground+i*13,'#303b4d');path([[140,ground],[845,ground],[940,500],[65,500]],'#212b3c');line(140,ground,845,ground,'#626d81',2);
  const y=ground-outputHeight*260;ctx.save();ctx.globalAlpha=1-outputHeight*.65;ctx.beginPath();ctx.ellipse(480,ground+12,100-outputHeight*25,15,0,0,Math.PI*2);ctx.fillStyle='#080f1a';ctx.fill();ctx.restore();
  line(230,ground,230,120,'#4d5b72',1);for(let i=0;i<=4;i++){const yy=ground-i*70;line(224,yy,236,yy,'#6b8d96');text(String(i*25)+'%',208,yy,10,'#6d788b','right');}
  text('LIFT',230,94,11,'#7ba1ab','center');line(270,160,815,160,'#46546d',1,[5,7]);text('持ち上げる',770,140,14,'#77949b','center','sans-serif');
  if(showReference){cupShape(480,ground-inputHeight*260,true);circle(230,ground-inputHeight*260,6,C.cyan);}
  circle(230,y,8,C.orange);cupShape(480,y);cursor({x:553,y:y+20});
  text(drag?'DRAGGING':inputHeight>.02?'HOLD & DRAG':'PRESS & DRAG UP',520,520,11,'#647188','center');
}
function drawViewpoint(){const e=effective();const state=projectLift(inputHeight,e?config.handGain:1,e?config.viewGain:0);const camY=1.7+state.camera*2.2;
  const proj=(x,y,z)=>({x:500+x*610/z,y:220+(camY-y)*610/z});
  const seg=(a,b,color=C.grid,width=1)=>{const p=proj(...a),q=proj(...b);line(p.x,p.y,q.x,q.y,color,width);};
  for(let z=3;z<=20;z+=1.5)seg([-8,0,z],[8,0,z],'#465266');for(let x=-8;x<=8;x+=1)seg([x,0,3],[x,0,22],'#3b475c');
  for(const x of [-4,4])for(const z of [5,9,14,20]){seg([x,0,z],[x,4,z],'#626f85',2);seg([x,4,z],[-x,4,z],'#3e4b62',1);}
  text('HAND '+(e?config.handGain:1).toFixed(2)+'×',90,115,16,C.lime);text('VIEW '+(e?config.viewGain:0).toFixed(2)+'×',90,143,12,C.cyan);
  function cube(h,ghost=false){const points=[[-.6,h,5],[.6,h,5],[.6,h+.9,5],[-.6,h+.9,5],[-.6,h,6.2],[.6,h,6.2],[.6,h+.9,6.2],[-.6,h+.9,6.2]].map(p=>proj(...p));const poly=(inds,fill)=>path(inds.map(i=>[points[i].x,points[i].y]),fill,ghost?C.cyan:'#72a0ab',ghost?1:1.3);
    if(ghost){ctx.save();ctx.globalAlpha=.6;ctx.setLineDash([5,6]);poly([0,1,2,3],null);poly([3,2,6,7],null);ctx.restore();return;}
    poly([1,5,6,2],'#6ab6c9');poly([3,2,6,7],'#a6e3f3');poly([0,1,2,3],'#81cbde');const p=proj(0,h+.47,4.99);text('AME LAB',p.x,p.y,13,'#435471','center');
    const a=proj(-1,h-.02,5),b=proj(1,h-.02,5);rect(a.x-70,a.y-1,88,27,'#728e95',null,8);rect(b.x-18,b.y-1,88,27,'#728e95',null,8);rect(a.x+5,a.y-7,54,20,'#e2b390',null,8);rect(b.x-59,b.y-7,54,20,'#e2b390',null,8);
  }
  if(showReference)cube(inputHeight*2.2,true);cube(state.hand*2.2);
  const out=proj(0,state.hand*2.2+.45,5);circle(out.x,out.y+35,4,C.orange);
  const indicator=clamp(438-state.camera*170,90,470);line(900,100,900,460,'#636e82',1);circle(900,indicator,7,C.cyan);text('VIEW',900,78,11,C.cyan,'center');text('視点の高さ',900,488,12,'#768f95','center','sans-serif');
}
function handShape(angle,ghost=false){ctx.save();ctx.translate(500,365);ctx.rotate(angle);if(ghost){ctx.globalAlpha=.4;ctx.strokeStyle=C.cyan;ctx.setLineDash([8,5]);ctx.lineWidth=2;}else{ctx.fillStyle='#e8c39f';ctx.strokeStyle='#f0d4b4';ctx.lineWidth=1.5;ctx.shadowColor='#060c1666';ctx.shadowBlur=12;}
  ctx.beginPath();ctx.moveTo(-32,40);ctx.lineTo(-32,-32);ctx.bezierCurveTo(-50,-58,-87,-82,-75,-94);ctx.bezierCurveTo(-62,-105,-44,-69,-28,-67);ctx.lineTo(-30,-150);ctx.quadraticCurveTo(-28,-174,-12,-153);ctx.lineTo(-9,-91);ctx.lineTo(-8,-175);ctx.quadraticCurveTo(0,-197,12,-177);ctx.lineTo(13,-93);ctx.lineTo(18,-165);ctx.quadraticCurveTo(29,-185,36,-161);ctx.lineTo(35,-88);ctx.lineTo(42,-141);ctx.quadraticCurveTo(55,-160,60,-139);ctx.lineTo(55,-49);ctx.quadraticCurveTo(51,-6,32,14);ctx.lineTo(32,40);ctx.closePath();if(!ghost)ctx.fill();ctx.stroke();ctx.shadowBlur=0;
  if(!ghost){rect(-34,28,70,105,'#55647d',null,8);line(-31,40,32,40,'#879da3',3);line(-9,-68,25,-55,'#b7987b',1);line(-14,-31,25,-22,'#b7987b',1);circle(0,9,5,C.orange);}ctx.restore();
}
function drawAvatar(){grid();ctx.save();ctx.setLineDash([4,9]);circle(500,365,208,null,'#566276',1);ctx.restore();for(let d=-120;d<=120;d+=30){const a=d*Math.PI/180;line(500+Math.sin(a)*212,365-Math.cos(a)*212,500+Math.sin(a)*224,365-Math.cos(a)*224,'#68768e',1);text(String(d)+'°',500+Math.sin(a)*246,365-Math.cos(a)*246,11,'#6f9199','center');}
  const ref=effective()?inputAngle:inputAngle;if(showReference)handShape(ref,true);handShape(outputAngle);circle(500,365,5,C.orange);text('INPUT',100,110,10,C.cyan);text(Math.round(inputAngle*180/Math.PI)+'°',100,140,24,C.cyan);text('AVATAR',830,110,10,C.orange);text(Math.round(outputAngle*180/Math.PI)+'°',830,140,24,C.orange);text('← DRAG TO ROTATE →',500,515,11,'#6e8c93','center');
}
function draw(now){const r=stage.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=C.bg;ctx.fillRect(0,0,r.width,r.height);ctx.translate(transform.x,transform.y);ctx.scale(transform.scale,transform.scale);
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
  if(mode==='delay')drawDelay(now);else if(mode==='resistance')drawResistance(now);else if(mode==='cup')drawCup();else if(mode==='viewpoint')drawViewpoint();else drawAvatar();ctx.restore();
}
// Graph colors follow the site's light/dark theme (CSS variables in style.css).
const traceStyle=getComputedStyle(traceCanvas),traceColor=(name,fallback)=>traceStyle.getPropertyValue(name).trim()||fallback;
function drawTrace(now){const r=traceCanvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=r.width,h=r.height;traceCtx.setTransform(dpr,0,0,dpr,0,0);traceCtx.clearRect(0,0,w,h);traceCtx.lineWidth=1;traceCtx.strokeStyle=traceColor('--trace-grid','#e0e6d6');traceCtx.beginPath();traceCtx.moveTo(0,h/2);traceCtx.lineTo(w,h/2);traceCtx.stroke();
  for(const [key,color] of [['input',traceColor('--trace-input','#86a5aa')],['output',traceColor('--trace-output','#d38d60')]]){traceCtx.strokeStyle=color;traceCtx.lineWidth=1.4;traceCtx.setLineDash(key==='input'?[3,2]:[]);traceCtx.beginPath();records.forEach((v,i)=>{const x=w*(1-(now-v.t)/3000),y=h-3-clamp(v[key],0,1)*(h-6);if(i===0)traceCtx.moveTo(x,y);else traceCtx.lineTo(x,y);});traceCtx.stroke();}traceCtx.setLineDash([]);
}
function tick(){requestAnimationFrame(tick);const now=performance.now(),e=effective();if(document.hidden){lastFrame=now;return;}
  if(running){if(mode==='delay')output={...pointerHistory.at(now,e?config.delay:0)};
    if(mode==='resistance')output=textureCursor.update(pointer,now,now-lastFrame,e);
    if(mode==='cup'){const delayed=heightHistory.at(now,e?config.delay:0).h;outputHeight=e?liftDisplay(inputHeight,delayed,outputHeight,direction,config.liftOnly):inputHeight;cycleCounter();}
    if(mode==='viewpoint'){outputHeight=inputHeight*(e?config.handGain:1);cycleCounter(inputHeight);}
    if(mode==='avatar')outputAngle=angleHistory.at(now,e?config.delay:0).angle*(e?config.rotationGain:1);
  }
  let ri=pointer.x/W,ro=output.x/W;
  if(mode==='cup'||mode==='viewpoint'){ri=inputHeight;ro=outputHeight/((mode==='viewpoint')?1.5:1);if(mode==='viewpoint')ri/=1.5;}
  if(mode==='avatar'){ri=.5+inputAngle/(Math.PI*3);ro=.5+outputAngle/(Math.PI*3);}
  records.push({t:now,input:ri,output:ro,x:output.x,y:output.y});while(records.length>1&&records[0].t<now-3050)records.shift();
  draw(now);if(now-traceTime>33){drawTrace(now);traceTime=now;}
  $('stage-score').textContent=(mode==='cup'||mode==='viewpoint')?`LIFTS ${String(lifts).padStart(2,'0')}`:mode==='avatar'?`${Math.round(outputAngle*180/Math.PI)}°`:`HITS ${String(hits).padStart(2,'0')}`;
  frames++;if(now-fpsTime>750){$('fps').textContent=Math.round(frames*1000/(now-fpsTime))+' fps';frames=0;fpsTime=now;}lastFrame=now;
}

$all('[data-demo]').forEach(b=>b.addEventListener('click',()=>setDemo(b.dataset.demo)));
$('start-button').addEventListener('click',start);$('reset-button').addEventListener('click',()=>reset());$('fs-reset').addEventListener('click',()=>reset());$('stop-button').addEventListener('click',stop);
$('effect-on').addEventListener('click',()=>setBaseline(false));$('effect-off').addEventListener('click',()=>setBaseline(true));$('fs-baseline').addEventListener('click',()=>setBaseline(!baseline));
$('show-reference').addEventListener('change',e=>showReference=e.target.checked);
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,select,textarea')||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.code==='Space'&&running&&e.target===stage){e.preventDefault();if(!spaceHeld){spaceHeld=true;resetMotion();updateLabels();}}
  if(e.key.toLowerCase()==='r'&&running){e.preventDefault();reset();}
  if(e.key==='Escape'){if(document.fullscreenElement||stage.classList.contains('expanded')){exitFullscreen();}else if(running)stop();}
});
document.addEventListener('keyup',e=>{if(e.code==='Space'&&spaceHeld){spaceHeld=false;resetMotion();updateLabels();}});
window.addEventListener('blur',()=>{if(spaceHeld){spaceHeld=false;resetMotion();updateLabels();}drag=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)stop();});
stage.addEventListener('keydown',e=>{
  if(!running||e.target!==stage)return;if(e.key==='Enter'){if(mode==='delay'||mode==='resistance')hitTarget();return;}
  if(!e.key.startsWith('Arrow'))return;e.preventDefault();const dx=e.key==='ArrowLeft'?-15:e.key==='ArrowRight'?15:0,dy=e.key==='ArrowUp'?-15:e.key==='ArrowDown'?15:0,now=performance.now();
  if(mode==='delay'||mode==='resistance'){pointer={x:clamp(pointer.x+dx,30,970),y:clamp(pointer.y+dy,70,490)};if(mode==='delay')pointerHistory.push(now,pointer);}
  else if(mode==='cup'||mode==='viewpoint'){inputHeight=clamp(inputHeight-dy/290,0,1);if(dy)direction=dy<0?1:-1;heightHistory.push(now,{h:inputHeight});}
  else {inputAngle=clamp(inputAngle+dx/310*Math.PI,-Math.PI*.8,Math.PI*.8);angleHistory.push(now,{angle:inputAngle});}
});
function fallbackFullscreen(enabled){stage.classList.toggle('expanded',enabled);document.body.style.overflow=enabled?'hidden':'';resize();}
async function exitFullscreen(){if(document.fullscreenElement)await document.exitFullscreen();fallbackFullscreen(false);$('fullscreen').setAttribute('aria-label','全画面表示');}
$('fullscreen').addEventListener('click',async()=>{if(document.fullscreenElement||stage.classList.contains('expanded'))return exitFullscreen();try{if(stage.requestFullscreen)await stage.requestFullscreen();else fallbackFullscreen(true);}catch{fallbackFullscreen(true);}$('fullscreen').setAttribute('aria-label','全画面を終了');});
$('fs-close').addEventListener('click',exitFullscreen);document.addEventListener('fullscreenchange',()=>{resize();if(!document.fullscreenElement)$('fullscreen').setAttribute('aria-label','全画面表示');});
const textureCard=document.querySelector('[data-demo="resistance"]');
if(textureCard){textureCard.querySelector('b').textContent='テクスチャを感じるカーソル';textureCard.querySelector('small').textContent='TEXTURE';}
const initial=location.hash.slice(1);setDemo(isDemo(initial)?initial:'delay');resize();requestAnimationFrame(tick);
