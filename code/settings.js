var headers;

function toggleSection() {
	for (i = 0; i < headers.length; i++) {
		if (this !== headers[i]) {
			headers[i].parentNode.classList.remove("active");
		}
	}
	this.parentNode.classList.toggle("active");
}

(function() {
	// add event handler to expand sections
	headers = document.querySelectorAll("header");
	for (i = 0; i < headers.length; i++) {
		headers[i].addEventListener("click", toggleSection);
	}

	// display version number from external file
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "version.txt", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			console.log(xhr.responseText);
			document.querySelector(".about div").innerText += xhr.responseText;
		}
	}
	xhr.send();
})();
