class Camera {
  constructor(canvas) {
    this.fov = 60;
    this.eye = new Vector3([0, 0, 0]);
    this.at = new Vector3([0, 0, -1]);
    this.up = new Vector3([0, 1, 0]);
    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.canvas = canvas;
    this._updateView();
    this._updateProjection();
  }

  _updateView() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }

  _updateProjection() {
    const w = this.canvas.width || 1;
    const h = this.canvas.height || 1;
    const aspect = w / h;
    this.projectionMatrix.setPerspective(this.fov, aspect, 0.1, 1000);
  }

  updateProjection() {
    this._updateProjection();
  }

  moveForward(speed = 0.5) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    f.mul(speed);
    this.eye.add(f);
    this.at.add(f);
    this._updateView();
  }

  moveBackwards(speed = 0.5) {
    let b = new Vector3();
    b.set(this.eye);
    b.sub(this.at);
    b.normalize();
    b.mul(speed);
    this.eye.add(b);
    this.at.add(b);
    this._updateView();
  }

  moveUp(speed = 0.5) {
    this.eye.elements[1] += speed;
    this.at.elements[1] += speed;
    this._updateView();
  }

  moveDown(speed = 0.5) {
    this.eye.elements[1] -= speed;
    this.at.elements[1] -= speed;
    this._updateView();
  }

  moveLeft(speed = 0.5) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    let s = new Vector3();
    s.elements[0] = this.up.elements[1] * f.elements[2] - this.up.elements[2] * f.elements[1];
    s.elements[1] = this.up.elements[2] * f.elements[0] - this.up.elements[0] * f.elements[2];
    s.elements[2] = this.up.elements[0] * f.elements[1] - this.up.elements[1] * f.elements[0];
    s.normalize();
    s.mul(-speed);
    this.eye.add(s);
    this.at.add(s);
    this._updateView();
  }

  moveRight(speed = 0.5) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    let s = new Vector3();
    s.elements[0] = this.up.elements[1] * f.elements[2] - this.up.elements[2] * f.elements[1];
    s.elements[1] = this.up.elements[2] * f.elements[0] - this.up.elements[0] * f.elements[2];
    s.elements[2] = this.up.elements[0] * f.elements[1] - this.up.elements[1] * f.elements[0];
    s.normalize();
    s.mul(speed);
    this.eye.add(s);
    this.at.add(s);
    this._updateView();
  }

  panLeft(alpha = 5) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    let rot = new Matrix4();
    rot.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let fPrime = rot.multiplyVector3(f);
    this.at.set(this.eye);
    this.at.add(fPrime);
    this._updateView();
  }

  panRight(alpha = 5) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    let rot = new Matrix4();
    rot.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let fPrime = rot.multiplyVector3(f);
    this.at.set(this.eye);
    this.at.add(fPrime);
    this._updateView();
  }

  panUp(alpha = 5) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    const dist = f.magnitude();
    if (dist < 0.0001) return;
    let right = new Vector3();
    right.elements[0] = this.up.elements[1] * f.elements[2] - this.up.elements[2] * f.elements[1];
    right.elements[1] = this.up.elements[2] * f.elements[0] - this.up.elements[0] * f.elements[2];
    right.elements[2] = this.up.elements[0] * f.elements[1] - this.up.elements[1] * f.elements[0];
    const rLen = Math.sqrt(right.elements[0]**2 + right.elements[1]**2 + right.elements[2]**2);
    if (rLen < 0.0001) return;
    right.elements[0] /= rLen; right.elements[1] /= rLen; right.elements[2] /= rLen;
    let rot = new Matrix4();
    rot.setRotate(-alpha, right.elements[0], right.elements[1], right.elements[2]);
    let fPrime = rot.multiplyVector3(f);
    this.at.set(this.eye);
    this.at.add(fPrime);
    const maxPitchDeg = 85;
    const maxPitchRad = (maxPitchDeg * Math.PI) / 180;
    const maxVert = dist * Math.sin(maxPitchRad);
    let vertOffset = this.at.elements[1] - this.eye.elements[1];
    vertOffset = Math.max(-maxVert, Math.min(maxVert, vertOffset));
    this.at.elements[1] = this.eye.elements[1] + vertOffset;
    this._updateView();
  }

  panDown(alpha = 5) {
    this.panUp(-alpha);
  }
}
