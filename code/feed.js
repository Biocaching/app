function displayData(data) {
	templateItem = document.querySelector("li.template");
	if (data.hits.length == 0)
		document.querySelector(".placeholder").classList.remove("template");
	data.hits.forEach(function(obs){
		obs = cleanupObservation(obs);
		obsBox = templateItem.cloneNode(true);
		obsBox.classList.remove("template");
		obsBox.querySelector("h1").textContent = obs.commonName;
		obsBox.querySelector("h2").textContent = obs.scientificName;
		obsBox.querySelector(".timestamp").textContent = obs.time.toLocaleString();
		obsBox.querySelector(".coordinates").textContent = (new Coords(Number(obs.latitude), Number(obs.longitude))).toString();
		obsBox.querySelector(".user").textContent = (data.users[obs.observerId].displayname || data.users[obs.observerId].name);
		obsBox.querySelector(".likes-count").textContent = obs.likesCount;
		if (obs.imageUrl)
			obsBox.querySelector("img").src = obs.imageUrl;
		obsBox.querySelector("a").href = "observation.html?id=" + obs.id;
		templateItem.parentNode.appendChild(obsBox);
	});
}

(function() {

	if (document.querySelector("html.personal")) {
		document.title = "My feed - Biocaching";
		var user = localStorage.getItem("biocaching:user");
		if (!user)
			window.location.replace(new URI("signin.html").search({source: uri.toString()}));
		sendRequest(requestMethod.get, "observations?user_id=" + user + "&size=999", displayData)
	} else {
		// allow bypassing authorization, since global feed is not private
		bypassAuthorization();

		sendRequest(requestMethod.get, "observations/?size=999", displayData)
	}

	if (auth.token) document.querySelector(".fab").classList.remove("template");

})();
