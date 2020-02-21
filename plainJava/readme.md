used:
======
*@three-js*
- https://www.npmjs.com/package/three-js

@ - small png 2 WebGL Mesh
- http://www.smartjava.org/content/threejs-render-real-world-terrain-heightmap-using-open-data/ 

@lukas2/threejs_landscape - .png Heigh Map to Mesh:
- https://www.lukaszielinski.de/blog/posts/2014/11/07/webgl-creating-a-landscape-mesh-with-three-dot-js-using-a-png-heightmap/
- https://github.com/lukas2/threejs_landscape



interesting realisiations: 
======
@mewo2 - creates rivers from mesh
- https://mewo2.com/notes/terrain/
- https://github.com/mewo2/terrain 

@delatin - generates cool mesh from heigh map:
- https://github.com/mapbox/delatin

Umsetzung!
-- https://observablehq.com/@mourner/martin-real-time-rtin-terrain-mesh?collection=@mourner/explorables
-- https://github.com/mapbox/martini


modules:
======
grass osgeo r.fill
- https://grass.osgeo.org/grass79/manuals/r.fill.dir.html
- https://grass.osgeo.org/grass76/manuals/r.flow.html
- https://grass.osgeo.org/grass76/manuals/r.terraflow.html

## turfjs
- https://turfjs.org/

## vielleicht als Heatpmap?
- https://www.patrick-wied.at/static/heatmapjs/example-full-customization.html

## Enginge??
deck.gl
-- https://deck.gl/#/

Google Engine?? hat eine reduce to vecotr methode 
-- https://developers.google.com/earth-engine/reducers_reduce_to_vectors

arcgis API? Hat hydrological Models!! Aber nur für lokale Dateien :(
-- https://developers.arcgis.com/rest/services-reference/raster-analysis-tasks-overview.htm

## hier geht es online
-- https://scalgo.com/live/global?ll=6.960033%2C51.450764&lrs=mapbox_basic%2Cglobal%2FSRTM_4_1%3Asrtm_v4_1_dem-simplified-2m_persistence%2Cglobal%2FSRTM_4_1%3Asrtm_v4_1_dem-sinks%2Cglobal%2Fhydrosheds%3Aedgeflow&res=2.388657133911758&tool=zoom&Persistence=4&FlowDetail=100000
wie machen die das online?
- https://scalgo.com/en-US/live-flood-risk
-- https://scalgo.com/assets/flashflood.mp4
-- https://scalgo.com/assets/watersheds.mp4

## Streamlines
gis rest: https://developers.arcgis.com/rest/services-reference/flow-direction.htm


## 2DO
-- select raster cells: https://blog.mastermaps.com/2015/11/mapping-grid-based-statistics-with.html
-- ol, nachbarn auswählen: https://openlayers.org/en/latest/examples/region-growing.html


-- Cool!! https://github.com/modelcreate/epanet-js || https://github.com/ewsterrenburg?tab=stars

-- shatten für die Karte: https://blog.mapbox.com/realistic-terrain-with-custom-styling-ce1fe98518ab
