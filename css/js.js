var con = console;
var camera, scene, renderer, composer;
var sw = window.innerWidth, sh = window.innerHeight;
var mouse = {down: false, x: 0, y: 0};
var bits = 6;
var depth = 24;
var walls = 5;
var size = 10;
var padding = 1;
var boxSize = size - padding * 2;
var tunnel;
var groups = [];
var blocks = [];
var can = document.createElement("canvas"); // originally used for debugging lattice, now texture too!
//document.body.appendChild(can);
can.width = walls * (bits * size - size);// + size);
can.height = depth * size;
var ctx = can.getContext("2d");
ctx.fillStyle = "#333";
ctx.fillRect(0, 0, can.width, can.height);

var y = 0;
var lineOffsets = []; // a simple way of getting something like a "box joint" in wood joinery
while (y < depth) {
  lineOffsets[y] = Math.random() > 0.5 ? 1 : 0;
  y++;
}


var w = 0;
while(w < walls) {
  y = 0;
  var xo = w * (bits * size);// + size);
  blocks[w] = [];
 
  while (y < depth) {
    var lineoffset = lineOffsets[y];
    var x = 0;
    blocks[w][y] = [];
    while (x < bits) {
      var block = Math.ceil(Math.random() * 4);
      var lastOne = false;
      if (x + block > bits) {
        block = bits - x;
      }
      ctx.fillStyle = "#555";
      ctx.fillRect(
        xo + (lineoffset + x - 1) * size + padding, 
        y * size + padding, 
        block * size - padding * 2, 
        size - padding * 2
      );
      blocks[w][y].push(block);

      x+= block;
      
    }
    y += 1;
  }
  
  w++
};
//con.log(blocks);

var texture = new THREE.Texture(can);//Texture);
texture.needsUpdate = true;
var material = new THREE.MeshLambertMaterial({color: 0xff2430, map: texture});


function listen(eventNames, callback) {
  for (var i = 0; i < eventNames.length; i++) {
    window.addEventListener(eventNames[i], callback);
  }
}

function createBox(w, h, d) {
  var geometry = new THREE.BoxGeometry(w,h,d);
  box = new THREE.Mesh(geometry, material);
  box.castShadow = true;
  box.receiveShadow = true;
  return box;
}

function init() {
  //return;
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0, 0.008);

	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(sw, sh);
	renderer.setClearColor(scene.fog.color);
  renderer.shadowMapEnabled = true;
  document.body.appendChild(renderer.domElement);
  
	camera = new THREE.PerspectiveCamera(80, sw / sh, 1, 1000);
	scene.add( camera );
/*
  var spotLight = new THREE.SpotLight(0xffffff, 1);
  spotLight.position.set(0, 800, 0);
  spotLight.castShadow = true;
  spotLight.shadowMapWidth = 2048
  spotLight.shadowMapHeight = 2048;
  spotLight.shadowCameraNear = 760;
  spotLight.shadowCameraFar = 4000;
  spotLight.shadowCameraFov = 30;
  scene.add( spotLight );
*/
	var lightTop = new THREE.DirectionalLight(0xffffff, 1);
	lightTop.position.set(-0.5, 1, 0);
	scene.add(lightTop);
  
	var lightFront = new THREE.DirectionalLight(0xc0c0e0, 1);
	lightFront.position.set(0.2, 0, 1);
	scene.add(lightFront);
  
	var lightBack = new THREE.DirectionalLight(0x705060, 1);
	lightBack.position.set(1, 0, -1);
	scene.add(lightBack);
  
	var lightAmbient = new THREE.AmbientLight(0x404040);
  scene.add(lightAmbient);
  
  
  var rotationZ = 1 / walls * Math.PI * 2
  var offsetY = bits * size / 2 / Math.tan(rotationZ / 2);
  
  tunnel = new THREE.Group();
  scene.add(tunnel);
  
  for (var w = 0; w < walls; w++) {
    
    groups[w] = [];
    
    var wall = new THREE.Group();
    wall.rotation.set(0, 0, w * rotationZ);
    tunnel.add(wall);

    for (var j = 0; j < depth; j++) {
      var group = new THREE.Group();
      group.position.set(0, 0, j * size);
      var numInLayer = blocks[w][j].length;
      var x = bits * size / -2 + (lineOffsets[j] ? 1 : -1) * (size - padding) / 2;
      for (var i = 0; i < numInLayer; i++) {
        var width = blocks[w][j][i] * size;
        box = createBox(width - padding * 2, boxSize + boxSize * Math.random(), boxSize);
        x += width / 2;
        var y = offsetY;
        var z = 0;
        box.position.set(x, y, z);
        box.rotation.set(0, 0, 0.3 * (Math.random() - 0.5));
        group.add(box);
        x += width / 2;
      };
      wall.add(group);
      groups[w][j] = group;
    };
    
  }

	listen(["resize"], function(e){
		sw = window.innerWidth;
		sh = window.innerHeight
		camera.aspect = sw / sh;
		camera.updateProjectionMatrix();
		renderer.setSize(sw, sh);
	});

	render(0);
}

function render(time) {

  tunnel.rotation.set(0, 0, time * 0.00005);
  
  for (var j = 0; j < depth; j++) {
    for (var w = 0; w < walls; w++) {
      var group = groups[w][j];
      group.position.z += 0.2;
      group.position.z %= size * depth;
    };
  }

	var camX = 0;//Math.sin(time * 0.00001976) * 50;
  var camY = 0;//Math.sin(time * 0.00002324) * 50;
  camera.position.set(camX, camY, 200);
  
  //camera.position.set(40, 0, 0);
  //camera.lookAt(new THREE.Vector3(0,0,0));
  //camera.rotation.set(0, 0, time * 0.00002);
  
  renderer.render(scene, camera)
	requestAnimationFrame(render);
}

init();