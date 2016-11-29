var id = 0, rootId = 0;

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
		getData("https://api.biocaching.com/taxa/" + id + "?fields=all", buildInfoBiocaching)

	// get data on child taxa
	var path = "?size=99&fields=all";
	if (id != rootId) path += "&parent_id=" + id;
	getData("https://api.biocaching.com/taxa/" + path, buildListBiocaching);
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
	if (taxonData.hits[0]._source.primary_picture != null)
		info.img = "https://api.biocaching.com" + taxonData.hits[0]._source.primary_picture.urls.medium;
	if (taxonData.database !== false) info.register = true;
	buildPageTaxonomy(info);

	if (id != rootId) {
		if (taxonData.hits[0]._source.parent_id == null)
			buildParentBiocaching({hits:[{_source: {scientific_name: "biota"}, _id: rootId}]})
		else
			getData("https://api.biocaching.com/taxa/" + taxonData.hits[0]._source.parent_id + "?fields=all", buildParentBiocaching);
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
			descendent.img = "https://api.biocaching.com" + hit._source.primary_picture.urls.medium;
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
		getData("https://api.biocaching.com/taxa/search?size=10&collection_id=" + id, readTaxaBiocachingFolkelig);
}

function loadRootinfoBiocachingFolkelig() {
	getData("https://api.biocaching.com/taxa/search?size=0", readRootinfoBiocachingFolkelig);
}

function loadSpecieBiocachingFolkelig() {
	getData("https://api.biocaching.com/taxa/" + query.sid + "?fields=all", readSpecieBiocachingFolkelig);
	getData("https://api.biocaching.com/taxa/search?size=0&collection_id=" + id, readSpecieTaxaBiocachingFolkelig);
}

function readRootinfoBiocachingFolkelig(data) {
	id = rootId = data.collection.id;
	loadTaxaBiocachingFolkelig();
}

function readTaxaBiocachingFolkelig(data) {
	var info = {};

	info.name = data.collection.names[0].name;

	// find the first child taxa that has a photo, and use that as this taxa's photo
	for (var i = 0; i < data.hits.length; i++) {
		if (data.hits[i]._source.primary_picture != null) {
			info.img = "https://api.biocaching.com" + data.hits[i]._source.primary_picture.urls.original;
			break;
		}
	}
	
	if ("parents" in data.collection) {
		info.ancestors = [];
		data.collection.parents.forEach(function(item){
			info.ancestors.push({
				name: item.names[0].name,
				id: item.id
			});
		});
	};

	info.descendents = [];
	if (data.collection.children.length == 0) {
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
				iteminfo.img = "https://api.biocaching.com" + item._source.primary_picture.urls.medium;
			iteminfo.scientific_name = item._source.scientific_name;
			info.descendents.push(iteminfo);
		});
	} else {
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
			getData("https://api.biocaching.com/taxa/search?size=10&collection_id=" + item.id, readIconBiocachingFolkelig);
		});
	};
}

function readSpecieBiocachingFolkelig(data) {
	var info = {};
	info.name = data.hits[0]._source.names.nob[0];
	if (data.hits[0]._source.primary_picture !== null)
		info.img = "https://api.biocaching.com" + data.hits[0]._source.primary_picture.urls.original;
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
				img: "https://api.biocaching.com" + data.hits[i]._source.primary_picture.urls.medium
			}]});
			break;
		}
	}
}

/* ================ Encyclopedia of Life =================== */

// http://eol.org/api
// http://eol.org/api/hierarchy_entries/1.0/51521763.json?callback=test

// http://eol.org/api/hierarchy_entries/1.0/<id>.json?callback=<func> --> name

function loadDataEol() {
	if (id == rootId) {
		buildListEol({
			scientificName: "Biota",
			taxonConceptID: rootId,
			ancestors: [],
			children: [
				{ taxonID: 51521761, taxonConceptID:    1, scientificName: "Animalia" },
				{ taxonID: 52744048, taxonConceptID: 5559, scientificName: "Fungi" },
				{ taxonID: 52800975, taxonConceptID:  281, scientificName: "Plantae" },
				{ taxonID: 53103686, taxonConceptID:  288, scientificName: "Bacteria" },
				{ taxonID: 53112249, taxonConceptID: 3352, scientificName: "Chromista" },
				{ taxonID: 53114002, taxonConceptID: 5006, scientificName: "Viruses" },
				{ taxonID: 53116999, taxonConceptID: 4651, scientificName: "Protozoa" },
				{ taxonID: 53131235, taxonConceptID: 7920, scientificName: "Archaea" }
			]
		});
		return;
	}

	var script = document.createElement("script");
	script.src = "http://eol.org/api/hierarchy_entries/1.0/" + id + ".json?callback=buildListEol";
	document.body.appendChild(script);
	document.body.removeChild(script);
}

function buildListEol(data) {
	var getDetailsFor = [];
	var script;

	// retreive details for current species
	if (id == rootId)  {
		buildDetailsEol([{"0": {
			taxonConcepts: [{nameAccordingTo: "Species 2000 & ITIS Catalogue of Life: April 2013", identifier: rootId}],
			dataObjects: [{eolMediaURL: "https://upload.wikimedia.org/wikipedia/commons/d/da/Ruwenpflanzen.jpg"}], 
			vernacularNames: []
		}}]);
	} else {
		// inject biota root into ancestors tree
		data.ancestors.unshift({taxonID: rootId, scientificName: "Biota"});
		script = document.createElement("script");
		script.src = "http://eol.org/api/pages/1.0.json?batch=true&id=" + data.taxonConceptID + "&images=1&videos=0&text=0&details=true&taxonomy=true&common_names=true&cache_ttl=300&callback=buildDetailsEol";
		document.body.appendChild(script);
	}

	var ancestors = [], descendents = [];
	data.ancestors.forEach(function(elm) {
		ancestors.push({name: elm.scientificName, id: elm.taxonID});
	});
	data.children.forEach(function(elm){
		descendents.push({name: elm.scientificName, id: elm.taxonID});
		script = document.createElement("script");
		script.src = "http://eol.org/api/pages/1.0.json?batch=true&id=" + elm.taxonConceptID + "&images=1&videos=0&text=0&details=true&taxonomy=true&common_names=true&cache_ttl=300&callback=buildDetailsEol";
		document.body.appendChild(script);
	});
	buildPageTaxonomy({name: data.scientificName, ancestors: ancestors, descendents: descendents});
}

function buildDetailsEol(data) {

	data.forEach(function(elm){
		// each array element is an object with only one property (named by taxonConceptID); get the contents of this propery
		var taxo = elm[Object.keys(elm)[0]];

		// find COL id
		var ColID = null;
		for (var c in taxo.taxonConcepts) {
			if (taxo.taxonConcepts[c].nameAccordingTo == "Species 2000 & ITIS Catalogue of Life: April 2013") {
				ColID = taxo.taxonConcepts[c].identifier;
				break;
			}
		};

		// find thumbnail
		var thumbnailUrl = null, mediaUrl = null;
		// check if there is data objects
		if (taxo.dataObjects.length > 0) {
			// find first data object that has a thumbnail
			for (var o in taxo.dataObjects) {
				if ("eolMediaURL" in taxo.dataObjects[o]) {
					// load thumbnail
					thumbnailURL = taxo.dataObjects[o].eolThumbnailURL;
					mediaUrl = taxo.dataObjects[o].eolMediaURL;
					break;
				}
			}
		}

		if (ColID == id) {
			// load main species details
			if (mediaUrl != null) {
				document.querySelector(".bg").src = mediaUrl;
				document.querySelector(".fg").src = mediaUrl;
			}
			var names_en = [];
			for (i = 0; i < taxo.vernacularNames.length; i++) {
				if (taxo.vernacularNames[i].language == "en") {
					names_en.push(taxo.vernacularNames[i].vernacularName);
				}
			}
			document.getElementById("name-en").textContent = names_en.join(", ");
		} else {
			// load descendent species details

			var elm = document.querySelector("li#tax-" + ColID);

			if (thumbnailURL != null) {
				var icon = elm.querySelector(".species-icon");
				icon.style.backgroundImage = "url(" + thumbnailURL + ")";
				icon.textContent = "";
			}

			var found = false;
			for (i = 0; i < taxo.vernacularNames.length && !found; i++) {
				if (taxo.vernacularNames[i].language == "en") {
					elm.querySelector(".name").textContent += " (" + taxo.vernacularNames[i].vernacularName + ")"
					found = true;
				}
			}
		}
	})
}

/* ================ view routines =================== */

function buildPageTaxonomy(data) {
	
	if ("name" in data) {
		document.querySelector("title").textContent = data.name + " - Biocaching";
		document.querySelector("h1").textContent = data.name;
	}

	if ("scientificName" in data) {
		document.querySelector("h2").textContent = data.scientificName;
	}

	if (data.img && !document.querySelector("img").src) {
		document.querySelector("img").src = data.img;
		menuPosition = document.querySelector("header.content img").clientHeight;
		setSticky();
	}

	if ("ancestors" in data) {
		document.querySelector(".ancestors").classList.remove("template");
		document.querySelector(".ancestors a").textContent = data.ancestors[0].name;
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
				item.querySelector("h1").textContent = descendent.name;
			if ("scientific_name" in descendent)
				item.querySelector("h2").textContent = descendent.scientific_name;
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
			document.querySelector(".switch a").href = URI().setSearch({ds: "biocaching", id: undefined});
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
