function loadDataLocal(callback) {
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', 'content/data.json', true);
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == "200") {
			// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
			callback(JSON.parse(xobj.responseText));
		}
	};
	xobj.send(null);  
}

function buildPageLocal(data) {

	if (id != rootId) {
		document.querySelector("title").textContent = data.taxo[id].name + " - Biocaching";
		document.querySelector("h1").textContent = data.taxo[id].name;
		document.querySelector("h2").textContent = data.taxo[id].name;			
		document.querySelector(".latin").textContent = data.taxo[id].name_lat;
	} else {
		var info = document.querySelector(".info");
		info.parentNode.removeChild(info);
	}

	// show image if available
	var figure = document.querySelector(".photo");
	if (data.taxo[id].hasOwnProperty("img")) {
		figure.querySelector("img").src = data.taxo[id].img;
	} else {
		figure.parentNode.removeChild(figure);
	}

	// create list of subitems
	var list = document.querySelector(".species-nav-list");
	var itemTemplate = list.querySelector("li");

	if (data.taxo[id].hasOwnProperty("children")) {
		data.taxo[id].children.forEach(function(elm){
			var item = itemTemplate.cloneNode(true);
			item.querySelector("h2").textContent = data.taxo[elm].name;
			item.querySelector("p").textContent = data.taxo[elm].name_lat;
			item.querySelector("img").src = data.taxo[elm].img;
			item.querySelector("a").href = "?" + elm;
			list.appendChild(item);
		});
		list.removeChild(itemTemplate);
	} else {
		list.parentNode.removeChild(list);
	}
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

	loadDataLocal(buildPageLocal);
})();