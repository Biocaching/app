function cleanupObservation(fullObservation) {
	var cleanObservation = {};

	if (fullObservation._source.taxon.all_common_names.eng != undefined)
		cleanObservation.commonName = fullObservation._source.taxon.all_common_names.eng[0];
	else for (var lang in fullObservation._source.taxon.all_common_names) {
		cleanObservation.commonName = fullObservation._source.taxon.all_common_names[lang][0];
		break;
	}
	cleanObservation.scientificName = fullObservation._source.taxon.scientific_name;
	cleanObservation.time = new Date(fullObservation._source.observed_at);
	cleanObservation.latitudeDMS = convertToDMS(fullObservation._source.location.lat, false)
	cleanObservation.longitudeDMS = convertToDMS(fullObservation._source.location.lon, true);
	cleanObservation.observerId = fullObservation._source.user_id;
	cleanObservation.likesCount = fullObservation._source.likes.length;
	if (fullObservation._source.primary_picture != undefined)
		cleanObservation.imageUrl = "https://api.biocaching.com" + fullObservation._source.primary_picture.urls.medium;

	return cleanObservation;
}

function convertToDMS(decimalDegrees, isLongitude) {
	return "" + 
		(0|(decimalDegrees<0?decimalDegrees=-decimalDegrees:decimalDegrees)) + "°" + 
		(0|decimalDegrees%1*60) + "'" + 
		(0|decimalDegrees*60%1*60) + "\"" + 
		(decimalDegrees<0?isLongitude?"W":"S":isLongitude?"E":"N");
}
