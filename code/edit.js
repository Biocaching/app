const observation = {
	speciesId: undefined,
	timestamp: undefined,
	coordinates: undefined
}

function updateLinks() {
	// enable upload if everything is filled out
	if (document.querySelector("#species").value.length > 1 && document.querySelector("#timestamp").value && document.querySelector("#coordinates").value)
		document.querySelector("#upload-link").classList.remove("disabled");
	else
		document.querySelector("#upload-link").classList.add("disabled");
}

function displayData(data) {
	// called both for displaying a registered observation, and displaying a selected species
	if (!(data.source == "obs" && query.sid)) {
		// if  displaying data for stored observation, while a taxon selection has also been made,
		// then don't use observation species info
		document.querySelector("#species").value = ( data.commonName || data.scientificName);
		observation.speciesId = data.speciesId;
	}
	if (data.time)
		document.querySelector("#timestamp").value = data.time.toISOString();
	if (data.latitude) 
		document.querySelector("#coordinates").value = (new Coords(data.latitude, data.longitude)).toString();

	updateLinks();
}

function uploadObservation() {
	var data = new FormData();
	data.append("observation[taxon_id]", observation.speciesId);
	data.append("observation[observed_at]", document.querySelector("#timestamp").value);
	var c = new Coords(document.querySelector("#coordinates").value);
	data.append("observation[latitude]", c.latitude);
	data.append("observation[longitude]", c.longitude);

	sendRequest(
		query.id ? requestMethod.put : requestMethod.post, 
		"https://api.biocaching.com/observations/" + (query.id || ""), 
		function(result) {
			window.location.replace(URI("observation.html").setSearch("id", result.status.observation_id));
		}, 
		data
	);
}

function deleteObservation() {
	sendRequest(
		requestMethod.delete, 
		"https://api.biocaching.com/observations/" + query.id, 
		function(result) {
			window.location.replace("feed.html?context=personal");
		}
	);
}

function getLocation() {
	navigator.geolocation.getCurrentPosition(
		function(loc) {
			document.querySelector("#coordinates").value = (new Coords(loc.coords.latitude, loc.coords.longitude)).toString();
			updateLinks();
		},
		function(error) {
			document.querySelector("#coordinates").value = "Error getting coordinates.";
		},
		{
			timeout: 50000
		}
	);
}

function loadSpecies() {
	var dest = URI("taxonomy.html?choose&ds=biocaching").setSearch({
		id: observation.speciesId,
		dt: document.querySelector("#timestamp").value,
		loc: document.querySelector("#coordinates").value,
		oid: query.id
	});
	window.location.href = dest;
}

// update links when timestamp or location is edited
document.querySelector("#timestamp").addEventListener("blur", updateLinks);
document.querySelector("#coordinates").addEventListener("blur", updateLinks);

document.querySelector("#upload-link").addEventListener("click", function() {
	if (!this.classList.contains("disabled"))
		uploadObservation();
});
document.querySelector("#delete").addEventListener("click", deleteObservation);

(function() {

	// fill in modified values from URL
	if (query.sid)
		sendRequest(
			requestMethod.get, 
			"https://api.biocaching.com/taxa/" + query.sid + "?fields=all", 
			function(data) { displayData(cleanupBiocaching(data.hits[0]._source) ) }
		);

	// TODO: combine with displayData()
	if (query.dt) {
		document.querySelector("#timestamp").value = query.dt;
	}
	if (query.loc) {
		document.querySelector("#coordinates").value = query.loc;
	}

	if (query.id) {
		// editing an existing observation
		document.querySelector("#back-link").href = URI("observation.html").setSearch({id: query.id});
		document.querySelector("#delete").classList.remove("template");
		if (!(query.sid && query.dt && query.loc)) {
			// only retreive observation if not everything is supplied in URL
			sendRequest(
				requestMethod.get, 
				"https://api.biocaching.com/observations/" + query.id, 
				function(data) { displayData(cleanupObservation(data.observation) ) }
			);
		}
	} else {
		// new observation
		if (!query.dt) {
			document.querySelector("#timestamp").value = (new Date()).toISOString();
		};
		if (!query.loc) {
			getLocation();
			document.addEventListener("deviceready", function() {
				getLocation();
			}, false);
		};
	};

	updateLinks();
})();
