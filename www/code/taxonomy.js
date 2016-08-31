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
		buildInfoBiocaching({hits:[{_source:{scientific_name:"biota"}}]});
	else
		getData("https://api.biocaching.com/taxa/" + id + "?fields=all", buildInfoBiocaching)

	var path = "?size=99&fields=all";
	if (id != rootId) path += "&parent_id=" + id;
	getData("https://api.biocaching.com/taxa/" + path, buildListBiocaching);
}

function buildInfoBiocaching(taxonData) {
	var name = taxonData.hits[0]._source.scientific_name;
	name = name.charAt(0).toUpperCase() + name.slice(1);
	buildPage({name: name, register: true})

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
		buildPage({ancestors: [{name: name, id: parentData.hits[0]._id}]});
	}
}

function buildListBiocaching(data) {
	var descendents = [];
	data.hits.forEach(function(hit){
		var descendent = {};
		descendent.name = hit._source.scientific_name;
		descendent.name = descendent.name.charAt(0).toUpperCase() + descendent.name.slice(1);
		descendent.id = hit._id;
		if (hit._source.primary_picture != null) // currently only for VERY few species, eg vulpes vulpes, canis lupus
			descendent.img = "https://api.biocaching.com" + hit._source.primary_picture.urls.medium;
		descendents.push(descendent);
	});
	buildPage({descendents: descendents})
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

	if (data.hits.length > 0) {
		var i = 0;
		while(i < data.hits.length && data.hits[i]._source.primary_pictures != null) {
			i++
		}
		if (i < data.hits.length)
			info.img = "https://api.biocaching.com" + data.hits[i]._source.primary_picture.urls.original;
	};
	
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

	buildPage(info);

	if (data.collection.children.length > 0) {
		data.collection.children.forEach(function(item) {
			getData("https://api.biocaching.com/taxa/search?size=1&collection_id=" + item.id, readIconBiocachingFolkelig);
		});
	};
}

function readSpecieBiocachingFolkelig(data) {
	buildPage({
		name: data.hits[0]._source.names.nob[0],
		img: "https://api.biocaching.com" + data.hits[0]._source.primary_picture.urls.original,
		register: true
	});
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
	buildPage({ ancestors: ancestors })
}

function readIconBiocachingFolkelig(data) {
	if (data.hits.length > 0 && data.hits[0]._source.primary_picture != null)
		buildPage({descendents: [{
			id: data.collection.id,
			img: "https://api.biocaching.com" + data.hits[0]._source.primary_picture.urls.medium
		}]});
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
	buildPage({name: data.scientificName, ancestors: ancestors, descendents: descendents});
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

			if (thumbnailURL != null) {
				var elm = document.querySelector("li#tax-" + ColID);
				elm.querySelector("img").src = thumbnailURL;
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

function buildPage(data) {
	
	if ("name" in data) {
		if (id != rootId) {
			document.querySelector("title").textContent = data.name + " - Biocaching";
			document.querySelector("h1").textContent = data.name;
		}
		document.querySelector("#name").textContent = data.name;
	}

	if ("register" in data && data.register == true) {
		document.querySelector(".fab").classList.remove("template");
		if (query.sid != undefined)
			document.querySelector(".fab").href += "?id=" + query.sid
		else
			document.querySelector(".fab").href += "?id=" + id;
	}

	if ("img" in data) {
		document.querySelector(".bg").src = data.img;
		document.querySelector(".fg").src = data.img;
	}

	var templateItem = null;
	if ("ancestors" in data) {
		document.querySelector("#ancestors").classList.remove("template");
		templateItem = document.querySelector("#ancestors li");
		data.ancestors.forEach(function(parent){
			var item = templateItem.cloneNode(true);
			item.classList.remove("template");
			templateItem.parentNode.appendChild(item);
			item.querySelector(".name").textContent = parent.name;
			item.querySelector("a").href = new URI().removeQuery("sid").setQuery({id: parent.id});
		});
	}

	if ("descendents" in data) {
		document.querySelector("#descendents").classList.remove("template");
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
				item.querySelector(".name").textContent = descendent.name;
			if ("specie" in descendent)
				item.querySelector("a").href = new URI().setSearch({sid: descendent.id})
			else
				item.querySelector("a").href = new URI().setSearch({id: descendent.id});
			var icon = item.querySelector(".species-icon");
			if ("img" in descendent) {
				icon.style.backgroundImage = "url(" + descendent.img + ")";
				icon.textContent = "";
			}
			else {
				icon.textContent = descendent.name.match(/^[a-zA-ZÀ-ʨ]/g);
				//icon.style.backgroundColor = "hsl(" + descendent.name.codePointAt(descendent.name.length-5)*13.8 + ",100%,50%)";
			};
		});
	}

}

/* ================ initialization =================== */

(function() {
	// search link
	document.getElementById("search-link").addEventListener("click", function(e){
		var ds = new URI().query(true).ds; // URI.js
		this.href = URI(this.href).addSearch("ds",ds).toString();
	}, false);

	var datasource = "biocaching";
	var query = uri.query(true); // URI.js

	if (query.ds !== undefined) datasource = query.ds;
	if (query.id !== undefined) id = query.id;

	document.querySelector("html").className += " " + datasource;

	switch(datasource) {
		case "biocfolk":
			if (query.sid !== undefined)
				loadSpecieBiocachingFolkelig()
			else
				loadTaxaBiocachingFolkelig();
			break;
		case "biocaching":
			loadDataBiocaching();
			break;
		case "eol":
			loadDataEol();
			break;
	}
})();
