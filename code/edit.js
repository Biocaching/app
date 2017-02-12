var observation = {
	speciesId: undefined,
	timestamp: undefined,
	coordinates: undefined
}
var imgDataFormat = {
	BASE64: 0,
	URI: 1
};

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
	if (!document.querySelector("#photo-file").classList.contains("template")) {
		data.append("observation[picture_attributes][picture]", document.querySelector("#photo-file").files[0]);
	} else {
		// get FileEntry from URL
		window.resolveLocalFileSystemURL(
			// location url
			document.querySelector("#display-photo").src,
			// succes
			function(fileEntry) {
				// convert FileEntry object to File object
				fileEntry.file(
					// succes
					function(file) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							var imgBlob = new Blob([ this.result ], { type: "image/jpeg" } );
							data.append("observation[picture_attributes][picture]", imgBlob, "photo.jpg");
							sendRequest(
								query.id ? requestMethod.put : requestMethod.post, 
								"observations/" + (query.id || ""), 
								function(result) {
									window.location.replace(URI("observation.html").setSearch("id", result.status.observation_id));
								}, 
								data
							);
						};
						reader.readAsArrayBuffer(file);
					},
					// failure
					function(e) {
						alert("Failure converting to File.");
					}
				);
			},
			// failure
			function() {
				alert("Error getting file.");
			}
		);
	}
}

function deleteObservation() {
	sendRequest(
		requestMethod.delete, 
		"observations/" + query.id, 
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
		oid: query.id,
		img: document.querySelector("#display-photo").src
	});
	window.location.href = dest;
}

function showPhoto(src, destinationType) {

	// Cordova "browser" platform always returns base64, even if FILE_URI was specified
	// https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-camera/#browser-quirks
	if (src.length > 1000) destinationType = imgDataFormat.BASE64;

	var photoElm = document.querySelector("#display-photo");
	if (destinationType == imgDataFormat.BASE64) {
		photoElm.src = "data:image/jpeg;base64," + src;
	}
	else {
		photoElm.src = src;
	}
	photoElm.classList.remove("template");

};

document.addEventListener("deviceready", function() {
	// Cordova deviceready
	document.querySelector("#camera").classList.remove("template");
	document.querySelector("#library").classList.remove("template");
	document.querySelector("#photo-file").classList.add("template");
}, false);

document.querySelector("#photo-file").addEventListener("change", function(e) {
	// HTML file selector
	var destinationType = imgDataFormat.URI;
	document.querySelector("#display-photo").classList.remove("template");
	var file = this.files[0];
	var img = URL.createObjectURL(file);
	showPhoto(img, destinationType);
	document.querySelector("#display-photo").onload = function() {
		URL.revokeObjectURL(img);
	};

}, false);

document.querySelector("#camera").addEventListener("click", function(evt) {
	// Cordova camera source

	var destinationType = imgDataFormat.URI;

	navigator.camera.getPicture(function(data) {
		// success
		showPhoto(data, destinationType);
	}, function(message) {
		// failure
		alert("Failure: " + message);
	}, {
		correctOrientation: true, 
		destinationType: destinationType
	});
	evt.preventDefault();
}, false);

document.querySelector("#library").addEventListener("click", function(evt) {
	// Cordova library source

	var destinationType = imgDataFormat.URI;

	navigator.camera.getPicture(function(data) {
		// success
		showPhoto(data, destinationType);
	}, function(message) {
		// failure
		alert("Failure: " + message);
	}, {
		//correctOrientation: true, 
		sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
		destinationType: destinationType
	});
}, false);

// update links when timestamp or location is edited
document.querySelector("#timestamp").addEventListener("blur", updateLinks);
document.querySelector("#coordinates").addEventListener("blur", updateLinks);

document.querySelector("#upload-link").addEventListener("click", function() {
	if (!this.classList.contains("disabled"))
		uploadObservation();
});
document.querySelector("#delete").addEventListener("click", deleteObservation);

(function() {

	// check login
	if (!localStorage.getItem("biocaching:user"))
		window.location.replace(new URI("signin.html").search({source: uri.toString()}));

	// fill in modified values from URL
	if (query.sid)
		sendRequest(
			requestMethod.get, 
			"taxa/" + query.sid + "?fields=all", 
			function(data) { displayData(cleanupBiocaching(data.hits[0]._source) ) }
		);

	// TODO: combine with displayData()
	if (query.dt) {
		document.querySelector("#timestamp").value = query.dt;
	}
	if (query.loc) {
		document.querySelector("#coordinates").value = query.loc;
	}
	if (query.img) {
		document.querySelector("#display-photo").src = query.img;
		document.querySelector("#display-photo").classList.remove("template");
	}

	if (query.id) {
		// editing an existing observation
		document.querySelector("#back-link").href = URI("observation.html").setSearch({id: query.id});
		document.querySelector("#delete").classList.remove("template");
		if (!(query.sid && query.dt && query.loc)) {
			// only retreive observation if not everything is supplied in URL
			sendRequest(
				requestMethod.get, 
				"observations/" + query.id, 
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
