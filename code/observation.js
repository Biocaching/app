var id;

function displayData(data) {
	obs = cleanupObservation(data.observation);
	console.log(obs);
	document.querySelector("h1").textContent = obs.commonName;
	document.querySelector("h2").textContent = obs.scientificName;
	document.querySelector(".timestamp").textContent = obs.time.toLocaleString();
	document.querySelector(".coordinates").textContent = obs.latitudeDMS + " " + obs.longitudeDMS;
	document.querySelector(".user").textContent = data.users[obs.observerId].displayname;
	document.querySelector(".likes-count").textContent = obs.likesCount;
	if (obs.bigImageUrl)
		document.querySelector("img").src = obs.bigImageUrl;

	var map = L.map("map", { zoomControl: false }).setView([obs.latitude, obs.longitude], 13);
	L.tileLayer(
		"http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}", {
			attribution: "Map data &copy; <a href='http://openstreetmap.org/' target='_blank'>OSM</a>, tiles &copy; <a href='http://korona.geog.uni-heidelberg.de/' target='_blank'>GIScience Heidelberg</a>",
			maxZoom: 17
		}
	).addTo(map);
	L.marker([obs.latitude, obs.longitude]).addTo(map);

	// disable all interactivity
	map._handlers.forEach(function(handler) {
		handler.disable();
	});
}

(function() {

	var query = uri.query(true); // URI.js
	id = query.id;

	bypassAuthorization();
	getData("https://api.biocaching.com/observations/" + id, displayData)

})();
