import * as THREE from './vendor/three.module.js';
import { PoseHistory } from './latency.js';
import { deviceQuaternion, relativeDeviceQuaternion } from './orientation.js';

const $ = id => document.getElementById(id);
const stage = $('stage');
const status = (text, error = false) => { $('input-status').replaceChildren(Object.assign(document.createElement('span'), {}), document.createTextNode(text)); $('input-status').classList.toggle('error', error); };
const message = text => { $('stage-message').textContent = text; $('stage-message').hidden = !text; };
const isTouch = matchMedia('(pointer: coarse)').matches;
let toastTimer;
function toast(text) { clearTimeout(toastTimer); message(text); toastTimer = setTimeout(() => message(''), 2200); }

async function main() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: $('scene'), antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    message('WebGLを開始できませんでした。3D表示に対応したブラウザで開いてください。');
    $('render-status').textContent = 'WebGLを利用できません';
    document.querySelectorAll('.controls button, .scene-tools button').forEach(b => b.disabled = true);
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#c6d5dd');
  scene.fog = new THREE.Fog('#c6d5dd', 24, 65);
  const camera = new THREE.PerspectiveCamera(55, 1, .1, 110);
  camera.position.set(0, 2.9, 10);
  camera.lookAt(0, 1.25, -4);
  const base = camera.quaternion.clone();
  const baseInverse = base.clone().invert();
  const inputPose = base.clone();
  const history = new PoseHistory(performance.now() - 1000, base.toArray());
  let delay = 0, mode = 'mouse', yaw = 0, pitch = 0;
  let mouseAnchor = { x: 0, y: 0 }, lastMouse = { x: 0, y: 0 };
  let touchDrag = null, sensorReference = null, rawSensor = null;
  let sensorState = 'off', sensorTimeout = null, lastSensorTime = 0, sensorRequestId = 0;
  let paused = false;
  let lastFrame = performance.now(), fpsStart = lastFrame, frameCount = 0, traceLast = 0;
  const trace = [], graph = $('trace'), ctx = graph.getContext('2d');
  const viewForward = new THREE.Vector3();
  let prevInputYaw = 0, prevOutputYaw = 0, continuousInput = 0, continuousOutput = 0;

  // Static gallery: depth cues remain still so only camera latency changes the image.
  scene.add(new THREE.HemisphereLight('#e7f8ff', '#5d747c', 2.5));
  const sun = new THREE.DirectionalLight('#fff4db', 3.1);
  sun.position.set(-9, 15, 9); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 18, bottom: -15, near: 1, far: 60 });
  sun.shadow.normalBias = .035; sun.shadow.bias = -.0001;
  sun.target.position.set(0, 0, -9);
  scene.add(sun, sun.target);
  const material = (color, roughness = .65, metalness = .05) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const ivory = material('#ecebdc'), coral = material('#ed8465'), teal = material('#3b9d99', .32, .26);
  const pale = material('#d4e6df'), charcoal = material('#3e505d'), floorMat = material('#c5d2d5', .88);
  function mesh(geometry, mat, x, y, z, cast = true) {
    const m = new THREE.Mesh(geometry, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m;
  }
  function box(w, h, d, mat, x, y, z, cast = true) { return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, cast); }
  const floor = mesh(new THREE.PlaneGeometry(100, 110), floorMat, 0, -.012, -16, false); floor.rotation.x = -Math.PI / 2;
  const grid = new THREE.GridHelper(90, 60, '#829ca8', '#9cb3bd'); grid.position.set(0, .001, -16); grid.material.transparent = true; grid.material.opacity = .30; scene.add(grid);
  // Long gallery frames establish stable near/far landmarks.
  for (let i = 0; i < 8; i++) {
    const z = 1 - i * 6;
    for (const x of [-8, 8]) {
      box(.22, 6.4, .22, pale, x, 3.2, z);
      box(.52, .12, .52, ivory, x, .06, z);
    }
    box(16.3, .22, .22, pale, 0, 6.4, z);
  }
  // A muted end wall and circular artwork.
  box(17, 6.2, .3, material('#b9cbd1'), 0, 3.1, -40, false);
  const artwork = mesh(new THREE.CircleGeometry(2.5, 64), coral, 0, 3.25, -39.82, false);
  // Main sculptural group, placed at different depths.
  box(2.45, .55, 2.45, ivory, -3.35, .275, -1.1);
  mesh(new THREE.SphereGeometry(1.04, 48, 32), ivory, -3.35, 1.59, -1.1);
  box(2.8, .22, 2.8, charcoal, .15, .11, -4.5);
  const knot = mesh(new THREE.TorusKnotGeometry(1.15, .31, 140, 20, 2, 3), teal, .15, 1.74, -4.5);
  knot.rotation.set(.2, -.32, -.12);
  box(2.15, .45, 2.15, ivory, 3.3, .225, .2);
  const cube = box(1.48, 1.48, 1.48, coral, 3.3, 1.42, .2); cube.rotation.y = -.36;
  box(1.4, .18, 1.4, charcoal, -1.4, .09, 4.0);
  const nearSphere = mesh(new THREE.SphereGeometry(.5, 32, 24), teal, -1.4, .68, 4.0);
  box(2.8, .5, 1.9, ivory, 2.6, .25, -13);
  const ring = mesh(new THREE.TorusGeometry(1.6, .24, 20, 90), coral, 2.6, 2.3, -13); ring.rotation.y = -.2;
  box(1.9, 2.9, 1.9, pale, -4.4, 1.45, -13.5);
  mesh(new THREE.IcosahedronGeometry(1.0, 0), ivory, -4.4, 3.65, -13.5).rotation.set(.15, .4, .1);
  box(3.2, .45, 2.5, charcoal, 0, .225, -23);
  mesh(new THREE.ConeGeometry(1.15, 3.8, 64), pale, 0, 2.35, -23);
  // Thin rails and low glowing insets add perspective without motion.
  const lightMat = new THREE.MeshBasicMaterial({ color: '#ecf8df' });
  for (const x of [-6.5, 6.5]) {
    box(.05, .025, 42, lightMat, x, .02, -18, false);
    box(.12, .12, 42, ivory, x, .06, -18, false);
  }
  function label(text, x, z) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 96;
    const context = c.getContext('2d'); context.fillStyle = '#435b65'; context.font = '500 40px monospace'; context.textAlign = 'center'; context.fillText(text, 128, 60);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = mesh(new THREE.PlaneGeometry(1.4, .525), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }), x, .013, z, false); m.rotation.x = -Math.PI / 2;
  }
  label('01', -3.35, .7); label('02', .15, -2.7); label('03', 3.3, 1.9);

  function resize() {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
    const gr = graph.getBoundingClientRect(), ratio = Math.min(devicePixelRatio, 2);
    graph.width = Math.round(gr.width * ratio); graph.height = Math.round(gr.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  new ResizeObserver(resize).observe(stage);
  new ResizeObserver(resize).observe(graph);
  resize();

  function pushPose(q, t = performance.now()) { inputPose.copy(q); history.push(t, q.toArray()); }
  function mousePose() {
    pitch = THREE.MathUtils.clamp(pitch, -.72, .72);
    yaw = THREE.MathUtils.clamp(yaw, -1.35, 1.35);
    pushPose(base.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'))));
  }
  function setDelay(value) {
    delay = value;
    document.querySelectorAll('[data-delay]').forEach(b => {
      const selected = Number(b.dataset.delay) === delay;
      b.classList.toggle('selected', selected); b.setAttribute('aria-checked', String(selected)); b.tabIndex = selected ? 0 : -1;
    });
    document.querySelectorAll('[data-full-delay]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.fullDelay) === delay)));
    $('scene-delay').innerHTML = `${delay} <small>ms</small>`;
    // Preserve input history when switching conditions; do not invent a ramp or easing.
  }
  document.querySelectorAll('[data-delay]').forEach(b => b.addEventListener('click', () => setDelay(Number(b.dataset.delay))));
  document.querySelectorAll('[data-full-delay]').forEach(b => b.addEventListener('click', () => setDelay(Number(b.dataset.fullDelay))));
  $('delay-options').addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault(); const values = [0, 50, 100, 200];
    const index = e.key === 'Home' ? 0 : e.key === 'End' ? 3 : (values.indexOf(delay) + (['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : 3)) % 4;
    setDelay(values[index]); document.querySelector(`[data-delay="${delay}"]`).focus();
  });
  setDelay(0);

  function resetTrace() { trace.length = 0; prevInputYaw = 0; prevOutputYaw = 0; continuousInput = 0; continuousOutput = 0; }
  function recenter(announce = true) {
    if (mode === 'sensor') sensorReference = rawSensor?.clone() ?? null;
    else { mouseAnchor = { ...lastMouse }; yaw = 0; pitch = 0; }
    // Calibration is immediate, flush queued poses to avoid a stale jump after a reset.
    inputPose.copy(base); camera.quaternion.copy(base);
    history.reset(performance.now() - 1000, base.toArray()); resetTrace();
    if (announce) toast(mode === 'sensor' && !rawSensor ? 'センサー入力を待っています' : '正面を再設定しました');
  }
  $('recenter').addEventListener('click', () => recenter());
  $('reset-view').addEventListener('click', () => recenter());

  function updateHint() {
    $('scene-hint').replaceChildren();
    $('scene-hint').textContent = mode === 'sensor' ? (sensorState === 'active' ? '端末を動かして見回す' : '「端末の姿勢を有効にする」を押す') : (isTouch ? 'ドラッグして見回す' : 'シーン内でマウスを動かす');
  }
  function stopSensor() {
    sensorRequestId++; clearTimeout(sensorTimeout);
    window.removeEventListener('deviceorientation', onOrientation);
    sensorState = 'off'; rawSensor = null; sensorReference = null;
    $('enable-sensor').disabled = false; $('enable-sensor').hidden = false;
    $('enable-sensor').textContent = '端末の姿勢を有効にする ↗';
  }
  function setMode(next) {
    if (mode === next) return;
    stopSensor(); mode = next; touchDrag = null;
    $('mouse-mode').classList.toggle('active', mode === 'mouse'); $('mouse-mode').setAttribute('aria-pressed', String(mode === 'mouse'));
    $('sensor-mode').classList.toggle('active', mode === 'sensor'); $('sensor-mode').setAttribute('aria-pressed', String(mode === 'sensor'));
    $('mouse-help').hidden = mode !== 'mouse'; $('sensor-help').hidden = mode !== 'sensor';
    recenter(false); updateHint();
    status(mode === 'mouse' ? 'マウス・タッチで操作できます' : 'ボタンから姿勢センサーを許可してください');
  }
  $('mouse-mode').addEventListener('click', () => setMode('mouse'));
  $('sensor-mode').addEventListener('click', () => setMode('sensor'));

  function onOrientation(event) {
    if (mode !== 'sensor' || paused || !Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
    const angle = screen.orientation?.angle ?? (typeof window.orientation === 'number' ? window.orientation : 0);
    // alpha may be unavailable without an absolute heading; relative tilt still works.
    rawSensor = deviceQuaternion(Number.isFinite(event.alpha) ? event.alpha : 0, event.beta, event.gamma, angle);
    if (!sensorReference) sensorReference = rawSensor.clone();
    if (sensorState !== 'active') {
      clearTimeout(sensorTimeout); sensorState = 'active';
      $('enable-sensor').hidden = true; $('enable-sensor').disabled = false;
      status('姿勢センサーで操作中'); updateHint();
    }
    lastSensorTime = performance.now();
    pushPose(relativeDeviceQuaternion(rawSensor, sensorReference, base), lastSensorTime);
  }
  $('enable-sensor').addEventListener('click', async () => {
    if (!window.isSecureContext) { status('HTTPSでページを開いてください。タッチ操作も利用できます。', true); return; }
    if (!('DeviceOrientationEvent' in window)) { status('この端末では姿勢を取得できません。マウス・タッチをご利用ください。', true); return; }
    const requestId = ++sensorRequestId;
    $('enable-sensor').disabled = true;
    try {
      // This call stays directly in the user-gesture handler for iOS Safari.
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (requestId !== sensorRequestId || mode !== 'sensor') return;
        if (permission !== 'granted') { status('姿勢の利用が許可されませんでした。マウス・タッチに切り替えられます。', true); $('enable-sensor').disabled = false; return; }
      }
      if (requestId !== sensorRequestId || mode !== 'sensor') return;
      rawSensor = null; sensorReference = null; sensorState = 'waiting';
      window.removeEventListener('deviceorientation', onOrientation);
      window.addEventListener('deviceorientation', onOrientation, { passive: true });
      status('センサーを待っています。端末を少し動かしてください');
      $('enable-sensor').textContent = 'センサー接続中…';
      clearTimeout(sensorTimeout);
      sensorTimeout = setTimeout(() => {
        if (sensorState !== 'waiting') return;
        stopSensor(); status('姿勢データが届きません。外部ブラウザで開くか、マウス・タッチを選んでください。', true);
      }, 6000);
    } catch (e) {
      if (requestId !== sensorRequestId) return;
      stopSensor(); status('センサーを開始できません。ブラウザの権限を確認するか、タッチをご利用ください。', true);
    }
  });
  function orientationChanged() { if (mode === 'sensor') { rawSensor = null; sensorReference = null; recenter(false); toast('画面の向きに合わせて正面を再設定しました'); } }
  if (screen.orientation) screen.orientation.addEventListener('change', orientationChanged);
  else window.addEventListener('orientationchange', orientationChanged);

  const canvas = $('scene');
  canvas.addEventListener('pointermove', e => {
    if (mode !== 'mouse' || paused) return;
    const rect = canvas.getBoundingClientRect();
    if (e.pointerType === 'mouse') {
      lastMouse = { x: (e.clientX - rect.left) / rect.width * 2 - 1, y: (e.clientY - rect.top) / rect.height * 2 - 1 };
      yaw = -(lastMouse.x - mouseAnchor.x) * .9; pitch = -(lastMouse.y - mouseAnchor.y) * .52;
    } else if (touchDrag?.id === e.pointerId) {
      yaw = touchDrag.yaw - (e.clientX - touchDrag.x) / rect.width * 1.8;
      pitch = touchDrag.pitch - (e.clientY - touchDrag.y) / rect.height * 1.1;
    } else return;
    mousePose(); status(e.pointerType === 'mouse' ? 'マウスで操作中' : 'タッチで操作中');
  });
  canvas.addEventListener('pointerdown', e => {
    if (mode !== 'mouse') return;
    stage.focus({ preventScroll: true });
    if (e.pointerType !== 'mouse') { canvas.setPointerCapture(e.pointerId); touchDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw, pitch }; }
  });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(name, e => { if (touchDrag?.id === e.pointerId) touchDrag = null; });
  stage.addEventListener('keydown', e => {
    if (e.target.closest('button') || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) || mode !== 'mouse') return;
    e.preventDefault();
    if (e.key === 'ArrowLeft') yaw += .035; if (e.key === 'ArrowRight') yaw -= .035;
    if (e.key === 'ArrowUp') pitch += .035; if (e.key === 'ArrowDown') pitch -= .035;
    mousePose(); status('キーボードで操作中');
  });
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey && !['INPUT','TEXTAREA'].includes(e.target.tagName)) { e.preventDefault(); recenter(); }
    if (e.key === 'Escape' && stage.classList.contains('fullscreen-fallback')) toggleFallback(false);
  });
  function toggleFallback(enabled) { stage.classList.toggle('fullscreen-fallback', enabled); document.body.style.overflow = enabled ? 'hidden' : ''; fullscreenLabel(enabled); resize(); }
  function fullscreenLabel(active) { $('fullscreen').title = active ? '全画面を終了' : '全画面表示'; $('fullscreen').setAttribute('aria-label', $('fullscreen').title); }
  $('fullscreen').addEventListener('click', async () => {
    if (stage.classList.contains('fullscreen-fallback')) { toggleFallback(false); return; }
    if (document.fullscreenElement) { await document.exitFullscreen(); return; }
    try { if (stage.requestFullscreen) await stage.requestFullscreen(); else toggleFallback(true); }
    catch (e) { toggleFallback(true); }
  });
  document.addEventListener('fullscreenchange', () => { fullscreenLabel(Boolean(document.fullscreenElement)); resize(); });
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused) { recenter(false); fpsStart = performance.now(); frameCount = 0; lastFrame = performance.now(); }
  });

  function localYaw(q) {
    viewForward.set(0, 0, -1).applyQuaternion(baseInverse.clone().multiply(q));
    return Math.atan2(-viewForward.x, -viewForward.z);
  }
  function angleDifference(a, b) { return Math.atan2(Math.sin(a - b), Math.cos(a - b)); }
  // Graph colors follow the site's light/dark theme (CSS variables in style.css).
  const traceStyle = getComputedStyle(graph);
  const traceColor = (name, fallback) => traceStyle.getPropertyValue(name).trim() || fallback;
  function drawTrace(now) {
    const { width: w, height: h } = graph.getBoundingClientRect();
    ctx.clearRect(0, 0, w, h); ctx.strokeStyle = traceColor('--trace-grid', '#303943'); ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 4; i++) { const x = w * i / 4; ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let i = 1; i <= 3; i++) { const y = h * i / 4; ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();
    let min = -.3, max = .3;
    if (trace.length) { min = trace[0].input - .3; max = trace[0].input + .3; }
    for (const p of trace) { min = Math.min(min, p.input, p.output); max = Math.max(max, p.input, p.output); }
    const padding = .15, range = max - min + 2 * padding;
    for (const [key, color] of [['input', traceColor('--trace-input', '#70c9c9')], ['output', traceColor('--trace-output', '#d8f592')]]) {
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = key === 'input' ? 1.6 : 1.8;
      if (key === 'input') ctx.setLineDash([4, 3]); else ctx.setLineDash([]);
      trace.forEach((p, i) => { const x = w * (1 - (now - p.t) / 4000), y = h - 5 - (p[key] - min + padding) / range * (h - 10); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
  function frame() {
    requestAnimationFrame(frame);
    if (paused) return;
    const now = performance.now();
    const sample = history.sample(now, delay);
    camera.quaternion.fromArray(sample.q);
    renderer.render(scene, camera);
    // The scene is static; the light's shadow map only needs one render.
    renderer.shadowMap.autoUpdate = false;
    const inputYaw = localYaw(inputPose), outputYaw = localYaw(camera.quaternion);
    continuousInput += angleDifference(inputYaw, prevInputYaw); continuousOutput += angleDifference(outputYaw, prevOutputYaw);
    prevInputYaw = inputYaw; prevOutputYaw = outputYaw;
    trace.push({ t: now, input: continuousInput, output: continuousOutput });
    while (trace.length > 1 && trace[0].t < now - 4050) trace.shift();
    if (now - traceLast > 32) { drawTrace(now); traceLast = now; }
    frameCount++;
    if (now - fpsStart >= 650) {
      $('fps').textContent = Math.round(frameCount * 1000 / (now - fpsStart)); fpsStart = now; frameCount = 0;
      if (mode === 'sensor' && sensorState === 'active' && now - lastSensorTime > 4000) status('姿勢データを待っています。端末を少し動かしてください');
    }
    lastFrame = now;
  }
  message(''); $('render-dot').classList.add('ready'); $('render-status').textContent = 'RENDERING';
  updateHint();
  if (isTouch) setMode('sensor');
  requestAnimationFrame(frame);
}
main().catch(error => { console.error(error); message('3Dシーンを開始できませんでした。ページを再読み込みしてください。'); $('render-status').textContent = '読み込みエラー'; });
