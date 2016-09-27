var uri, query;
if (typeof URI !== "undefined") {
	uri = new URI(); // URI.js
	query = uri.query(true);
}
var auth = {};

function getData(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.overrideMimeType("application/json");
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("X-User-Email", auth.email);
	xhr.setRequestHeader("X-User-Token", auth.token);
	xhr.setRequestHeader("X-User-Api-Key", "0b4d859e740d2978b98a13e2b9e130d8");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			switch (xhr.status) {
				case 200:
					// everything is ok
					callback(JSON.parse(xhr.responseText));
					break;
				case 401:
					// authentication error
					//alert("Authentication error!");
					window.location.replace(new URI("signin.html").search({source: uri.toString()}));
					break;
				default:
					// unexpected status
					alert("unexpected status " + xhr.status);
					break;
			}
		}
	}
	xhr.send();
}

function buildPage() {

		document.querySelector("body").insertAdjacentHTML("afterbegin", "\
			<header class='pageheader'>\
				<div class='main'>\
					<a class='icon' href='javascript:alert(\"Not implemented yet\");'><i class='material-icons' title='Personal'>&#xE7FD;</i></a>\
					<a class='icon' href='javascript:alert(\"Not implemented yet\");'><i class='material-icons' title='Public'  >&#xE7FB;</i></a>\
					<a class='icon' href='javascript:alert(\"Not implemented yet\");'><i class='material-icons' title='Camera'  >&#xE412;</i></a>\
					<a class='icon' href='taxonomy.html'                             ><i class='material-icons' title='Taxonomy'>&#xE8B6;</i></a>\
					<a class='icon' href='javascript:alert(\"Not implemented yet\");'><i class='material-icons' title='Settings'>&#xE8B8;</i></a>\
				</div>\
			</header>");
}

(function() {

	// back link
	if (document.getElementById("back-link")) document.getElementById("back-link").addEventListener("click", function(e){
		e.preventDefault();
		history.back();
	}, false);

	// authentication (biocaching only, really)
	auth.email = localStorage.getItem("email");
	auth.token = localStorage.getItem("authentication_token");

	buildPage();
})();
