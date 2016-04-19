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

(function() {
	// https://en.wikipedia.org/wiki/Immediately-invoked_function_expression

	// back link
	document.getElementById("back-link").addEventListener("click", function(e){
		e.preventDefault();
		history.back();
	}, false);

	// authentication (biocaching only, really)
	auth.email = localStorage.getItem("email");
	auth.token = localStorage.getItem("authentication_token");

	// load relevant data script
	/*
	var datasourcescript = document.createElement("script");
	datasourcescript.src = "code/" + query.ds + ".js";
	document.getElementsByTagName("head")[0].appendChild(datasourcescript);
	*/
})();
