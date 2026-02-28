class Sphere {
  constructor() {
    this.type = 'sphere';
    this.color = [1.0, 0.4, 0.2, 1.0];
    this.matrix = new Matrix4();
    this.segments = 48;
    this.stacks = 32;
  }

  render() {
    let rgba = this.color;
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    for (let stack = 0; stack < this.stacks; stack++) {
      const phi1 = (stack / this.stacks) * Math.PI - Math.PI / 2;
      const phi2 = ((stack + 1) / this.stacks) * Math.PI - Math.PI / 2;
      const y1 = Math.sin(phi1);
      const y2 = Math.sin(phi2);
      const r1 = Math.cos(phi1);
      const r2 = Math.cos(phi2);

      for (let seg = 0; seg < this.segments; seg++) {
        const theta1 = (seg / this.segments) * 2 * Math.PI;
        const theta2 = ((seg + 1) / this.segments) * 2 * Math.PI;
        const x1 = r1 * Math.cos(theta1);
        const z1 = r1 * Math.sin(theta1);
        const x2 = r1 * Math.cos(theta2);
        const z2 = r1 * Math.sin(theta2);
        const x3 = r2 * Math.cos(theta1);
        const z3 = r2 * Math.sin(theta1);
        const x4 = r2 * Math.cos(theta2);
        const z4 = r2 * Math.sin(theta2);

        if (stack === 0) {
          const n1 = [0, -1, 0], n2 = [x3, y2, z3], n3 = [x4, y2, z4];
          drawTriangle3D([0, -1, 0, x3, y2, z3, x4, y2, z4], n1.concat(n2).concat(n3));
        } else if (stack === this.stacks - 1) {
          const n1 = [x1, y1, z1], n2 = [x2, y1, z2], n3 = [0, 1, 0];
          drawTriangle3D([x1, y1, z1, x2, y1, z2, 0, 1, 0], n1.concat(n2).concat(n3));
        } else {
          const n1 = [x1, y1, z1], n2 = [x2, y1, z2], n3 = [x4, y2, z4], n4 = [x3, y2, z3];
          drawTriangle3D([x1, y1, z1, x2, y1, z2, x4, y2, z4], n1.concat(n2).concat(n3));
          drawTriangle3D([x1, y1, z1, x4, y2, z4, x3, y2, z3], n1.concat(n3).concat(n4));
        }
      }
    }
  }
}
