/// <reference path="main.js" />

function cleanupBiocaching(fullData) {
	var cleanData = {};
	cleanData.source = "taxo"; // required to differentiate from cleanupObservation data
	cleanData.scientificName = fullData.scientific_name;
	cleanData.speciesId = fullData.id;
	if (fullData.names.eng)
		cleanData.commonName = fullData.names.eng[0];
	if (fullData.primary_picture != null)
		cleanData.img = api_root + fullData.primary_picture.urls.medium;

	return cleanData;
}

