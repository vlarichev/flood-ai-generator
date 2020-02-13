import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';
import {fromLonLat} from 'ol/proj';
import {Raster as RasterSource, TileJSON} from 'ol/source';
import XYZ from 'ol/source/XYZ';
import Geolocation from 'ol/Geolocation';
//import OSM from 'ol/source/OSM';

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
}
loader.loaderHide  = () => {
  loader.classList.remove("visible");
  loader.classList.add("hidden");
}

var simulateInput = function(){ 
  control.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
}

var mXYZ = "https://api.mapbox.com/styles/v1/vladsalat/cjp00ru9502172rnxwd9t81nb/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidmxhZHNhbGF0IiwiYSI6ImNpdXh4cjM4YzAwMmsyb3IzMDA0aHV4a3YifQ.TiC4sHEfBVhLetC268aGEQ";
var levelLayer = new TileLayer({ source: new XYZ({ url: mXYZ })});

var mBoxElevationURL = 'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=pk.eyJ1IjoidmxhZHNhbGF0IiwiYSI6ImNqMHA5dDUxazAwMDgyd29heXozcXN6cTEifQ.3svfh2C2-MvbXgOLRz8igw';
var elevation = new XYZ({ crossOrigin: 'anonymous', url: mBoxElevationURL});
var raster = new RasterSource({ sources: [elevation], operation: flood });
var rasterLayer = new ImageLayer({opacity: 0.6, source: raster });

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
    levelLayer,
    rasterLayer,
    //new TileLayer({ source: new OSM(), opacity: 0.5 }),
  ],
  view: mapView
});

map.on("movestart", function(e){
    control.value=1;
    output.innerText = ""
});

map.once('rendercomplete', function(){
  init();
  Swal.fire({
    title: 'Welcome to AI Flood Map generator',
    html: 'Choose <code>Start</code> to start simulation.<br> Under <code>Examples</code> are some places to start',
    footer: '<a href="https://www.hydrotec.de/starkregen-webviewer/">Searching for more accurate maps? 🤔</a>',
    imageUrl: 'https://unsplash.it/id/1053/400/200',
    confirmButtonText: "Let's go",
    showCloseButton: true,
    imageWidth: 400,
    imageHeight: 200,
    imageAlt: 'Custom image',
  })
}); 

var init = function(){
    floodCanvas = document.getElementsByTagName('canvas')[1];
    floodContext = floodCanvas.getContext('2d'); 
    loader.loaderHide();
    console.log("done", floodCanvas, floodContext);
}

rain.addEventListener('click', function(){
    control.value = 60;
    simulateInput();
})

control.addEventListener('input', function() {
  output.innerText = "Probability - " + (1000-control.value)/1000 + "% ("+ control.value +")" ;
  raster.changed();
  loader.loaderVisible();
  calcBlue();
});

raster.on('beforeoperations', function(event) { event.data.level = control.value; });

var locations = document.getElementsByClassName('location');
for (var i = 0, ii = locations.length; i < ii; ++i) {
  locations[i].addEventListener('click', relocate);
}

function calcBlue () {
    if(floodCanvas){  
        var nAll = 0;
        var nAlive = 0;
        var p = floodContext.getImageData(0,0,floodCanvas.width,floodCanvas.height).data;
        
        for (var y = 0, i =0 ; y < floodCanvas.height; y++ )
          for (var x = 0; x < floodCanvas.width; x++, i+=4){
            nAll++;
            if (p[i+3]){
                nAlive++;
            }
        } 
        var resulted = nAlive/nAll*100;
        console.log(nAll, nAlive, resulted)
        if (resulted < maxRain) {
            console.log("Increase")
            nAlive == 0 ? control.stepUp(5) : control.stepUp(1);
            window.requestAnimationFrame(simulateInput)
        } else {
            console.log("done");
            loader.loaderHide();
        }
    } else {
        console.warn("nix, try to recatch")
        init()
    }
}


home.addEventListener("click", function(){
    var geolocation = new Geolocation({ tracking: true });
    geolocation.on('change:accuracyGeometry', function() {
        var coordinates = geolocation.getPosition();
        mapView.setCenter(fromLonLat(coordinates));
    });
})

function relocate(event) {
  var data = event.target.dataset;
  var view = map.getView();
  view.setCenter(fromLonLat(data.center.split(',').map(Number)));
  view.setZoom(Number(data.zoom));
}