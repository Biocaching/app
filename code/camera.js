document.querySelector("#photo-file").addEventListener("change", function(e) {

	document.querySelector("#display-photo").classList.remove("template");
	var file = this.files[0];
	var img = URL.createObjectURL(file);
	document.querySelector("#display-photo").src = img;
	document.querySelector("#display-photo").onload = function() {
		URL.revokeObjectURL(img);
	};

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
		}
	);

}, false);
