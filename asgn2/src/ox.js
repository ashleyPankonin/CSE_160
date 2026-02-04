let canvas = null;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let g_globalRotY = 0;
let g_globalRotX = 0;
let g_rightHip = 0;
let g_rightKnee = 0;
let g_footAngle = 0;
let g_animationOn = false;
let g_seconds = 0;

// shake
let g_shake = false;
let g_shakeStart = 0;
let g_shakeAngle = 0;        
let g_shakeLegHip = 0;       
let g_shakeLegKnee = 0;       
let g_shakeOffsetX = 0;       

// Performance
let g_lastFrameTime = performance.now();
let g_perfAcc = 0;
let g_perfFrames = 0;
let g_perfLastUpdate = performance.now();

// Shapes
let g_cube = null;
let g_cylinder = null;
let g_triangle = null;

// Colors
const COLOR_BODY = [0.55, 0.27, 0.07, 1];
const COLOR_HORN = [0.85, 0.85, 0.85, 1];
const COLOR_HOOF = [0.1, 0.08, 0.05, 1];
const COLOR_EYE = [0, 0, 0, 1];

const VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
void main() {
  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
}
`;

const FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
void main() {
  gl_FragColor = u_FragColor;
}
`;


function main() {
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) return;
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) return;
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.8, 0.9, 1.0, 1);
  g_cube = new Cube();
  g_cylinder = new Cylinder();
  g_triangle = new Triangle();
  setupMouseControl();
  setupSliders();
  requestAnimationFrame(tick);
}


function tick() {
  const now = performance.now();
  const dt = now - g_lastFrameTime;
  g_lastFrameTime = now;
  g_seconds = now / 1000.0;
  updateAnimationAngles();
  renderScene();
  g_perfAcc += dt;
  g_perfFrames++;
  if (now - g_perfLastUpdate > 200) {
    const avg = g_perfAcc / g_perfFrames;
    const fps = 1000 / avg;
    document.getElementById("perf").innerText =
      `ms: ${avg.toFixed(1)} fps: ${fps.toFixed(1)}`;
    g_perfAcc = 0;
    g_perfFrames = 0;
    g_perfLastUpdate = now;
  }
  requestAnimationFrame(tick);
}


function updateAnimationAngles() {
  // Regular walking animation
  if (g_animationOn) {
    const s = Math.sin(g_seconds * 2);
    g_rightHip = 25 * s;
    g_rightKnee = 35 * Math.max(0, -s);
    g_footAngle = 25 * Math.max(0, -s);
  }


  if (g_shake) {
    const t = g_seconds - g_shakeStart;
    if (t > 1.0) {
      g_shake = false;
      g_shakeAngle = 0;
      g_shakeLegHip = 0;
      g_shakeLegKnee = 0;
      g_shakeOffsetX = 0;           
    } else {
      const shakeSin = Math.sin(t * Math.PI * 8);   
      g_shakeAngle     = shakeSin * 18;            
      g_shakeLegHip    = shakeSin * 12;
      g_shakeLegKnee   = shakeSin * 8;

   
      const decay = 1 - t;                       
      g_shakeOffsetX   = shakeSin * 1.4 * decay * decay;  
    }
  } else {
    g_shakeLegHip = 0;
    g_shakeLegKnee = 0;
    g_shakeOffsetX = 0;
  }
}


function drawCubeWith(mat, color) {
  g_cube.matrix = mat;
  g_cube.color = color;
  g_cube.render();
}

function drawCylinderWith(mat, color) {
  g_cylinder.matrix = mat;
  g_cylinder.color = color;
  g_cylinder.render();
}

// Leggssss
function drawLeg(parent, x, y, z, hipAng, kneeAng) {
  const thighBase = new Matrix4(parent);
  thighBase.translate(x, y, z);
  thighBase.rotate(-hipAng, 1, 0, 0);
  const thigh = new Matrix4(thighBase);
  thigh.translate(-0.07, -0.20, -0.07);
  thigh.scale(0.16, 0.22, 0.14);
  drawCubeWith(thigh, COLOR_BODY);
  const calfBase = new Matrix4(thighBase);
  calfBase.translate(0, -0.20, 0);
  calfBase.rotate(-kneeAng, 1, 0, 0);
  const calf = new Matrix4(calfBase);
  calf.translate(-0.05, -0.18, -0.06);
  calf.scale(0.12, 0.20, 0.12);
  drawCubeWith(calf, COLOR_BODY);
  const hoofBase = new Matrix4(calfBase);
  hoofBase.translate(0, -0.20, -0.03);
  const footAngle = g_footAngle + Math.max(0, kneeAng) * 0.4;
  hoofBase.rotate(footAngle, 1, 0, 0);
  const hoof = new Matrix4(hoofBase);
  hoof.translate(-0.08, -0.04, -0.12);
  hoof.scale(0.16, 0.08, 0.28);
  drawCubeWith(hoof, COLOR_HOOF);
}

// attaching body parts
function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // rotation 
  const globalRot = new Matrix4();
  globalRot.scale(0.6, 0.6, 0.6);
  globalRot.rotate(g_globalRotY, 0, 1, 0);
  globalRot.rotate(g_globalRotX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRot.elements);

  
  const sceneRoot = new Matrix4();

 
  sceneRoot.translate(g_shakeOffsetX, 0, 0);

  
  const legsRoot = new Matrix4(sceneRoot);
  legsRoot.translate(0, 0, 0);

  // LEGS
  const hipY = -0.15;
  const frontZ = -0.5;
  const backZ = 0.5;
  const rightX = 0.3;
  const leftX = -0.3;

  const frHip = g_rightHip + g_shakeLegHip;
  const frKnee = g_rightKnee + g_shakeLegKnee;
  const flHip = -0.8 * g_rightHip + g_shakeLegHip * -0.8;
  const flKnee = -0.8 * g_rightKnee + g_shakeLegKnee * -0.8;
  const brHip = -0.8 * g_rightHip + g_shakeLegHip * -0.8;
  const brKnee = -0.8 * g_rightKnee + g_shakeLegKnee * -0.8;
  const blHip = 0.8 * g_rightHip + g_shakeLegHip * 0.8;
  const blKnee = 0.8 * g_rightKnee + g_shakeLegKnee * 0.8;

  drawLeg(legsRoot, rightX, hipY, frontZ, frHip, frKnee);
  drawLeg(legsRoot, leftX, hipY, frontZ, flHip, flKnee);
  drawLeg(legsRoot, rightX, hipY, backZ, brHip, brKnee);
  drawLeg(legsRoot, leftX, hipY, backZ, blHip, blKnee);

  // body
  const bodyBase = new Matrix4(legsRoot);
  bodyBase.translate(-0.4, -0.15, -0.80);


  const body = new Matrix4(bodyBase);
  body.scale(0.8, 0.6, 1.5);
  drawCubeWith(body, COLOR_BODY);

  // head
  const headBase = new Matrix4(bodyBase);
  headBase.translate(0.15, 0.25, -0.40);

  const head = new Matrix4(headBase);
  head.scale(0.5, 0.45, 0.5);
  drawCubeWith(head, COLOR_BODY);

  // nose
  const noseBase = new Matrix4(bodyBase);
  noseBase.translate(0.28, 0.25, -0.55);
  const nose = new Matrix4(noseBase);
  nose.scale(0.25, 0.25, 0.25);
  drawCubeWith(nose, COLOR_BODY);

  // nostrils
  const leftnoseBase = new Matrix4(headBase);
  leftnoseBase.translate(0.18, 0.15, -0.2);
  leftnoseBase.rotate(90, 1, 0, 0);
  const leftNose = new Matrix4(leftnoseBase);
  leftNose.scale(0.05, 0.05, 0.08);
  drawCylinderWith(leftNose, [0, 0, 0, 1]);

  const rightnoseBase = new Matrix4(headBase);
  rightnoseBase.translate(0.32, 0.15, -0.2);
  rightnoseBase.rotate(90, 1, 0, 0);
  const rightNose = new Matrix4(rightnoseBase);
  rightNose.scale(0.05, 0.05, 0.08);
  drawCylinderWith(rightNose, [0, 0, 0, 1]);

  // horns
  const lh = new Matrix4(headBase);
  lh.translate(0.01, 0.45, -0.01);
  lh.scale(0.08, 0.3, 0.075);
  drawCubeWith(lh, COLOR_HORN);

  const rh = new Matrix4(headBase);
  rh.translate(0.4, 0.45, -0.01);
  rh.scale(0.08, 0.3, 0.075);
  drawCubeWith(rh, COLOR_HORN);

  // Eyes
  const eyeColor = [0, 0, 0, 1];
  const leftEye = new Matrix4(headBase);
  leftEye.translate(0.1, 0.35, -0.05);
  leftEye.rotate(90, 1, 0, 0);
  leftEye.scale(0.04, 0.04, 0.05);
  drawCylinderWith(leftEye, eyeColor);

  const rightEye = new Matrix4(headBase);
  rightEye.translate(0.4, 0.35, -0.05);
  rightEye.rotate(90, 1, 0, 0);
  rightEye.scale(0.04, 0.04, 0.05);
  drawCylinderWith(rightEye, eyeColor);

  // tail
  const tailBase = new Matrix4(bodyBase);
  tailBase.translate(0.35, 0.15, 1.5);
  const tail = new Matrix4(tailBase);
  tail.scale(0.1, 0.1, 0.4);
  drawCubeWith(tail, COLOR_BODY);
}

// mouse 
function setupMouseControl() {
  let dragging = false;
  canvas.onmousedown = ev => {
    if (ev.shiftKey) {
      g_shake = true;
      g_shakeStart = g_seconds;
      return;
    }
    dragging = true;
  };
  canvas.onmouseup = () => dragging = false;
  canvas.onmouseleave = () => dragging = false;
  canvas.onmousemove = ev => {
    if (!dragging) return;
    g_globalRotY += ev.movementX;
    g_globalRotX = Math.max(-89, Math.min(89, g_globalRotX + ev.movementY));
  };
}
//sliders

function setupSliders() {
  const gyVal = document.getElementById("globalYValue");
  const gxVal = document.getElementById("globalXValue");
  const hipVal = document.getElementById("rightHipValue");
  const kneeVal = document.getElementById("rightKneeValue");
  const footVal = document.getElementById("footValue");

  document.getElementById("globalYSlider").addEventListener("input", e => {
    g_globalRotY = +e.target.value;
    gyVal.textContent = e.target.value;
  });
  document.getElementById("globalXSlider").addEventListener("input", e => {
    g_globalRotX = +e.target.value;
    gxVal.textContent = e.target.value;
  });
  document.getElementById("rightHipSlider").addEventListener("input", e => {
    g_animationOn = false;
    g_rightHip = +e.target.value;
    hipVal.textContent = e.target.value;
  });
  document.getElementById("rightKneeSlider").addEventListener("input", e => {
    g_animationOn = false;
    g_rightKnee = +e.target.value;
    kneeVal.textContent = e.target.value;
  });
  document.getElementById("footSlider").addEventListener("input", e => {
    g_animationOn = false;
    g_footAngle = +e.target.value;
    footVal.textContent = e.target.value;
  });
  document.getElementById("animOnButton").onclick = () => g_animationOn = true;
  document.getElementById("animOffButton").onclick = () => g_animationOn = false;
}