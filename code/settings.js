/// <reference path="main.js" />

var headers;


/**
 * Event handler for closing and opening option sections.
 */
function toggleSection() {
	// close all other sections
	for (i = 0; i < headers.length; i++) {
		if (this !== headers[i]) {
			headers[i].parentNode.classList.remove("active");
		}
	}
	// toggle current section
	this.parentNode.classList.toggle("active");
}

/**
 * Sign the current user out.
 */
function signOut() {
	localStorage.removeItem("biocaching:token");
	localStorage.removeItem("biocaching:user");
	window.location.href = "feed.html";
}

(function() {
	// add event handler to expand sections
	headers = document.querySelectorAll("header");
	for (i = 0; i < headers.length; i++) {
		headers[i].addEventListener("click", toggleSection);
	}

	// display version number from external file (async)
	// not using sendRequest, since this doesn't go to the API server
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "version.txt", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			console.log(xhr.responseText);
			document.querySelector(".about div").innerText += xhr.responseText;
		}
	}
	xhr.send();

	// sign out handler
	document.getElementById("sign-out").addEventListener("click", signOut);
})();
