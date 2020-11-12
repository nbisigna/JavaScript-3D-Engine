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
var cube = [
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
