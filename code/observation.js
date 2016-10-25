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
}

(function() {

	var query = uri.query(true); // URI.js
	id = query.id;

	bypassAuthorization();
	getData("https://api.biocaching.com/observations/" + id, displayData)

})();
