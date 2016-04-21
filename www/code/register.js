var query = uri.query(true); // URI.js

function buildPage(data) {
	document.querySelector("#name").textContent = data.hits[0]._source.scientific_name;
}

document.querySelector("form").addEventListener("submit", function(e) {

	e.preventDefault();

	var file = this.elements["photo-file"].files[0];
	var data = new FormData();
	data.append("observation[picture]", file);
	data.append('observation[taxon_id]', query.id);
	data.append('observation[observed_at]', '2009-10-26T04:47:09Z');
	data.append('observation[latitude]', 0);
	data.append('observation[longitude]', 0); 

	var xhr = new XMLHttpRequest();
	xhr.open("POST", "https://api.biocaching.com/observations", true);
	xhr.setRequestHeader("X-User-Email", auth.email);
	xhr.setRequestHeader("X-User-Token", auth.token);
	xhr.setRequestHeader("X-User-Api-Key", "0b4d859e740d2978b98a13e2b9e130d8");

	xhr.onload = function() {
		if (xhr.status == 200)
			alert("Upload successful!")
		else
			alert("Failure: " + xhr.responseText);
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

	getData("https://api.biocaching.com/taxa/" + query.id, buildPage)

})();
