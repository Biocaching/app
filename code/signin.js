function signIn(evt) {
	evt.preventDefault();
	var xhr = new XMLHttpRequest();
	xhr.overrideMimeType("application/json");
	xhr.open("POST", "https://api.biocaching.com/users/sign_in", true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("X-User-Api-Key", "0b4d859e740d2978b98a13e2b9e130d8");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status >= 200 && xhr.status < 300)
				getAuthentication(JSON.parse(xhr.responseText));
			else
				alert("Authentication error. (Status " + xhr.status + ")");
		}
	}
	xhr.send(JSON.stringify({
		user : {
			email : document.getElementById("email").value, 
			password : document.getElementById("password").value
		}
	}));
}

function getAuthentication(response) {
	localStorage.setItem("biocaching:email", response.email);
	localStorage.setItem("biocaching:token", response.authentication_token);
	window.location.replace(document.getElementById("sign-in").action);
}

(function() {
	var query = new URI().query(true); // URI.js

	document.getElementById("email").value = localStorage.getItem("email");
	document.getElementById("sign-in").action = query.source;
	document.getElementById("sign-in").addEventListener("submit", signIn, false);

})();
