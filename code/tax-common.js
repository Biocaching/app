function cleanupBiocaching(fullData) {
	var cleanData = {};
	cleanData.scientificName = fullData.scientific_name;
	cleanData.speciesId = fullData.id;
	if (fullData.names.eng)
		cleanData.commonName = fullData.names.eng[0];
	if (fullData.primary_picture != null)
		cleanData.img = "https://api.biocaching.com" + fullData.primary_picture.urls.medium;

	return cleanData;
}

