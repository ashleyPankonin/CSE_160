// --- Shaders ---
const VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform float u_Size;
void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
}`;

const FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
void main() {
    gl_FragColor = u_FragColor;
}`;

// --- Globals ---
let canvas, gl;
let a_Position, u_FragColor, u_Size;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10;
let g_shapesList = [];

// --- Point class ---
class Point {
    constructor(x, y, color, size) {
        this.position = [x, y];
        this.color = color;
        this.size = size;
    }

    render() {
        gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);
        gl.uniform4fv(u_FragColor, this.color);
        gl.uniform1f(u_Size, this.size);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}

// --- Render all points ---
function renderAllShapes() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let p of g_shapesList) {
        p.render();
    }
}

// --- Click handler ---
function click(ev) {
    let rect = canvas.getBoundingClientRect();
    let x = ((ev.clientX - rect.left) / canvas.width) * 2 - 1;
    let y = 1 - ((ev.clientY - rect.top) / canvas.height) * 2;

    let p = new Point(x, y, g_selectedColor.slice(), g_selectedSize);
    g_shapesList.push(p);

    renderAllShapes();
}

// --- Setup UI ---
function setupUI() {
    document.getElementById('redSlide').oninput = e => g_selectedColor[0] = e.target.value / 100;
    document.getElementById('greenSlide').oninput = e => g_selectedColor[1] = e.target.value / 100;
    document.getElementById('blueSlide').oninput = e => g_selectedColor[2] = e.target.value / 100;
    document.getElementById('sizeSlide').oninput = e => g_selectedSize = e.target.value;
    document.getElementById('clearButton').onclick = () => { g_shapesList = []; renderAllShapes(); };
}

// --- Initialize WebGL ---
function main() {
    canvas = document.getElementById('webgl');
    gl = getWebGLContext(canvas, { preserveDrawingBuffer: true });
    if (!gl) { alert('Failed to get WebGL context'); return; }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        alert('Failed to initialize shaders');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');

    gl.enableVertexAttribArray(a_Position);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    canvas.onmousedown = click;
    canvas.onmousemove = ev => { if (ev.buttons === 1) click(ev); };

    setupUI();
}

main();
