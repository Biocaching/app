/// <reference path="main.js" />

/**
 * Standarize and simplify observation data structure
 * @param {object} fullObservation 
 */
function cleanupObservation(fullObservation) {
	var cleanObservation = {};
	cleanObservation.source = "obs"; // required to differentiate from cleanupBiocaching data
	fullObservation = (fullObservation._source || fullObservation);

	cleanObservation.id = fullObservation.id;

	// set a common name
	localStorage.getItem("biocaching:languages") && localStorage.getItem("biocaching:languages").split(",").some(function(language) {
		language = language.trim();
		if (fullObservation.taxon.all_common_names[language] != undefined) {
			cleanObservation.commonName = sentenceCase(fullObservation.taxon.all_common_names[language][0]);
			return true;
		}
	})

	cleanObservation.scientificName = sentenceCase(fullObservation.taxon.scientific_name);
	cleanObservation.speciesId = fullObservation.taxon.id;
	cleanObservation.time = new Date(fullObservation.observed_at);
	cleanObservation.latitude = Number(fullObservation.location.lat);
	cleanObservation.longitude = Number(fullObservation.location.lon);
	cleanObservation.observerId = fullObservation.user_id;
	cleanObservation.likesCount = fullObservation.likes.length;
	cleanObservation.pictures = [];
	for (var i = 0; i < fullObservation.pictures.length; i++) {
		cleanObservation.pictures.push({
			url: api_root + fullObservation.pictures[i].urls.medium, 
			urlBig: api_root + fullObservation.pictures[i].urls.original
		});
	}
	return cleanObservation;
}

function Coords(param1, param2) {
	if (param1 == undefined || param1 == "") {
		return;
	}
	if (typeof param1 == "number") {
		this.latitude = param1;
		this.longitude = param2;
	} else {
		var parts = param1.split(" ");
		this.latitude = DMStoDecimalDegrees(parts[0]);
		this.longitude = DMStoDecimalDegrees(parts[1]);
	};
}
Coords.prototype.toString = function() {
	return "" + 
		DecimalDegreesToDMS(this.latitude)  + (this.latitude  >= 0 ? "N" : "S") + " " +
		DecimalDegreesToDMS(this.longitude) + (this.longitude >= 0 ? "E" : "W");
}
function DecimalDegreesToDMS(deg) {
	return "" + 
		(0|(deg<0?deg=-deg:deg)) + "°" + 
		(0|deg%1*60) + "'" + 
		(0|deg*60%1*60) + "\"";
}
function DMStoDecimalDegrees(dms) {
	var parts = dms.split(/[^\d\w\.]+/);
	var deg = Number(parts[0]) + Number(parts[1])/60 + Number(parts[2])/(60*60);
	if (parts[3] == "S" || parts[3] == "W")
		deg *= -1;
	return deg;
}
