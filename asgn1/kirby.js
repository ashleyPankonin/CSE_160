function drawKirby(clearFirst = true) {
  
// ─── Initials "AP" in top-right corner ───
const textColor = [1.0, 1.0, 1.0, 1.0];  // white

const baseX = 0.72;    
const baseY = 0.78;    
const scale = 0.09;     

// Letter A 
drawTriangle([
  baseX + scale*1.0,    baseY, 
  baseX + scale*0.5,    baseY + scale*1.1,    
  baseX,                baseY
], ...textColor);


const pX = baseX + scale * 1.1; 

// p
drawTriangle([pX, baseY, 
              pX + scale*0.25, baseY, 
              pX, baseY - scale*1.1], ...textColor);

drawTriangle([pX + scale*0.25, baseY, 
              pX + scale*0.25, baseY - scale*1.1, 
              pX, baseY - scale*1.1], ...textColor);  

const loopTopY = baseY - scale*0.2;
const loopMidY = baseY - scale*0.7;

drawTriangle([pX + scale*0.25, loopTopY, 
              pX + scale*0.9,  loopTopY, 
              pX + scale*0.6,  loopMidY - scale*0.1], ...textColor);

drawTriangle([pX + scale*0.25, loopMidY, 
              pX + scale*0.9,  loopMidY, 
              pX + scale*0.6,  loopMidY - scale*0.1], ...textColor);

drawTriangle([pX + scale*0.25, loopMidY + scale*0.1, 
              pX + scale*0.9,  loopMidY + scale*0.1, 
              pX + scale*0.6,  loopMidY + scale*0.3], ...textColor);


  const bodyColor = [1.00, 0.68, 0.88, 1.0];
  const armColor  = bodyColor;  

  const segments = 48;
  const cx       = 0.0;
  const cy       = 0.08;
  const bodyR    = 0.58;

  for (let i = 0; i < segments; i++) {
    const ang1 = (i / segments) * Math.PI * 2;
    const ang2 = ((i + 1) / segments) * Math.PI * 2;

    const x1 = cx + Math.cos(ang1) * bodyR;
    const y1 = cy + Math.sin(ang1) * bodyR * 0.92;
    const x2 = cx + Math.cos(ang2) * bodyR;
    const y2 = cy + Math.sin(ang2) * bodyR * 0.92;

    drawTriangle([cx, cy, x1, y1, x2, y2], ...bodyColor);
  }

  // Arms 
  drawSlantedOval(-0.38, -0.05, 0.34, 0.17,  Math.PI / 5, armColor);   // left
  drawSlantedOval( 0.38, -0.05, 0.34, 0.17, -Math.PI / 5, armColor);   // right

  // Feet
  const footColor = [0.98, 0.18, 0.28, 1.0];
  drawOval(-0.28, -0.55, 0.29, 0.15, footColor);
  drawOval( 0.28, -0.55, 0.29, 0.15, footColor);

  const eyeBlue    = [0.40, 0.70, 1.00, 1.0];   

  // Left eye
  drawOval(-0.165, 0.34, 0.09, 0.185, eyeBlue);
  // Right eye
  drawOval( 0.165, 0.34, 0.09, 0.185, eyeBlue);

  // ─── Blush ───
  const blush = [1.0, 0.55, 0.65, 0.68];
  drawOval(-0.32, 0.06, 0.11, 0.075, blush);
  drawOval( 0.32, 0.06, 0.11, 0.075, blush);

  // ─── Mouth ───
  const mouthColor = [0.80, 0.15, 0.35, 1.0];
  drawOval(0.00, -0.11, 0.18, 0.09, mouthColor);  
}

function drawOval(cx, cy, rx, ry, color) {
  const seg = 32;

  for (let i = 0; i < seg; i++) {
    const a1 = (i / seg) * Math.PI * 2;
    const a2 = ((i + 1) / seg) * Math.PI * 2;

    const x1 = cx + Math.cos(a1) * rx;
    const y1 = cy + Math.sin(a1) * ry;
    const x2 = cx + Math.cos(a2) * rx;
    const y2 = cy + Math.sin(a2) * ry;

    drawTriangle([cx, cy, x1, y1, x2, y2], ...color);
  }
}

function drawSlantedOval(cx, cy, rx, ry, rotationRadians, color) {
  const seg = 32;

  for (let i = 0; i < seg; i++) {
    const a1 = (i / seg) * Math.PI * 2;
    const a2 = ((i + 1) / seg) * Math.PI * 2;

    const cosR = Math.cos(rotationRadians);
    const sinR = Math.sin(rotationRadians);


    let x1Local = Math.cos(a1) * rx;
    let y1Local = Math.sin(a1) * ry;
    const x1 = cx + x1Local * cosR - y1Local * sinR;
    const y1 = cy + x1Local * sinR + y1Local * cosR;


    let x2Local = Math.cos(a2) * rx;
    let y2Local = Math.sin(a2) * ry;
    const x2 = cx + x2Local * cosR - y2Local * sinR;
    const y2 = cy + x2Local * sinR + y2Local * cosR;

    drawTriangle([cx, cy, x1, y1, x2, y2], ...color);
  }
}