function displayData(data) {
	var map = L.map("map");
	L.tileLayer(
		"http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}", {
	    	attribution: "Map data &copy; <a href='http://openstreetmap.org'>OSM</a> contributors, tiles &copy; <a href='http://korona.geog.uni-heidelberg.de/'>GIScience Heidelberg</a>",
	    	subdomains: ['a','b','c'],
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
		if (obs.imageUrl) imageCode = "<img src='" + obs.imageUrl + "'/>";
		m.bindPopup("\
			<div class='spacer'></div>\
			" + imageCode + "\
			<h2>" + obs.commonName + "</h2>\
			<h3>" + obs.scientificName + "</h3>\
			<time datetime='2016-11-05'>" + obs.time.toLocaleDateString() + "</time>\
			");
		obsLayer.addLayer(m);
	});
	map.addLayer(obsLayer);
	map.fitBounds(obsLayer.getBounds());
}

(function() {

	if (document.querySelector(".personal-section")) {
		document.title = "My map - Biocaching";
		var user = localStorage.getItem("biocaching:user");
		if (!user)
			window.location.replace(new URI("signin.html").search({source: uri.toString()}));
		getData("https://api.biocaching.com/observations?user_id=" + user + "&size=999", displayData)
	} else {
		// allow bypassing authorization, since global feed is not private
		bypassAuthorization();

		getData("https://api.biocaching.com/observations?size=999", displayData)
	}

})();
