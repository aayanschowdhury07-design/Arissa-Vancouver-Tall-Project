// Hollow Tree Hotel, Vancouver — procedural Three.js model built from the elevation drawings.
// Six weathered-timber trunks around a hollow void, horizontal ribs/bridges with planted
// terraces, splintered tips, flared arched roots landing in reflecting pools, warm glass lobby.
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

const q = new URLSearchParams(location.search);
const W = +q.get('w') || 2600;
const H = +q.get('h') || 3250;
const VIEW = q.get('view') || 'street';
const SEED = +q.get('seed') || 7;

// ---------- deterministic random ----------
let _s = SEED;
const rnd = () => { _s = (_s * 1664525 + 1013904223) % 4294967296; return _s / 4294967296; };
const rr = (a, b) => a + (b - a) * rnd();
const DEG = Math.PI / 180;

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const fogColor = new THREE.Color(0xd3d8dc);
scene.fog = new THREE.Fog(fogColor, 220, 6800);

// ---------- overcast sky ----------
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { top: { value: new THREE.Color(0xb3bcc4) }, mid: { value: new THREE.Color(0xd3d9de) }, bot: { value: new THREE.Color(0xe2e5e8) } },
  vertexShader: `varying vec3 vP; void main(){ vP=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top,mid,bot; varying vec3 vP;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
  float fbm(vec2 p){ float v=0., a=0.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return v; }
  void main(){ vec3 d=normalize(vP); float h=d.y; vec3 c = h<0.12 ? mix(bot,mid,smoothstep(-0.05,0.12,h)) : mix(mid,top,smoothstep(0.12,0.75,h));
    vec2 uv = d.xz/(abs(h)+0.18); float n = fbm(uv*1.6+vec2(3.1,0.4)); float n2 = fbm(uv*5.0+vec2(7.,2.));
    float cl = smoothstep(0.35,0.75,n)*0.75 + 0.25*n2; cl *= smoothstep(-0.02,0.2,h);
    c = mix(c, c*0.88, cl*0.5); c = mix(c, c*1.10+vec3(0.03), smoothstep(0.55,0.9,n2)*smoothstep(0.0,0.3,h)*0.5);
    gl_FragColor=vec4(c,1.); }`
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(6000, 48, 24), skyMat);
scene.add(sky);
{ // environment for glass/metal reflections
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMat));
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(envScene, 0.04).texture;
}

// ---------- lights (soft overcast) ----------
scene.add(new THREE.HemisphereLight(0xe4e9ee, 0x5a5751, 1.9));
const sun = new THREE.DirectionalLight(0xfff4e6, 1.25);
sun.position.set(-260, 420, 300);
sun.target.position.set(0, 60, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 50, far: 1200 });
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.6;
scene.add(sun, sun.target);

// ---------- procedural textures ----------
function woodTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 1024; const g = c.getContext('2d');
  g.fillStyle = '#9d907d'; g.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 1400; i++) {
    const x = rnd() * 512, w = 0.6 + rnd() * 3.5;
    g.fillStyle = rnd() < 0.55 ? `rgba(70,58,46,${(rnd() * 0.35).toFixed(3)})` : `rgba(215,205,185,${(rnd() * 0.3).toFixed(3)})`;
    g.fillRect(x, 0, w, 1024);
  }
  for (let i = 0; i < 160; i++) { // silver-grey weathering
    g.fillStyle = `rgba(${150 + rnd() * 40 | 0},${150 + rnd() * 30 | 0},${145 + rnd() * 25 | 0},${(0.06 + rnd() * 0.16).toFixed(3)})`;
    g.beginPath(); g.ellipse(rnd() * 512, rnd() * 1024, 6 + rnd() * 30, 60 + rnd() * 260, 0, 0, Math.PI * 2); g.fill();
  }
  for (let i = 0; i < 24; i++) { // checks / cracks
    g.strokeStyle = `rgba(40,32,26,${(0.25 + rnd() * 0.4).toFixed(2)})`; g.lineWidth = 0.8 + rnd() * 1.2;
    const x = rnd() * 512, y = rnd() * 1024; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rr(-4, 4), y + rr(40, 220)); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function noiseTexture(size, lo, hi, cells) { // for puddles / stone variation
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, size, size);
  for (let i = 0; i < cells; i++) {
    const r = rr(size * 0.02, size * 0.12);
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, r);
    const v = rr(lo, hi) | 0;
    grad.addColorStop(0, `rgba(${v},${v},${v},1)`); grad.addColorStop(1, `rgba(${v},${v},${v},0)`);
    g.save(); g.translate(rnd() * size, rnd() * size); g.scale(1, rr(0.4, 1)); g.fillStyle = grad; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.restore();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function puddleAlpha() { // white = asphalt opaque, black = puddle (mirror shows through)
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d');
  g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 90; i++) {
    const r = rr(14, 80); const grad = g.createRadialGradient(0, 0, 0, 0, 0, r);
    grad.addColorStop(0, 'rgba(30,30,30,1)'); grad.addColorStop(0.7, 'rgba(60,60,60,0.9)'); grad.addColorStop(1, 'rgba(216,216,216,0)');
    g.save(); g.translate(rnd() * 1024, rnd() * 1024); g.scale(1, rr(0.3, 0.7)); g.rotate(rr(0, 3)); g.fillStyle = grad; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); g.restore();
  }
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(0,0,0,${(rnd() * 0.25).toFixed(2)})`; g.fillRect(rnd() * 1024, rnd() * 1024, 2, 2); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function windowTexture(tint, litRatio) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = tint; g.fillRect(0, 0, 256, 512);
  const cols = 6, rows = 24, cw = 256 / cols, rh = 512 / rows;
  for (let r = 0; r < rows; r++) for (let cI = 0; cI < cols; cI++) {
    const lit = rnd() < litRatio; const v = 150 + rnd() * 50 | 0;
    g.fillStyle = lit ? `rgba(255,${205 + rnd() * 30 | 0},${150 + rnd() * 50 | 0},0.55)` : `rgba(${v - 30},${v},${v + 12},${(0.35 + rnd() * 0.4).toFixed(2)})`;
    g.fillRect(cI * cw + 1.5, r * rh + 1.5, cw - 3, rh * 0.62);          // vision glass
    g.fillStyle = `rgba(70,82,92,${(0.5 + rnd() * 0.3).toFixed(2)})`;
    g.fillRect(cI * cw + 1.5, r * rh + rh * 0.66, cw - 3, rh * 0.32);    // spandrel band
  }
  g.fillStyle = 'rgba(225,230,235,0.7)';
  for (let r = 0; r <= rows; r++) g.fillRect(0, r * rh - 0.6, 256, 1.4);
  for (let cI = 0; cI <= cols; cI++) g.fillRect(cI * cw - 0.6, 0, 1.4, 512);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

const woodTex = woodTexture();
const timberMat = new THREE.MeshStandardMaterial({ map: woodTex, color: 0xb6a890, roughness: 0.84, metalness: 0.0 });
const timberDark = new THREE.MeshStandardMaterial({ map: woodTex, color: 0x8d8068, roughness: 0.86 });
const stoneTex = noiseTexture(512, 120, 200, 400); stoneTex.repeat.set(40, 40);
const stoneMat = new THREE.MeshStandardMaterial({ color: 0xa9a7a0, map: stoneTex, roughness: 0.75 });
const concreteMat = new THREE.MeshStandardMaterial({ color: 0x9b9a95, map: stoneTex, roughness: 0.85 });
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xbfd3d8, roughness: 0.08, metalness: 0.05, transparent: true, opacity: 0.42, envMapIntensity: 1.3, side: THREE.DoubleSide, depthWrite: false });
const lobbyGlass = new THREE.MeshPhysicalMaterial({ color: 0xd7e2e4, roughness: 0.05, metalness: 0.05, transparent: true, opacity: 0.3, envMapIntensity: 1.1, side: THREE.DoubleSide, depthWrite: false });
const slabMat = new THREE.MeshStandardMaterial({ color: 0xcfc3ae, emissive: 0xffc98a, emissiveIntensity: 0.12, roughness: 0.9 });
const roomGlass = new THREE.MeshPhysicalMaterial({ color: 0x6d8690, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.62, envMapIntensity: 1.2, emissive: 0xffb070, emissiveIntensity: 0.10, side: THREE.DoubleSide, depthWrite: false });
const warmPanel = new THREE.MeshStandardMaterial({ color: 0xffe2b8, emissive: 0xffb866, emissiveIntensity: 0.55, roughness: 1 });
const leafMats = [0x2a4228, 0x365431, 0x233a26, 0x415c33, 0x334c2e].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, flatShading: true }));

// ---------- tower parameters (from the elevation: 145 m tall, ~45 m wide at base) ----------
const TOWER_TOP = 145;
const trunkTips = [145, 131, 139, 126, 142, 134];
const NT = 6;
const trunkAz = Array.from({ length: NT }, (_, i) => i * 60 * DEG); // gaps face ±z (camera on +z)
function ringRadius(y) { // distance of trunk centreline from tower axis
  let r = 11.9 + 11.8 * Math.exp(-Math.max(y, 0) / 22);
  if (y > 92) r -= 0.016 * (y - 92);
  return r;
}

// ---------- sweep: extrude a lobed cross-section along a curve ----------
function sweep(curve, segs, radial, profile) {
  const pos = [], uv = [], idx = [];
  const pts = curve.getSpacedPoints(segs);
  const R = new THREE.Vector3(), B = new THREE.Vector3(), N = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, P = pts[i], T = curve.getTangentAt(t).normalize();
    R.set(P.x, 0, P.z); if (R.lengthSq() < 1e-6) R.set(1, 0, 0); R.normalize();
    B.crossVectors(T, R).normalize(); N.crossVectors(B, T).normalize();
    const pr = profile(t, P);
    for (let j = 0; j <= radial; j++) {
      const th = j / radial * Math.PI * 2;
      const lobe = 1 + pr.lobe * Math.cos(pr.lobes * th + (pr.phase || 0));
      const x = Math.cos(th) * pr.a * lobe, z = Math.sin(th) * pr.b * lobe;
      pos.push(P.x + N.x * x + B.x * z, P.y + N.y * x + B.y * z, P.z + N.z * x + B.z * z);
      uv.push(j / radial * pr.u, t * pr.v);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++) {
    const a = i * (radial + 1) + j, b = a + radial + 1;
    idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}
function cyl(az, r, y) { return new THREE.Vector3(r * Math.cos(az), y, r * Math.sin(az)); }

const tower = new THREE.Group(); scene.add(tower);
function addMesh(geo, mat, parent = tower, shadow = true) { const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = shadow; parent.add(m); return m; }

// ---------- trunks ----------
for (let k = 0; k < NT; k++) {
  const az = trunkAz[k], top = trunkTips[k];
  const pts = [];
  for (let i = 0; i <= 48; i++) {
    const y = -2 + (top + 2) * i / 48;
    let r = ringRadius(y);
    if (y > top - 24) r += 1.4 * Math.pow((y - (top - 24)) / 24, 2); // petal-like outward lean at tip
    pts.push(cyl(az, r, y));
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const geo = sweep(curve, 180, 28, (t) => {
    const h = t * (top + 2) - 2; const f = Math.max(0, h) / TOWER_TOP;
    let a = 2.6 - 1.2 * f, b = 3.0 - 1.3 * f;          // radial depth, tangential half-width
    const tipStart = 0.90; if (t > tipStart) { const s = (t - tipStart) / (1 - tipStart); const sc = Math.pow(1 - s, 0.75) * 0.92 + 0.08; a *= sc; b *= sc; }
    if (h < 14) { const s = (14 - h) / 16; a *= 1 + 0.35 * s; b *= 1 + 0.45 * s; } // flare toward ground
    return { a, b, lobe: 0.17, lobes: 6, phase: k * 0.7, u: 6, v: 48 };
  });
  addMesh(geo, timberMat);
  // splintered secondary tips at different heights
  for (const [tOff, hOff] of [[-1.7, 3], [1.6, -10], [0.1, 5]]) {
    const y0 = top - 34, y1 = top + hOff;
    const r0 = ringRadius(y0), r1 = ringRadius(y1) + 0.9 + Math.abs(tOff) * 0.8;
    const tang = new THREE.Vector3(-Math.sin(az), 0, Math.cos(az));
    const p0 = cyl(az, r0 - 0.6, y0).addScaledVector(tang, tOff * 0.4);
    const p1 = cyl(az, (r0 + r1) / 2 + 0.8, (y0 + y1) / 2).addScaledVector(tang, tOff * 0.9);
    const p2 = cyl(az, r1 + 0.4, y1).addScaledVector(tang, tOff * 1.4);
    const c = new THREE.CatmullRomCurve3([p0, p1, p2]);
    addMesh(sweep(c, 30, 12, (t) => { const s = 1.35 * Math.pow(1 - t, 0.85) + 0.12; return { a: s, b: s * 1.4, lobe: 0.12, lobes: 4, u: 1.5, v: 10 }; }), timberDark);
  }
  // vertical rib strands on the outer face (bundled 'stipes')
  for (const off of [-1.9, -0.65, 0.65, 1.9]) {
    const tang = new THREE.Vector3(-Math.sin(az), 0, Math.cos(az));
    const spts = [];
    for (let i = 0; i <= 30; i++) { const y = 4 + (top - 26) * i / 30; const f = y / TOWER_TOP; const p = cyl(az, ringRadius(y) + (2.5 - 1.15 * f) * 0.92, y).addScaledVector(tang, off * (1 - 0.4 * f)); spts.push(p); }
    const sc = new THREE.CatmullRomCurve3(spts);
    addMesh(sweep(sc, 90, 8, (t) => { const s = 0.42 - 0.18 * t; return { a: s, b: s, lobe: 0, lobes: 1, u: 1, v: 30 }; }), timberDark);
  }
  // roots: arched legs flaring outward from the trunk base to land in the pools
  for (const [side, reach, yStart] of [[-1, 17, 17], [1, 17, 17], [-1, 10, 9], [1, 10, 9]]) {
    const tang = new THREE.Vector3(-Math.sin(az), 0, Math.cos(az));
    const rS = ringRadius(yStart);
    const p0 = cyl(az, rS - 0.5, yStart);
    const p1 = cyl(az, rS + reach * 0.30, yStart * 0.78).addScaledVector(tang, side * reach * 0.30);
    const p2 = cyl(az, rS + reach * 0.70, yStart * 0.36).addScaledVector(tang, side * reach * 0.62);
    const p3 = cyl(az, rS + reach, -1.5).addScaledVector(tang, side * reach * 0.8);
    const c = new THREE.CatmullRomCurve3([p0, p1, p2, p3], false, 'centripetal');
    const big = reach > 10;
    addMesh(sweep(c, 48, 18, (t) => { let a = (big ? 2.1 : 1.5) - 0.6 * t, b = (big ? 2.6 : 1.8) - 0.7 * t; if (t > 0.86) { const s = (t - 0.86) / 0.14; a *= 1 + 0.5 * s; b *= 1 + 0.6 * s; } return { a, b, lobe: 0.12, lobes: 5, u: 3, v: 10 }; }), timberMat);
  }
}

// ---------- interior drum: floors, recessed glass, ribs, bridges, terraces ----------
const VOID_R = 6.6;
const SECTOR_HALF = 19 * DEG;   // each trunk carries a room sector; the rest of each gap is an open slot into the void
function annulus(ri, ro, h, segs = 72, a0 = 0, a1 = Math.PI * 2) {
  const s = new THREE.Shape();
  if (a1 - a0 >= Math.PI * 2 - 1e-6) { s.absarc(0, 0, ro, 0, Math.PI * 2, false); const hole = new THREE.Path(); hole.absarc(0, 0, ri, 0, Math.PI * 2, true); s.holes.push(hole); }
  else { s.absarc(0, 0, ro, a0, a1, false); s.absarc(0, 0, ri, a1, a0, true); s.closePath(); }
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: segs }); g.rotateX(-Math.PI / 2); return g;
}
{
  // room sectors: floor plates + recessed dark glass between timber ribs
  for (let y = 18; y <= 138; y += 3.6) {
    const ro = ringRadius(y) - 2.4;
    for (let k = 0; k < NT; k++) {
      const az = trunkAz[k];
      // Shape arcs run counter-clockwise in the XY plane; after rotateX(-90°) the shape's +Y maps to -Z, so negate the azimuth.
      const slab = addMesh(annulus(VOID_R, ro, 0.4, 24, -az - SECTOR_HALF, -az + SECTOR_HALF), slabMat); slab.position.y = y;
      const gl = new THREE.Mesh(new THREE.CylinderGeometry(ro + 0.15, ringRadius(y - 3.6) - 2.25, 3.4, 24, 1, true, Math.PI / 2 - az - SECTOR_HALF, 2 * SECTOR_HALF), roomGlass);
      gl.position.y = y - 1.6; tower.add(gl);
      // end walls of the sector facing the open slot
      for (const sgn of [-1, 1]) {
        const a = az + sgn * SECTOR_HALF; const w = addMesh(new THREE.BoxGeometry(ro - VOID_R, 3.4, 0.25), timberDark);
        w.position.copy(cyl(a, (ro + VOID_R) / 2, y - 1.6)); w.rotation.y = -a; 
      }
      const panel = new THREE.Mesh(annulus(VOID_R + 0.4, ro - 0.3, 0.1, 24, -az - SECTOR_HALF + 0.03, -az + SECTOR_HALF - 0.03), warmPanel); panel.position.y = y + 3.0; tower.add(panel);
    }
    // thin timber rib at every floor: runs around the whole tower, crossing the open slots
    const rib = new THREE.Mesh(new THREE.TorusGeometry(ringRadius(y) - 1.7, 0.3, 8, 120), timberDark);
    rib.rotation.x = Math.PI / 2; rib.position.y = y + 0.2; rib.castShadow = true; tower.add(rib);
    const atriumRail = new THREE.Mesh(new THREE.TorusGeometry(VOID_R + 0.1, 0.12, 6, 64), timberDark); atriumRail.rotation.x = Math.PI / 2; atriumRail.position.y = y + 1.3; tower.add(atriumRail);
  }
  // heavy ribs + bridges crossing the void with planted terraces
  const bridgeLevels = [25.2, 39.6, 54, 68.4, 82.8, 97.2, 111.6, 126];
  bridgeLevels.forEach((y, li) => {
    const R = ringRadius(y) - 1.0;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.9, 10, 140), timberMat);
    ring.rotation.x = Math.PI / 2; ring.position.y = y + 0.6; ring.castShadow = ring.receiveShadow = true; tower.add(ring);
    for (let b = 0; b < 3; b++) {
      const rot = (li * 20 + b * 60) * DEG;
      const beam = addMesh(new THREE.BoxGeometry(2 * R + 1, 1.4, 2.8), timberMat);
      beam.position.y = y + 0.6; beam.rotation.y = rot;
      const deck = addMesh(new THREE.BoxGeometry(2 * R, 0.25, 3.6), timberDark);
      deck.position.y = y + 1.4; deck.rotation.y = rot;
      for (let p = 0; p < 7; p++) {
        const d = (p / 6 - 0.5) * 2 * (R - 1.2);
        const pl = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(0.7, 1.3), 1), leafMats[(p + li) % leafMats.length]);
        pl.position.set(Math.cos(rot) * d + Math.sin(rot) * rr(-1, 1), y + 2.1, -Math.sin(rot) * d + Math.cos(rot) * rr(-1, 1)); pl.scale.y = 0.7; pl.castShadow = true; tower.add(pl);
      }
    }
    for (let p = 0; p < 40; p++) {
      const a = p / 40 * Math.PI * 2 + li;
      const pl = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(0.6, 1.15), 1), leafMats[p % leafMats.length]);
      pl.position.set(Math.cos(a) * (R - 0.1), y + 2.0, Math.sin(a) * (R - 0.1)); pl.scale.y = 0.65; pl.castShadow = true; tower.add(pl);
    }
    for (let g = 0; g < NT; g++) { // planted terraces projecting into the slots between trunks
      const az = trunkAz[g] + 30 * DEG; const rT = ringRadius(y) - 0.6;
      const ter = addMesh(new THREE.BoxGeometry(4.6, 0.5, 4.8), timberMat);
      ter.position.copy(cyl(az, rT, y + 0.6)); ter.rotation.y = -az;
      for (let p = 0; p < 5; p++) {
        const pl = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(0.5, 0.95), 1), leafMats[(p + g) % leafMats.length]);
        pl.position.copy(cyl(az + rr(-0.09, 0.09), rT + rr(-1.5, 1.5), y + 1.45)); pl.scale.y = 0.7; tower.add(pl);
      }
    }
  });
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(ringRadius(141) - 2.5, ringRadius(137) - 2.4, 4.5, 64, 1, true), roomGlass); crown.position.y = 139.5; tower.add(crown);
  const crownRoof = new THREE.Mesh(annulus(VOID_R, ringRadius(141.5) - 2.5, 0.5, 64), timberDark); crownRoof.position.y = 141.4; tower.add(crownRoof);
}

// ---------- base podium: warm glass lobby between the roots ----------
{
  const LR = 17.2;
  for (const [y, h] of [[0.0, 0.5], [7.0, 0.5], [14.2, 0.9]]) {
    const slab = addMesh(new THREE.CylinderGeometry(LR + (y > 14 ? 1.2 : 0.3), LR + (y > 14 ? 1.2 : 0.3), h, 96), y > 14 ? timberDark : stoneMat); slab.position.y = y + h / 2;
  }
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(LR, LR, 14.2, 96, 1, true), lobbyGlass); drum.position.y = 7.1; scene.add(drum);
  for (const y of [6.4, 13.6]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(LR - 0.4, LR - 0.4, 0.15, 96), new THREE.MeshStandardMaterial({ color: 0xffe2b8, emissive: 0xffb866, emissiveIntensity: 1.1 })); p.position.y = y; scene.add(p); }
  // holdfast columns in the lobby (bundled stipes)
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2 + 0.3, r = i === 0 ? 0 : 10.5; const cx = Math.cos(a) * r, cz = Math.sin(a) * r;
    for (let s = 0; s < 6; s++) {
      const sa = s / 6 * Math.PI * 2;
      const c = new THREE.CatmullRomCurve3([new THREE.Vector3(cx + Math.cos(sa) * 2.2, 0.3, cz + Math.sin(sa) * 2.2), new THREE.Vector3(cx + Math.cos(sa) * 0.9, 4.5, cz + Math.sin(sa) * 0.9), new THREE.Vector3(cx + Math.cos(sa) * 0.5, 14.2, cz + Math.sin(sa) * 0.5)]);
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(c, 12, 0.22, 7), timberDark));
    }
  }
  // warm lights inside the lobby
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const L = new THREE.PointLight(0xffb870, 900, 60, 2); L.position.set(Math.cos(a) * 9, 5, Math.sin(a) * 9); scene.add(L); }
  const L0 = new THREE.PointLight(0xffc080, 1500, 70, 2); L0.position.set(0, 9, 8); scene.add(L0);
}

// ---------- ground: mirror base (wet street + pools), overlays, plaza, walkways ----------
const mirror = new Reflector(new THREE.PlaneGeometry(1600, 1600), { clipBias: 0.002, textureWidth: 2048, textureHeight: 2048, color: 0x8e949a });
mirror.rotation.x = -Math.PI / 2; mirror.position.y = 0; scene.add(mirror);
{
  const puddles = puddleAlpha(); puddles.repeat.set(10, 10);
  const asphalt = new THREE.MeshStandardMaterial({ color: 0x33363a, roughness: 0.55, transparent: true, alphaMap: puddles, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
  const asphaltPlane = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), asphalt); asphaltPlane.rotation.x = -Math.PI / 2; asphaltPlane.position.y = 0.04; asphaltPlane.receiveShadow = true; scene.add(asphaltPlane);
  // the pools: cut the asphalt away by covering the plaza instead with raised stone; pool water tint
  const waterTint = new THREE.Mesh(annulus(17.6, 40, 0.01, 128), new THREE.MeshStandardMaterial({ color: 0x8fb0b8, transparent: true, opacity: 0.18, roughness: 0.05, depthWrite: false }));
  waterTint.position.y = 0.06; scene.add(waterTint);
  const poolCover = new THREE.Mesh(annulus(17.6, 40, 0.02, 128), new THREE.MeshBasicMaterial({ colorWrite: false })); // hides asphalt overlay inside pools
  poolCover.position.y = 0.045; poolCover.renderOrder = -1; scene.add(poolCover);
  // pool rims and plaza
  addMesh(annulus(40, 41.0, 0.42, 128), stoneMat, scene);
  addMesh(annulus(41.0, 56, 0.16, 128), stoneMat, scene);
  // walkways over the pools at the gaps, main entrance toward the camera (+z)
  for (let g = 0; g < NT; g++) {
    const az = trunkAz[g] + 30 * DEG; const main = Math.abs(Math.sin(az) - 1) < 1e-6;
    const wk = addMesh(new THREE.BoxGeometry(main ? 9 : 4.0, 0.4, 24.5), stoneMat, scene);
    wk.position.copy(cyl(az, 29, 0.2)); wk.rotation.y = -az + Math.PI / 2;
  }
  // street toward the camera: sidewalks and curbs
  for (const sx of [-1, 1]) {
    const sw = addMesh(new THREE.BoxGeometry(7, 0.18, 360), concreteMat, scene); sw.position.set(sx * 16.5, 0.09, 230);
  }
  // lane markings and crosswalk
  const white = new THREE.MeshStandardMaterial({ color: 0xd9d9d2, roughness: 0.5 });
  for (let z = 70; z < 400; z += 9) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 4), white); m.position.set(0, 0.06, z); scene.add(m); }
  for (let x = -11; x <= 11; x += 2.2) { const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.02, 5), white); m.position.set(x, 0.065, 61); scene.add(m); }
}

// ---------- surrounding downtown: glass towers ----------
{
  const winTexA = windowTexture('#7b8d99', 0.06), winTexB = windowTexture('#8a9aa4', 0.04), winTexC = windowTexture('#6c7f8c', 0.08);
  const texes = [winTexA, winTexB, winTexC];
  const podTex = windowTexture('#5f6a70', 0.2); podTex.repeat.set(4, 1);
  const podiumMat = new THREE.MeshStandardMaterial({ map: podTex, color: 0xb8b4ac, roughness: 0.6, metalness: 0.2 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x7d7a74, roughness: 0.8 });
  function glassTower(x, z, w, d, h, ti) {
    const tex = texes[ti % 3].clone(); tex.needsUpdate = true; tex.repeat.set(Math.max(1, Math.round(w / 9)), Math.max(1, Math.round(h / 36)));
    const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0xd5dde2, roughness: 0.28, metalness: 0.35, envMapIntensity: 0.9 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, h / 2, z); m.castShadow = m.receiveShadow = true; scene.add(m);
    const pod = new THREE.Mesh(new THREE.BoxGeometry(w + 6, 12, d + 6), podiumMat); pod.position.set(x, 6, z); pod.castShadow = true; scene.add(pod);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 3, d * 0.6), capMat); cap.position.set(x, h + 1.5, z); scene.add(cap);
  }
  // towers lining the street on both sides, leaving the plaza open
  const rows = [
    { x: 46, zs: [78, 126, 182, 246, 318, 400, 500, 620], hs: [68, 95, 56, 110, 82, 128, 70, 100] },
    { x: 92, zs: [60, 130, 210, 300, 420, 560], hs: [120, 84, 140, 96, 118, 150] },
    { x: 150, zs: [90, 200, 330, 480], hs: [100, 135, 90, 120] },
  ];
  let ti = 0;
  for (const side of [-1, 1]) for (const row of rows) row.zs.forEach((z, i) => {
    glassTower(side * (row.x + rr(-6, 6)), z + rr(-8, 8), rr(26, 38), rr(26, 38), row.hs[i] * rr(0.9, 1.1), ti++);
  });
  // city blocks behind the hotel (north), lower so the mountains read above them
  const back = [[-70, -140, 72], [70, -150, 88], [-130, -200, 110], [130, -210, 96], [0, -260, 80], [-200, -300, 120], [200, -320, 105], [-60, -380, 130], [80, -420, 118], [-300, -260, 90], [300, -280, 98], [-160, -500, 140], [160, -520, 126], [0, -600, 110], [-400, -450, 112], [400, -480, 120], [-250, -700, 150], [250, -720, 138]];
  for (const [x, z, h] of back) glassTower(x + rr(-10, 10), z, rr(28, 40), rr(28, 40), h, ti++);
}

// ---------- North Shore mountains with snow ----------
{
  const geo = new THREE.PlaneGeometry(12000, 3200, 240, 64); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position; const col = [];
  const snow = new THREE.Color(0xe6eaed), rock = new THREE.Color(0x5e676f), forest = new THREE.Color(0x36423f), lowc = new THREE.Color(0x46525a);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i) - 3800;
    const d = Math.max(0, Math.min(1, (-z - 2300) / 900)); // ramp up with distance so no wall at the near edge
    let h = 520 + 380 * Math.sin(x / 1150 + 0.6) + 260 * Math.sin(x / 470 + 2.1) + 160 * Math.abs(Math.sin(x / 210 + 1.0)) + 110 * Math.abs(Math.sin(x / 95 + z / 330)) + 70 * Math.sin(x / 41 + z / 150) + 45 * Math.abs(Math.sin(x / 17 + z / 90));
    h += 220 * Math.exp(-Math.pow((x - 900) / 1200, 2)) + 180 * Math.exp(-Math.pow((x + 1600) / 900, 2));
    h *= 1.15 * d * (1 - Math.max(0, (-z - 5200) / 1800));
    h = Math.max(0, h);
    p.setXYZ(i, x, h, z);
    const t = h / 1100; const c = new THREE.Color();
    const sn = 0.5 + 0.08 * Math.sin(x / 90) + 0.05 * Math.sin(x / 23 + z / 40); if (t > sn) c.copy(rock).lerp(snow, Math.min(1, (t - sn) / 0.12)); else if (t > 0.28) c.copy(forest).lerp(rock, (t - 0.28) / (sn - 0.28)); else c.copy(lowc).lerp(forest, t / 0.28);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: false })); scene.add(m);
}

const views = {
  street: { z: 142, x: -3.0, tanTop: 1.10, tanBot: 0.135 },
  wide:   { z: 232, x: -4.0, tanTop: 0.700, tanBot: 0.140 },
  close:  { z: 118, x:  2.0, tanTop: 1.300, tanBot: 0.130 },
};
const v = views[VIEW] || views.street;

// ---------- street furniture: trees, lamps, cars ----------
{
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x4a4038, roughness: 0.95 });
  function tree(x, z, s = 1) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.28 * s, 4.5 * s, 8), barkMat); t.position.set(x, 2.25 * s, z); t.castShadow = true; scene.add(t);
    for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(rr(1.1, 2.3) * s, 1), leafMats[(i + 1) % leafMats.length]); c.position.set(x + rr(-1.2, 1.2) * s, (5.2 + rr(-0.6, 1.6)) * s, z + rr(-1.2, 1.2) * s); c.castShadow = true; scene.add(c); }
  }
  for (let z = 66; z < 380; z += 17) { if (z > v.z - 30 && z < v.z + 40) continue; tree(-15.5, z + rr(-2, 2), rr(0.9, 1.3)); tree(15.5, z + rr(-2, 2), rr(0.9, 1.3)); }
  for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2 + 0.15; if (Math.abs(Math.sin(a) - 1) < 0.25) continue; tree(Math.cos(a) * 50, Math.sin(a) * 50, rr(1.0, 1.4)); }
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x3a3c3e, roughness: 0.6, metalness: 0.6 });
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xffe9c0, emissive: 0xffd089, emissiveIntensity: 3 });
  for (let z = 70; z < 400; z += 32) for (const sx of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 9, 8), poleMat); pole.position.set(sx * 13.2, 4.5, z); scene.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.12), poleMat); arm.position.set(sx * 12.1, 9, z); scene.add(arm);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), lampMat); lamp.position.set(sx * 11.0, 8.9, z); scene.add(lamp);
  }
  function car(x, z, towardCamera, color) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = towardCamera ? 0 : Math.PI;
    const body = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.5 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.7, 4.6), body); b.position.y = 0.6; b.castShadow = true; g.add(b);
    const c = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 2.4), new THREE.MeshStandardMaterial({ color: 0x1a2026, roughness: 0.2, metalness: 0.6 })); c.position.set(0, 1.25, -0.2); g.add(c);
    const hl = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2d0, emissiveIntensity: 6 });
    const tl = new THREE.MeshStandardMaterial({ color: 0xff2020, emissive: 0xff2a1a, emissiveIntensity: 4 });
    for (const sx of [-0.65, 0.65]) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.1), hl); h.position.set(sx, 0.7, 2.3); g.add(h); const t = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.1), tl); t.position.set(sx, 0.75, -2.3); g.add(t); }
    for (const [sx, sz] of [[-0.9, 1.5], [0.9, 1.5], [-0.9, -1.5], [0.9, -1.5]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 12), new THREE.MeshStandardMaterial({ color: 0x111111 })); w.rotation.z = Math.PI / 2; w.position.set(sx, 0.34, sz); g.add(w); }
    scene.add(g);
  }
  car(5.5, 84, true, 0x2a2f36); car(-5.5, 100, false, 0x7d8286); car(5.5, v.z + 70, true, 0x5a1e1e); car(-6, v.z + 160, false, 0x25303a);
}

// ---------- pedestrians ----------
{
  const coats = [0x1d1f24, 0x2b2f3a, 0x3a2e28, 0x46484c, 0x1f2b3a, 0x5b4e42, 0x2f2f2f, 0x3b2a30, 0x6c6a66].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }));
  const skin = new THREE.MeshStandardMaterial({ color: 0xc9a68a, roughness: 0.8 });
  const umb = [0x111111, 0x222a44, 0x8a1c1c, 0x1b4d3e, 0x333333].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, side: THREE.DoubleSide }));
  function person(x, z, rot, umbrella, coatIdx) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
    const s = rr(0.92, 1.06); g.scale.setScalar(s);
    const coat = coats[coatIdx !== undefined ? coatIdx : Math.floor(rnd() * coats.length)];
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.64, 4, 10), coat); body.position.y = 1.12; body.castShadow = true; g.add(body);
    for (const sx of [-0.1, 0.1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.8, 8), coats[1]); leg.position.set(sx, 0.4, 0); g.add(leg); }
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), skin); head.position.y = 1.64; g.add(head);
    if (umbrella) { const u = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.2, 12, 1, true), umb[Math.floor(rnd() * umb.length)]); u.position.y = 2.0; u.castShadow = true; g.add(u); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 5), coats[0]); st.position.set(0, 1.5, 0); g.add(st); }
    scene.add(g);
  }
  // foreground figures on the wet street, walking toward the hotel
  person(-4.2, v.z - 16, Math.PI + 0.2, true, 0); person(-3.0, v.z - 14.5, Math.PI - 0.1, false, 4); person(6.4, v.z - 22, Math.PI + 0.4, true, 1); person(9.4, v.z - 29, Math.PI - 0.5, true, 6); person(-9.8, v.z - 34, Math.PI, false, 3);
  // sidewalks
  for (let i = 0; i < 26; i++) { const sx = rnd() < 0.5 ? -1 : 1; person(sx * rr(13.5, 18.5), rr(62, 330), rr(0, 6.3), rnd() < 0.5); }
  // crosswalk & plaza & entrance walkway
  for (let i = 0; i < 6; i++) person(rr(-10, 10), rr(59, 63), rr(0, 6.3), rnd() < 0.5);
  for (let i = 0; i < 14; i++) { const a = rr(0.25, 2.9); const r = rr(42, 55); person(Math.cos(a) * r, Math.sin(a) * r, rr(0, 6.3), rnd() < 0.4); }
  for (let i = 0; i < 8; i++) person(rr(-3.5, 3.5), rr(19, 40), rr(0, 6.3), rnd() < 0.3);
}

// ---------- camera: eye level, shifted lens (verticals stay vertical) ----------
const fovFull = 2 * Math.atan(v.tanTop) / DEG;
const frac = (v.tanTop + v.tanBot) / (2 * v.tanTop);
const Hf = Math.round(H / frac);
const camera = new THREE.PerspectiveCamera(fovFull, W / Hf, 0.5, 12000);
camera.setViewOffset(W, Hf, 0, 0, W, H);
camera.position.set(v.x, 1.65, v.z);
camera.lookAt(v.x, 1.65, 0);
camera.updateProjectionMatrix();

// ---------- render ----------
renderer.compile(scene, camera);
renderer.render(scene, camera);
window.__done = true;
console.log('rendered', W, 'x', H, 'view', VIEW, 'triangles', renderer.info.render.triangles);
