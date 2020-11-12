const fs = require('fs');
const readline = require('readline');
var filename = 'mountains';
function triangle(a, b, c, d, e, f, g, h, i) {
  this.p = [new vec3d(a, b, c), new vec3d(d, e, f), new vec3d(g, h, i)];
}
var triangles = [];
var vertices = [];
function vec3d(x = 0, y = 0, z = 0, w = 1) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.w = w;
}

const readInterface = readline.createInterface({
  input: fs.createReadStream('./' + filename + '.obj'),
  output: false,
  console: false,
});

readInterface.on('line', function (line) {
  var arr = line.split(' ');
  if (arr[0] == 'v') {
    vertices.push(new vec3d(Number(arr[1]), Number(arr[2]), Number(arr[3])));
  } else if (arr[0] == 'f') {
    one = Number(arr[1]) - 1;
    two = Number(arr[2]) - 1;
    three = Number(arr[3]) - 1;
    triangles.push(
      new triangle(
        vertices[one].x,
        vertices[one].y,
        vertices[one].z,
        vertices[two].x,
        vertices[two].y,
        vertices[two].z,
        vertices[three].x,
        vertices[three].y,
        vertices[three].z
      )
    );
  }
});

readInterface.on('close', () => {
  fs.writeFile('./' + filename + '.js', JSON.stringify(triangles), (err) => {
    console.error(err);
  });
});
