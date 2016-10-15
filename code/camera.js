imgDataFormat = {
	BASE64 : 0,
	URI    : 1
};

// Native HTML5
document.querySelector("#photo-file").addEventListener("change", function(e) {

	document.querySelector("#display-photo").classList.remove("template");
	var file = this.files[0];
	var img = URL.createObjectURL(file);
	showPhoto(img, imgDataFormat.URI);
	document.querySelector("#display-photo").onload = function() {
		URL.revokeObjectURL(img);
	};

}, false);

// Cordova
document.addEventListener("deviceready", function() {
	// deviceready

	document.querySelector("#photo-button").addEventListener("click", function(evt) {

		var format = imgDataFormat.URI,
			formatCamera = /*Camera.DestinationType.FILE_URI*/ Camera.DestinationType.NATIVE_URI;

		navigator.camera.getPicture(function(data) {
			// success
			showPhoto(data, format);
		}, function(message) {
			// failure
			alert("Failure: " + message);
		}, {
			correctOrientation: true, 
			destinationType: formatCamera
		});
		evt.preventDefault();
	}, false);

	document.querySelector("#browse-button").addEventListener("click", function(evt) {
		navigator.camera.getPicture(function(data) {
			// success
			showPhoto(data, imgDataFormat.URI);
		}, function(message) {
			// failure
			alert("Failure: " + message);
		}, {
			//correctOrientation: true, 
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY
		});
	}, false);

}, false);

function showPhoto(src, dataFmt) {

	var photoElm = document.querySelector("#display-photo");
	if (dataFmt == imgDataFormat.BASE64) {
		photoElm.src = "data:image/jpeg;base64," + src;
	}
	else {
		photoElm.src = src;
	}
	photoElm.classList.remove("template");

	document.querySelector("#controls").classList.add("template");
	document.querySelector("#location").classList.remove("template");
	document.querySelector(".pagefooter").classList.remove("template");

	document.querySelector(".timestamp").textContent = (new Date()).toLocaleDateString('nb', {  year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});

	navigator.geolocation.getCurrentPosition(
		function(loc) {
			document.querySelector(".coordinates").textContent = loc.coords.latitude + ";" + loc.coords.longitude;
		},
		function() {
			document.querySelector(".coordinates").textContent = 'Unable to get coordinates';
		},
		{
			enableHighAccuracy: true,
			timeout: 5000
		}
	);

}