let canvas = null;
let gl;
let a_Position;
let a_TexCoord;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler;
let u_texColorWeight;
let u_texScale;
let u_skybox;
let u_NormalViz;
let u_LightPos;
let u_LightColor;
let u_LightingOn;
let u_CameraPos;
let u_NormalMatrix;
let u_SphereCenter;
let u_UseSphereNormal;
let u_BlockCenter;
let u_UseBlockNormal;
let u_BlockFloorColor;
let u_BlockWallColor;
let u_BlockBackColor;
let u_BlockFaceNormal;
let u_UseRoomNormal;
let u_RoomFaceNormal;
let u_SpotDir;
let u_SpotCutoff;
let u_SpotExp;
let u_SpotOn;
let camera = null;
let g_cube = null;
let g_sphere = null;
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
let wolfNormalBuffer = null;

let fpsLastTime = performance.now();
let fpsEl = null;

let normalVizOn = false;
let lightingOn = true;
let lightTime = 0;
let lightManualControl = false;
const lightPosition = { x: 12, y: 8, z: 12 };
const lightColor = { r: 1, g: 1, b: 1 };
const SPHERE_POS = { x: 0, y: 0, z: 0 };
const MAP_SIZE = 32;
const ROOM_HEIGHT = 16;
const OPEN_FIELD_RADIUS = 6;
const ROOM_MARGIN = 0.2;

function clampLightToRoom() {
  lightPosition.x = Math.max(ROOM_MARGIN, Math.min(MAP_SIZE - ROOM_MARGIN, lightPosition.x));
  lightPosition.y = Math.max(ROOM_MARGIN, Math.min(ROOM_HEIGHT - ROOM_MARGIN, lightPosition.y));
  lightPosition.z = Math.max(ROOM_MARGIN, Math.min(MAP_SIZE - ROOM_MARGIN, lightPosition.z));
}

const map = [];
function buildMap() {
  for (let i = 0; i < MAP_SIZE; i++) {
    map[i] = [];
    for (let j = 0; j < MAP_SIZE; j++) {
      map[i][j] = 0;
    }
  }
}

function getSpawnCenter() {
  return { x: Math.floor(MAP_SIZE / 2) + 0.5, z: Math.floor(MAP_SIZE / 2) + 0.5 };
}

function drawRoomCube(roomMatrix) {
  gl.uniformMatrix4fv(u_ModelMatrix, false, roomMatrix.elements);
  setNormalMatrix(roomMatrix);
  const uv = [0, 0, 0, 0, 0, 0];
  if (u_UseRoomNormal) gl.uniform1f(u_UseRoomNormal, 1.0);
  gl.uniform4f(u_FragColor, 0.2, 0.75, 0.2, 1);
  if (u_RoomFaceNormal) gl.uniform3f(u_RoomFaceNormal, 0, 1, 0);
  drawTriangle3DUV([0, 0, 0, 1, 0, 0, 1, 0, 1], uv, [0, 1, 0, 0, 1, 0, 0, 1, 0]);
  drawTriangle3DUV([0, 0, 0, 1, 0, 1, 0, 0, 1], uv, [0, 1, 0, 0, 1, 0, 0, 1, 0]);
  gl.uniform4f(u_FragColor, 0.35, 0.5, 0.85, 1);
  if (u_RoomFaceNormal) gl.uniform3f(u_RoomFaceNormal, 0, -1, 0);
  drawTriangle3DUV([0, 1, 0, 1, 1, 1, 0, 1, 1], uv, [0, -1, 0, 0, -1, 0, 0, -1, 0]);
  drawTriangle3DUV([0, 1, 0, 1, 1, 0, 1, 1, 1], uv, [0, -1, 0, 0, -1, 0, 0, -1, 0]);
  if (u_RoomFaceNormal) gl.uniform3f(u_RoomFaceNormal, 0, 0, 1);
  drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], uv, [0, 0, 1, 0, 0, 1, 0, 0, 1]);
  drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], uv, [0, 0, 1, 0, 0, 1, 0, 0, 1]);
  if (u_RoomFaceNormal) gl.uniform3f(u_RoomFaceNormal, 0, 0, -1);
  drawTriangle3DUV([1, 0, 1, 0, 1, 1, 0, 0, 1], uv, [0, 0, -1, 0, 0, -1, 0, 0, -1]);
  drawTriangle3DUV([1, 0, 1, 1, 1, 1, 0, 1, 1], uv, [0, 0, -1, 0, 0, -1, 0, 0, -1]);
  if (u_RoomFaceNormal) gl.uniform3f(u_RoomFaceNormal, 1, 0, 0);
  drawTriangle3DUV([0, 1, 0, 0, 0, 1, 0, 0, 0], uv, [1, 0, 0, 1, 0, 0, 1, 0, 0]);
  drawTriangle3DUV([0, 1, 0, 0, 1, 1, 0, 0, 1], uv, [1, 0, 0, 1, 0, 0, 1, 0, 0]);
  if (u_RoomFaceNormal) gl.uniform3f(u_RoomFaceNormal, -1, 0, 0);
  drawTriangle3DUV([1, 0, 0, 1, 1, 1, 1, 0, 1], uv, [-1, 0, 0, -1, 0, 0, -1, 0, 0]);
  drawTriangle3DUV([1, 0, 0, 1, 1, 0, 1, 1, 1], uv, [-1, 0, 0, -1, 0, 0, -1, 0, 0]);
  if (u_UseRoomNormal) gl.uniform1f(u_UseRoomNormal, 0.0);
}

function setNormalMatrix(modelMatrix) {
  try {
    const inv = new Matrix4().setInverseOf(modelMatrix);
    const e = inv.elements;
    const n = [e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]];
    if (u_NormalMatrix) gl.uniformMatrix3fv(u_NormalMatrix, false, n);
  } catch (err) {
    if (u_NormalMatrix) gl.uniformMatrix3fv(u_NormalMatrix, false, [1,0,0, 0,1,0, 0,0,1]);
  }
}

function drawBlockAsFaces() {
  const uv = [0, 0, 0, 0, 0, 0];
  const n = (nx, ny, nz) => [nx, ny, nz, nx, ny, nz, nx, ny, nz];
  if (u_BlockFaceNormal) gl.uniform3f(u_BlockFaceNormal, 0, 0, -1);
  drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0], n(0,0,-1));
  drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1], n(0,0,-1));
  if (u_BlockFaceNormal) gl.uniform3f(u_BlockFaceNormal, 0, 0, 1);
  drawTriangle3DUV([0,0,1, 1,0,1, 1,1,1], [0,0, 1,0, 1,1], n(0,0,1));
  drawTriangle3DUV([0,0,1, 1,1,1, 0,1,1], [0,0, 1,1, 0,1], n(0,0,1));
  if (u_BlockFaceNormal) gl.uniform3f(u_BlockFaceNormal, 0, 1, 0);
  drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,0, 0,1, 1,1], n(0,1,0));
  drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,0, 1,1, 1,0], n(0,1,0));
  if (u_BlockFaceNormal) gl.uniform3f(u_BlockFaceNormal, 0, -1, 0);
  drawTriangle3DUV([0,0,0, 1,0,0, 1,0,1], [0,0, 1,0, 1,1], n(0,-1,0));
  drawTriangle3DUV([0,0,0, 1,0,1, 0,0,1], [0,0, 1,1, 0,1], n(0,-1,0));
  if (u_BlockFaceNormal) gl.uniform3f(u_BlockFaceNormal, 1, 0, 0);
  drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1], n(1,0,0));
  drawTriangle3DUV([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], n(1,0,0));
  if (u_BlockFaceNormal) gl.uniform3f(u_BlockFaceNormal, -1, 0, 0);
  drawTriangle3DUV([0,0,0, 0,0,1, 0,1,1], [0,0, 1,0, 1,1], n(-1,0,0));
  drawTriangle3DUV([0,0,0, 0,1,1, 0,1,0], [0,0, 1,1, 0,1], n(-1,0,0));
}

function parseObjText(text) {
  const lines = text.split("\n");
  const v = [], vt = [], vn = [];
  const outPos = [], outUv = [], outNorm = [];
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === "v" && parts.length >= 4) {
      v.push(+parts[1], +parts[2], +parts[3]);
    } else if (parts[0] === "vt" && parts.length >= 3) {
      vt.push(+parts[1], +parts[2]);
    } else if (parts[0] === "vn" && parts.length >= 4) {
      vn.push(+parts[1], +parts[2], +parts[3]);
    } else if (parts[0] === "f" && parts.length >= 4) {
      const idx = (p) => {
        const i = p.split("/").map(x => parseInt(x, 10) || 0);
        return {
          vi: (i[0] - 1) * 3,
          vti: i[1] ? (i[1] - 1) * 2 : -1,
          vni: i[2] ? (i[2] - 1) * 3 : -1
        };
      };
      const tri = (a, b, c) => {
        const ia = idx(a), ib = idx(b), ic = idx(c);
        const ax = v[ia.vi], ay = v[ia.vi + 1], az = v[ia.vi + 2];
        const bx = v[ib.vi], by = v[ib.vi + 1], bz = v[ib.vi + 2];
        const cx = v[ic.vi], cy = v[ic.vi + 1], cz = v[ic.vi + 2];
        let nx, ny, nz;
        if (ia.vni >= 0 && vn.length > 0) {
          nx = vn[ia.vni]; ny = vn[ia.vni + 1]; nz = vn[ia.vni + 2];
        } else {
          const e1x = bx - ax, e1y = by - ay, e1z = bz - az;
          const e2x = cx - ax, e2y = cy - ay, e2z = cz - az;
          nx = e1y * e2z - e1z * e2y;
          ny = e1z * e2x - e1x * e2z;
          nz = e1x * e2y - e1y * e2x;
          const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          nx /= len; ny /= len; nz /= len;
        }
        [a, b, c].forEach((p) => {
          const { vi, vti, vni } = idx(p);
          outPos.push(v[vi], v[vi + 1], v[vi + 2]);
          outUv.push(vti >= 0 ? vt[vti] : 0, vti >= 0 ? vt[vti + 1] : 0);
          if (vni >= 0 && vn.length > 0) {
            outNorm.push(vn[vni], vn[vni + 1], vn[vni + 2]);
          } else {
            outNorm.push(nx, ny, nz);
          }
        });
      };
      for (let i = 1; i < parts.length - 2; i++) tri(parts[1], parts[i + 1], parts[i + 2]);
    }
  }
  if (outNorm.length === 0) {
    for (let i = 0; i < outPos.length / 3; i++) outNorm.push(0, 1, 0);
  }
  return {
    positions: new Float32Array(outPos),
    uvs: new Float32Array(outUv),
    normals: new Float32Array(outNorm),
    numVertices: outPos.length / 3
  };
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
  if (!wolfMesh.uvs) return;
  if (!wolfMeshBuffer) {
    wolfMeshBuffer = gl.createBuffer();
    wolfUVBuffer = gl.createBuffer();
    if (wolfMesh.normals && wolfMesh.normals.length >= wolfMesh.numVertices * 3)
      wolfNormalBuffer = gl.createBuffer();
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, wolfMeshBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, wolfMesh.positions, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.bindBuffer(gl.ARRAY_BUFFER, wolfUVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, wolfMesh.uvs, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_TexCoord);
  if (wolfNormalBuffer && wolfMesh.normals && a_Normal >= 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, wolfNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, wolfMesh.normals, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);
  }
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

const VSHADER_SIMPLE = `
attribute vec4 a_Position;
attribute vec2 a_TexCoord;
attribute vec3 a_Normal;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform mat3 u_NormalMatrix;
uniform vec3 u_LightPos;
uniform vec2 u_texScale;
uniform float u_skybox;
varying vec2 v_TexCoord;
varying vec3 v_NormalDir;
varying vec3 v_LightDir;
varying vec3 v_WorldPos;
void main() {
  vec4 worldPos4 = u_ModelMatrix * a_Position;
  v_WorldPos = worldPos4.xyz;
  vec3 lightVector = u_LightPos - v_WorldPos;
  v_LightDir = length(lightVector) > 0.001 ? normalize(lightVector) : vec3(0.0, 1.0, 0.0);
  v_NormalDir = normalize(u_NormalMatrix * a_Normal);
  vec4 pos = u_ProjectionMatrix * u_ViewMatrix * worldPos4;
  if (u_skybox > 0.5) pos.z = pos.w;
  gl_Position = pos;
  v_TexCoord = a_TexCoord * u_texScale;
}
`;

const FSHADER_SIMPLE = `
precision mediump float;
uniform vec4 u_FragColor;
uniform sampler2D u_Sampler;
uniform float u_texColorWeight;
uniform float u_NormalViz;
uniform vec3 u_LightPos;
uniform vec3 u_LightColor;
uniform float u_LightingOn;
uniform vec3 u_CameraPos;
uniform float u_UseSphereNormal;
uniform vec3 u_SphereCenter;
uniform float u_UseBlockNormal;
uniform vec3 u_BlockCenter;
uniform vec4 u_BlockFloorColor;
uniform vec4 u_BlockWallColor;
uniform vec4 u_BlockBackColor;
uniform vec3 u_BlockFaceNormal;
uniform float u_UseRoomNormal;
uniform vec3 u_RoomFaceNormal;
uniform vec3 u_SpotDir;
uniform float u_SpotCutoff;
uniform float u_SpotExp;
uniform float u_SpotOn;
varying vec2 v_TexCoord;
varying vec3 v_NormalDir;
varying vec3 v_LightDir;
varying vec3 v_WorldPos;
void main() {
  if (u_NormalViz > 0.5) {
    // Boundary style: N*0.5+0.5. Room=flat face normal; blocks=u_BlockFaceNormal; wolf=vertex normal.
    vec3 N;
    if (u_UseSphereNormal > 0.5) {
      N = normalize(v_WorldPos - u_SphereCenter);
    } else if (u_UseRoomNormal > 0.5) {
      N = normalize(u_RoomFaceNormal);
    } else if (u_UseBlockNormal > 0.5) {
      N = normalize(u_BlockFaceNormal);
    } else {
      N = normalize(v_NormalDir);
    }
    gl_FragColor = vec4(N * 0.5 + 0.5, 1.0);
    return;
  }
  vec3 N;
  if (u_UseSphereNormal > 0.5) {
    N = normalize(v_WorldPos - u_SphereCenter);
  } else if (u_UseBlockNormal > 0.5) {
    // Blocks: use flat per-face normal for lighting, but keep dirt texture color
    N = normalize(u_BlockFaceNormal);
  } else if (u_UseRoomNormal > 0.5) {
    N = normalize(u_RoomFaceNormal);
  } else {
    N = normalize(v_NormalDir);
  }
  vec4 baseColor = u_FragColor;
  float t = u_texColorWeight;
  vec4 texColor = texture2D(u_Sampler, v_TexCoord);
  baseColor = (1.0 - t) * baseColor + t * texColor;
  if (u_LightingOn < 0.5) {
    gl_FragColor = baseColor;
    return;
  }
  vec3 L = normalize(v_LightDir);
  vec3 V = normalize(u_CameraPos - v_WorldPos);
  vec3 H = normalize(L + V);
  float NdotL = max(dot(N, L), 0.0);
  float NdotH = max(dot(N, H), 0.0);
  float ambient = 0.05;
  float diffuse = 0.88 * NdotL;
  float specular = 0.6 * pow(NdotH, 72.0);
  vec3 ambientPart = ambient * u_LightColor;
  vec3 directionalPart = (diffuse + specular) * u_LightColor;
  if (u_SpotOn > 0.5) {
    float spotDot = dot(L, u_SpotDir);
    float spotFactor = 0.0;
    if (spotDot >= u_SpotCutoff)
      spotFactor = pow((spotDot - u_SpotCutoff) / (1.0 - u_SpotCutoff), u_SpotExp);
    directionalPart *= (1.0 + spotFactor);
  }
  vec3 lightContrib = ambientPart + directionalPart;
  vec3 bounce = 0.18 * max(0.0, -N.y) * vec3(0.2, 0.45, 0.2);
  lightContrib += bounce;
  gl_FragColor = vec4(baseColor.rgb * lightContrib, baseColor.a);
}
`;

function main() {
  try {
    canvas = document.getElementById("webgl");
    if (!canvas) { console.error("Canvas #webgl not found"); return; }
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: true });
    if (!gl) gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true, antialias: true });
    if (!gl) { console.error("WebGL not supported"); return; }
    if (!initShaders(gl, VSHADER_SIMPLE, FSHADER_SIMPLE)) {
      console.error("Shaders failed to compile");
      return;
    }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
  a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
  u_texColorWeight = gl.getUniformLocation(gl.program, "u_texColorWeight");
  u_texScale = gl.getUniformLocation(gl.program, "u_texScale");
  u_skybox = gl.getUniformLocation(gl.program, "u_skybox");
  u_NormalViz = gl.getUniformLocation(gl.program, "u_NormalViz");
  u_LightPos = gl.getUniformLocation(gl.program, "u_LightPos");
  u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
  u_LightingOn = gl.getUniformLocation(gl.program, "u_LightingOn");
  u_CameraPos = gl.getUniformLocation(gl.program, "u_CameraPos");
  u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  u_SphereCenter = gl.getUniformLocation(gl.program, "u_SphereCenter");
  u_UseSphereNormal = gl.getUniformLocation(gl.program, "u_UseSphereNormal");
  u_BlockCenter = gl.getUniformLocation(gl.program, "u_BlockCenter");
  u_UseBlockNormal = gl.getUniformLocation(gl.program, "u_UseBlockNormal");
  u_BlockFloorColor = gl.getUniformLocation(gl.program, "u_BlockFloorColor");
  u_BlockWallColor = gl.getUniformLocation(gl.program, "u_BlockWallColor");
  u_BlockBackColor = gl.getUniformLocation(gl.program, "u_BlockBackColor");
  u_BlockFaceNormal = gl.getUniformLocation(gl.program, "u_BlockFaceNormal");
  u_UseRoomNormal = gl.getUniformLocation(gl.program, "u_UseRoomNormal");
  u_RoomFaceNormal = gl.getUniformLocation(gl.program, "u_RoomFaceNormal");
  u_SpotDir = gl.getUniformLocation(gl.program, "u_SpotDir");
  u_SpotCutoff = gl.getUniformLocation(gl.program, "u_SpotCutoff");
  u_SpotExp = gl.getUniformLocation(gl.program, "u_SpotExp");
  u_SpotOn = gl.getUniformLocation(gl.program, "u_SpotOn");

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.4, 0.6, 0.95, 1);

  camera = new Camera(canvas);
  g_cube = new Cube();
  g_sphere = new Sphere();
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
  SPHERE_POS.x = spawn.x;
  SPHERE_POS.y = 0.7;
  SPHERE_POS.z = spawn.z - 3;
  lightPosition.x = spawn.x + 4;
  lightPosition.y = 5;
  lightPosition.z = spawn.z - 6;
  clampLightToRoom();
  const wallZ = Math.floor(spawn.z) - 5;
  const wallXStart = Math.floor(spawn.x) - 2;
  const wallXEnd = Math.floor(spawn.x) + 2;
  const wallHeight = 4;
  for (let x = wallXStart; x <= wallXEnd; x++) {
    if (x >= 0 && x < MAP_SIZE && wallZ >= 0 && wallZ < MAP_SIZE)
      map[x][wallZ] = Math.max(map[x][wallZ] || 0, wallHeight);
  }
  const base = (typeof window !== "undefined" && window.location) ? (window.location.href.replace(/[^/]*$/, "")) : "";
  initTextures(base);
  loadObjModel(base + "src/minecraft-wolf/source/wolf.obj", function (mesh) { wolfMesh = mesh; if (mesh) console.log("Wolf model loaded:", mesh.numVertices, "vertices"); });
  setupKeyboard();
  setupMouseLook();
  setupNormalVizButton();
  setupLightingUI();
  window.addEventListener("resize", onResize);
  onResize();
  if (!canvas.width || canvas.width < 100) canvas.width = 800;
  if (!canvas.height || canvas.height < 100) canvas.height = 600;
  gl.viewport(0, 0, canvas.width, canvas.height);
  if (camera) camera.updateProjection();
  fpsEl = document.getElementById("fps");
  requestAnimationFrame(tick);
  console.log("World started. Canvas:", canvas.width, "x", canvas.height);
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
  g_groundTexture = createTextureWithFallback(src + "green.jpg", true, "green");
  g_dirtTexture = createTextureWithFallback(src + "dirt.jpeg", false, "dirt");
  g_wallTexture = g_skyTexture;
  g_wolfTexture = createTextureWithFallback(base + "src/minecraft-wolf/textures/wolf.png", false, "wolf");
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
  else if (fallbackType === "green") createGreenFallbackTexture(texture);
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
    else if (fallbackType === "green") createGreenFallbackTexture(texture);
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

function createGreenFallbackTexture(texture) {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const x = (i % size) / size;
    const y = Math.floor(i / size) / size;
    const n = (Math.sin(x * 12) * Math.sin(y * 12) + 1) * 0.5;
    data[i * 4 + 0] = Math.floor(40 + 60 * n);
    data[i * 4 + 1] = Math.floor(140 + 50 * n);
    data[i * 4 + 2] = Math.floor(50 + 40 * n);
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
      case "KeyA": camera.moveRight(); ev.preventDefault(); break;
      case "KeyD": camera.moveLeft(); ev.preventDefault(); break;
      case "KeyQ": camera.panLeft(); ev.preventDefault(); break;
      case "KeyE": camera.panRight(); ev.preventDefault(); break;
      case "Space": camera.moveUp(); ev.preventDefault(); break;
      case "ShiftLeft":
      case "ShiftRight": camera.moveDown(); ev.preventDefault(); break;
    }
  });
}

function setupNormalVizButton() {
  const btn = document.getElementById("normal-viz-btn");
  if (btn) {
    btn.addEventListener("click", function () {
      normalVizOn = !normalVizOn;
      this.textContent = normalVizOn ? "Normals: ON" : "Normals: OFF";
    });
  }
}

function setupLightingUI() {
  const toggle = document.getElementById("lighting-toggle");
  if (toggle) toggle.addEventListener("click", function () {
    lightingOn = !lightingOn;
    this.textContent = lightingOn ? "Lighting: ON" : "Lighting: OFF";
  });
  const sx = document.getElementById("light-x"), sy = document.getElementById("light-y"), sz = document.getElementById("light-z");
  if (sx) { sx.value = lightPosition.x; sx.addEventListener("input", function () { lightManualControl = true; lightPosition.x = parseFloat(this.value); clampLightToRoom(); if (sx) sx.value = lightPosition.x; }); }
  if (sy) { sy.value = lightPosition.y; sy.addEventListener("input", function () { lightManualControl = true; lightPosition.y = parseFloat(this.value); clampLightToRoom(); if (sy) sy.value = lightPosition.y; }); }
  if (sz) { sz.value = lightPosition.z; sz.addEventListener("input", function () { lightManualControl = true; lightPosition.z = parseFloat(this.value); clampLightToRoom(); if (sz) sz.value = lightPosition.z; }); }
  const sr = document.getElementById("light-r"), sg = document.getElementById("light-g"), sb = document.getElementById("light-b");
  if (sr) { sr.value = lightColor.r; sr.addEventListener("input", function () { lightColor.r = parseFloat(this.value); }); }
  if (sg) { sg.value = lightColor.g; sg.addEventListener("input", function () { lightColor.g = parseFloat(this.value); }); }
  if (sb) { sb.value = lightColor.b; sb.addEventListener("input", function () { lightColor.b = parseFloat(this.value); }); }
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
    const angleX = ev.movementX * sensitivity;
    const angleY = ev.movementY * sensitivity;
    if (angleX > 0) camera.panRight(angleX);
    else if (angleX < 0) camera.panLeft(-angleX);
    if (angleY > 0) camera.panDown(angleY);
    else if (angleY < 0) camera.panUp(-angleY);
  });
}

function tick() {
  lightTime += 0.016;
  if (!lightManualControl) {
    const spawn = getSpawnCenter();
    const sunAngle = lightTime * 0.9;
    const orbitRadius = MAP_SIZE / 2 - ROOM_MARGIN - 1;
    const orbitHeight = ROOM_HEIGHT / 2;
    lightPosition.x = spawn.x + orbitRadius * Math.cos(sunAngle);
    lightPosition.z = spawn.z + orbitRadius * Math.sin(sunAngle);
    lightPosition.y = orbitHeight;
    clampLightToRoom();
    const sx = document.getElementById("light-x"), sy = document.getElementById("light-y"), sz = document.getElementById("light-z");
    if (sx) sx.value = lightPosition.x;
    if (sy) sy.value = lightPosition.y;
    if (sz) sz.value = lightPosition.z;
  }
  try {
    renderScene();
  } catch (e) {
    console.error("renderScene error:", e);
  }
  if (fpsEl) {
    const now = performance.now();
    const dt = now - fpsLastTime;
    fpsLastTime = now;
    const fps = dt > 0 ? Math.round(1000 / dt) : 0;
    fpsEl.textContent = fps + " FPS";
  }
  requestAnimationFrame(tick);
}

function computeBlockRegions(map) {
  const regionId = [];
  for (let x = 0; x < MAP_SIZE; x++) {
    regionId[x] = [];
    for (let z = 0; z < MAP_SIZE; z++) regionId[x][z] = -1;
  }
  let nextId = 0;
  const regionCenters = [];
  for (let sx = 0; sx < MAP_SIZE; sx++) {
    for (let sz = 0; sz < MAP_SIZE; sz++) {
      if (map[sx][sz] <= 0 || regionId[sx][sz] >= 0) continue;
      const id = nextId++;
      const stack = [[sx, sz]];
      let minX = sx, maxX = sx, minZ = sz, maxZ = sz, maxY = 0;
      while (stack.length > 0) {
        const [x, z] = stack.pop();
        if (x < 0 || x >= MAP_SIZE || z < 0 || z >= MAP_SIZE || map[x][z] <= 0 || regionId[x][z] >= 0) continue;
        regionId[x][z] = id;
        const h = map[x][z];
        if (h > maxY) maxY = h;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
        stack.push([x + 1, z]); stack.push([x - 1, z]);
        stack.push([x, z + 1]); stack.push([x, z - 1]);
      }
      const cy = maxY > 0 ? (maxY - 1) / 2 + 0.5 : 0.5;
      regionCenters[id] = {
        x: (minX + maxX) / 2 + 0.5,
        y: cy,
        z: (minZ + maxZ) / 2 + 0.5
      };
    }
  }
  return { regionId, regionCenters };
}

function renderScene() {
  if (!gl || !camera) return;
  gl.useProgram(gl.program);
  const w = canvas.width || 800;
  const h = canvas.height || 600;
  if (w < 1 || h < 1) return;
  gl.viewport(0, 0, w, h);
  gl.clearColor(0.4, 0.6, 0.95, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (g_dirtTexture) gl.bindTexture(gl.TEXTURE_2D, g_dirtTexture);
  else if (g_groundTexture) gl.bindTexture(gl.TEXTURE_2D, g_groundTexture);
  else if (g_skyTexture) gl.bindTexture(gl.TEXTURE_2D, g_skyTexture);
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
  gl.uniform1i(u_Sampler, 0);
  gl.uniform2f(u_texScale, 1, 1);
  gl.uniform1f(u_skybox, 0);
  if (u_NormalViz) gl.uniform1f(u_NormalViz, normalVizOn ? 1.0 : 0.0);
  if (u_LightPos) gl.uniform3f(u_LightPos, lightPosition.x, lightPosition.y, lightPosition.z);
  if (u_LightColor) gl.uniform3f(u_LightColor, lightColor.r, lightColor.g, lightColor.b);
  if (u_LightingOn) gl.uniform1f(u_LightingOn, lightingOn ? 1.0 : 0.0);
  if (u_CameraPos) gl.uniform3f(u_CameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
  if (u_UseSphereNormal) gl.uniform1f(u_UseSphereNormal, 0.0);
  if (u_UseBlockNormal) gl.uniform1f(u_UseBlockNormal, 0.0);
  const sceneCenter = getSpawnCenter();
  const sx = sceneCenter.x - lightPosition.x, sy = 0.5 - lightPosition.y, sz = sceneCenter.z - lightPosition.z;
  const spotLen = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1;
  if (u_SpotDir) gl.uniform3f(u_SpotDir, sx / spotLen, sy / spotLen, sz / spotLen);
  if (u_SpotCutoff !== null && u_SpotCutoff !== undefined) gl.uniform1f(u_SpotCutoff, 0.65);
  if (u_SpotExp !== null && u_SpotExp !== undefined) gl.uniform1f(u_SpotExp, 25.0);
  if (u_SpotOn) gl.uniform1f(u_SpotOn, 1.0);

  const blockRegions = computeBlockRegions(map);
  gl.uniform2f(u_texScale, 1, 1);
  gl.uniform1f(u_texColorWeight, 0);
  const roomMatrix = new Matrix4();
  roomMatrix.setIdentity();
  roomMatrix.scale(MAP_SIZE, ROOM_HEIGHT, MAP_SIZE);
  const prevFrontFace = gl.getParameter(gl.FRONT_FACE);
  gl.frontFace(gl.CW);
  drawRoomCube(roomMatrix);
  gl.frontFace(prevFrontFace);
  gl.uniform2f(u_texScale, 1, 1);
  gl.uniform1f(u_texColorWeight, 1);
  if (u_BlockFloorColor) gl.uniform4f(u_BlockFloorColor, 0.2, 0.75, 0.2, 1);
  if (u_BlockWallColor) gl.uniform4f(u_BlockWallColor, 0.35, 0.5, 0.85, 1);
  if (u_BlockBackColor) gl.uniform4f(u_BlockBackColor, 0.12, 0.45, 0.12, 1);
  for (let x = 0; x < MAP_SIZE; x++) {
    for (let z = 0; z < MAP_SIZE; z++) {
      const blockHeight = map[x][z];
      for (let y = 0; y < blockHeight; y++) {
        const blockMatrix = new Matrix4();
        blockMatrix.setIdentity();
        blockMatrix.translate(x, y, z);
        gl.uniformMatrix4fv(u_ModelMatrix, false, blockMatrix.elements);
        setNormalMatrix(blockMatrix);
        if (u_UseBlockNormal) gl.uniform1f(u_UseBlockNormal, 1.0);
        drawBlockAsFaces();
      }
    }
  }
  if (u_UseBlockNormal) gl.uniform1f(u_UseBlockNormal, 0.0);
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
    setNormalMatrix(wolfMatrix);
    gl.uniform4f(u_FragColor, 1, 1, 1, 1);
    if (wolfMesh) drawWolfMesh();
    else {
      const wolfCube = new Cube();
      wolfCube.color = [1, 1, 1, 1];
      wolfCube.matrix.setIdentity();
      wolfCube.matrix.translate(wolf.x, wolf.y, wolf.z);
      wolfCube.matrix.scale(0.8, 0.8, 0.8);
      setNormalMatrix(wolfCube.matrix);
      wolfCube.render();
    }
  }
  gl.uniform1f(u_texColorWeight, 0);
  gl.uniform1f(u_skybox, 0);
  const sphereMatrix = new Matrix4();
  sphereMatrix.setIdentity();
  sphereMatrix.translate(SPHERE_POS.x, SPHERE_POS.y, SPHERE_POS.z);
  sphereMatrix.scale(0.4, 0.4, 0.4);
  g_sphere.matrix = sphereMatrix;
  g_sphere.color = [1, 0.4, 0.2, 1];
  if (u_LightPos) gl.uniform3f(u_LightPos, lightPosition.x, lightPosition.y, lightPosition.z);
  if (u_LightColor) gl.uniform3f(u_LightColor, lightColor.r, lightColor.g, lightColor.b);
  if (u_LightingOn) gl.uniform1f(u_LightingOn, lightingOn ? 1.0 : 0.0);
  if (u_CameraPos) gl.uniform3f(u_CameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
  gl.uniformMatrix4fv(u_ModelMatrix, false, sphereMatrix.elements);
  setNormalMatrix(sphereMatrix);
  if (u_SphereCenter) gl.uniform3f(u_SphereCenter, SPHERE_POS.x, SPHERE_POS.y, SPHERE_POS.z);
  if (u_UseSphereNormal) gl.uniform1f(u_UseSphereNormal, 1.0);
  g_sphere.render();

  if (u_UseSphereNormal) gl.uniform1f(u_UseSphereNormal, 0.0);

  if (u_LightPos) gl.uniform3f(u_LightPos, lightPosition.x, lightPosition.y, lightPosition.z);
  const lightingOnPrev = lightingOn;
  if (u_LightingOn) gl.uniform1f(u_LightingOn, 0.0);
  const sunMatrix = new Matrix4();
  sunMatrix.setIdentity();
  sunMatrix.translate(lightPosition.x, lightPosition.y, lightPosition.z);
  sunMatrix.scale(0.78, 0.78, 0.78);
  g_sphere.matrix = sunMatrix;
  g_sphere.color = [1, 0.95, 0.6, 1];
  gl.uniformMatrix4fv(u_ModelMatrix, false, sunMatrix.elements);
  setNormalMatrix(sunMatrix);
  if (u_SphereCenter) gl.uniform3f(u_SphereCenter, lightPosition.x, lightPosition.y, lightPosition.z);
  if (u_UseSphereNormal) gl.uniform1f(u_UseSphereNormal, 1.0);
  g_sphere.render();
  if (u_UseSphereNormal) gl.uniform1f(u_UseSphereNormal, 0.0);
  if (u_LightingOn) gl.uniform1f(u_LightingOn, lightingOnPrev ? 1.0 : 0.0);

  gl.depthFunc(gl.LEQUAL);
  gl.depthMask(false);
  gl.uniform1f(u_skybox, 1);
  gl.uniform1f(u_texColorWeight, 0);
  const sky = new Cube();
  sky.color = [0.4, 0.6, 0.95, 1];
  sky.matrix.setIdentity();
  sky.matrix.translate(-500, -500, -500);
  sky.matrix.scale(1000, 1000, 1000);
  setNormalMatrix(sky.matrix);
  sky.render();
  gl.depthMask(true);
  gl.depthFunc(gl.LESS);
}
