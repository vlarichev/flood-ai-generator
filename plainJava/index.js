import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';
import {fromLonLat} from 'ol/proj';
import {Raster as RasterSource, TileJSON} from 'ol/source';
import XYZ from 'ol/source/XYZ';
import Geolocation from 'ol/Geolocation';
import OSM from 'ol/source/OSM';

import Swal from 'sweetalert2';

import flood from "./componenents/calculate";

const control = document.getElementById('level');
const loader = document.getElementById("loader");
const output = document.getElementById('output');
const rain = document.getElementById('rain');
const home = document.getElementById('home');

window.maxRain = 12;

var floodCanvas;
var floodContext;

loader.loaderVisible = () => {
  loader.classList.remove("hidden");
  loader.classList.add("visible");
};
loader.loaderHide  = () => {
  loader.classList.remove("visible");
  loader.classList.add("hidden");
};

var simulateInput = function(){ 
  control.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
};

var mURL = "https://api.mapbox.com/styles/v1/vladsalat/cjp00ru9502172rnxwd9t81nb/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidmxhZHNhbGF0IiwiYSI6ImNpdXh4cjM4YzAwMmsyb3IzMDA0aHV4a3YifQ.TiC4sHEfBVhLetC268aGEQ";
var levelLayer = new TileLayer({ source: new XYZ({ url: mURL })});


function calcPixel(pixels, data){
  var pixel = pixels[0];
  if (pixel[3]) {
    var height = -10000 + ((pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1);
    if (height <= data.level-(height*0.02)) {
        pixel[0] = 255; //R
        pixel[1] = 45; //G
        pixel[2] = 45; //B
        pixel[3] = 255; //A
    } 
    else if (height <= data.level-(height*0.01)) {
        pixel[0] = 246; //R
        pixel[1] = 110; //G
        pixel[2] = 110  ; //B
        pixel[3] = 255; //A
    } 
    else if(height <= data.level){
        pixel[0] = 236; //R
        pixel[1] = 185; //G
        pixel[2] = 186; //B
        pixel[3] = 225; //A
    }  else {
        pixel[3] = 0;
      }
  }
  return pixel;
}

var mBoxElevationURL = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=pk.eyJ1IjoidmxhZHNhbGF0IiwiYSI6ImNqMHA5dDUxazAwMDgyd29heXozcXN6cTEifQ.3svfh2C2-MvbXgOLRz8igw';
var elevation = new XYZ({ crossOrigin: 'anonymous', url: mBoxElevationURL});

var raster = new RasterSource({ 
  sources: [elevation], 
  operation: function(pixels, data){
    var pixel = calcPixel(pixels, data);
    data.empty ++;
    if(pixel[3] !== 0) data.full ++;
    return pixel;
  },  
  lib: { calcPixel:calcPixel }
});
var floodLayer = new ImageLayer({opacity: 0.6, source: raster });

var mapView = new View({
  center: fromLonLat([6.081356,50.774044]),
  zoom: 17,
  maxZoom: 18,
  minZoom:14
});



var map = new Map({
  target: 'map',
  controls: [],
  layers: [
    //new TileLayer({ source: new OSM(), opacity: 0.5 }),
    //levelLayer,
    floodLayer
  ],
  view: mapView
});


map.on("movestart", function(e){
    control.value=1;
    output.innerText = "";
});

map.once('rendercomplete', function(){
  if(location.hostname !== "localhost") Swal.fire({
    title: 'Welcome to AI Flood Map generator',
    html: 'Choose <code>Start</code> to start simulation.<br> Under <code>Examples</code> are some places to start',
    footer: '<a href="https://www.hydrotec.de/starkregen-webviewer/">Searching for more accurate maps? 🤔</a>',
    imageUrl: 'https://unsplash.it/id/1053/400/200',
    confirmButtonText: "Let's go",
    showCloseButton: true,
    imageWidth: 400,
    imageHeight: 200,
    imageAlt: 'Custom image',
  });
  init();
}); 

var init = function(){
  try {
    //floodCanvas = document.getElementsByTagName('canvas')[1];
    //floodContext = floodCanvas.getContext('2d'); 
    loader.loaderHide();
    //console.log("done", floodCanvas, floodContext);
  } catch (error) {
    console.log(error, document.getElementsByTagName('canvas'));
  }

};

rain.addEventListener('click', function(){
    control.value = 60;
    animateFlood();
});

control.addEventListener('input', function() {
  output.innerText = "Probability - " + (1000-control.value)/1000 + "% ("+ control.value +")" ;
  raster.changed();
  loader.loaderVisible();
  //calcBlue();
});

raster.on('beforeoperations', function(event) { 
  //resetMap();
  event.data.level = control.value; 
  event.data.empty = 0; 
  event.data.full = 0; 
});

window.resulted = {
  full:1,
  empty:10000
};

raster.on('afteroperations',function(result){
  window.resulted  = result.data;
});

var locations = document.getElementsByClassName('location');
for (var i = 0, ii = locations.length; i < ii; ++i) {
  locations[i].addEventListener('click', relocate);
}

function animateFlood () {
  var data =  window.resulted;
  var resulted = data.full/data.empty*100;
  console.log(data.empty,resulted, control.value);
  if (resulted < maxRain) {
      console.log("Increase");
      control.stepUp(data.full === 0 ?  2 :  1);
      raster.changed();
      window.requestAnimationFrame(animateFlood);
  } else {
      console.log("done");
      loader.loaderHide();
  }
}

window.run = animateFlood;


home.addEventListener("click", function(){
    var geolocation = new Geolocation({ tracking: true });
    geolocation.on('change:accuracyGeometry', function() {
        var coordinates = geolocation.getPosition();
        mapView.setCenter(fromLonLat(coordinates));
    });
});

function relocate(event) {
  var data = event.target.dataset;
  var view = map.getView();
  view.setCenter(fromLonLat(data.center.split(',').map(Number)));
  view.setZoom(Number(data.zoom));
}