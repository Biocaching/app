function signIn(evt) {
	evt.preventDefault();
	var xhr = new XMLHttpRequest();
	xhr.overrideMimeType("application/json");
	xhr.open("POST", "http://api.biocaching.com/users/sign_in", true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status >= 200 && xhr.status < 300)
				getAuthentication(JSON.parse(xhr.responseText));
			else
				alert("Authentication error");
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
	//console.log(response);
	localStorage.setItem("email", response.email);
	localStorage.setItem("authentication_token", response.authentication_token);
	window.location.replace(document.getElementById("sign-in").action);
}

(function() {
	var query = new URI().query(true); // URI.js

	document.getElementById("email").value = localStorage.getItem("email");
	document.getElementById("sign-in").action = query.source;
	document.getElementById("sign-in").addEventListener("submit", signIn, false);

})();
