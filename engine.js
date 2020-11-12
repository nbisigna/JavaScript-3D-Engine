document.body.style.margin = 0;
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');

var Height;
var Width;

var Time = 0;

var Engine;

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

  var vCamera = new vec3d();
  var vLookDir = new vec3d();

  var fYaw = 0;
  var fTheta = 0;

  this.Matrix_MultiplyVector = function (m, i) {
    var v = new vec3d();
    v.x = i.x * m.m[0][0] + i.y * m.m[1][0] + i.z * m.m[2][0] + i.w * m.m[3][0];
    v.y = i.x * m.m[0][1] + i.y * m.m[1][1] + i.z * m.m[2][1] + i.w * m.m[3][1];
    v.z = i.x * m.m[0][2] + i.y * m.m[1][2] + i.z * m.m[2][2] + i.w * m.m[3][2];
    v.w = i.x * m.m[0][3] + i.y * m.m[1][3] + i.z * m.m[2][3] + i.w * m.m[3][3];
    return v;
  };

  this.Matrix_MakeIdentity = function () {
    var matrix = new mat4x4();
    matrix.m[0][0] = 1;
    matrix.m[1][1] = 1;
    matrix.m[2][2] = 1;
    matrix.m[3][3] = 1;
    return matrix;
  };
  this.Matrix_MakeRotationX = function (fAngleRad) {
    var matrix = new mat4x4();
    matrix.m[0][0] = 1;
    matrix.m[1][1] = Math.cos(fAngleRad);
    matrix.m[1][2] = Math.sin(fAngleRad);
    matrix.m[2][1] = -Math.sin(fAngleRad);
    matrix.m[2][2] = Math.cos(fAngleRad);
    matrix.m[3][3] = 1;
    return matrix;
  };
  this.Matrix_MakeRotationY = function (fAngleRad) {
    var matrix = new mat4x4();
    matrix.m[0][0] = Math.cos(fAngleRad);
    matrix.m[0][2] = Math.sin(fAngleRad);
    matrix.m[2][0] = -Math.sin(fAngleRad);
    matrix.m[1][1] = 1;
    matrix.m[2][2] = Math.cos(fAngleRad);
    matrix.m[3][3] = 1;
    return matrix;
  };
  this.Matrix_MakeRotationZ = function (fAngleRad) {
    var matrix = new mat4x4();
    matrix.m[0][0] = Math.cos(fAngleRad);
    matrix.m[0][1] = Math.sin(fAngleRad);
    matrix.m[1][0] = -Math.sin(fAngleRad);
    matrix.m[1][1] = Math.cos(fAngleRad);
    matrix.m[2][2] = 1;
    matrix.m[3][3] = 1;
    return matrix;
  };
  this.Matrix_MakeTranslation = function (x, y, z) {
    var matrix = new mat4x4();

    matrix.m[0][0] = 1;
    matrix.m[1][1] = 1;
    matrix.m[2][2] = 1;
    matrix.m[3][3] = 1;
    matrix.m[3][0] = x;
    matrix.m[3][1] = y;
    matrix.m[3][2] = z;
    return matrix;
  };
  this.Matrix_MakeProjection = function (
    fFovDegrees,
    fAspectRatio,
    fNear,
    fFar
  ) {
    fFovRad = 1 / Math.tan(((fFovDegrees * 0.5) / 180) * Math.PI);
    var matrix = new mat4x4();
    matrix.m[0][0] = fAspectRatio * fFovRad;
    matrix.m[1][1] = fFovRad;
    matrix.m[2][2] = fFar / (fFar - fNear);
    matrix.m[3][2] = (-fFar * fNear) / (fFar - fNear);
    matrix.m[2][3] = 1;
    matrix.m[3][3] = 0;
    return matrix;
  };

  this.Matrix_MultiplyMatrix = function (m1, m2) {
    var matrix = new mat4x4();
    for (var c = 0; c < 4; c++)
      for (var r = 0; r < 4; r++)
        matrix.m[r][c] =
          m1.m[r][0] * m2.m[0][c] +
          m1.m[r][1] * m2.m[1][c] +
          m1.m[r][2] * m2.m[2][c] +
          m1.m[r][3] * m2.m[3][c];
    return matrix;
  };

  this.Matrix_PointAt = function (pos, target, up) {
    // Calculate new forward direction
    var newForward = this.Vector_Sub(target, pos);
    newForward = this.Vector_Normalize(newForward);

    // Calculate new Up direction
    var a = this.Vector_Mul(newForward, this.Vector_DotProduct(up, newForward));
    var newUp = this.Vector_Sub(up, a);
    newUp = this.Vector_Normalize(newUp);

    // New Right direction is easy, its just cross product
    var newRight = this.Vector_CrossProduct(newUp, newForward);

    // Construct Dimensioning and Translation Matrix
    var matrix = new mat4x4();
    matrix.m[0][0] = newRight.x;
    matrix.m[0][1] = newRight.y;
    matrix.m[0][2] = newRight.z;
    matrix.m[0][3] = 0;
    matrix.m[1][0] = newUp.x;
    matrix.m[1][1] = newUp.y;
    matrix.m[1][2] = newUp.z;
    matrix.m[1][3] = 0;
    matrix.m[2][0] = newForward.x;
    matrix.m[2][1] = newForward.y;
    matrix.m[2][2] = newForward.z;
    matrix.m[2][3] = 0;
    matrix.m[3][0] = pos.x;
    matrix.m[3][1] = pos.y;
    matrix.m[3][2] = pos.z;
    matrix.m[3][3] = 1;
    return matrix;
  };

  this.Matrix_QuickInverse = function (m) {
    // Only for Rotation/Translation Matrices
    var matrix = new mat4x4();
    matrix.m[0][0] = m.m[0][0];
    matrix.m[0][1] = m.m[1][0];
    matrix.m[0][2] = m.m[2][0];
    matrix.m[0][3] = 0;
    matrix.m[1][0] = m.m[0][1];
    matrix.m[1][1] = m.m[1][1];
    matrix.m[1][2] = m.m[2][1];
    matrix.m[1][3] = 0;
    matrix.m[2][0] = m.m[0][2];
    matrix.m[2][1] = m.m[1][2];
    matrix.m[2][2] = m.m[2][2];
    matrix.m[2][3] = 0;
    matrix.m[3][0] = -(
      m.m[3][0] * matrix.m[0][0] +
      m.m[3][1] * matrix.m[1][0] +
      m.m[3][2] * matrix.m[2][0]
    );
    matrix.m[3][1] = -(
      m.m[3][0] * matrix.m[0][1] +
      m.m[3][1] * matrix.m[1][1] +
      m.m[3][2] * matrix.m[2][1]
    );
    matrix.m[3][2] = -(
      m.m[3][0] * matrix.m[0][2] +
      m.m[3][1] * matrix.m[1][2] +
      m.m[3][2] * matrix.m[2][2]
    );
    matrix.m[3][3] = 1;
    return matrix;
  };

  this.Vector_Add = function (v1, v2) {
    return new vec3d(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  };
  this.Vector_Sub = function (v1, v2) {
    return new vec3d(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  };
  this.Vector_Mul = function (v1, k) {
    return new vec3d(v1.x * k, v1.y * k, v1.z * k);
  };
  this.Vector_Div = function (v1, k) {
    return new vec3d(v1.x / k, v1.y / k, v1.z / k);
  };
  this.Vector_DotProduct = function (v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  };
  this.Vector_Length = function (v) {
    return Math.sqrt(this.Vector_DotProduct(v, v));
  };
  this.Vector_Normalize = function (v) {
    var l = this.Vector_Length(v);
    return new vec3d(v.x / l, v.y / l, v.z / l);
  };
  this.Vector_CrossProduct = function (v1, v2) {
    var v = new vec3d();
    v.x = v1.y * v2.z - v1.z * v2.y;
    v.y = v1.z * v2.x - v1.x * v2.z;
    v.z = v1.x * v2.y - v1.y * v2.x;
    return v;
  };

  this.Vector_IntersectPlane = function (plane_p, plane_n, lineStart, lineEnd) {
    plane_n = this.Vector_Normalize(plane_n);
    var plane_d = -1 * this.Vector_DotProduct(plane_n, plane_p);
    var ad = this.Vector_DotProduct(lineStart, plane_n);
    var bd = this.Vector_DotProduct(lineEnd, plane_n);
    var t = (-plane_d - ad) / (bd - ad);
    var lineStartToEnd = this.Vector_Sub(lineEnd, lineStart);
    var lineToIntersect = this.Vector_Mul(lineStartToEnd, t);
    return this.Vector_Add(lineStart, lineToIntersect);
  };
  this.Triangle_ClipAgainstPlane = function (plane_p, plane_n, in_tri) {
    var out_tri1 = new triangle(),
      out_tri2 = new triangle();
    // Make sure plane normal is indeed normal
    plane_n = this.Vector_Normalize(plane_n);

    // Return signed shortest distance from point to plane, plane normal must be normalised
    var that = this;
    function dist(p, that) {
      return (
        plane_n.x * p.x +
        plane_n.y * p.y +
        plane_n.z * p.z -
        that.Vector_DotProduct(plane_n, plane_p)
      );
    }

    // Create two temporary storage arrays to classify points either side of plane
    // If distance sign is positive, point lies on "inside" of plane
    var inside_points = [new vec3d(), new vec3d(), new vec3d()];
    var outside_points = [new vec3d(), new vec3d(), new vec3d()];
    var nInsidePointCount = 0;
    var nOutsidePointCount = 0;

    // Get signed distance of each point in triangle to plane
    var d0 = dist(in_tri.p[0], that);
    var d1 = dist(in_tri.p[1], that);
    var d2 = dist(in_tri.p[2], that);

    if (d0 >= 0) {
      inside_points[nInsidePointCount++] = in_tri.p[0];
    } else {
      outside_points[nOutsidePointCount++] = in_tri.p[0];
    }
    if (d1 >= 0) {
      inside_points[nInsidePointCount++] = in_tri.p[1];
    } else {
      outside_points[nOutsidePointCount++] = in_tri.p[1];
    }
    if (d2 >= 0) {
      inside_points[nInsidePointCount++] = in_tri.p[2];
    } else {
      outside_points[nOutsidePointCount++] = in_tri.p[2];
    }

    if (nInsidePointCount == 0) {
      return [];
    }

    if (nInsidePointCount == 3) {
      out_tri1 = in_tri;
      return [out_tri1];
    }

    if (nInsidePointCount == 1 && nOutsidePointCount == 2) {
      // out_tri1.c = in_tri.c;
      out_tri1.c = 'blue';

      out_tri1.p[0] = inside_points[0];

      out_tri1.p[1] = this.Vector_IntersectPlane(
        plane_p,
        plane_n,
        inside_points[0],
        outside_points[0]
      );
      out_tri1.p[2] = this.Vector_IntersectPlane(
        plane_p,
        plane_n,
        inside_points[0],
        outside_points[1]
      );

      return [out_tri1];
    }

    if (nInsidePointCount == 2 && nOutsidePointCount == 1) {
      // out_tri1.c = in_tri.c;
      out_tri1.c = 'green';

      // out_tri2.c = in_tri.c;
      out_tri2.c = 'red';

      out_tri1.p[0] = inside_points[0];
      out_tri1.p[1] = inside_points[1];
      out_tri1.p[2] = this.Vector_IntersectPlane(
        plane_p,
        plane_n,
        inside_points[0],
        outside_points[0]
      );

      out_tri2.p[0] = inside_points[1];
      out_tri2.p[1] = out_tri1.p[2];
      out_tri2.p[2] = this.Vector_IntersectPlane(
        plane_p,
        plane_n,
        inside_points[1],
        outside_points[0]
      );
      return [out_tri1, out_tri2];
    }
  };

  this.OnUserCreate = function () {
    meshCube.tris = axis;

    matProj = this.Matrix_MakeProjection(90, Height / Width, 0.1, 1000);
  };

  var that = this;
  this.keydown = function (e) {
    var code = e.keyCode;
    var vFoward = that.Vector_Mul(vLookDir, 8 * window.time);
    switch (code) {
      case 37: //left
        vCamera.x += 8 * window.time;
        break;
      case 38: //up
        vCamera.y += 8 * window.time;
        break;
      case 39: //right
        vCamera.x -= 8 * window.time;
        break;
      case 40: //down
        vCamera.y -= 8 * window.time;
        break;
      case 65: //a
        fYaw -= 2 * window.time;
        break;
      case 68: //d
        fYaw += 2 * window.time;
        break;
      case 87: //w
        vCamera = that.Vector_Add(vCamera, vFoward);
        break;
      case 83: //s
        vCamera = that.Vector_Sub(vCamera, vFoward);
        break;
    }
  };
  this.OnUserUpdate = function (fElapsedTime) {
    window.time = fElapsedTime;
    window.removeEventListener('keydown', this.keydown);
    window.addEventListener('keydown', this.keydown);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, Width, Height);

    var matRotZ = new mat4x4(),
      matRotX = new mat4x4();
    // fTheta += 1 * Time;

    matRotZ = this.Matrix_MakeRotationZ(fTheta * 0.5);
    matRotX = this.Matrix_MakeRotationX(fTheta);

    var matTrans = new mat4x4();
    matTrans = this.Matrix_MakeTranslation(0, 0, 5);

    var matWorld = new mat4x4();
    matWorld = this.Matrix_MakeIdentity();
    matWorld = this.Matrix_MultiplyMatrix(matRotZ, matRotX);
    matWorld = this.Matrix_MultiplyMatrix(matWorld, matTrans);

    var vUp = new vec3d(0, 1, 0);
    var vTarget = new vec3d(0, 0, 1);
    var matCameraRot = this.Matrix_MakeRotationY(fYaw);
    vLookDir = this.Matrix_MultiplyVector(matCameraRot, vTarget);
    vTarget = this.Vector_Add(vCamera, vLookDir);

    var matCamera = this.Matrix_PointAt(vCamera, vTarget, vUp);

    var matView = this.Matrix_QuickInverse(matCamera);

    var vecTrianglesToRaster = [];

    for (var i = 0; i < meshCube.tris.length; i++) {
      var triProjected = new triangle(),
        triTransformed = new triangle(),
        triViewed = new triangle();

      triTransformed.p[0] = this.Matrix_MultiplyVector(
        matWorld,
        meshCube.tris[i].p[0]
      );
      triTransformed.p[1] = this.Matrix_MultiplyVector(
        matWorld,
        meshCube.tris[i].p[1]
      );
      triTransformed.p[2] = this.Matrix_MultiplyVector(
        matWorld,
        meshCube.tris[i].p[2]
      );

      var normal = new vec3d(),
        line1 = new vec3d(),
        line2 = new vec3d();

      line1 = this.Vector_Sub(triTransformed.p[1], triTransformed.p[0]);
      line2 = this.Vector_Sub(triTransformed.p[2], triTransformed.p[0]);

      normal = this.Vector_CrossProduct(line1, line2);
      normal = this.Vector_Normalize(normal);
      var vCameraRay = this.Vector_Sub(triTransformed.p[0], vCamera);

      if (this.Vector_DotProduct(normal, vCameraRay) < 0) {
        var light_direction = new vec3d(0, 1, -1);
        light_direction = this.Vector_Normalize(light_direction);

        var dp = Math.max(this.Vector_DotProduct(light_direction, normal), 0.1);

        var g = ((dp * 256) | 0).toString(16);
        triViewed.c = '#' + g + g + g;

        triViewed.p[0] = this.Matrix_MultiplyVector(
          matView,
          triTransformed.p[0]
        );
        triViewed.p[1] = this.Matrix_MultiplyVector(
          matView,
          triTransformed.p[1]
        );
        triViewed.p[2] = this.Matrix_MultiplyVector(
          matView,
          triTransformed.p[2]
        );

        var clipped = this.Triangle_ClipAgainstPlane(
          new vec3d(0, 0, 0.1),
          new vec3d(0, 0, 1),
          triViewed
        );

        for (var n = 0; n < clipped.length; n++) {
          triProjected.p[0] = this.Matrix_MultiplyVector(
            matProj,
            clipped[n].p[0]
          );
          triProjected.p[1] = this.Matrix_MultiplyVector(
            matProj,
            clipped[n].p[1]
          );
          triProjected.p[2] = this.Matrix_MultiplyVector(
            matProj,
            clipped[n].p[2]
          );
          triProjected.c = clipped[n].c;

          triProjected.p[0] = this.Vector_Div(
            triProjected.p[0],
            triProjected.p[0].w
          );
          triProjected.p[1] = this.Vector_Div(
            triProjected.p[1],
            triProjected.p[1].w
          );
          triProjected.p[2] = this.Vector_Div(
            triProjected.p[2],
            triProjected.p[2].w
          );

          var vOffsetView = new vec3d(1, 1, 0);
          triProjected.p[0] = this.Vector_Add(triProjected.p[0], vOffsetView);
          triProjected.p[1] = this.Vector_Add(triProjected.p[1], vOffsetView);
          triProjected.p[2] = this.Vector_Add(triProjected.p[2], vOffsetView);
          triProjected.p[0].x *= 0.5 * Width;
          triProjected.p[0].y *= 0.5 * Height;
          triProjected.p[1].x *= 0.5 * Width;
          triProjected.p[1].y *= 0.5 * Height;
          triProjected.p[2].x *= 0.5 * Width;
          triProjected.p[2].y *= 0.5 * Height;
          vecTrianglesToRaster.push(triProjected);
        }
      }
    }
    vecTrianglesToRaster.sort((t1, t2) => {
      var z1 = t1.p[0].z + t1.p[1].z + t1.p[2].z / 3;
      var z2 = t2.p[0].z + t2.p[1].z + t2.p[2].z / 3;
      return z1 > z2;
    });

    var listTriangles = [];
    for (var i = 0; i < vecTrianglesToRaster.length; i++) {
      listTriangles.push(vecTrianglesToRaster[i]);
      var nNewTriangles = 1;
      for (var p = 0; p < 4; p++) {
        var trisToAdd = [];
        while (nNewTriangles > 0) {
          var test = listTriangles.shift();
          nNewTriangles--;
          switch (p) {
            case 0:
              trisToAdd = this.Triangle_ClipAgainstPlane(
                new vec3d(0, 0, 0),
                new vec3d(0, 1, 0),
                test
              );
            case 1:
              trisToAdd = this.Triangle_ClipAgainstPlane(
                new vec3d(0, Height - 1, 0),
                new vec3d(0, -1, 0),
                test
              );
            case 2:
              trisToAdd = this.Triangle_ClipAgainstPlane(
                new vec3d(0, 0, 0),
                new vec3d(1, 0, 0),
                test
              );
            case 3:
              trisToAdd = this.Triangle_ClipAgainstPlane(
                new vec3d(Width - 1, 0, 0),
                new vec3d(-1, 0, 0),
                test
              );
          }
          for (var w = 0; w < trisToAdd.length; w++) {
            listTriangles.push(trisToAdd[w]);
          }
        }
        nNewTriangles = listTriangles.length;
      }
    }
    for (var i = 0; i < listTriangles.length; i++) {
      ctx.beginPath();
      ctx.moveTo(listTriangles[i].p[0].x, listTriangles[i].p[0].y);
      ctx.lineTo(listTriangles[i].p[1].x, listTriangles[i].p[1].y);
      ctx.lineTo(listTriangles[i].p[2].x, listTriangles[i].p[2].y);
      ctx.lineTo(listTriangles[i].p[0].x, listTriangles[i].p[0].y);
      ctx.closePath();
      ctx.strokeStyle = 'black';
      ctx.stroke();
      ctx.fillStyle = listTriangles[i].c;
      ctx.fill();
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
    Time += 0.001 / 30;
    Engine.OnUserUpdate(Time);
  }, 1000 / 30);
}
function init() {
  reSize();
  document.body.appendChild(canvas);
  loop();
}
init();
