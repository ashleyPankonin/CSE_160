
class Cube{
  constructor(){
    this.type='cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }
  render() {
    let rgba = this.color;
    const uv00 = [0, 0, 1, 1, 1, 0];
    const uv01 = [0, 0, 0, 1, 1, 1];
    const uvBack0 = [0, 0, 1, 0, 1, 1];
    const uvBack1 = [0, 0, 1, 1, 0, 1];
    const uvTop0 = [0, 0, 0, 1, 1, 1];
    const uvTop1 = [0, 0, 1, 1, 1, 0];
    const uvBottom0 = [0, 0, 1, 0, 1, 1];
    const uvBottom1 = [0, 0, 1, 1, 0, 1];
    const uvRight0 = [0, 0, 0, 1, 1, 1];
    const uvRight1 = [0, 0, 1, 1, 1, 0];
    const uvLeft0 = [0, 0, 1, 0, 1, 1];
    const uvLeft1 = [0, 0, 1, 1, 0, 1];
    const nFront = [0, 0, -1, 0, 0, -1, 0, 0, -1];
    const nBack = [0, 0, 1, 0, 0, 1, 0, 0, 1];
    const nTop = [0, 1, 0, 0, 1, 0, 0, 1, 0];
    const nBottom = [0, -1, 0, 0, -1, 0, 0, -1, 0];
    const nRight = [1, 0, 0, 1, 0, 0, 1, 0, 0];
    const nLeft = [-1, 0, 0, -1, 0, 0, -1, 0, 0];

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], uv00, nFront);
    drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], uv01, nFront);

    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3DUV([0,0,1,  1,0,1,  1,1,1], uvBack0, nBack);
    drawTriangle3DUV([0,0,1,  1,1,1,  0,1,1], uvBack1, nBack);

    gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);
    drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], uvTop0, nTop);
    drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], uvTop1, nTop);

    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3DUV([0,0,0,  1,0,0,  1,0,1], uvBottom0, nBottom);
    drawTriangle3DUV([0,0,0,  1,0,1,  0,0,1], uvBottom1, nBottom);

    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3DUV([1,0,0,  1,1,0,  1,1,1], uvRight0, nRight);
    drawTriangle3DUV([1,0,0,  1,1,1,  1,0,1], uvRight1, nRight);

    gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
    drawTriangle3DUV([0,0,0,  0,0,1,  0,1,1], uvLeft0, nLeft);
    drawTriangle3DUV([0,0,0,  0,1,1,  0,1,0], uvLeft1, nLeft);
  }
}
