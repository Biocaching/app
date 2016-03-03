function signIn(evt) {
	evt.preventDefault();
	var xhr = new XMLHttpRequest();
	xhr.overrideMimeType("application/json");
	xhr.open("POST", "http://api.biocaching.com:82/users/sign_in", true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			loginData = JSON.parse(xhr.responseText);
			getAuthentication(xhr);
		}
	}
	xhr.send(JSON.stringify({
		user : {
			email : document.getElementById("email").value, 
			password : document.getElementById("password").value
		}
	}));
}

function getAuthentication(xhr) {
	var response = JSON.parse(xhr.responseText);
	console.log(response);
	localStorage.setItem("email", response.email);
	localStorage.setItem("authentication_token", response.authentication_token);
	document.getElementById("sign-in").submit();
}

(function() {
	// https://en.wikipedia.org/wiki/Immediately-invoked_function_expression
	document.getElementById("email").value = localStorage.getItem("email");
	document.getElementById("sign-in").addEventListener("submit", signIn, false);

})();
