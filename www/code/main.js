function WikimediaThumb(image, size) {
	var size = typeof size !== 'undefined' ?  size : 200;
	var imgMd5 = md5(image);
	return "https://upload.wikimedia.org/wikipedia/commons/thumb/" + imgMd5.substr(0,1) + "/" + imgMd5.substr(0,2) + "/" + image + "/" + size + "px-" + image + ((image.substr(-4) == ".svg") ? ".png" : "");
	// BUG: images smaller than 200px will return an error!
}

/* ================ loading using SPARQL =================== */

// http://stackoverflow.com/questions/32166730/how-to-get-a-list-of-all-films-on-wikidata/32179450
// https://wdq.wmflabs.org/api?q=claim[171:2382443]&props=*
// http://www.wikidata.org/wiki/Special:EntityData/Q10872.json
// http://tools.wmflabs.org/autolist/autolist1.html?q=claim[171:2382443]
// https://www.mediawiki.org/wiki/Wikibase/API#wbgetentities -- https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q204219|Q499078|Q504947|Q548074|Q1186957|Q4033604|Q19868361|Q21282292&props=info|aliases|labels|descriptions|claims|sitelinks&languages=en
// https://query.wikidata.org/#PREFIX%20wd%3A%20%3Chttp%3A%2F%2Fwww.wikidata.org%2Fentity%2F%3E%0APREFIX%20wdt%3A%20%3Chttp%3A%2F%2Fwww.wikidata.org%2Fprop%2Fdirect%2F%3E%0APREFIX%20wikibase%3A%20%3Chttp%3A%2F%2Fwikiba.se%2Fontology%23%3E%0A%0ASELECT%20%3Ftaxon%20%3FtaxonLabel%20%3Fpicture%0AWHERE%0A{%0A%20%20%3Ftaxon%20wdt%3AP171%20wd%3AQ10872%20.%0A%20%20OPTIONAL%20{%0A%20%20%20%20%3Ftaxon%20wdt%3AP18%20%3Fpicture%20.%20%0A%20%20}%0A%20%20SERVICE%20wikibase%3Alabel%20{%0A%20%20%20%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22%20.%0A%20%20%20}%0A}
// https://www.mediawiki.org/wiki/Wikidata_query_service/User_Manual

function loadDataHierarchy(callback) {
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open("GET", "https://query.wikidata.org/sparql?query=" + encodeURIComponent(
		"PREFIX wd: <http://www.wikidata.org/entity/> " +
		"PREFIX wdt: <http://www.wikidata.org/prop/direct/> " +
		"PREFIX wikibase: <http://wikiba.se/ontology#> " +

		"SELECT ?taxon ?taxonLabel ?picture " +
		"WHERE " +
		"{ " +
		"  ?taxon wdt:P171 wd:Q" + id + " . " +
		"  OPTIONAL { " +
		"    ?taxon wdt:P18 ?picture . " +
		"  } " +
		"  SERVICE wikibase:label { " +
		"    bd:serviceParam wikibase:language \"en\" . " +
		"  } " +
		"} "
		) + "&format=json", true);
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == "200") {
			// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
			callback(JSON.parse(xobj.responseText));
		}
	};
	xobj.send(null);
}

function buildHierarchy(data) {
	// create list of subitems
	var listSection = document.querySelector("#subitems");
	var list = listSection.querySelector("ul");
	var itemTemplate = list.querySelector("li");

	if (data.results.bindings.length > 0) {
		data.results.bindings.forEach(function(elm){
			var elmid = /\d+/.exec(elm.taxon.value);
			// some elements may be listed multiple times; mostly because of multiple images
			// check if element has already been added
			if (!document.getElementById(elmid)) {
				var item = itemTemplate.cloneNode(true);
				item.querySelector("h2").textContent = elm.taxonLabel.value;
				if (elm.hasOwnProperty("picture")) { 
					// problem: Special:FilePath only returns full-size images
					var imgFile = decodeURIComponent(elm.picture.value.substr(elm.picture.value.lastIndexOf("/")+1)).replace(/ /g, "_");
					item.querySelector("img").src = WikimediaThumb(imgFile);
				}
				item.querySelector("a").href = "?" + elmid;
				item.id = elmid;
				list.appendChild(item);
			}
		});
		list.removeChild(itemTemplate);
	} else {
		listSection.parentNode.removeChild(listSection);
	}
}

function loadDataItem(callback) {
	var script = document.createElement("script");
	script.src = "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&callback=buildItem&languages=en&ids=q" + id;
	document.body.appendChild(script);
	document.body.removeChild(script);
}

function buildItem(data) {
	console.log(data);

	var entityData = data.entities["Q"+id];

	if (id != rootId) {
		document.querySelector("title").textContent = entityData.labels.en.value + " - Biocaching";
		document.querySelector("h1").textContent = entityData.labels.en.value;
	}

	document.querySelector("#name").textContent = entityData.labels.en.value;

	if (entityData.aliases.hasOwnProperty("en")) {
		var aliases = [];
		entityData.aliases.en.forEach(function(elm) {
			if (
				(elm.value.toLowerCase() != entityData.labels.en.value.toLowerCase())
				&& (elm.value != entityData.labels.en.value + "s")
				&& (elm.value != entityData.labels.en.value + "es")
			) aliases.push(elm.value);
		});
		if (aliases.length > 0) document.getElementById("name-alt").textContent = "(" + aliases.join(", ") + ")";
	}

	if (entityData.descriptions.hasOwnProperty("en")) {
		document.getElementById("desc").textContent = entityData.descriptions.en.value;
	} else {
		document.getElementById("desc").parentNode.removeChild(document.getElementById("desc"));
	}

	var parents = document.getElementById("parents");
	if (entityData.claims.hasOwnProperty("P171")) {
		var itemTemplate = document.querySelector("#parents li");
		entityData.claims.P171.forEach(function(elm){
			var item = itemTemplate.cloneNode(true);
			item.querySelector("a").textContent = elm.mainsnak.datavalue.value["numeric-id"];
			item.querySelector("a").href = "?" + elm.mainsnak.datavalue.value["numeric-id"];
			itemTemplate.parentNode.appendChild(item);
		});
		itemTemplate.parentNode.removeChild(itemTemplate);
	} else {
		parents.parentNode.removeChild(parents);
	}


	var figure = document.querySelector("figure");
	if (entityData.claims.hasOwnProperty("P18")) {
		figure.querySelector(".fg").src = figure.querySelector(".bg").src = WikimediaThumb(entityData.claims.P18[0].mainsnak.datavalue.value.replace(/ /g, "_"),800);
	} else {
		//figure.parentNode.removeChild(figure);
	}
}

/* ================ initialization =================== */

var id = rootId = 2382443;

(function() {
	// https://en.wikipedia.org/wiki/Immediately-invoked_function_expression

	var s = window.location.search;
	if (s.length > 0) { id = s.substring(1); }

	// if at top level, change back arrow to home icon and remove form
	if (id == rootId) {
		document.querySelector("#back-link").className += " home-link"
	}

	loadDataHierarchy(buildHierarchy);
	loadDataItem(buildItem);
})();
