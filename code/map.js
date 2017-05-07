function displayData(data) {
	var map = L.map("map");
	L.tileLayer(
		"http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}", {
	    	attribution: "Map data &copy; <a href='http://openstreetmap.org/' target='_blank'>OSM</a> contributors, tiles &copy; <a href='http://korona.geog.uni-heidelberg.de/' target='_blank'>GIScience Heidelberg</a>",
	    	maxZoom: 17
		}
	).addTo(map);
	var obsLayer = L.markerClusterGroup({ 
		showCoverageOnHover: false,
		maxClusterRadius: 40
	});
	data.hits.forEach(function(obs){
		var m = L.marker([obs._source.location.lat, obs._source.location.lon]);
		obs = cleanupObservation(obs);
		var imageCode = "";
		if (obs.pictures.length > 0) imageCode = "<img src='" + obs.pictures[0].url + "'/>";
		m.bindPopup("\
			<div class='spacer'></div>\
			<a href='observation.html?id=" + obs.id + "'>\
				" + imageCode + "\
				<h2>" + obs.commonName + "</h2>\
				<h3>" + obs.scientificName + "</h3>\
				<time datetime='2016-11-05'>" + obs.time.toLocaleDateString() + "</time>\
			</a>\
			");
		obsLayer.addLayer(m);
	});
	map.addLayer(obsLayer);
	map.fitBounds(obsLayer.getBounds());
}

(function() {

	if (document.querySelector("html.personal")) {
		document.title = "My map - Biocaching";
		var user = localStorage.getItem("biocaching:user");
		if (!user)
			window.location.replace(new URI("signin.html").search({source: uri.toString()}));
		sendRequest(requestMethod.get, observationsRoot + "?user_id=" + user + "&size=999", displayData)
	} else {
		// allow bypassing authorization, since global feed is not private
		bypassAuthorization();

		sendRequest(requestMethod.get, observationsRoot + "?size=999", displayData)
	}

})();
