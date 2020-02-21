
import "./componenents/map"

//import { OrbitControls } from './node_modules/three-js/addons/OrbitControls';


import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

var terrain;
//var THREE = THREELib();
//var THREE = THREELib(OrbitControls); // return THREE JS extended by its addons

function run(){

  
  
  // Make the img global so we can easily access the width and height.
  var img;
  
  // How much to scale the height of the heightfield.
  var height_scale = 200;
  
  function addLights() {
   var ambientLight = new THREE.AmbientLight(0x444444);
   ambientLight.intensity = 0.0;
   scene.add(ambientLight);
  
   var directionalLight = new THREE.DirectionalLight(0xffffff);
  
   directionalLight.position.set(900, 400, '0000').normalize();
   scene.add(directionalLight);
  }
  
  function setupCamera() {
    camera.position.z = 1000;
    camera.position.y = 240;
    camera.position.x = 0;
    camera.lookAt(new THREE.Vector3(0,0,0));
  }
  
  //To get the pixels, draw the image onto a canvas. From the canvas get the Pixel (R,G,B,A)
  function getTerrainPixelData() {
    img = document.getElementsByTagName("canvas")[document.getElementsByTagName("canvas").length-1];
    var canvas = document.getElementById("canvas");
    

    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
  
    var data = canvas.getContext('2d').getImageData(0,0, img.width, img.height).data;
    var normPixels = []
    var counter = 0;
    for (var i = 0, n = data.length; i < n; i += 4) {
      // get the average value of R, G and B.
      var color = data[i] + data[i+1] + data[i+2];
      normPixels.push((color) / 3);
      if(color !== 0) {
        counter++;
      }
    }
    console.log(counter) //
    return normPixels;
  }
  
  function addGround() {
    terrain = getTerrainPixelData();  
  
    var geometry = new THREE.PlaneGeometry(2400, 2400*img.width/img.height, img.height-1, img.width-1);
    //var geometry = new THREE.PlaneGeometry(2400*img.width/img.height, 2400, img.width-1, img.height-1);
    var material = new THREE.MeshLambertMaterial({
      color: 0xccccff,
      wireframe: true
    });
  
    // keep in mind, that the plane has more vertices than segments. If there's one segment, there's two vertices, if
    // there's 10 segments, there's 11 vertices, and so forth. 
    // The simplest is, if like here you have 100 segments, the image to have 101 pixels. You don't have to worry about
    // "skewing the landscape" then..
  
    // to check uncomment the next line, numbers should be equal
    console.log("length: " + terrain.length + ", vertices length: " + geometry.vertices.length);
    

    for (var i = 0, l = geometry.vertices.length; i < l; i++)
    {
      //console.count("computing...")
      var terrainValue = terrain[i] / 255;
      geometry.vertices[i].z = geometry.vertices[i].z + terrainValue * height_scale ;
    }
    
    // might as well free up the input data at this point, or I should say let garbage collection know we're done.
    terrain = null;
  
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
  
    var plane = new THREE.Mesh(geometry, material);
  
    geometry.dispose();
    ///plane.position = new THREE.Vector3(0,0,0);
    plane.position.set(0,0,0);
    // rotate the plane so up is where y is growing..
  
    var q = new THREE.Quaternion();
    q.setFromAxisAngle( new THREE.Vector3(-1,0,0), 90 * Math.PI / 180 );
    plane.quaternion.multiplyQuaternions( q, plane.quaternion );
  
    scene.add(plane)
  }
  
  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    controls.update();
  }
  console.log(THREE.OrbitControls)
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  var renderer = new THREE.WebGLRenderer();
  var controls = new OrbitControls( camera, renderer.domElement );
  
  setupCamera();
  addLights();
  addGround();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
  render();
  
}
window.run = run;
