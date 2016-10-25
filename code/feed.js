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
		obsBox.querySelector(".coordinates").textContent = obs.latitudeDMS + " " + obs.longitudeDMS;
		obsBox.querySelector(".user").textContent = data.users[obs.observerId].displayname;
		obsBox.querySelector(".count").textContent = obs.likesCount;
		if (obs.imageUrl)
			obsBox.querySelector("img").src = obs.imageUrl;
		obsBox.querySelector("a").href = "observation.html?id=" + obs.id;
		templateItem.parentNode.appendChild(obsBox);
	});
}

(function() {

	if (document.querySelector(".personal-section")) {
		document.title = "My feed - Biocaching";
		var user = localStorage.getItem("biocaching:user");
		if (!user)
			window.location.replace(new URI("signin.html").search({source: uri.toString()}));
		getData("https://api.biocaching.com/observations?user_id=" + user + "&size=999", displayData)
	} else {
		// allow bypassing authorization, since global feed is not private
		bypassAuthorization();

		getData("https://api.biocaching.com/observations/?size=999", displayData)
	}

})();
