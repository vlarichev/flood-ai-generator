

// Set the search control 
var search = new ol.control.SearchNominatim (
    {	//target: $(".options").get(0),
        polygon: $("#polygon").prop("checked"),
        reverse: true,
        position: true	// Search, with priority to geo position
    });
map.addControl (search);

// Select feature when click on the reference index
search.on('select', function(e)
    {	// console.log(e);
        sLayer.getSource().clear();
        // Check if we get a geojson to describe the search
        if (e.search.geojson) {
            var format = new ol.format.GeoJSON();
            var f = format.readFeature(e.search.geojson, { dataProjection: "EPSG:4326", featureProjection: map.getView().getProjection() });
            sLayer.getSource().addFeature(f);
            var view = map.getView();
            var resolution = view.getResolutionForExtent(f.getGeometry().getExtent(), map.getSize());
            var zoom = view.getZoomForResolution(resolution);
            var center = ol.extent.getCenter(f.getGeometry().getExtent());
            // redraw before zoom
            setTimeout(function(){
                    view.animate({
                    center: center,
                    zoom: Math.min (zoom, 16)
                });
            }, 100);
        }
        else {
            map.getView().animate({
                center:e.coordinate,
                zoom: Math.max (map.getView().getZoom(),16)
            });
        }
    });