function cleanupObservation(fullObservation) {
	var cleanObservation = {};
	fullObservation = (fullObservation._source || fullObservation);

	cleanObservation.id = fullObservation.id;
	if (fullObservation.taxon.all_common_names.eng != undefined)
		cleanObservation.commonName = fullObservation.taxon.all_common_names.eng[0];
	else for (var lang in fullObservation.taxon.all_common_names) {
		cleanObservation.commonName = fullObservation.taxon.all_common_names[lang][0];
		break;
	}
	cleanObservation.scientificName = fullObservation.taxon.scientific_name;
	cleanObservation.time = new Date(fullObservation.observed_at);
	cleanObservation.latitude = fullObservation.location.lat;
	cleanObservation.longitude = fullObservation.location.lon;
	cleanObservation.latitudeDMS = convertToDMS(cleanObservation.latitude, false);
	cleanObservation.longitudeDMS = convertToDMS(cleanObservation.longitude, true);
	cleanObservation.observerId = fullObservation.user_id;
	cleanObservation.likesCount = fullObservation.likes.length;
	if (fullObservation.primary_picture != undefined) {
		cleanObservation.imageUrl = "https://api.biocaching.com" + fullObservation.primary_picture.urls.medium;
		cleanObservation.bigImageUrl = "https://api.biocaching.com" + fullObservation.primary_picture.urls.original;
	}

	return cleanObservation;
}

function convertToDMS(decimalDegrees, isLongitude) {
	return "" + 
		(0|(decimalDegrees<0?decimalDegrees=-decimalDegrees:decimalDegrees)) + "°" + 
		(0|decimalDegrees%1*60) + "'" + 
		(0|decimalDegrees*60%1*60) + "\"" + 
		(decimalDegrees<0?isLongitude?"W":"S":isLongitude?"E":"N");
}
