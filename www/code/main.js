/* ================ Encyclopedia of Life =================== */

// http://eol.org/api
// http://eol.org/api/hierarchy_entries/1.0/51521763.json?callback=test

function loadData(callback) {
	if (id == rootId) {
		callback(null);
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

var id = rootId = 0;

(function() {
	// https://en.wikipedia.org/wiki/Immediately-invoked_function_expression

	var s = window.location.search;
	if (s.length > 0) { id = s.substring(1); }

	// if at top level, change back arrow to home icon and remove form
	if (id == rootId) {
		document.querySelector("#back-link").className += " home-link"
	}

	loadData(buildList);
})();
