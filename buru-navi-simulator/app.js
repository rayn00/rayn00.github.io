import { sample, stats, advancePhase, csv } from './model.js';
const $ = id => document.getElementById(id);
let params = { amplitude: 1, mass: 20, frequency: 20, asymmetry: .5, direction: 1 };
let metrics = stats(params), phase = 0, speed = .05, playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
let comparison = true, previousTime = null, lastUI = 0;
const scene = $('mechanism'), graph = $('waves'), sc = scene.getContext('2d'), gc = graph.getContext('2d');
let sceneSize = {w:800,h:320}, graphSize = {w:700,h:330}, waveData = [];
const COLORS = {orange:'#edab78', blue:'#6cb8ff', positive:'#c96838',negative:'#357b94',dark:'#193b4c',paper:'#e8ecdb',muted:'#afc6ca'};
const signed = (n,d=3) => (Math.abs(n)<.5*10**(-d)?'':n>0?'+':'−')+Math.abs(n).toFixed(d);
function speak(message){$('status').textContent=message;}
function updatePlayback(){
  $('play').innerHTML=playing?'Ⅱ <span>一時停止</span>':'▶ <span>再生</span>';
  $('play').setAttribute('aria-label',playing?'一時停止':'再生');
  $('speed-badge').textContent=(speed===1?'実時間':`1/${Math.round(1/speed)} スロー`) + (playing?'再生':' / 停止中');
  $('display-note').textContent=speed===1?'実時間表示では画面の更新周期により動きが遅く見えたり逆行して見えたりします。運動の観察にはスロー再生を使ってください。':'表示速度だけを落としています。波形の数値は設定した振動周波数で計算します。';
}
function setPlaying(value){playing=value;previousTime=null;updatePlayback();}
function updateParameters(){
  for(const key of ['amplitude','mass','frequency','asymmetry']){
    $(key).value=params[key];$(key+'-value').textContent=params[key].toFixed(key==='amplitude'?1:key==='asymmetry'?2:0);
  }
  for(const id of ['symmetric','asymmetric']){
    const selected = id==='symmetric'?params.asymmetry===0:params.asymmetry>0;
    $(id).classList.toggle('selected',selected);$(id).setAttribute('aria-pressed',String(selected));
  }
  for(const id of ['left','right']){
    const selected=(id==='right')===(params.direction===1);$(id).classList.toggle('selected',selected);$(id).setAttribute('aria-pressed',String(selected));
  }
  metrics=stats(params);
  $('peak-ratio').innerHTML=metrics.ratio.toFixed(2)+'<small> : 1</small>';
  $('positive-peak').textContent=signed(metrics.max)+' N';$('negative-peak').textContent=signed(metrics.min)+' N';
  $('mean-force').textContent=signed(metrics.mean)+' N';
  $('positive-impulse').textContent=signed(metrics.positiveImpulse*1000);
  $('negative-impulse').textContent=signed(metrics.negativeImpulse*1000);
  $('period-label').textContent=`1周期 ${(1000/params.frequency).toFixed(1)} ms`;
  waveData=Array.from({length:701},(_,i)=>({phase:i/700,...sample(i/700,params),reference:sample(i/700,{...params,asymmetry:0})}));
}
for(const key of ['amplitude','mass','frequency','asymmetry'])$(key).addEventListener('input',e=>{params[key]=Number(e.target.value);updateParameters();});
$('symmetric').addEventListener('click',()=>{params.asymmetry=0;updateParameters();speak('対称振動。左右の反力ピークが同じ大きさです。');});
$('asymmetric').addEventListener('click',()=>{params.asymmetry=.5;updateParameters();speak('非対称振動。強い側と弱い側の反力ピーク比は2対1です。');});
$('right').addEventListener('click',()=>{params.direction=1;updateParameters();speak('強い反力を右向きにしました。');});
$('left').addEventListener('click',()=>{params.direction=-1;updateParameters();speak('強い反力を左向きにしました。');});
$('play').addEventListener('click',()=>setPlaying(!playing));
$('step').addEventListener('click',()=>{setPlaying(false);phase=advancePhase(phase,1,1,1/48);updatePhase();});
$('reset').addEventListener('click',()=>{phase=0;previousTime=null;updatePhase();speak('位相を0度に戻しました。');});
$('speed').addEventListener('change',e=>{speed=Number(e.target.value);previousTime=null;updatePlayback();});
$('compare').addEventListener('change',e=>{comparison=e.target.checked;});
$('phase').addEventListener('input',e=>{setPlaying(false);phase=Number(e.target.value)/1000;updatePhase(false);});
function updatePhase(setSlider=true){$('phase-value').textContent=(phase*360).toFixed(1)+'°';if(setSlider)$('phase').value=Math.round(phase*1000);}
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&!e.target.closest('button,input,select,a,summary')){e.preventDefault();setPlaying(!playing);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false);});
$('export').addEventListener('click',()=>{
  const blob=new Blob([csv(params)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=`buru-navi_f${params.frequency}Hz_A${params.amplitude}mm_m${params.mass}g_r${params.asymmetry}_${params.direction===1?'right':'left'}.csv`;
  link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);speak('現在の設定による1周期の波形をCSVで保存しました。');
});
function resize(){const dpr=Math.min(devicePixelRatio||1,2);for(const canvas of [scene,graph]){const rect=canvas.getBoundingClientRect();canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);const size={w:rect.width,h:rect.height,dpr};if(canvas===scene)sceneSize=size;else graphSize=size;}}
new ResizeObserver(resize).observe(scene);new ResizeObserver(resize).observe(graph);
function line(c,x1,y1,x2,y2,color,width=1,dash=[]){c.save();c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.restore();}
function box(c,x,y,w,h,r,fill,stroke){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
function label(c,t,x,y,size,color,align='left',font='sans-serif'){c.fillStyle=color;c.font=`${size}px ${font}`;c.textAlign=align;c.textBaseline='middle';c.fillText(t,x,y);}
function arrow(c,x,y,length,color,width=3){if(Math.abs(length)<2){c.beginPath();c.arc(x,y,2,0,Math.PI*2);c.fillStyle=color;c.fill();return;}const d=Math.sign(length),end=x+length;line(c,x,y,end,y,color,width);c.fillStyle=color;c.beginPath();c.moveTo(end,y);c.lineTo(end-d*10,y-6);c.lineTo(end-d*10,y+6);c.closePath();c.fill();}
function drawMechanism(s){
  const {w,h,dpr}=sceneSize;sc.setTransform(dpr,0,0,dpr,0,0);sc.clearRect(0,0,w,h);
  const scale=Math.min(w/800,(h-46)/300),ox=(w-800*scale)/2,oy=(h-300*scale)/2;
  sc.save();sc.translate(ox,oy);sc.scale(scale,scale);
  for(let x=40;x<=760;x+=40)for(let y=30;y<=280;y+=40){sc.fillStyle='#314466';sc.fillRect(x,y,1.4,1.4);}
  const maxForce=Math.max(metrics.max,-metrics.min),unit=s.force/maxForce,mx=400+s.x*1000*52;
  const forceColor=s.force>=0?COLORS.orange:COLORS.blue;
  box(sc,139,94,522,127,22,'#203250','#637188');
  box(sc,156,109,488,97,11,'#152747','#4e5d78');
  for(const x of [150,650])for(const y of [107,208]){sc.beginPath();sc.arc(x,y,3,0,Math.PI*2);sc.strokeStyle='#64728b';sc.stroke();}
  line(sc,176,139,624,139,'#76939a',4);line(sc,176,177,624,177,'#76939a',4);
  line(sc,400,100,400,218,'#64728a',1,[4,6]);
  box(sc,mx-48,113,96,88,8,'#cddbdf','#dceef3');box(sc,mx-48,113,96,16,7,'#dfeaed');
  for(let x=-31;x<36;x+=11)line(sc,mx+x,180,mx+x,192,'#9eabae',1);
  label(sc,params.mass+' g',mx,153,22,'#333f55','center','monospace');
  arrow(sc,mx,71,-unit*105,'#bad2d8',2);
  label(sc,'おもりの加速度 a',400,39,17,'#c5d1d4','center');
  line(sc,139,229,661,229,'#738f96',1);line(sc,139,225,139,234,'#738f96');line(sc,661,225,661,234,'#738f96');
  label(sc,'手で保持した筐体（固定）',400,245,16,'#a5bbc1','center');
  arrow(sc,400,278,unit*185,forceColor,5);
  label(sc,`筐体への反力 ${signed(s.force)} N`,400,310,17,forceColor,'center','sans-serif');
  label(sc,`x = ${signed(s.x*1000,2)} mm`,mx,191,12,'#333f55','center','monospace');
  sc.restore();
}
// Graph colors follow the site's light/dark theme (CSS variables in style.css).
const waveStyle=getComputedStyle(graph),WAVE_VARS={label:['--wv-label','#4a656a'],value:['--wv-value','#375359'],grid:['--wv-grid','#e7eae2'],axis:['--wv-axis','#cdd8cc'],tick:['--wv-tick','#8c9e96'],reference:['--wv-reference','#9daaa1'],x:['--wv-x','#44676a'],v:['--wv-v','#789069'],cursor:['--wv-cursor','#4f6856'],dot:['--wv-dot','#507570'],pos:['--force-pos','#c96838'],neg:['--force-neg','#357b94'],posFill:['--force-pos-fill','#c9683818'],negFill:['--force-neg-fill','#357b9418']};
function wavePalette(){const p={};for(const k in WAVE_VARS)p[k]=waveStyle.getPropertyValue(WAVE_VARS[k][0]).trim()||WAVE_VARS[k][1];return p;}
function drawWaves(s){
  const {w,h,dpr}=graphSize,G=wavePalette();gc.setTransform(dpr,0,0,dpr,0,0);gc.clearRect(0,0,w,h);
  const left=46,right=w-12,plotW=right-left,rowH=(h-24)/3,px=left+phase*plotW;
  const series=[{key:'x',name:'変位 x',unit:'mm',factor:1000,max:params.amplitude},{key:'v',name:'速度 v',unit:'mm/s',factor:1000,max:Math.max(...waveData.map(v=>Math.abs(v.v)))*1000},{key:'force',name:'筐体への反力 F',unit:'N',factor:1,max:Math.max(metrics.max,-metrics.min)}];
  for(let j=0;j<3;j++){
    const data=series[j],top=j*rowH,base=top+60,half=29,max=data.max*1.06;
    const py=value=>base-value*data.factor/max*half;
    label(gc,data.name,0,top+11,11,G.label);label(gc,signed(s[data.key]*data.factor,data.key==='force'?3:2)+' '+data.unit,right,top+11,11,G.value,'right','monospace');
    for(let k=0;k<=4;k++){const x=left+k*plotW/4;line(gc,x,top+27,x,top+92,G.grid,1);}
    line(gc,left,base,right,base,G.axis,1);
    const decimals=data.max<1?3:data.max<10?1:0;
    label(gc,data.max.toFixed(decimals),left-8,py(data.max/data.factor),8,G.tick,'right','monospace');
    label(gc,'0',left-8,base,8,G.tick,'right','monospace');
    label(gc,'−'+data.max.toFixed(decimals),left-8,py(-data.max/data.factor),8,G.tick,'right','monospace');
    if(j===2){for(const sign of [1,-1]){
      gc.save();gc.beginPath();gc.rect(left,sign>0?top+26:base,plotW,sign>0?base-(top+26):half+4);gc.clip();
      gc.beginPath();gc.moveTo(left,base);for(const p of waveData)gc.lineTo(left+p.phase*plotW,py(p.force));gc.lineTo(right,base);gc.closePath();gc.fillStyle=sign>0?G.posFill:G.negFill;gc.fill();gc.restore();
    }}
    if(comparison){gc.save();gc.strokeStyle=G.reference;gc.lineWidth=1.3;gc.setLineDash([4,4]);gc.beginPath();waveData.forEach((p,i)=>{const x=left+p.phase*plotW,y=py(p.reference[data.key]);i?gc.lineTo(x,y):gc.moveTo(x,y);});gc.stroke();gc.restore();}
    if(j===2){for(let i=1;i<waveData.length;i++){const a=waveData[i-1],b=waveData[i];line(gc,left+a.phase*plotW,py(a.force),left+b.phase*plotW,py(b.force),((a.force+b.force)/2>=0)?G.pos:G.neg,1.8);}}
    else{gc.strokeStyle=j===0?G.x:G.v;gc.lineWidth=1.8;gc.beginPath();waveData.forEach((p,i)=>{const x=left+p.phase*plotW,y=py(p[data.key]);i?gc.lineTo(x,y):gc.moveTo(x,y);});gc.stroke();}
    line(gc,px,top+26,px,top+92,G.cursor,1,[2,3]);gc.beginPath();gc.arc(px,py(s[data.key]),3.5,0,Math.PI*2);gc.fillStyle=j===2?(s.force>=0?G.pos:G.neg):G.dot;gc.fill();
  }
  label(gc,'0',left,h-8,9,G.tick,'center','monospace');label(gc,'T/2',left+plotW/2,h-8,9,G.tick,'center','monospace');label(gc,'T',right,h-8,9,G.tick,'right','monospace');
}
function tick(now){
  requestAnimationFrame(tick);if(document.hidden){previousTime=null;return;}
  if(previousTime!==null&&playing)phase=advancePhase(phase,(now-previousTime)/1000,params.frequency,speed);
  previousTime=now;const current=sample(phase,params);drawMechanism(current);drawWaves(current);
  if(now-lastUI>80){updatePhase();lastUI=now;}
}
updateParameters();updatePlayback();resize();requestAnimationFrame(tick);
