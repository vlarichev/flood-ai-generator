import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';
import {fromLonLat} from 'ol/proj';
import {Raster as RasterSource, TileJSON} from 'ol/source';
import XYZ from 'ol/source/XYZ';
import Geolocation from 'ol/Geolocation';
import OSM from 'ol/source/OSM';

import MapboxElevation from 'mapbox-elevation';

import  C2S  from "canvas2svg";


import loader from "./loader"
import calcPixel from "./calculate";
import sayHello from "./firstSwal"

const control = document.getElementById('level');
const output = document.getElementById('output');
const startButton = document.getElementById('rain');
const home = document.getElementById('home');

window.maxRain = 11;
console.log({maxRain})

var simulateInput = () =>   control.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

const _mbK = "pk.eyJ1IjoidmxhZHNhbGF0IiwiYSI6ImNpdXh4cjM4YzAwMmsyb3IzMDA0aHV4a3YifQ.TiC4sHEfBVhLetC268aGEQ"
const mapBoxBackgorundMap = "https://api.mapbox.com/styles/v1/vladsalat/cjp00ru9502172rnxwd9t81nb/tiles/256/{z}/{x}/{y}@2x?access_token="+_mbK;
const mBoxElevationURL = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=pk.eyJ1IjoidmxhZHNhbGF0IiwiYSI6ImNqMHA5dDUxazAwMDgyd29heXozcXN6cTEifQ.3svfh2C2-MvbXgOLRz8igw';

var calcFunction = calcPixel;

var elevation = new XYZ({ crossOrigin: 'anonymous', url: mBoxElevationURL});

var raster = new RasterSource({ 
  sources: [elevation], 
  operation: function(pixels, data){
    var pixel = calcFunction(pixels, data);
    data.empty ++;
    if(pixel[3] !== 0) data.full ++;
    return pixel;
  },  
  lib: { calcFunction: calcFunction }
});

var startCoordinates = [6.081356,50.774044];

var mapView = new View({ center: fromLonLat(startCoordinates), minZoom:14, zoom: 17, maxZoom: 18});

var getElevation = MapboxElevation(_mbK);



var map = new Map({
  target: 'map',
  controls: [],
  layers: [
    //new TileLayer({ source: new OSM(), opacity: 0.5 }),
    //new TileLayer({ source: new XYZ({ url: mapBoxBackgorundMap })}),
    new ImageLayer({opacity: 0.6, source: raster })
  ],
  view: mapView
});


map.on("movestart", function(e){
    control.value=1;
    output.innerText = "";
});

map.once('rendercomplete', function(){
  sayHello();
  loader.loaderHide();
}); 

startButton.addEventListener('click', function(){
  getElevation(startCoordinates, function(err, elevation) {
    console.log('elevation at this point is ', elevation);
    control.value = elevation-20;
  });  
  animateFlood();
});

control.addEventListener('input', function() {
  output.innerText = "Probability - " + (1000-control.value)/1000 + "% ("+ control.value +")" ;
  raster.changed();
  loader.loaderVisible();
  //calcBlue();
});

raster.on('beforeoperations', function(event) { 
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
      //raster.changed();
      simulateInput()
      setTimeout(animateFlood, 400);
  } else {
        console.log("done");
        loader.loaderHide();
        window.run()
        var canvas = document.getElementsByTagName('canvas')[0];
        
        //https://openlayers.org/en/latest/examples/svg-layer.html
        var ctxDraw = new C2S(canvas.width,canvas.height);
        ctxDraw.drawImage(canvas,0,0);
        var mySerializedSVG = ctxDraw.getSerializedSvg(); 

        console.log(mySerializedSVG)
  }
}

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
  startCoordinates = data.center.split(',').map(Number)
  view.setCenter(fromLonLat(startCoordinates));
  view.setZoom(Number(data.zoom));
}