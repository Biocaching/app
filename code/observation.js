var id, obs;

function openGallery(elm) {
	var galleryElements = elm.parentElement.parentElement.children,
		galleryItems = [];

	for (var i = 0; i < galleryElements.length; i++) {
		galleryItems[i] = {};
		galleryItems[i].src = galleryElements[i].firstElementChild.src;
		galleryItems[i].w = galleryElements[i].firstElementChild.naturalWidth;
		galleryItems[i].h = galleryElements[i].firstElementChild.naturalHeight;
		// if image was not loaded yet (need to make a better solution)
		if (galleryItems[i].w == 0) galleryItems[i].w = 1000;
		if (galleryItems[i].h == 0) galleryItems[i].h = 1000;
	}

	var options = {
		closeOnVerticalDrag: false,
		closeEl: false,
		fullscreenEl: false,
		shareEl: false,
		index: parseInt(elm.getAttribute("data-index"), 10)
	};

	var gallery = new PhotoSwipe( 
		document.querySelector('.pswp'), 
		PhotoSwipeUI_Default, 
		galleryItems, 
		options
	);

	gallery.init();
}

function displayData(data) {
	obs = cleanupObservation(data.observation);
	document.querySelector("h1").textContent = obs.commonName;
	document.querySelector("h2").textContent = obs.scientificName;
	document.querySelector(".timestamp").textContent = obs.time.toLocaleString();
	document.querySelector(".coordinates").textContent = (new Coords(obs.latitude, obs.longitude)).toString();
	document.querySelector(".user a").textContent = (data.users[obs.observerId].displayname || data.users[obs.observerId].name);
	document.querySelector(".likes-count").textContent = obs.likesCount;

	if (obs.pictures.length > 0) {

		var heroLink = document.querySelector("#image-link");
		heroLink.href = obs.pictures[0].urlBig;
		heroLink.firstElementChild.src = obs.pictures[0].urlBig;
		menuPosition = document.querySelector("header.content img").clientHeight;
		setSticky();

		var picturesContainer = document.querySelector("#pictures");
		// only show pictures list if there is more than 1 pictures
		if (obs.pictures.length > 1)
			picturesContainer.classList.remove("template");
		var imgLinkTemplate = picturesContainer.querySelector(".template")
		for (var i = 0; i < obs.pictures.length; i++) {
			var imgLink = imgLinkTemplate.cloneNode(true);
			imgLink.firstElementChild.setAttribute("data-index", i)
			imgLink.href = imgLink.firstElementChild.src = obs.pictures[i].urlBig;
			imgLink.classList.remove("template");
			imgLinkTemplate.parentNode.appendChild(imgLink);

			imgLink.addEventListener("click", function(e) {
				e.preventDefault();
				openGallery(e.target);
			});
		}
		picturesContainer.removeChild(imgLinkTemplate);

		heroLink.addEventListener("click", function(e) {
			e.preventDefault();
			openGallery(picturesContainer.firstElementChild.firstElementChild);
		});

	}

	var map = L.map("map", { zoomControl: false }).setView([obs.latitude, obs.longitude], 13);
	L.tileLayer(
		"http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}", {
			attribution: "Map data &copy; <a href='http://openstreetmap.org/' target='_blank'>OSM</a>, tiles &copy; <a href='http://korona.geog.uni-heidelberg.de/' target='_blank'>GIScience Heidelberg</a>",
			maxZoom: 17
		}
	).addTo(map);
	L.marker([obs.latitude, obs.longitude]).addTo(map);

	// disable all interactivity
	map._handlers.forEach(function(handler) {
		handler.disable();
	});

	if (authorized && localStorage.getItem("biocaching:user") == obs.observerId) {
		document.querySelector("#edit-link").classList.remove("template");
		document.querySelector("#edit-link").href = URI(document.querySelector("#edit-link").href).setSearch({id: id});
	}
}

(function() {

	var query = uri.query(true); // URI.js
	id = query.id;

	bypassAuthorization();
	sendRequest(requestMethod.get, "observations/" + id, displayData)
})();
