var id = 0, rootId = 0;

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

/* ================ Biocaching =================== */

// https://db.biocaching.com/
// https://api.biocaching.com/taxa
// https://api.biocaching.com/taxa?parent_id=1

// https://api.biocaching.com/taxa/<id>?fields=all --> name, parent id
//   https://api.biocaching.com/taxa/<parentid> --> parent name
// https://api.biocaching.com/taxa/?size=99&parent_id=<id>&fields=all --> children{name,id}

function loadDataBiocaching() {
	if (id == rootId)
		// root taxon doesn't exist, so insert it here
		buildInfoBiocaching({hits:[{_source:{names:{eng:["Life"]},scientific_name:"biota"}}],database:false});
	else
		// get taxon data from server
		sendRequest(requestMethod.get, taxaRoot + id + "?fields=all", buildInfoBiocaching)

	// get data on child taxa
	var path = "?size=999&fields=all";
	if (id != rootId) path += "&parent_id=" + id;
	sendRequest(requestMethod.get, taxaRoot + path, buildListBiocaching);
}

function buildInfoBiocaching(taxonData) {
	var info = {};
	info.scientificName = taxonData.hits[0]._source.scientific_name;
	if ("eng" in taxonData.hits[0]._source.names)
		info.name = taxonData.hits[0]._source.names.eng[0];
	else {
		info.name = taxonData.hits[0]._source.scientific_name;
		info.scientificName = undefined;
	}
	info.images = [];
	if (taxonData.hits[0]._source.primary_picture)
		info.images.push(api_root + taxonData.hits[0]._source.primary_picture.urls.original);
	if (taxonData.hits[0]._source.other_pictures)
		for (var i = 0; i < taxonData.hits[0]._source.other_pictures.length; i++)
			info.images.push(api_root + taxonData.hits[0]._source.other_pictures[i].urls.original);
	if (taxonData.database !== false) info.register = true;

	buildPageTaxonomy(info);

	if (id != rootId) {
		if (taxonData.hits[0]._source.parent_id)
			buildParentBiocaching({hits:[{_source: {scientific_name: "biota"}, _id: rootId}]})
		else
			sendRequest(requestMethod.get, taxaRoot + taxonData.hits[0]._source.parent_id + "?fields=all", buildParentBiocaching);
	}
}

function buildParentBiocaching(parentData) {
	if (parentData.hits.length > 0) {
		var name = parentData.hits[0]._source.scientific_name;
		name = name.charAt(0).toUpperCase() + name.slice(1);
		buildPageTaxonomy({ancestors: [{name: name, id: parentData.hits[0]._id}]});
	}
}

function buildListBiocaching(data) {
	var descendents = [], img;
	data.hits.forEach(function(hit){
		var descendent = {};
		descendent.scientificName = hit._source.scientific_name;
		if ("eng" in hit._source.names)
			descendent.name = hit._source.names.eng[0];
		else {
			descendent.name = hit._source.scientific_name;
			descendent.scientificName = undefined;
		}
		descendent.id = hit._id;
		if (hit._source.primary_picture != null) {// currently only for VERY few species, eg vulpes vulpes, canis lupus
			descendent.img = api_root + hit._source.primary_picture.urls.medium;
			if (!img) img = descendent.img;
		}
		descendents.push(descendent);
	});
	buildPageTaxonomy({img: img, descendents: descendents})
}


/* ================ Biocaching, popular taxonomy =================== */

function loadTaxaBiocachingFolkelig() {
	if (id == 0)
		loadRootinfoBiocachingFolkelig();
	else
		sendRequest(requestMethod.get, taxaRoot + "search?size=10&collection_id=" + id, readTaxaBiocachingFolkelig);
		/* just load enough initial species to find a photo to display */
}

function loadRootinfoBiocachingFolkelig() {
	sendRequest(requestMethod.get, taxaRoot + "search?size=0", readRootinfoBiocachingFolkelig);
}

function loadSpecieBiocachingFolkelig() {
	sendRequest(requestMethod.get, taxaRoot + query.sid + "?fields=all", readSpecieBiocachingFolkelig);
	sendRequest(requestMethod.get, taxaRoot + "search?size=0&collection_id=" + id, readSpecieTaxaBiocachingFolkelig);
}

function readRootinfoBiocachingFolkelig(data) {
	id = rootId = data.collection.id;
	loadTaxaBiocachingFolkelig();
}

function readTaxaBiocachingFolkelig(data) {
	var info = {};

	info.name = data.collection.names[0].name;

	// find the first child species that has a photo, and use that as this taxa's photo
	info.images = [];
	for (var i = 0; i < data.hits.length; i++) {
		if (data.hits[i]._source.primary_picture != null) {
			info.images.push(api_root + data.hits[i]._source.primary_picture.urls.original);
			break;
		}
	}
	
	// build list of parent hierarchy
	if ("parents" in data.collection) {
		info.ancestors = [];
		data.collection.parents.forEach(function(item){
			info.ancestors.push({
				name: item.names[0].name,
				id: item.id
			});
		});
	};

	// show either child taxa or species
	info.descendents = [];
	if (data.collection.children.length == 0) {
		// no child taxa, show species
		if (data.hits.length == data.total)
			// all child species were included in initial download
			readSpecieListBiocachingFolkelig(data);
		else 
			// there is more, download all child species
			sendRequest(requestMethod.get, taxaRoot + "search?size=" + data.total + "&collection_id=" + id, readSpecieListBiocachingFolkelig);
	} else {
		// show child taxa
		data.collection.children.forEach(function(item) {
			info.descendents.push({
				name: item.names[0].name,
				id: item.id
			});
		});
	};
	if (info.descendents.length == 0) 
		delete info["descendents"];

	buildPageTaxonomy(info);

	if (data.collection.children.length > 0) {
		data.collection.children.forEach(function(item) {
			sendRequest(requestMethod.get, taxaRoot + "search?size=10&collection_id=" + item.id, readIconBiocachingFolkelig);
		});
	};
}

function readSpecieListBiocachingFolkelig(data) {
	var info = {};
	info.descendents = [];
	data.hits.forEach(function(item) {
		var iteminfo = {};
		if ("nob" in item._source.names)
			iteminfo.name = item._source.names.nob[0]
		else if ("eng" in item._source.names)
			iteminfo.name = item._source.names.eng[0]
		else
			iteminfo.name = item._source.scientific_name;
		iteminfo.id = item._source.id;
		iteminfo.specie = true;
		if (item._source.primary_picture != null)
			iteminfo.img = api_root + item._source.primary_picture.urls.medium;
		iteminfo.scientific_name = item._source.scientific_name;
		info.descendents.push(iteminfo);
	});
	buildPageTaxonomy(info);
}

function readSpecieBiocachingFolkelig(data) {
	var info = {};
	if ("nob" in data.hits[0]._source.names)
		info.name = data.hits[0]._source.names.nob[0]
	else if ("eng" in data.hits[0]._source.names)
		info.name = data.hits[0]._source.names.eng[0]
	else
		info.name = data.hits[0]._source.scientific_name;
	info.images = [];
	if (data.hits[0]._source.primary_picture !== null)
		info.images.push(api_root + data.hits[0]._source.primary_picture.urls.original);
	if (data.hits[0]._source.other_pictures !== null)
		for (var i = 0; i < data.hits[0]._source.other_pictures.length; i++)
			info.images.push(api_root + data.hits[0]._source.other_pictures[i].urls.original);
	info.register = true;
	buildPageTaxonomy(info);
}

function readSpecieTaxaBiocachingFolkelig(data) {
	var ancestors = [];
	data.collection.parents.forEach(function(item){
		ancestors.push({
			id: item.id,
			name: item.names[0].name
		});
	});
	ancestors.push({
		id: data.collection.id,
		name: data.collection.names[0].name
	});
	buildPageTaxonomy({ ancestors: ancestors })
}

function readIconBiocachingFolkelig(data) {
	for (var i = 0; i < data.hits.length; i++) {
		if (data.hits[i]._source.primary_picture != null) {
			buildPageTaxonomy({descendents: [{
				id: data.collection.id,
				img: api_root + data.hits[i]._source.primary_picture.urls.medium
			}]});
			break;
		}
	}
}

/* ================ view routines =================== */

function buildPageTaxonomy(data) {
	
	if ("name" in data) {
		document.querySelector("title").textContent = sentenceCase(data.name) + " - Biocaching";
		document.querySelector("h1").textContent = sentenceCase(data.name);
	}

	if ("scientificName" in data && data.scientificName != undefined) {
		document.querySelector("h2").textContent = sentenceCase(data.scientificName);
	}

	if (data.images && data.images.length > 0 && !document.querySelector("img").src) {
		var heroLink = document.querySelector("#image-link");
		heroLink.href = data.images[0];
		heroLink.firstElementChild.src = data.images[0];
		menuPosition = document.querySelector("header.content img").clientHeight;
		setSticky();

		var picturesContainer = document.querySelector("#pictures");
		// only show pictures list if there is more than 1 pictures
		if (data.images.length > 1)
			picturesContainer.classList.remove("template");
		var imgLinkTemplate = picturesContainer.querySelector(".template")
		for (var i = 0; i < data.images.length; i++) {
			var imgLink = imgLinkTemplate.cloneNode(true);
			imgLink.firstElementChild.setAttribute("data-index", i)
			imgLink.href = imgLink.firstElementChild.src = data.images[i];
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

	if ("ancestors" in data) {
		document.querySelector(".ancestors").classList.remove("template");
		document.querySelector(".ancestors a").textContent = sentenceCase(data.ancestors[0].name);
		document.querySelector(".ancestors a").href = new URI().setSearch({id: data.ancestors[0].id});
	}

	if ("register" in data && data.register == true) {
		document.querySelector(".fab").classList.remove("template");
	}

	var templateItem = null;
	if ("descendents" in data) {
		templateItem = document.querySelector("#descendents li");
		data.descendents.forEach(function(descendent){
			var item = document.getElementById("tax-" + descendent.id);
			if (!item) {
				item = templateItem.cloneNode(true);
				item.id = "tax-" + descendent.id;
				item.classList.remove("template");
				templateItem.parentNode.appendChild(item);
			}
			if ("name" in descendent)
				item.querySelector("h1").textContent = sentenceCase(descendent.name);
			if ("scientific_name" in descendent)
				item.querySelector("h2").textContent = sentenceCase(descendent.scientific_name);
			if ("specie" in descendent)
				item.querySelector("a").href = new URI().setSearch({sid: descendent.id})
			else
				item.querySelector("a").href = new URI().setSearch({id: descendent.id});
			var icon = item.querySelector(".species-icon");
			if ("img" in descendent) {
				icon.querySelector("img").src = descendent.img;
			}
			else {
				icon.querySelector("div").textContent = descendent.name.match(/^[a-zA-ZÀ-ʨ]/g);
			};
		});
	}

}

/* ================ initialization =================== */

(function() {

	var datasource = "biocfolk";
	var query = uri.query(true); // URI.js

	if (query.ds !== undefined) datasource = query.ds;
	if (query.id !== undefined) id = query.id;

	if (query.choose !== undefined) document.querySelector(".fab i").textContent = "done";
	document.querySelector(".fab").href = URI(document.querySelector(".fab").href).search(URI().search()).setSearch({
		sid: query.sid || id, 
		id: query.oid, 
		choose: undefined, 
		ds: undefined, 
		oid: undefined
	});

	// allow bypassing authentication, since taxonomy is not private
	bypassAuthorization();

	document.querySelector("html").classList.add(datasource);

	switch(datasource) {
		case "biocfolk":
			document.querySelector(".switch a").href = URI().setSearch({ds: "biocaching", id: undefined, sid: undefined});
			if (query.sid !== undefined)
				loadSpecieBiocachingFolkelig()
			else
				loadTaxaBiocachingFolkelig();
			break;
		case "biocaching":
			document.querySelector(".switch a").textContent = "Switch to popular taxonomy";
			document.querySelector(".switch a").href = URI().setSearch({ds: undefined, id: undefined});
			loadDataBiocaching();
			break;
		case "eol":
			loadDataEol();
			break;
	}
})();
