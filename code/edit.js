var dataType = { observation: 0, taxon: 1 };
var speciesLink = document.querySelector("#species");

function displayData(data, type) {
	// called both for displaying a registered observation, and displaying a selected species
	if (!(type == dataType.observation && query.sid)) {
		speciesLink.textContent = ( data.commonName || data.scientificName);
		speciesLink.href = URI(speciesLink.href).setSearch({id: data.speciesId});
	}
	if (data.time) {
		document.querySelector("#timestamp").value = data.time.toISOString();
	}
	if (data.latitude) document.querySelector("#coordinates").value = (new Coords(data.latitude, data.longitude)).toString();

	updateLinks();
}

function updateLinks() {
	speciesLink.href = URI(speciesLink.href).setSearch({
		dt: document.querySelector("#timestamp").value,
		loc: document.querySelector("#coordinates").value
	});

	// enable upload is everything is filled out
	if (document.querySelector("#species").textContent.length > 1 && document.querySelector("#timestamp").value && document.querySelector("#coordinates").value)
		document.querySelector("#upload-link").classList.remove("disabled");
	else
		document.querySelector("#upload-link").classList.add("disabled");
}

function upload() {
	var formData = new FormData();
	// formData.append("observation[taxon_id]", 1441);
	// formData.append("observation[observed_at]", "2016-11-17T11:00:00.000Z");
	// formData.append("observation[latitude]", 63.37183226679281);
	// formData.append("observation[longitude]", 10.480957031250002);
	formData.append("observation[taxon_id]", query.sid);
	formData.append("observation[observed_at]", document.querySelector("#timestamp").value);
	var c = new Coords(document.querySelector("#coordinates").value);
	formData.append("observation[latitude]", c.latitude);
	formData.append("observation[longitude]", c.longitude);

	var xhr = new XMLHttpRequest();
	xhr.open("POST", "https://api.biocaching.com/observations")
	xhr.setRequestHeader("X-User-Email", auth.email);
	xhr.setRequestHeader("X-User-Token", auth.token);
	xhr.setRequestHeader("X-User-Api-Key", "0b4d859e740d2978b98a13e2b9e130d8");
	xhr.addEventListener("load", function() {
		switch (this.status) {
			case 200:
				console.log(this.responseText);
				break;
			default:
				// unexpected status
				console.log(this.status, this.responseText);
				break;
		}
	});
	xhr.send(formData);
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

(function() {

	speciesLink.href = URI(speciesLink.href).setSearch({oid: query.id});

	// update links when timestamp or location is edited
	document.querySelector("#timestamp").addEventListener("blur", updateLinks);
	document.querySelector("#coordinates").addEventListener("blur", updateLinks);

	document.querySelector("#upload-link").addEventListener("click", function() {
		if (!this.classList.contains("disabled"))
			upload();
	});

	// fill in modified values from URL
	if (query.sid)
		getData("https://api.biocaching.com/taxa/" + query.sid + "?fields=all", function(data) { displayData(cleanupBiocaching(data.hits[0]._source), dataType.taxon ) });
	if (query.dt) {
		document.querySelector("#timestamp").value = query.dt;
		speciesLink.href = URI(speciesLink.href).setSearch({dt: document.querySelector("#timestamp").value});
	}
	if (query.loc) {
		document.querySelector("#coordinates").value = query.loc;
		speciesLink.href = URI(speciesLink.href).setSearch({loc: document.querySelector("#coordinates").value});
	}

	if (query.id) {
		// editing an existing observation
		document.querySelector("#back-link").href = URI("observation.html").setSearch({id: query.id});
		if (!(query.sid && query.dt && query.loc)) {
			// only retreive observation if everything is not supplied  in URL
			getData("https://api.biocaching.com/observations/" + query.id, function(data) { displayData(cleanupObservation(data.observation), dataType.observation ) });
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
