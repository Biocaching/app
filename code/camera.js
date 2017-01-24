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

}, false);

// Cordova
document.addEventListener("deviceready", function() {
	// deviceready

	navigator.camera.getPicture(function(data) {
		// success
		showPhoto(data, imgDataFormat.URI);
	}, function(message) {
		// failure
		alert("Failure: " + message);
	}, {
		correctOrientation: true, 
		destinationType: imgDataFormat.URI
	});
	evt.preventDefault();

}, false);

function showPhoto(src, dataFmt) {

	if (dataFmt == imgDataFormat.BASE64) {
		src = "data:image/jpeg;base64," + src;
	}

	var dest = URI("edit.html").setSearch({ img: src });
	window.location.replace(dest);

}