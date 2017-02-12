// Show terms of service after signing in, if the user has not already accepted. 

function decline(evt) {
	// User declines terms, return to sign in screen.
	evt.preventDefault();
	window.location.replace(new URI("signin.html").search({source: document.querySelector("#accept-form").action}));
	// not using form submit, because that would cause the form to be stored in browse history
}

function accept(evt) {
	// User accepted terms, write sign in data and continue session
	evt.preventDefault();
	localStorage.setItem("biocaching:token", sessionStorage.getItem("biocaching:token"));
	localStorage.setItem("biocaching:user" , sessionStorage.getItem("biocaching:user" ));
	// set auth, because that couldn't be set on page load
	auth.email = localStorage.getItem("biocaching:email");
	auth.token = localStorage.getItem("biocaching:token");
	sendRequest(
		requestMethod.post,
		"terms/accept", 
		function(result) {
			window.location.replace(document.querySelector("#accept-form").action);
		}
	);
}

(function() {
	var query = new URI().query(true); // URI.js
	document.querySelector("#accept-form").action = query.source;
	document.querySelector("#decline-button").addEventListener("click", decline, false);
	document.querySelector("#accept-button" ).addEventListener("click", accept,  false);

	sendRequest(
		requestMethod.get, 
		"admin/terms/", 
		function(result) {
			var output = "";
			for (var i in result.terms) {
				output += "<p>" + result.terms[i] + "</p>";
			}
			document.querySelector("#terms-text").innerHTML = output;
		}
	);
})();
