import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';
import {fromLonLat,toLonLat} from 'ol/proj';
import {Raster as RasterSource, TileJSON} from 'ol/source';
import XYZ from 'ol/source/XYZ';
import Geolocation from 'ol/Geolocation';
import OSM from 'ol/source/OSM';

import MapboxElevation from 'mapbox-elevation';

//import  C2S  from "canvas2svg";

import Swal from 'sweetalert2';


import loader from "./loader"
import calcPixel from "./calculate";
import sayHello from "./firstSwal"

const control = document.getElementById('level');
const output = document.getElementById('output');
const startButton = document.getElementById('rain');
const home = document.getElementById('home');

window.maxRain  = 11;
window.resulted = { full:1, empty:10000 };

console.log({maxRain})

var simulateInput = () =>   control.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));


// Karten initialisieren

const _mbK = "pk.eyJ1IjoidmxhZHNhbGF0IiwiYSI6ImNpdXh4cjM4YzAwMmsyb3IzMDA0aHV4a3YifQ.TiC4sHEfBVhLetC268aGEQ"
const mapBoxBackgorundMap = "https://api.mapbox.com/styles/v1/vladsalat/cjp00ru9502172rnxwd9t81nb/tiles/256/{z}/{x}/{y}@2x?access_token="+_mbK;
const mBoxElevationURL = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=pk.eyJ1IjoidmxhZHNhbGF0IiwiYSI6ImNqMHA5dDUxazAwMDgyd29heXozcXN6cTEifQ.3svfh2C2-MvbXgOLRz8igw';

var getElevation = MapboxElevation(_mbK);

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
var heighLayer = new ImageLayer({opacity: 0.9, source: raster });

var map = new Map({
  target: 'map',
  controls: [],
  layers: [
    //new TileLayer({ source: new OSM(), opacity: 0.5 }),
    new TileLayer({ source: new XYZ({ url: mapBoxBackgorundMap })}),
    heighLayer
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

/// TODO - Aktueller Mittelpunkt des Bildschirmes zum Startpunkt der Simulation umwanlden
var localWaterLevel;
var currentMiddlePoint = () => toLonLat(map.getView().getCenter());

startButton.addEventListener('click', function(){
  getElevation(currentMiddlePoint(), function(err, elevation) {
    console.info('elevation at this point is ', elevation);
    localWaterLevel = elevation;
    control.value = elevation-20;
  });  
  animateFlood();
});



var returnProbability = function(){
  var currentProbability =  (Math.abs((localWaterLevel/parseInt(control.value)-1)*100))*4;
  if(currentProbability > 100) return '<span class="font-weight-bold text-success">Extrem unwahrscheinlich</span>'
  else if(currentProbability > 75) return '<span class="font-weight-bold text-success">Sehr unwahrscheinlich</span>'
  else if(currentProbability > 50) return '<span class="font-weight-bold text-primary">Unwahrscheinlich</span>'
  else if(currentProbability > 50) return '<span class="font-weight-bold text-warning">Sehr selten</span>'
  else if(currentProbability > 25) return '<span class="font-weight-bold text-warning">selten</span>'
  else return '<span class="font-weight-bold text-danger">wahrscheinlich</span>'
}

control.addEventListener('input', function() {
  //output.innerText = "Probability - " + (1000-control.value)/1000 + "% ("+ control.value +")" ;
  raster.changed();
  loader.loaderVisible();
});

raster.on('beforeoperations', function(event) { 
  event.data.level = control.value; 
  event.data.empty = 0; 
  event.data.full = 0; 
});


raster.on('afteroperations',function(result){
  window.resulted  = result.data;
});

var locations = document.getElementsByClassName('location');
for (var i = 0, ii = locations.length; i < ii; ++i) {
  locations[i].addEventListener('click', relocate);
}

var newRun = true;
const speed = 200;

var returnStep = function (current, goal) {
  var step = 1;
  var delta = Math.abs(Math.floor(current-goal))
  if (delta>=20) step = 5;
  else if (delta>=10) step = 2;
  return step;

}

function animateFlood () {
  heighLayer.setZIndex(-1);
  var data =  window.resulted;
  var resulted = data.full/data.empty*100;
  output.innerHTML = returnProbability();
  //console.log(resulted,data.empty,data.full,maxRain, control.value, localWaterLevel);
  if (newRun && resulted < maxRain) {
    //console.log("Increase");
    control.stepUp(returnStep(resulted,maxRain));
    //raster.changed();
    simulateInput()
    setTimeout(animateFlood, speed);
  }else if(resulted > maxRain){
    console.log("ups, too much");
    control.stepDown(returnStep(resulted,maxRain));
    //raster.changed();
    simulateInput()
    newRun = false;
    setTimeout(animateFlood, speed);
  } else {
    heighLayer.setZIndex(2);
    loader.loaderHide();
    newRun = true;
    Swal.fire({
      icon: 'success',
      title: 'Berechnung fertig, die Wahrscheinlichkeit für diesen Ereignis ist',
      html: returnProbability(),
      showConfirmButton: false,
      timer: 2500
    })
  }
}

home.addEventListener("click", function(){
  var geolocation = new Geolocation({ tracking: true, trackingOptions: { enableHighAccuracy: true }});
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