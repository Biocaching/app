document.querySelector("form").addEventListener("submit", function(e) {

	e.preventDefault();

	var file = this.elements["photo-file"].files[0];
	var data = new FormData();
	data.append("observation[picture]", file);
	data.append('observation[taxon_id]', '31619');
	data.append('observation[observed_at]', '2009-10-26T04:47:09Z');
	data.append('observation[latitude]', 0);
	data.append('observation[longitude]', 0); 

	var xhr = new XMLHttpRequest();
	xhr.open("POST", "https://api.biocaching.com/observations", true);
	xhr.setRequestHeader("X-User-Email", auth.email);
	xhr.setRequestHeader("X-User-Token", auth.token);
	xhr.setRequestHeader("X-User-Api-Key", "0b4d859e740d2978b98a13e2b9e130d8");

	xhr.onload = function(e) {
		alert("Upload finished!");
	}

	xhr.send(data);

}, false);

document.querySelector('#photo-file').addEventListener('change', function(e) {

	document.querySelector("#display-photo").classList.remove("template");
	var file = this.files[0];
	var img = URL.createObjectURL(file);
	document.querySelector("#display-photo").src = img;
	document.querySelector("#display-photo").onload = function() {
		URL.revokeObjectURL(img);
	};

}, false);

/* ================ initialization =================== */

(function() {

})();
