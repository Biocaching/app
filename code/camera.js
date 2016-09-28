document.querySelector("#photo-file").addEventListener("change", function(e) {

	document.querySelector("#display-photo").classList.remove("template");
	var file = this.files[0];
	var img = URL.createObjectURL(file);
	document.querySelector("img").src = img;
	document.querySelector("img").onload = function() {
		URL.revokeObjectURL(img);
	};

}, false);
