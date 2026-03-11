
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();


const skyboxUrls = [
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/cube/skybox/posx.jpg',
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/cube/skybox/negx.jpg',
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/cube/skybox/posy.jpg',
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/cube/skybox/negy.jpg',
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/cube/skybox/posz.jpg',
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/cube/skybox/negz.jpg'
];
const cubeTextureLoader = new THREE.CubeTextureLoader();
const skyboxTexture = cubeTextureLoader.load(skyboxUrls);
skyboxTexture.colorSpace = THREE.SRGBColorSpace;

scene.environment = skyboxTexture;
scene.background = new THREE.Color(0x87ceeb); 


const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 2.2, 7);
camera.lookAt(0, 2.2, -7.5);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 2.2, -7.5);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

scene.add(new THREE.AmbientLight(0x404060, 0.6));

const dirLight = new THREE.DirectionalLight(0xfff4e0, 0.8);
dirLight.position.set(10, 15, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 60;
scene.add(dirLight);

scene.add(new THREE.HemisphereLight(0x88c0ff, 0x222211, 0.4));

const pointLight = new THREE.PointLight(0xffaa44, 0.7, 40);
pointLight.position.set(-6, 10, -2);
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff, 0.6, 50, Math.PI / 6, 0.4);
spotLight.position.set(6, 14, 6);
spotLight.castShadow = true;
spotLight.shadow.mapSize.set(1024, 1024);
spotLight.shadow.camera.near = 2;
spotLight.shadow.camera.far = 40;
spotLight.shadow.bias = -0.0005;
spotLight.target.position.set(0, 3, -10);
scene.add(spotLight);
scene.add(spotLight.target);

const textureLoader = new THREE.TextureLoader();
const courtTextureUrl =
  'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/4k/diagonal_parquet/diagonal_parquet_diff_4k.jpg';

const courtMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
textureLoader.load(courtTextureUrl, (tex) => {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  courtMaterial.map = tex;
  courtMaterial.needsUpdate = true;
});


const courtWidth = 18;  
const courtLength = 14;
const courtGeo = new THREE.PlaneGeometry(courtWidth, courtLength);
const courtMesh = new THREE.Mesh(courtGeo, courtMaterial);
courtMesh.rotation.x = -Math.PI / 2;
courtMesh.position.set(0, 0, -4);
courtMesh.receiveShadow = true;
scene.add(courtMesh);


const courtNearZ = courtMesh.position.z + courtLength / 2;
const courtFarZ = courtMesh.position.z - courtLength / 2;

const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const sideLineGeo = new THREE.BoxGeometry(0.08, 0.02, courtLength);
const baseLineGeo = new THREE.BoxGeometry(courtWidth, 0.02, 0.08);

const leftSide = new THREE.Mesh(sideLineGeo, lineMat);
leftSide.position.set(-courtWidth / 2, 0.01, courtMesh.position.z);
const rightSide = leftSide.clone();
rightSide.position.x = courtWidth / 2;

const nearBase = new THREE.Mesh(baseLineGeo, lineMat);
nearBase.position.set(0, 0.01, courtNearZ);
const farBase = nearBase.clone();
farBase.position.z = courtFarZ;

[leftSide, rightSide, nearBase, farBase].forEach((m) => {
  m.receiveShadow = true;
  scene.add(m);
});


const circleGeo = new THREE.RingGeometry(1.0, 1.1, 32);
const circleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });


const hoopPos = new THREE.Vector3(0, 3, -7.5);

const rimGeo = new THREE.TorusGeometry(0.9, 0.09, 12, 24);
const rimMat = new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.6, roughness: 0.3 });
const rimMesh = new THREE.Mesh(rimGeo, rimMat);
rimMesh.rotation.x = Math.PI / 2;
rimMesh.position.copy(hoopPos);
rimMesh.castShadow = true;
scene.add(rimMesh);

const boardGeo = new THREE.BoxGeometry(2, 1.2, 0.1);

const backboardCanvas = document.createElement('canvas');
backboardCanvas.width = 512;
backboardCanvas.height = 512;
const backCtx = backboardCanvas.getContext('2d');
backCtx.fillStyle = '#ffffff';
backCtx.fillRect(0, 0, 512, 512);
backCtx.strokeStyle = '#ef4444';
backCtx.lineWidth = 18;
backCtx.strokeRect(120, 120, 272, 272);
const backboardTex = new THREE.CanvasTexture(backboardCanvas);
backboardTex.colorSpace = THREE.SRGBColorSpace;
const boardMat = new THREE.MeshStandardMaterial({
  map: backboardTex,
  color: 0xffffff,
  metalness: 0.05,
  roughness: 0.7,
});
const backboard = new THREE.Mesh(boardGeo, boardMat);
backboard.position.set(hoopPos.x, hoopPos.y + 1, hoopPos.z - 0.6);
backboard.castShadow = true;
backboard.receiveShadow = true;
scene.add(backboard);

const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 4, 12);
const poleMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
const pole = new THREE.Mesh(poleGeo, poleMat);
pole.position.set(hoopPos.x, 2, hoopPos.z - 1.2);
pole.castShadow = true;
pole.receiveShadow = true;
scene.add(pole);

const poleBasePos = new THREE.Vector3(hoopPos.x, 0, hoopPos.z - 1.2);
const poleRadius = 0.18;

const baseGeo = new THREE.BoxGeometry(1.4, 0.3, 1.4);
const baseMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
const base = new THREE.Mesh(baseGeo, baseMat);
base.position.set(hoopPos.x, 0.15, hoopPos.z - 1.2);
base.castShadow = true;
base.receiveShadow = true;
scene.add(base);


const baselineZ = courtFarZ;
const keyWidth = 4.8;
const keyDepth = 4.8;
const keyLineLongGeo = new THREE.BoxGeometry(0.06, 0.02, keyDepth);
const keyLineShortGeo = new THREE.BoxGeometry(keyWidth, 0.02, 0.06);

const keyFrontZ = baselineZ + 0.02;     
const keyBackZ = keyFrontZ + keyDepth;     
const keyCenterZ = (keyFrontZ + keyBackZ) / 2;

const keyLeft = new THREE.Mesh(keyLineLongGeo, lineMat);
keyLeft.position.set(-keyWidth / 2, 0.013, keyCenterZ);
const keyRight = keyLeft.clone();
keyRight.position.x = keyWidth / 2;

const keyNear = new THREE.Mesh(keyLineShortGeo, lineMat);
keyNear.position.set(0, 0.013, keyFrontZ);
const keyFar = keyNear.clone();
keyFar.position.z = keyBackZ;

[keyLeft, keyRight, keyNear, keyFar].forEach((m) => {
  m.receiveShadow = true;
  scene.add(m);
});

const ftRadius = keyWidth / 2;
const ftRingGeo = new THREE.RingGeometry(ftRadius, ftRadius + 0.08, 48, 1, 0, Math.PI);
const ftRing = new THREE.Mesh(ftRingGeo, circleMat);
ftRing.rotation.x = -Math.PI / 2;
ftRing.rotation.z = Math.PI;
ftRing.position.set(0, 0.014, keyBackZ);
scene.add(ftRing);


const backWallGeo = new THREE.BoxGeometry(18, 8, 0.5);
const backWallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.0, roughness: 0.9 });
const backWall = new THREE.Mesh(backWallGeo, backWallMat);

backWall.position.set(0, 4, courtFarZ - 0.25);
backWall.receiveShadow = true;
scene.add(backWall);

textureLoader.load(
  'assets/brick_wall.jpg',
  (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 1);
    backWallMat.map = tex;
    backWallMat.needsUpdate = true;
  },
  undefined,
  () => {
    console.warn('assets/brick_wall.jpg not found, using solid wall color instead.');
  }
);

const scoreboardCanvas = document.createElement('canvas');
scoreboardCanvas.width = 512;
scoreboardCanvas.height = 256;
const scoreboardCtx = scoreboardCanvas.getContext('2d');

const scoreboardTexture = new THREE.CanvasTexture(scoreboardCanvas);
scoreboardTexture.colorSpace = THREE.SRGBColorSpace;

const scoreboardMat = new THREE.MeshBasicMaterial({ map: scoreboardTexture, transparent: true });
const scoreboardGeo = new THREE.PlaneGeometry(4, 2);
const scoreboardMesh = new THREE.Mesh(scoreboardGeo, scoreboardMat);
scoreboardMesh.position.set(hoopPos.x, hoopPos.y + 3.2, hoopPos.z - 2.51);
scene.add(scoreboardMesh);

const bleacherCanvas = document.createElement('canvas');
bleacherCanvas.width = 256;
bleacherCanvas.height = 256;
const bleacherCtx = bleacherCanvas.getContext('2d');

bleacherCtx.fillStyle = '#d1d5db';
bleacherCtx.fillRect(0, 0, 256, 256);

for (let row = 0; row < 8; row++) {
  const y = row * 32;

  bleacherCtx.fillStyle = '#9ca3af';
  bleacherCtx.fillRect(0, y + 20, 256, 12);

  bleacherCtx.fillStyle = '#e5e7eb';
  for (let col = 0; col < 8; col++) {
    const x = col * 32;
    bleacherCtx.fillRect(x + 2, y + 2, 24, 12);
  }
}
const bleacherTex = new THREE.CanvasTexture(bleacherCanvas);
bleacherTex.wrapS = bleacherTex.wrapT = THREE.RepeatWrapping;
bleacherTex.repeat.set(2, 2);
bleacherTex.colorSpace = THREE.SRGBColorSpace;

const bleacherMat = new THREE.MeshStandardMaterial({
  map: bleacherTex,
  color: 0xcbd5e1,       
  roughness: 0.7,         
  metalness: 0.1,          
  emissive: new THREE.Color(0x000000),
  emissiveIntensity: 0.0,
});
const bleacherDepth = courtLength + 2;
const bleacherCenterZ = courtMesh.position.z;
const tiers = 4;        
const seatsPerTier = 4;   

function addBleachers(sideSign) {
  const group = new THREE.Group();

  for (let tier = 0; tier < tiers; tier++) {
    const tierHeight = 0.4;
    const tierRise = 0.45;
    const seatWidth = 0.8;
    const seatDepth = bleacherDepth / seatsPerTier;
    const y = 0.2 + tier * tierRise;

    const xFront = (courtWidth / 2) + seatWidth / 2 + 0.1 + tier * 0.4;

    for (let i = 0; i < seatsPerTier; i++) {
      const z = bleacherCenterZ - bleacherDepth / 2 + seatDepth / 2 + i * seatDepth;
      const seatGeo = new THREE.BoxGeometry(seatWidth, tierHeight, seatDepth * 0.9);
      const seat = new THREE.Mesh(seatGeo, bleacherMat);
      seat.position.set(sideSign * xFront, y, z);
      seat.castShadow = true;
      seat.receiveShadow = true;
      group.add(seat);
    }
  }


  const railMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.6, metalness: 0.2 });
  const railGeo = new THREE.BoxGeometry(0.06, tiers * 0.5 + 0.8, bleacherDepth * 0.9);
  const rail = new THREE.Mesh(railGeo, railMat);
  rail.position.set(sideSign * (courtWidth / 2 + 2.4), 0.8 + (tiers - 1) * 0.25, bleacherCenterZ);
  rail.castShadow = true;
  group.add(rail);

  scene.add(group);
}

addBleachers(-1);
addBleachers(1);


const ballRadius = 0.4;
const ballGeo = new THREE.SphereGeometry(ballRadius, 32, 32);

const ballMat = new THREE.MeshStandardMaterial({
  color: 0xff8a00,
  metalness: 0.3,
  roughness: 0.5,
  transparent: true,
  opacity: 0.0,
});
const ball = new THREE.Mesh(ballGeo, ballMat);

ball.castShadow = false;
ball.receiveShadow = false;


const mtlLoader = new MTLLoader();
mtlLoader.setPath('basketball/source/Basketball_size6_SF/');
mtlLoader.load('Basketball_size6_SF.mtl', (materials) => {
  materials.preload();
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.setPath('basketball/source/Basketball_size6_SF/');
  objLoader.load('Basketball_size6_SF.obj', (obj) => {
  
    obj.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  
    const targetScale = (ballRadius * 2) / 10;
    obj.scale.setScalar(targetScale);
    obj.position.set(0, 0, 0);
    ball.add(obj);
  });
});


const startBallPos = new THREE.Vector3(0, ballRadius + 0.02, 1.5);
ball.position.copy(startBallPos);
scene.add(ball);


function enableShadow(obj) {
  obj.traverse((c) => {
    if (c.isMesh) {
      c.castShadow = true;
      c.receiveShadow = true;
    }
  });
}
// Optional .glb statue loading disabled to avoid 404s for models/character.glb.

let score = 0;
let shots = 0;

const scoreEl = document.getElementById('score');
const shotsEl = document.getElementById('shots');

function drawScoreboard() {
  if (!scoreboardCtx) return;
  const ctx = scoreboardCtx;
  const w = scoreboardCanvas.width;
  const h = scoreboardCanvas.height;

  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, w - 24, h - 24);

  ctx.fillStyle = '#9ca3af';
  ctx.font = '32px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SCORE', w * 0.5, 70);

  ctx.fillStyle = '#f97316';
  ctx.font = '96px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(String(score), w * 0.5, 170);

  scoreboardTexture.needsUpdate = true;
}

function updateUI() {
  if (scoreEl) scoreEl.textContent = String(score);
  if (shotsEl) shotsEl.textContent = String(shots);
  drawScoreboard();
}

updateUI();

let isDragging = false;
let dragStart = new THREE.Vector2();
let dragStartTime = 0;

let ballVelocity = new THREE.Vector3();
let ballInFlight = false;
let scoredThisShot = false;
let wasAboveRimThisShot = false;

const GRAVITY = -14; 

function resetBall() {
  ball.position.copy(startBallPos);
  ballVelocity.set(0, 0, 0);
  ballInFlight = false;
  scoredThisShot = false;
}

function launchBall(drag, dt) {
  if (ballInFlight) return;
  if (dt <= 0) return;

  shots++;
  scoredThisShot = false;
  wasAboveRimThisShot = false;

  const dragLen = drag.length();
  const power = Math.min(1.1, dragLen / (dt * 1100)); 

  const vx = (drag.x / dt) * 0.002;      
  const vy = (-drag.y / dt) * 0.0025 + 6.0; 
  const vz = -6.5 * power - 1.2;           

  ballVelocity.set(vx, vy, vz);
  ballInFlight = true;
  updateUI();
}


canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  const mouse = new THREE.Vector2(x, y);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(ball, false);
  if (intersects.length === 0 && !ballInFlight) {
 
    controls.enabled = true;
    return;
  }

  isDragging = true;
  dragStart.set(e.clientX, e.clientY);
  dragStartTime = performance.now();
  controls.enabled = false;
  if (controls.cancel) controls.cancel();
});

canvas.addEventListener('pointerup', (e) => {
  if (!isDragging) return;
  isDragging = false;
  controls.enabled = true;

  const dt = (performance.now() - dragStartTime) / 1000;
  const drag = new THREE.Vector2(e.clientX, e.clientY).sub(dragStart);

  if (drag.length() < 10) return; 
  launchBall(drag, dt);
});

canvas.addEventListener('pointerleave', () => {
  if (isDragging) {
    isDragging = false;
    controls.enabled = true;
  }
});


let lastTime = performance.now();

function animate(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  if (ballInFlight) {

    ballVelocity.y += GRAVITY * dt;
    ball.position.addScaledVector(ballVelocity, dt);
    ball.rotation.x += ballVelocity.z * dt * 0.5;
    ball.rotation.z += ballVelocity.x * dt * 0.5;

    if (ball.position.y > hoopPos.y + ballRadius * 0.8) {
      wasAboveRimThisShot = true;
    }

    if (ball.position.y < ballRadius) {
      ball.position.y = ballRadius;
      if (ballVelocity.y < 0) {
 
        ballVelocity.y *= -0.55;
        ballVelocity.x *= 0.85;
        ballVelocity.z *= 0.85;
      }
    
      if (
        Math.abs(ballVelocity.y) < 0.2 &&
        Math.abs(ballVelocity.x) < 0.2 &&
        Math.abs(ballVelocity.z) < 0.2 &&
        ball.position.z < hoopPos.z - 2
      ) {
        resetBall();
      }
    }

 
    const backWallZ = hoopPos.z - 3;
    if (ball.position.z < backWallZ + ballRadius) {
      if (ballVelocity.z < 0) {
        ball.position.z = backWallZ + ballRadius;
        ballVelocity.z *= -0.5;
        ballVelocity.x *= 0.8;
        ballVelocity.y *= 0.9;
      }
    }

   
    const boardZ = hoopPos.z - 0.6;
    if (ball.position.z < boardZ + ballRadius) {
      const dxBoard = ball.position.x - hoopPos.x;
      const dyBoard = ball.position.y - (hoopPos.y + 0.7);
      if (Math.abs(dxBoard) < 1 && Math.abs(dyBoard) < 1 && ballVelocity.z < 0) {
        ball.position.z = boardZ + ballRadius;
        ballVelocity.z *= -0.4;
        ballVelocity.x *= 0.85;
        ballVelocity.y *= 0.9;
      }
    }

 
    const dxPole = ball.position.x - poleBasePos.x;
    const dzPole = ball.position.z - poleBasePos.z;
    const distPole = Math.sqrt(dxPole * dxPole + dzPole * dzPole);
    const poleCollideRadius = poleRadius + ballRadius * 0.6;
    if (distPole < poleCollideRadius && ball.position.y < 3.5) {
      const nxP = dxPole / (distPole || 1);
      const nzP = dzPole / (distPole || 1);
      let overlapP = poleCollideRadius - distPole;
      overlapP = Math.min(overlapP, ballRadius * 0.25);
      ball.position.x += nxP * overlapP;
      ball.position.z += nzP * overlapP;

      const vnP = ballVelocity.x * nxP + ballVelocity.z * nzP;
      if (vnP < 0) {
        const poleRestitution = 0.3;
        ballVelocity.x -= (1 + poleRestitution) * vnP * nxP;
        ballVelocity.z -= (1 + poleRestitution) * vnP * nzP;
      }
      ballVelocity.y *= 0.98;
    }

    
    const rimRadius = 1.0;
    const dxRim = ball.position.x - hoopPos.x;
    const dzRim = ball.position.z - hoopPos.z;
    const dyRim = ball.position.y - hoopPos.y;
    const horizDist = Math.sqrt(dxRim * dxRim + dzRim * dzRim);
    const innerRadius = 0.55;                       
    const outerRadius = rimRadius + ballRadius * 0.3; 

    if (
      dyRim > -ballRadius * 0.5 && dyRim < ballRadius * 1.5 && 
      horizDist > innerRadius && horizDist < outerRadius &&   
      horizDist > 0.0001                                       
    ) {
      const nx = dxRim / horizDist;
      const nz = dzRim / horizDist;
      let overlap = outerRadius - horizDist;
   
      overlap = Math.min(overlap, ballRadius * 0.25);

      ball.position.x += nx * overlap;
      ball.position.z += nz * overlap;

      
      const vn = ballVelocity.x * nx + ballVelocity.z * nz;
      if (vn < 0) {
        const restitution = 0.6; 
        ballVelocity.x -= (1 + restitution) * vn * nx;
        ballVelocity.z -= (1 + restitution) * vn * nz;
      }
      ballVelocity.y *= 0.98;
    }

    // Rolling friction on the floor so the ball slows down naturally
    if (ball.position.y <= ballRadius + 0.01) {
      ballVelocity.x *= 0.96;
      ballVelocity.z *= 0.96;
    }

    // If the ball has basically stopped moving on the court, reset it
    const speed =
      Math.abs(ballVelocity.x) + Math.abs(ballVelocity.y) + Math.abs(ballVelocity.z);
    if (ball.position.y <= ballRadius + 0.01 && speed < 0.3) {
      resetBall();
    }

    // Out of bounds
    if (ball.position.y < -5 || ball.position.z < -30 || ball.position.z > 20) {
      resetBall();
    }

    
    if (!scoredThisShot) {
      const dx = ball.position.x - hoopPos.x;
      const dy = ball.position.y - hoopPos.y;
      const dz = ball.position.z - hoopPos.z;
      const horizDist = Math.sqrt(dx * dx + dz * dz);

      if (
        dy < -ballRadius * 0.2 &&   
        dy > -ballRadius * 2.0 &&   
        horizDist < 0.9            
      ) {
        scoredThisShot = true;
        score++;
        updateUI();
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});