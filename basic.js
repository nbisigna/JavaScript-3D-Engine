document.body.style.margin = 0;
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');

var Height;
var Width;

var Time = 0;

var Engine;

function vec3d(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

function vec3d(x = 0, y = 0, z = 0, w = 1) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.w = w;
}

function triangle(
  a = 0,
  b = 0,
  c = 0,
  d = 0,
  e = 0,
  f = 0,
  g = 0,
  h = 0,
  i = 0
) {
  this.p = [new vec3d(a, b, c), new vec3d(d, e, f), new vec3d(g, h, i)];
  this.c = 'white';
}

function mesh() {
  this.tris;
}

function mat4x4() {
  this.m = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}

function Engine3d() {
  var meshCube = new mesh();
  var matProj = new mat4x4();
  var fTheta = 0;
  this.MultiplyMatrixVector = function (i, o, m) {
    o.x = i.x * m.m[0][0] + i.y * m.m[1][0] + i.z * m.m[2][0] + m.m[3][0];
    o.y = i.x * m.m[0][1] + i.y * m.m[1][1] + i.z * m.m[2][1] + m.m[3][1];
    o.z = i.x * m.m[0][2] + i.y * m.m[1][2] + i.z * m.m[2][2] + m.m[3][2];
    var w = i.x * m.m[0][3] + i.y * m.m[1][3] + i.z * m.m[2][3] + m.m[3][3];
    if (w != 0) {
      o.x /= w;
      o.y /= w;
      o.z /= w;
    }
    return o;
  };
  this.OnUserCreate = function () {
    meshCube.tris = [
      // SOUTH
      new triangle(0, 0, 0, 0, 1, 0, 1, 1, 0),
      new triangle(0, 0, 0, 1, 1, 0, 1, 0, 0),

      // EAST
      new triangle(1, 0, 0, 1, 1, 0, 1, 1, 1),
      new triangle(1, 0, 0, 1, 1, 1, 1, 0, 1),

      // NORTH
      new triangle(1, 0, 1, 1, 1, 1, 0, 1, 1),
      new triangle(1, 0, 1, 0, 1, 1, 0, 0, 1),

      // WEST
      new triangle(0, 0, 1, 0, 1, 1, 0, 1, 0),
      new triangle(0, 0, 1, 0, 1, 0, 0, 0, 0),

      // TOP
      new triangle(0, 1, 0, 0, 1, 1, 1, 1, 1),
      new triangle(0, 1, 0, 1, 1, 1, 1, 1, 0),

      // BOTTOM
      new triangle(1, 0, 1, 0, 0, 1, 0, 0, 0),
      new triangle(1, 0, 1, 0, 0, 0, 1, 0, 0),
    ];

    var fNear = 0.1;
    var fFar = 1000;
    var fFov = 90;
    var fAspectRatio = Height / Width;
    var fFovRad = 1 / Math.tan(((fFov * 0.5) / 180) * Math.PI);

    matProj.m[0][0] = fAspectRatio * fFovRad;
    matProj.m[1][1] = fFovRad;
    matProj.m[2][2] = fFar / (fFar - fNear);
    matProj.m[3][2] = (-fFar * fNear) / (fFar - fNear);
    matProj.m[2][3] = 1;
    matProj.m[3][3] = 0;
  };
  this.OnUserUpdate = function () {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, Width, Height);

    var matRotZ = new mat4x4(),
      matRotX = new mat4x4();
    fTheta += 1 * Time;

    // Rotation Z
    matRotZ.m[0][0] = Math.cos(fTheta);
    matRotZ.m[0][1] = Math.sin(fTheta);
    matRotZ.m[1][0] = -Math.sin(fTheta);
    matRotZ.m[1][1] = Math.cos(fTheta);
    matRotZ.m[2][2] = 1;
    matRotZ.m[3][3] = 1;

    // Rotation X
    matRotX.m[0][0] = 1;
    matRotX.m[1][1] = Math.cos(fTheta * 0.5);
    matRotX.m[1][2] = Math.sin(fTheta * 0.5);
    matRotX.m[2][1] = -Math.sin(fTheta * 0.5);
    matRotX.m[2][2] = Math.cos(fTheta * 0.5);
    matRotX.m[3][3] = 1;

    for (var i = 0; i < meshCube.tris.length; i++) {
      var triProjected = new triangle(),
        triTranslated = new triangle(),
        triRotatedZ = new triangle(),
        triRotatedZX = new triangle();

      triRotatedZ.p[0] = this.MultiplyMatrixVector(
        meshCube.tris[i].p[0],
        triRotatedZ.p[0],
        matRotZ
      );
      triRotatedZ.p[1] = this.MultiplyMatrixVector(
        meshCube.tris[i].p[1],
        triRotatedZ.p[1],
        matRotZ
      );
      triRotatedZ.p[2] = this.MultiplyMatrixVector(
        meshCube.tris[i].p[2],
        triRotatedZ.p[2],
        matRotZ
      );

      // Rotate in X-Axis
      triRotatedZX.p[0] = this.MultiplyMatrixVector(
        triRotatedZ.p[0],
        triRotatedZX.p[0],
        matRotX
      );
      triRotatedZX.p[1] = this.MultiplyMatrixVector(
        triRotatedZ.p[1],
        triRotatedZX.p[1],
        matRotX
      );
      triRotatedZX.p[2] = this.MultiplyMatrixVector(
        triRotatedZ.p[2],
        triRotatedZX.p[2],
        matRotX
      );

      triTranslated = triRotatedZX;
      triTranslated.p[0].z = triRotatedZX.p[0].z + 3;
      triTranslated.p[1].z = triRotatedZX.p[1].z + 3;
      triTranslated.p[2].z = triRotatedZX.p[2].z + 3;

      triProjected.p[0] = this.MultiplyMatrixVector(
        triTranslated.p[0],
        triProjected.p[0],
        matProj
      );
      triProjected.p[1] = this.MultiplyMatrixVector(
        triTranslated.p[1],
        triProjected.p[1],
        matProj
      );
      triProjected.p[2] = this.MultiplyMatrixVector(
        triTranslated.p[2],
        triProjected.p[2],
        matProj
      );

      triProjected.p[0].x += 1;
      triProjected.p[0].y += 1;
      triProjected.p[1].x += 1;
      triProjected.p[1].y += 1;
      triProjected.p[2].x += 1;
      triProjected.p[2].y += 1;
      triProjected.p[0].x *= 0.5 * Width;
      triProjected.p[0].y *= 0.5 * Height;
      triProjected.p[1].x *= 0.5 * Width;
      triProjected.p[1].y *= 0.5 * Height;
      triProjected.p[2].x *= 0.5 * Width;
      triProjected.p[2].y *= 0.5 * Height;

      ctx.beginPath();
      ctx.moveTo(triProjected.p[0].x, triProjected.p[0].y);
      ctx.lineTo(triProjected.p[1].x, triProjected.p[1].y);
      ctx.lineTo(triProjected.p[2].x, triProjected.p[2].y);
      ctx.lineTo(triProjected.p[0].x, triProjected.p[0].y);
      ctx.closePath();
      ctx.strokeStyle = 'white';
      //   ctx.fillStyle = 'white';
      ctx.stroke();
    }
  };
  this.OnUserCreate();
  this.OnUserUpdate();
}

window.addEventListener('resize', reSize);
function reSize() {
  canvas.height = Height = window.innerHeight;
  canvas.width = Width = window.innerWidth;
  Engine = new Engine3d();
  Time = 0;
}
function loop() {
  setTimeout(function () {
    requestAnimationFrame(loop);
    Engine.OnUserUpdate();
    Time += 0.001 / 30;
  }, 1000 / 30);
}
function init() {
  reSize();
  document.body.appendChild(canvas);
  loop();
}
init();