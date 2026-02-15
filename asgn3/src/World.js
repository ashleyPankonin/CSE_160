let canvas = null;
let gl;
let a_Position;
let a_TexCoord;
let u_FragColor;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler;
let u_texColorWeight;
let u_texScale;
let u_skybox;
let camera = null;
let g_cube = null;
let g_skyTexture = null;
let g_groundTexture = null;
let g_dirtTexture = null;
let g_wallTexture = null;
let g_wolfTexture = null;
const wolf = { x: 0, y: 0.2, z: 0 };
const WOLF_FOLLOW_SPEED = 0.03;
const WOLF_MIN_DIST = 1.5;
let wolfMesh = null;
let wolfMeshBuffer = null;
let wolfUVBuffer = null;

const MAP_SIZE = 32;
const OPEN_FIELD_RADIUS = 6;
const MAX_BLOCK_HEIGHT = 8;
const map = [];
function buildMap() {
  const spawnX = Math.floor(MAP_SIZE / 2);
  const spawnZ = Math.floor(MAP_SIZE / 2);
  for (let i = 0; i < MAP_SIZE; i++) {
    map[i] = [];
    for (let j = 0; j < MAP_SIZE; j++) {
      const edge = (i === 0 || i === MAP_SIZE - 1 || j === 0 || j === MAP_SIZE - 1);
      if (edge) {
        map[i][j] = 2;
      } else {
        const inField = (i - spawnX) * (i - spawnX) + (j - spawnZ) * (j - spawnZ) <= OPEN_FIELD_RADIUS * OPEN_FIELD_RADIUS;
        if (inField) {
          map[i][j] = 0;
        } else {
          if (Math.random() < 0.35) map[i][j] = 2;
          else map[i][j] = 0;
        }
      }
    }
  }
}

function getSpawnCenter() {
  return { x: Math.floor(MAP_SIZE / 2) + 0.5, z: Math.floor(MAP_SIZE / 2) + 0.5 };
}

function parseObjText(text) {
  const lines = text.split("\n");
  const v = [], vt = [];
  const outPos = [], outUv = [];
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === "v" && parts.length >= 4) {
      v.push(+parts[1], +parts[2], +parts[3]);
    } else if (parts[0] === "vt" && parts.length >= 3) {
      vt.push(+parts[1], +parts[2]);
    } else if (parts[0] === "f" && parts.length >= 4) {
      const idx = (p) => {
        const i = p.split("/").map(x => parseInt(x, 10) || 0);
        return { vi: (i[0] - 1) * 3, vti: i[1] ? (i[1] - 1) * 2 : -1 };
      };
      const tri = (a, b, c) => {
        [a, b, c].forEach(p => {
          const { vi, vti } = idx(p);
          outPos.push(v[vi], v[vi + 1], v[vi + 2]);
          outUv.push(vti >= 0 ? vt[vti] : 0, vti >= 0 ? vt[vti + 1] : 0);
        });
      };
      for (let i = 1; i < parts.length - 2; i++) tri(parts[1], parts[i + 1], parts[i + 2]);
    }
  }
  return { positions: new Float32Array(outPos), uvs: new Float32Array(outUv), numVertices: outPos.length / 3 };
}

const EMBEDDED_WOLF_OBJ = [
  "v -0.5 -0.5 0.5", "v 0.5 -0.5 0.5", "v 0.5 0.5 0.5", "v -0.5 0.5 0.5",
  "v -0.5 -0.5 -0.5", "v 0.5 -0.5 -0.5", "v 0.5 0.5 -0.5", "v -0.5 0.5 -0.5",
  "vt 0 0", "vt 1 0", "vt 1 1", "vt 0 1",
  "f 1/1 2/2 3/3 4/4", "f 5/1 6/2 7/3 8/4", "f 4/1 3/2 7/3 8/4", "f 1/1 2/2 6/2 5/1",
  "f 2/1 6/2 7/3 3/3", "f 5/1 1/2 4/3 8/4"
].join("\n");

function loadObjModel(url, callback) {
  fetch(url)
    .then(r => r.text())
    .then(text => callback(parseObjText(text)))
    .catch(() => {
      console.warn("Wolf OBJ load failed (e.g. file://), using embedded mesh.");
      callback(parseObjText(EMBEDDED_WOLF_OBJ));
    });
}

function drawWolfMesh() {
  if (!wolfMesh || wolfMesh.numVertices === 0) return;
  if (!wolfMeshBuffer) {
    wolfMeshBuffer = gl.createBuffer();
    wolfUVBuffer = gl.createBuffer();
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, wolfMeshBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, wolfMesh.positions, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.bindBuffer(gl.ARRAY_BUFFER, wolfUVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, wolfMesh.uvs, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_TexCoord);
  gl.drawArrays(gl.TRIANGLES, 0, wolfMesh.numVertices);
}

function getBlockInFront(steps) {
  steps = steps || 1;
  const ex = camera.eye.elements[0], ez = camera.eye.elements[2];
  const ax = camera.at.elements[0], az = camera.at.elements[2];
  const currentX = Math.floor(ex), currentZ = Math.floor(ez);
  let forwardX = ax - ex, forwardZ = az - ez;
  const len = Math.sqrt(forwardX * forwardX + forwardZ * forwardZ);
  if (len < 0.001) {
    forwardX = 0;
    forwardZ = -1;
  } else {
    forwardX /= len;
    forwardZ /= len;
  }
  const dx = Math.abs(forwardX) >= Math.abs(forwardZ) ? (forwardX > 0 ? 1 : -1) : 0;
  const dz = Math.abs(forwardZ) >= Math.abs(forwardX) ? (forwardZ > 0 ? 1 : -1) : 0;
  const frontX = currentX + dx * steps, frontZ = currentZ + dz * steps;
  if (frontX < 0 || frontX >= MAP_SIZE || frontZ < 0 || frontZ >= MAP_SIZE) return null;
  return { x: frontX, z: frontZ };
}

function addBlockInFront() {
  const cell = getBlockInFront();
  if (!cell) return;
  const h = map[cell.x][cell.z];
  if (h < MAX_BLOCK_HEIGHT) {
    map[cell.x][cell.z] = h + 1;
  }
}

function removeBlockInFront() {
  for (let step = 1; step <= 2; step++) {
    const cell = getBlockInFront(step);
    if (!cell) continue;
    const h = map[cell.x][cell.z];
    if (h > 0) {
      map[cell.x][cell.z] = h - 1;
      return;
    }
  }
}

const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec2 a_TexCoord;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform vec2 u_texScale;
uniform float u_skybox;
varying vec2 v_TexCoord;
void main() {
  vec4 pos = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
  if (u_skybox > 0.5) {
    pos.z = pos.w;
  }
  gl_Position = pos;
  v_TexCoord = a_TexCoord * u_texScale;
}
`;

const FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler;
uniform float u_texColorWeight;
varying vec2 v_TexCoord;
void main() {
  vec4 texColor = texture2D(u_Sampler, v_TexCoord);
  float t = u_texColorWeight;
  gl_FragColor = (1.0 - t) * u_FragColor + t * texColor;
}
`;

function main() {
  try {
    canvas = document.getElementById("webgl");
    if (!canvas) { console.error("Canvas #webgl not found"); return; }
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: true });
    if (!gl) { console.error("WebGL not supported"); return; }
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) { console.error("Shader init failed"); return; }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
  u_texColorWeight = gl.getUniformLocation(gl.program, "u_texColorWeight");
  u_texScale = gl.getUniformLocation(gl.program, "u_texScale");
  u_skybox = gl.getUniformLocation(gl.program, "u_skybox");

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.4, 0.6, 0.95, 1);

  camera = new Camera(canvas);
  g_cube = new Cube();
  buildMap();
  const spawn = getSpawnCenter();
  const cx = spawn.x;
  const cz = spawn.z;
  const eyeHeight = 0.5;
  camera.eye.elements[0] = cx;
  camera.eye.elements[1] = eyeHeight;
  camera.eye.elements[2] = cz;
  camera.at.elements[0] = cx;
  camera.at.elements[1] = eyeHeight;
  camera.at.elements[2] = cz - 1;
  camera._updateView();
  wolf.x = spawn.x - 2;
  wolf.z = spawn.z - 2;
  wolf.y = 0.2;
  const base = (typeof window !== "undefined" && window.location) ? (window.location.href.replace(/[^/]*$/, "")) : "";
  initTextures(base);
  loadObjModel(base + "minecraft-wolf/source/wolf.obj", function (mesh) { wolfMesh = mesh; if (mesh) console.log("Wolf model loaded:", mesh.numVertices, "vertices"); });
  setupKeyboard();
  setupMouseLook();
  window.addEventListener("resize", onResize);
  onResize();
  gl.viewport(0, 0, canvas.width, canvas.height);
  requestAnimationFrame(tick);
  } catch (e) {
    console.error("main() error:", e);
  }
}

function onResize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let w = Math.floor((canvas.clientWidth || 400) * dpr);
  let h = Math.floor((canvas.clientHeight || 300) * dpr);
  if (w < 1) w = 400;
  if (h < 1) h = 300;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    if (camera) camera.updateProjection();
  }
}

function initTextures(base) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const src = base + "src/";
  g_skyTexture = createTextureWithFallback(src + "sky.jpg", false);
  g_groundTexture = createTextureWithFallback(src + "green.jpg", true);
  g_dirtTexture = createTextureWithFallback(src + "dirt.jpeg", false, "dirt");
  g_wallTexture = g_skyTexture;
  g_wolfTexture = createTextureWithFallback(base + "minecraft-wolf/textures/wolf.png", false, "wolf");
}

function isPowerOf2(n) { return n > 0 && (n & (n - 1)) === 0; }

function createTextureWithFallback(imageUrl, repeat, fallbackType) {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
  if (fallbackType === "dirt") createDirtFallbackTexture(texture);
  else if (fallbackType === "wolf") createWolfFallbackTexture(texture);
  else createFallbackTexture(texture);
  loadTexture(imageUrl, texture, fallbackType);
  return texture;
}

function loadTexture(url, texture, fallbackType) {
  const image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    console.log("Texture loaded: " + url);
  };
  image.onerror = function () {
    console.log("Texture failed (e.g. file://): " + url + ", using fallback.");
    if (fallbackType === "dirt") createDirtFallbackTexture(texture);
    else if (fallbackType === "wolf") createWolfFallbackTexture(texture);
    else createFallbackTexture(texture);
  };
  image.crossOrigin = "";
  image.src = url;
}

function createFallbackTexture(texture) {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const x = (i % size) / size;
    const y = Math.floor(i / size) / size;
    data[i * 4 + 0] = Math.floor(100 + 80 * x);
    data[i * 4 + 1] = Math.floor(150 + 80 * y);
    data[i * 4 + 2] = 220;
    data[i * 4 + 3] = 255;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
}

function createDirtFallbackTexture(texture) {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const x = (i % size) / size;
    const y = Math.floor(i / size) / size;
    const n = (Math.sin(x * 20) * Math.sin(y * 20) + 1) * 0.5;
    data[i * 4 + 0] = Math.floor(100 + 55 * n);
    data[i * 4 + 1] = Math.floor(70 + 40 * n);
    data[i * 4 + 2] = Math.floor(40 + 25 * n);
    data[i * 4 + 3] = 255;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
}

function createWolfFallbackTexture(texture) {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const x = (i % size) / size;
    const y = Math.floor(i / size) / size;
    const n = (Math.sin(x * 8) * Math.sin(y * 8) + 1) * 0.5;
    data[i * 4 + 0] = Math.floor(180 + 40 * n);
    data[i * 4 + 1] = Math.floor(160 + 50 * n);
    data[i * 4 + 2] = Math.floor(130 + 40 * n);
    data[i * 4 + 3] = 255;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
}

function setupKeyboard() {
  document.addEventListener("keydown", function (ev) {
    switch (ev.code) {
      case "KeyW": camera.moveForward(); ev.preventDefault(); break;
      case "KeyS": camera.moveBackwards(); ev.preventDefault(); break;
      case "KeyA": camera.moveLeft(); ev.preventDefault(); break;
      case "KeyD": camera.moveRight(); ev.preventDefault(); break;
      case "KeyQ": camera.panLeft(); ev.preventDefault(); break;
      case "KeyE": camera.panRight(); ev.preventDefault(); break;
      case "Space": camera.moveUp(); ev.preventDefault(); break;
      case "ShiftLeft":
      case "ShiftRight": camera.moveDown(); ev.preventDefault(); break;
    }
  });
}

function setupMouseLook() {
  canvas.addEventListener("click", function (ev) {
    if (!(document.pointerLockElement === canvas || document.mozPointerLockElement === canvas)) {
      canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
      if (canvas.requestPointerLock) canvas.requestPointerLock();
    }
    ev.preventDefault();
  });
  canvas.addEventListener("mousedown", function (ev) {
    if (document.pointerLockElement !== canvas && document.mozPointerLockElement !== canvas) return;
    if (ev.button === 0) { addBlockInFront(); ev.preventDefault(); }
    else if (ev.button === 2) { removeBlockInFront(); ev.preventDefault(); }
  });
  canvas.addEventListener("contextmenu", function (ev) { ev.preventDefault(); });
  document.addEventListener("mousemove", function (ev) {
    if (document.pointerLockElement !== canvas && document.mozPointerLockElement !== canvas) return;
    const sensitivity = 0.3;
    const angle = ev.movementX * sensitivity;
    if (angle > 0) camera.panRight(angle);
    else if (angle < 0) camera.panLeft(-angle);
  });
}

function tick() {
  try {
    renderScene();
  } catch (e) {
    console.error("renderScene error:", e);
  }
  requestAnimationFrame(tick);
}

function renderScene() {
  if (!gl || !camera) return;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
  gl.uniform1i(u_Sampler, 0);
  gl.uniform2f(u_texScale, 1, 1);
  gl.uniform1f(u_skybox, 0);
  gl.uniform1f(u_texColorWeight, 0);
  const ground = new Cube();
  ground.color = [0.25, 0.85, 0.25, 1];
  ground.matrix.setIdentity();
  ground.matrix.scale(MAP_SIZE, 0.1, MAP_SIZE);
  ground.render();
  if (g_dirtTexture) gl.bindTexture(gl.TEXTURE_2D, g_dirtTexture);
  gl.uniform2f(u_texScale, 1, 1);
  gl.uniform1f(u_texColorWeight, 1);
  for (let x = 0; x < MAP_SIZE; x++) {
    for (let z = 0; z < MAP_SIZE; z++) {
      const h = map[x][z];
      for (let y = 0; y < h; y++) {
        const w = new Cube();
        w.color = [1, 1, 1, 1];
        w.matrix.setIdentity();
        w.matrix.translate(x, y, z);
        w.render();
      }
    }
  }
  const ex = camera.eye.elements[0], ez = camera.eye.elements[2];
  let dx = ex - wolf.x, dz = ez - wolf.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  if (dist > WOLF_MIN_DIST) {
    const move = Math.min(WOLF_FOLLOW_SPEED * (dist - WOLF_MIN_DIST), dist - WOLF_MIN_DIST);
    if (dist > 0.001) {
      wolf.x += (dx / dist) * move;
      wolf.z += (dz / dist) * move;
    }
  }
  wolf.y = 0.2;
  if (g_wolfTexture) {
    gl.bindTexture(gl.TEXTURE_2D, g_wolfTexture);
    gl.uniform2f(u_texScale, 1, 1);
    gl.uniform1f(u_texColorWeight, 1);
    gl.uniform1f(u_skybox, 0);
    const wolfMatrix = new Matrix4();
    wolfMatrix.setIdentity();
    wolfMatrix.translate(wolf.x, wolf.y, wolf.z);
    const faceAngle = (dist > 0.001) ? Math.atan2(dx, dz) * (180 / Math.PI) : 0;
    wolfMatrix.rotate(faceAngle, 0, 1, 0);
    wolfMatrix.scale(0.0125, 0.0125, 0.0125);
    gl.uniformMatrix4fv(u_ModelMatrix, false, wolfMatrix.elements);
    gl.uniform4f(u_FragColor, 1, 1, 1, 1);
    if (wolfMesh) drawWolfMesh();
    else {
      const wolfCube = new Cube();
      wolfCube.color = [1, 1, 1, 1];
      wolfCube.matrix.setIdentity();
      wolfCube.matrix.translate(wolf.x, wolf.y, wolf.z);
      wolfCube.matrix.scale(0.8, 0.8, 0.8);
      wolfCube.render();
    }
  }
  gl.depthFunc(gl.LEQUAL);
  gl.depthMask(false);
  gl.uniform1f(u_skybox, 1);
  gl.uniform1f(u_texColorWeight, 0);
  const sky = new Cube();
  sky.color = [0.4, 0.6, 0.95, 1];
  sky.matrix.setIdentity();
  sky.matrix.translate(-500, -500, -500);
  sky.matrix.scale(1000, 1000, 1000);
  sky.render();
  gl.depthMask(true);
  gl.depthFunc(gl.LESS);
}
