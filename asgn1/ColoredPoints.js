// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
const VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform float u_Size;
void main() {
    gl_Position = a_Position;
    //g1_PointSize = 30.0;
    gl_PointSize = u_Size;
}`;

const FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
void main() {
    gl_FragColor = u_FragColor;
}`;

let canvas, gl;
let a_Position, u_FragColor, u_Size;
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];

function setupWebGL(){
  canvas = document.getElementById('webgl');
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true})
  //gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

function setSelectedColor(r, g, b, a = 1.0) {
  // Update global color
  g_selectedColor = [r, g, b, a];

  // Update sliders (convert 0–1 → 0–100)
  document.getElementById('redSlide').value   = r * 100;
  document.getElementById('greenSlide').value = g * 100;
  document.getElementById('blueSlide').value  = b * 100;
}

let g_selectedSize = 5;
let g_selectedType =POINT;
let g_eraserActive = false;
let g_eraserSize = 40;

function addActionsForHtmlUI(){
  document.getElementById('redSlide').addEventListener('input', function() {
    setSelectedColor(this.value / 100, g_selectedColor[1], g_selectedColor[2]);
});

  document.getElementById('greenSlide').addEventListener('input', function() {
    setSelectedColor(g_selectedColor[0], this.value / 100, g_selectedColor[2]);
});

  document.getElementById('blueSlide').addEventListener('input', function() {
    setSelectedColor(g_selectedColor[0], g_selectedColor[1], this.value / 100);
});

  document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value; });

  document.getElementById('clearButton').onclick = function() {g_shapesList=[]; renderAllShapes(); };

  document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
  document.getElementById('triButton').onclick = function() {g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};

  document.getElementById('segmentsSlide').addEventListener('input', function() {
    g_circleSegments = Number(this.value);        // update global
    document.getElementById('segmentsValue').innerText = this.value;}); // update display

  document.getElementById('kirbyButton').onclick = function() {
  g_shapesList = [];
  renderAllShapes();
  drawKirby();         
};

  document.getElementById('eraserButton').onclick = function() {
    g_eraserActive = !g_eraserActive;
    this.textContent = g_eraserActive ? "Eraser ON" : "Eraser OFF";
    canvas.style.cursor = g_eraserActive ? 'crosshair' : 'default';
  };
  document.getElementById('eraserSizeSlide').addEventListener('input', function() {
    g_eraserSize = Number(this.value);
    document.getElementById('eraserSizeValue').innerText = this.value;
});
 
}


function main() {
  setupWebGL();
  connectVariablesToGLSL();
  canvas.onmousedown = click;

  canvas.onmousemove = function(ev) {
    if (ev.buttons === 1) {   // left button held → draw
      click(ev);
    }
    if (g_eraserActive) {     // hover erase
      let [x, y] = convertCoordinatesEventsToGL(ev);
      eraseNearbyShapes(x, y);
    }
  };
  addActionsForHtmlUI();
  setSelectedColor(1.0, 0.0, 0.0);
  



  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList=[];
let g_circleSegments = 10;

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

function click(ev) {
  let [x,y] = convertCoordinatesEventsToGL(ev);
  if (g_eraserActive) return;

  let point;
  if(g_selectedType==POINT){
    point = new Point();
  } else if (g_selectedType==TRIANGLE){
    point = new Triangle();
  } else {
    point = new Circle();
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);

  // Store the coordinates to g_points array
 // g_points.push([x, y]);

 // g_colors.push(g_selectedColor.slice()); 
 // g_sizes.push(g_selectedSize);
  // Store the coordinates to g_points array
  //if (x >= 0.0 && y >= 0.0) {      // First quadrant
 //   g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
 // } else if (x < 0.0 && y < 0.0) { // Third quadrant
  //  g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
 // } else {                         // Others
  //  g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
 // }
  renderAllShapes();
}

function convertCoordinatesEventsToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  // Store the coordinates to g_points array
  return([x, y]);
}

function renderAllShapes(){

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();

   // var xy = g_shapesList[i].position;
   // var rgba = g_shapesList[i].color;
   // var size = g_shapesList[i].size;

    // Pass the position of a point to a_Position variable
   // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
   // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

   // gl.uniform1f(u_Size, size);
    // Draw
   // gl.drawArrays(gl.POINTS, 0, 1);
  }
}

function eraseNearbyShapes(mx, my) {
  let somethingRemoved = false;

  
  for (let i = g_shapesList.length - 1; i >= 0; i--) {
    let shape = g_shapesList[i];
    let dx = shape.position[0] - mx;
    let dy = shape.position[1] - my;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Adjust hit area 
    let hitRadius = 0.015;  
    if (shape instanceof Point) {
      hitRadius += shape.size / 400;
    } else if (shape instanceof Triangle) {
      hitRadius += shape.size / 120;
    } else if (shape instanceof Circle) {
      hitRadius += shape.size / 120 + (shape.segments || 10) * 0.004;
    }

    let eraserRadiusGL = (g_eraserSize / canvas.width) * 2;


    if (distance < hitRadius + eraserRadiusGL) {
      g_shapesList.splice(i, 1);
      somethingRemoved = true;
    }
  }

  if (somethingRemoved) {
    renderAllShapes();
  }
}