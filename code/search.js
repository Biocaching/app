function showSearchResults(data) {
	// this code uses innerHTML to insert HTML returned from the service
	// that is considered bad practice, but the service sometimes returnes HTML code and HTML-escaped characters
	var frag = document.createDocumentFragment(); // cache results before outputting
	var hit, h2, header_p, header, article, a, li;
	for (var i in data.hits) {
		console.log(data.hits[i]._source.scientific_name);
		hit = data.hits[i];

		h2 = document.createElement("h2");
		if (hit.highlight.hasOwnProperty("scientific_name"))
			h2.innerHTML = hit.highlight.scientific_name
		else
			h2.innerHTML = hit._source.scientific_name;

		header_p = document.createElement("p");
		if (hit.highlight.hasOwnProperty("names.eng"))
			header_p.innerHTML = hit.highlight["names.eng"]
		else if (hit._source.hasOwnProperty("names"))
			header_p.innerHTML = hit._source.names.eng
		else
			header_p.innerHTML = "&#8203;";

		header = document.createElement("header");
		header.appendChild(h2);
		header.appendChild(header_p);

		article = document.createElement("article");
		article.appendChild(header);

		a = document.createElement("a");
		a.href = new URI("taxonomy.html").addQuery({ds: query.ds, id: hit._id}).toString();
		a.className = "card";
		a.appendChild(article);

		li = document.createElement("li"); 
		li.appendChild(a);

		frag.appendChild(li);
	}
	document.querySelector("ol").appendChild(frag);
}

/* ================ initialization =================== */

(function() {
	if (uri.hasQuery("ds"))
		document.getElementById("search-ds").value = query.ds;
	if (uri.hasQuery("q")) {
		document.getElementById("search-field").value = query.q;
		getData("https://api.biocaching.com/taxa/search?term=" + query.q, showSearchResults);
	} else {
		document.getElementById("search-field").value = "";
	}
})();