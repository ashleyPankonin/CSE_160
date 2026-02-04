
class Cube{
  constructor(){
    this.type='cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }
render() {
    let rgba = this.color;

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D([0,0,0,  1,1,0,  1,0,0]);
    drawTriangle3D([0,0,0,  0,1,0,  1,1,0]);

   
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D([0,0,1,  1,0,1,  1,1,1]);
    drawTriangle3D([0,0,1,  1,1,1,  0,1,1]);


    gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);
    drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
    drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);

 
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D([0,0,0,  1,0,0,  1,0,1]);
    drawTriangle3D([0,0,0,  1,0,1,  0,0,1]);

  
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D([1,0,0,  1,1,0,  1,1,1]);
    drawTriangle3D([1,0,0,  1,1,1,  1,0,1]);

  
    gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
    drawTriangle3D([0,0,0,  0,0,1,  0,1,1]);
    drawTriangle3D([0,0,0,  0,1,1,  0,1,0]);
  }
}








/*
  render(){
    //let xy = this.position; 
    let rgba = this.color;
    //var size = this.size;

    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front of cube
    drawTriangle3D([0,0,0,   1,1,0,   1,0,0]);
    //drawTriangle3D([ 0,0,-1,  1,1,-1,  1,0,-1 ]);
    //drawTriangle3D( [ 0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0 ]);
    //drawTriangle3D( [ 0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0 ]);
    drawTriangle3D([ 0,0,0,  0,1,0,  1,1,0 ]);
    //drawTriangle3D([ 0,0,-1,  0,1,-1,  1,1,-1 ]);

    // Pass the color of a point to u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]*.9);



    //Front of cube
    drawTriangle3D( [ 0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0 ]);
    drawTriangle3D( [ 0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0 ]);
   // Back of cube (z = 1)
    drawTriangle3D([ 0,0,1,  1,0,1,  1,1,1 ]);
    drawTriangle3D([ 0,0,1,  1,1,1,  0,1,1 ]);

    // Top of cube (y = 1)
    drawTriangle3D([ 0,1,0,  1,1,1,  1,1,0 ]);
    drawTriangle3D([ 0,1,0,  0,1,1,  1,1,1 ]);

    // Bottom of cube (y = 0)
    drawTriangle3D([ 0,0,0,  1,0,0,  1,0,1 ]);
    drawTriangle3D([ 0,0,0,  1,0,1,  0,0,1 ]);

    // Right side of cube (x = 1)
    drawTriangle3D([ 1,0,0,  1,1,0,  1,1,1 ]);
    drawTriangle3D([ 1,0,0,  1,1,1,  1,0,1 ]);

    // Left side of cube (x = 0)
    drawTriangle3D([ 0,0,0,  0,1,1,  0,1,0 ]);
    drawTriangle3D([ 0,0,0,  0,0,1,  0,1,1 ]);


  }
}
*/