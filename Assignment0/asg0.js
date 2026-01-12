var ctx;

// DrawTriangle.js (c) 2012 matsuda
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  }


  ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var v1 = new Vector3([2.25, 2.25, 0]);
  drawVector(ctx, v1, "red");
  }

  function handleDrawEvent() {
    // v1
    const v1x = parseFloat(document.getElementById('v1x').value);
    const v1y = parseFloat(document.getElementById('v1y').value);

    //  v2
    const v2x = parseFloat(document.getElementById('v2x').value);
    const v2y = parseFloat(document.getElementById('v2y').value);

    var v1 = new Vector3([v1x, v1y, 0]);
    var v2 = new Vector3([v2x, v2y, 0]);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawVector(ctx, v1, "red");
    drawVector(ctx, v2, "blue");

    const op = document.getElementById('operation').value;
  const scalar = parseFloat(document.getElementById('scalar').value);

  if (op === "add") {
          drawVector(ctx, v1.add(v2), "green");
      } else if (op === "sub") {
          drawVector(ctx, v1.sub(v2), "green");
      } else if (op === "mul") {
          drawVector(ctx, v1.mul(scalar), "green");
          drawVector(ctx, v2.mul(scalar), "green");
      } else if (op === "div") {
          drawVector(ctx, v1.div(scalar), "green");
          drawVector(ctx, v2.div(scalar), "green");
      } else if (op === "magnitude") {
          console.log("Magnitude v1:", v1.magnitude());
          console.log("Magnitude v2:", v2.magnitude());
      } else if (op === "normalize") {
          drawVector(ctx, new Vector3(v1.elements.slice()).normalize(), "green");
          drawVector(ctx, new Vector3(v2.elements.slice()).normalize(), "green");
      } else if (op === "angle") {
          const alpha = angleBetween(v1,v2);
          if (alpha!==null) console.log("Angle between v1 and v2:", alpha.toFixed(2), "degrees");
      } else if (op === "area") {
        const area = areaTriangle(v1, v2);
        console.log("Area of triangle formed by v1 and v2:", area.toFixed(2));
      }
  }

  function drawVector(ctx, v, color) {
    const scale = 20;
    const cx = ctx.canvas.width / 2;
    const cy = ctx.canvas.height / 2;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + v.elements[0] * scale, cy - v.elements[1] * scale);
    ctx.stroke();
  }

  function angleBetween(v1, v2) {
      const dotProduct = Vector3.dot(v1, v2);
      const mag1 = v1.magnitude();
      const mag2 = v2.magnitude();

      if (mag1 === 0 || mag2 === 0) {
          console.log("Cannot calculate angle with zero-length vector.");
          return null;
      }
      let cosAlpha = dotProduct / (mag1 * mag2);
      cosAlpha = Math.min(Math.max(cosAlpha, -1), 1);
      const angle = Math.acos(cosAlpha) * (180 / Math.PI);
      return angle;
  }

  function areaTriangle(v1, v2) {
    const crossProduct = Vector3.cross(v1, v2);
    const areaParallelogram = crossProduct.magnitude();
    const areaTriangle = areaParallelogram / 2;
    return areaTriangle;
}
