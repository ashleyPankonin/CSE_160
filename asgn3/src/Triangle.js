
class Triangle{
  constructor(x1, y1, x2, y2, x3, y3, color){
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;
    this.color = color; 
  }

  render(){
    
    let vertices = new Float32Array([
      this.x1, this.y1,
      this.x2, this.y2,
      this.x3, this.y3
    ]);

    let vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
      console.log('Failed to create the buffer object');
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
let g_tri3DBuffer = null;
let g_tri3DUVBuffer = null;

function drawTriangle3D(verts) {
  const uvs = [0, 0, 0, 0, 0, 0];
  drawTriangle3DUV(verts, uvs);
}

function drawTriangle3DUV(verts, uvs) {
  if (!g_tri3DBuffer) {
    g_tri3DBuffer = gl.createBuffer();
    if (!g_tri3DBuffer) {
      console.log('Failed to create the buffer object');
      return;
    }
  }
  if (!g_tri3DUVBuffer) {
    g_tri3DUVBuffer = gl.createBuffer();
    if (!g_tri3DUVBuffer) {
      console.log('Failed to create the UV buffer object');
      return;
    }
  }

  const vertices = new Float32Array(verts);
  const uvData = new Float32Array(uvs);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_tri3DBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_tri3DUVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, uvData, gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_TexCoord);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

