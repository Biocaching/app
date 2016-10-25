var uri, query;
if (typeof URI !== "undefined") {
	uri = new URI(); // URI.js
	query = uri.query(true);
}

var auth = {};
var authorized; // undefined == unknown, false == bypassed auth, true == logged in

function bypassAuthorization() {
	// since all api calls require authorization, but i feel some should be accessible without account,
	// this function will authorize in those cases without logging in
	if (!(auth.email && auth.token)) {
		auth.email = "peter@biocaching.com";
		auth.token = "eZVvsTPJriBV74cGS62o";
		authorized = false;
	}
}

function getData(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.overrideMimeType("application/json");
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("X-User-Email", auth.email);
	xhr.setRequestHeader("X-User-Token", auth.token);
	xhr.setRequestHeader("X-User-Api-Key", "0b4d859e740d2978b98a13e2b9e130d8");
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			switch (xhr.status) {
				case 200:
					// everything is ok
					// if not bypassing auth, then set authorized
					if (authorized == null) authorized = true;
					callback(JSON.parse(xhr.responseText));
					break;
				case 401:
					// authentication error
					window.location.replace(new URI("signin.html").search({source: uri.toString()}));
					break;
				default:
					// unexpected status
					alert("unexpected status " + xhr.status);
					break;
			}
		}
	}
	xhr.send();
}

function buildPage() {

	if (document.querySelector("body:not(.no-header)")) {
		document.querySelector("body").insertAdjacentHTML("afterbegin", "\
			<header class='pageheader'>\
				<div class='main'>\
					<a class='icon' href='feed.html?context=personal'><i class='material-icons' title='Personal'>&#xE7FD;</i></a>\
					<a class='icon' href='feed.html'                 ><i class='material-icons' title='Public'  >&#xE7FB;</i></a>\
					<a class='icon' href='camera.html'               ><i class='material-icons' title='Camera'  >&#xE412;</i></a>\
					<a class='icon' href='taxonomy.html'             ><i class='material-icons' title='Taxonomy'>&#xE8B6;</i></a>\
					<a class='icon' href='settings.html'             ><i class='material-icons' title='Settings'>&#xE8B8;</i></a>\
				</div>\
			</header>");
	}
	if ((query.context === "personal") || (query.context === "likes")) {
		var sectionElmClasses = document.querySelector(".public-section").classList;
		sectionElmClasses.remove("public-section");
		sectionElmClasses.add("personal-section");
		if (query.context === "likes")
			sectionElmClasses.add("likes");
	}
	if (document.querySelector(".personal-section")) {
		document.querySelector(".pageheader").insertAdjacentHTML("beforeend", "\
			<div class='sub'>\
				<a class='icon' href='feed.html?context=personal'><i class='material-icons' title='Your feed'   >&#xE8EF;</i></a>\
				<a class='icon' href='map.html?context=personal' ><i class='material-icons' title='Your map'    >&#xE55B;</i></a>\
				<a class='icon' href='friends.html'              ><i class='material-icons' title='Your friends'>&#xE7FB;</i></a>\
				<a class='icon' href='feed.html?context=likes'   ><i class='material-icons' title='Your likes'  >&#xE87D;</i></a>\
			</div>");
	}
	else if (document.querySelector(".public-section")) {
		document.querySelector(".pageheader").insertAdjacentHTML("beforeend", "\
			<div class='sub'>\
				<a class='icon' href='feed.html'><i class='material-icons' title='Feed view'>&#xE8EF;</i></a>\
				<a class='icon' href='map.html' ><i class='material-icons' title='Map view' >&#xE55B;</i></a>\
			</div>");
	}
	else if (document.querySelector(".search-section")) {
		document.querySelector(".pageheader").insertAdjacentHTML("beforeend", "\
			<div class='sub'><h1>&nbsp;</h1></div>");
	}
}

(function() {

	// biocaching user authentication
	auth.email = localStorage.getItem("biocaching:email");
	auth.token = localStorage.getItem("biocaching:token");

	buildPage();
})();
