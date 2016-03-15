var id = rootId = 0;
var auth = {};

/* ================ Biocaching =================== */

// http://db.biocaching.com/
// http://api.biocaching.com/taxa
// http://api.biocaching.com/taxa?parent_id=1

// http://api.biocaching.com/taxa/<id> --> name, parent id
//   http://api.biocaching.com/taxa/<parentid> --> parent name
// http://api.biocaching.com/taxa/?size=99&parent_id=<id> --> children{name,id}

var taxaUrlBiocaching = "http://api.biocaching.com/taxa/";

function getDataBiocaching() {
	if (id == rootId) {
		buildInfoBiocaching({hits:[{_source:{scientific_name:"biota"}}]});
	} else {
		var xhrInfo = new XMLHttpRequest();
		xhrInfo.open("GET", taxaUrlBiocaching + id, true);
		xhrInfo.overrideMimeType("application/json");
		xhrInfo.setRequestHeader("Content-type", "application/json");
		xhrInfo.setRequestHeader("Accept", "application/json");
		xhrInfo.setRequestHeader("X-User-Email", auth.email);
		xhrInfo.setRequestHeader("X-User-Token", auth.token);
		xhrInfo.onreadystatechange = function() {
			if (xhrInfo.readyState == 4) {
				buildInfoBiocaching(JSON.parse(xhrInfo.responseText));
			}
		}
		xhrInfo.send();
	}

	var xhrList = new XMLHttpRequest();
	var url = taxaUrlBiocaching + "?size=99";
	if (id != rootId) url += "&parent_id=" + id;
	xhrList.open("GET", url, true);
	xhrList.overrideMimeType("application/json");
	xhrList.setRequestHeader("Content-type", "application/json");
	xhrList.setRequestHeader("Accept", "application/json");
	xhrList.setRequestHeader("X-User-Email", auth.email);
	xhrList.setRequestHeader("X-User-Token", auth.token);
	xhrList.onreadystatechange = function() {
		if (xhrList.readyState == 4) {
			buildListBiocaching(JSON.parse(xhrList.responseText));
		}
	}
	xhrList.send();
}

function buildInfoBiocaching(taxonData) {
	console.log(taxonData);
	var name = taxonData.hits[0]._source.scientific_name;
	name = name.charAt(0).toUpperCase() + name.slice(1);
	if (id != rootId) {
		document.querySelector("title").textContent = name + " - Biocaching";
		document.querySelector("h1").textContent = name;
	}
	document.querySelector("#name").textContent = name;

	var xhrParent = new XMLHttpRequest();
	xhrParent.open("GET", taxaUrlBiocaching + taxonData.hits[0]._source.parent_id, true);
	xhrParent.overrideMimeType("application/json");
	xhrParent.setRequestHeader("Content-type", "application/json");
	xhrParent.setRequestHeader("Accept", "application/json");
	xhrParent.setRequestHeader("X-User-Email", auth.email);
	xhrParent.setRequestHeader("X-User-Token", auth.token);
	xhrParent.onreadystatechange = function() {
		if (xhrParent.readyState == 4) {
			buildParentBiocaching(JSON.parse(xhrParent.responseText));
		}
	}
	xhrParent.send();
}

function buildParentBiocaching(data) {
	console.log(data);
	if (data.hits.length == 0)
		return;

	var name = data.hits[0]._source.scientific_name;
	name = name.charAt(0).toUpperCase() + name.slice(1);
	document.querySelector("#parent").textContent += name;
	document.querySelector("#parent").href = "?" + data.hits[0]._id;
}

function buildListBiocaching(data) {
	//console.log(data);
	var childItemTemplate = document.querySelector("#subitems li");
	data.hits.forEach(function(taxon){
		var item = childItemTemplate.cloneNode(true);
		var name = taxon._source.scientific_name;
		name = name.charAt(0).toUpperCase() + name.slice(1);
		item.querySelector("h2").textContent = name;
		item.querySelector("a").href = "?" + taxon._id;
		childItemTemplate.parentNode.appendChild(item);
	});
	if (data.hits.length == 0) {
		var children = document.querySelector("#subitems");
		children.parentNode.removeChild(children);
	} else {
		childItemTemplate.parentNode.removeChild(childItemTemplate);
	}
}


/* ================ Encyclopedia of Life =================== */

// http://eol.org/api
// http://eol.org/api/hierarchy_entries/1.0/51521763.json?callback=test

function loadDataEol() {
	if (id == rootId) {
		buildList(null);
		return;
	}

	var script = document.createElement("script");
	script.src = "http://eol.org/api/hierarchy_entries/1.0/" + id + ".json?callback=buildList";
	document.body.appendChild(script);
	document.body.removeChild(script);
}

function buildList(data) {

	if (id == rootId) data = 
		{
			"scientificName": "Biota",
			"taxonConceptID": 0,
			"ancestors": [],
			"children": [
				{ "taxonID": 51521761, "taxonConceptID":    1, "scientificName": "Animalia" },
				{ "taxonID": 52744048, "taxonConceptID": 5559, "scientificName": "Fungi" },
				{ "taxonID": 52800975, "taxonConceptID":  281, "scientificName": "Plantae" },
				{ "taxonID": 53103686, "taxonConceptID":  288, "scientificName": "Bacteria" },
				{ "taxonID": 53112249, "taxonConceptID": 3352, "scientificName": "Chromista" },
				{ "taxonID": 53114002, "taxonConceptID": 5006, "scientificName": "Viruses" },
				{ "taxonID": 53116999, "taxonConceptID": 4651, "scientificName": "Protozoa" },
				{ "taxonID": 53131235, "taxonConceptID": 7920, "scientificName": "Archaea" }
			]
		};
	else data.ancestors.unshift({"taxonID":0,"scientificName":"Biota"});

	var getDetailsFor = [];

	if (id != rootId) {
		document.querySelector("title").textContent = data.scientificName + " - Biocaching";
		document.querySelector("h1").textContent = data.scientificName;
	}
	document.querySelector("#name").textContent = data.scientificName;
	document.querySelector("body").id = "t" + data.taxonConceptID;
	getDetailsFor.push(data.taxonConceptID);

	var parentItemTemplate = document.querySelector("#parents div");
	var parentItem = null;
	data.ancestors.forEach(function(elm){
		var item = parentItemTemplate.cloneNode(true);
		item.querySelector("a").textContent = elm.scientificName;
		item.querySelector("a").href = "?" + elm.taxonID;
		if (parentItem == null) {
			parentItemTemplate.parentNode.appendChild(item);
		} else {
			parentItem.appendChild(item);
		}
		parentItem = item;
	});
	if (data.ancestors.length == 0) {
		var parents = document.querySelector("#parents");
		parents.parentNode.removeChild(parents);
	} else {
		parentItemTemplate.parentNode.removeChild(parentItemTemplate);
	}

	var childItemTemplate = document.querySelector("#subitems li");
	data.children.forEach(function(elm){
		var item = childItemTemplate.cloneNode(true);
		item.id = "t" + elm.taxonConceptID;
		item.querySelector("h2").textContent = elm.scientificName;
		item.querySelector("a").href = "?" + elm.taxonID;
		childItemTemplate.parentNode.appendChild(item);
		getDetailsFor.push(elm.taxonConceptID);
	});
	if (data.children.length == 0) {
		var children = document.querySelector("#subitems");
		children.parentNode.removeChild(children);
	} else {
		childItemTemplate.parentNode.removeChild(childItemTemplate);
	}

	var script = document.createElement("script");
	script.src = "http://eol.org/api/pages/1.0.json?batch=true&id=" + getDetailsFor.join() + "&images=1&videos=0&text=0&details=true&taxonomy=false&common_names=true&cache_ttl=300&callback=buildDetails";
	document.body.appendChild(script);
	document.body.removeChild(script);
}

function buildDetails(data) {
	console.log(data);

	if (id == rootId) {
		data.push({"0": {"dataObjects": [{"eolMediaURL":"https://upload.wikimedia.org/wikipedia/commons/d/da/Ruwenpflanzen.jpg"}]}});
	}

	data.forEach(function(taxo){
		var taxonConceptID = Object.keys(taxo)[0];
		console.log(taxonConceptID);
		if (taxo[taxonConceptID].dataObjects.length > 0) {
			var elm = document.querySelector("li#t" + taxonConceptID);
			if (elm != null) {
				elm.querySelector("img").src = taxo[taxonConceptID].dataObjects[0].eolThumbnailURL;
				var found = false;
				for (i = 0; i < taxo[taxonConceptID].vernacularNames.length && !found; i++) {
					console.log(i, taxo[taxonConceptID].vernacularNames[i].language);
					if (taxo[taxonConceptID].vernacularNames[i].language == "en") {
						elm.querySelector("h2").textContent += " (" + taxo[taxonConceptID].vernacularNames[i].vernacularName + ")"
						found = true;
					}
				}
			} else {
				elm = document.querySelector("body#t" + taxonConceptID);
				if (elm != null) {
					document.querySelector(".bg").src = taxo[taxonConceptID].dataObjects[0].eolMediaURL;
					document.querySelector(".fg").src = taxo[taxonConceptID].dataObjects[0].eolMediaURL;
				}
				var names_en = [];
				for (i = 0; i < taxo[taxonConceptID].vernacularNames.length; i++) {
					if (taxo[taxonConceptID].vernacularNames[i].language == "en") {
						names_en.push(taxo[taxonConceptID].vernacularNames[i].vernacularName);
					}
				}
				document.getElementById("name-en").textContent = names_en.join(", ");
			}
		}
	})
}

/* ================ initialization =================== */

(function() {

	var s = window.location.search;
	if (s.length > 0) { id = s.substring(1); }

	auth.email = localStorage.getItem("email");
	auth.token = localStorage.getItem("authentication_token");
	document.querySelector("html").className += " biocaching";

	//loadData();
	getDataBiocaching();
})();
