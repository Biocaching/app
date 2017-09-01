"use strict";
/// <reference path="uri.js" />

var api_root = "https://api.biocaching.com";
var observationsRoot = "/observations/";
var taxaRoot = "/taxa/"

var auth = {};
var authenticated; // undefined == unknown, false == bypassed auth, true == logged in
var uri, query;
if (typeof URI !== "undefined") {
	uri = new URI(); // URI.js
	query = uri.query(true);
}

/**
 * Various HTTP request methods.
 */
var requestMethod = {
	delete: "DELETE",
	get: "GET",
	post: "POST",
	put: "PUT"
}

/**
 * Convert the first letter in a string to uppercase.
 * @param {string} input String to be capitalized.
 */
function sentenceCase(input) {
	return input && input.charAt(0).toUpperCase() + input.slice(1);
}

/**
 * Retreive user authentication.
 */
function getUserDetails() {
	// auth contains real or dummy login data, localStorage always contains real login data
	auth.email = localStorage.getItem("biocaching:email");
	auth.token = localStorage.getItem("biocaching:token");
	authenticated = (auth.email && auth.token) ? true : false;
	if (!authenticated) {
		// since all api calls require authentication, but i feel some should be accessible without account,
		// this will give access in those cases without logging in
		auth.email = "peter@biocaching.com";
		auth.token = "eZVvsTPJriBV74cGS62o";
	}
}

/**
 * Communicate with API.
 * @param {string} method One of the HTTP request methods.
 * @param {string} url URL path for the API call.
 * @param {function} callback Function to process returned data.
 * @param {object} data Data returned from API.
 */
function sendRequest(method, url, callback, data) {
	// TODO: allow custom function on authentication error, so that this can also be used 
	// on the sign in form itself
	// TODO: allow alternate locations, so that this can also be used to load version number
	var xhr = new XMLHttpRequest();
	xhr.open(method, api_root + url, true);
	xhr.overrideMimeType("application/json");
	//xhr.setRequestHeader("Content-type", "application/json");
	xhr.setRequestHeader("Accept", "application/json");
	if (auth.email && auth.token) {
		xhr.setRequestHeader("X-User-Email", auth.email);
		xhr.setRequestHeader("X-User-Token", auth.token);
	}
	xhr.setRequestHeader("X-User-Api-Key", "0b4d859e740d2978b98a13e2b9e130d8");
	xhr.addEventListener("load", function() {
		switch (this.status) {
			case 200:
				// everything is ok
				// if not bypassing auth, then set authenticated
				if (authenticated == null) authenticated = true;
				callback(JSON.parse(this.responseText));
				break;
			case 401:
				// authentication error
				window.location.replace(new URI("signin.html").search({source: uri.toString()}));
				break;
			default:
				// unexpected status
				alert("unexpected status " + this.status + " on " + url);
				break;
		}
	});
	xhr.addEventListener("error", function(evt) {
		alert("A network error occured loading the data.");
		console.log(evt);
	})
	xhr.addEventListener("timeout", function(evt) {
		alert("A timeout error occured loading the data.");
		console.log(evt);
	})
	xhr.send(data);
}

/**
 * Build the general page layout.
 */
function buildPage() {

	if (document.querySelector("body:not(.no-header)")) {
		document.querySelector("body").insertAdjacentHTML("afterbegin", toolbars.app);
	}
	if ((query.context === "personal") || (query.context === "likes")) {
		var sectionElmClasses = document.querySelector("html.public").classList;
		sectionElmClasses.remove("public");
		sectionElmClasses.add("personal");
		if (query.context === "likes")
			sectionElmClasses.add("likes");
	}
	if (document.querySelector("html.personal")) {
		document.querySelector(".toolbar.app").insertAdjacentHTML("afterend", toolbars.personal);
	}
	else if (document.querySelector("html.public")) {
		document.querySelector(".toolbar.app").insertAdjacentHTML("afterend", toolbars.public);
	}
}

/**
 * HTML code for toolbars.
 */
var toolbars = {
	get app() {return this.HTML("app", [
		{ url: "feed.html?context=personal", title: "Personal"    , class: "personal", iconId: "E7FD" },
		{ url: "feed.html"                 , title: "Public"      , class: "public"  , iconId: "E7FB" },
		{ url: "camera.html"               , title: "Camera"      , class: "camera"  , iconId: "E412" },
		{ url: "taxonomy.html"             , title: "Taxonomy"    , class: "search"  , iconId: "E8B6" },
		{ url: "settings.html"             , title: "Settings"    , class: "settings", iconId: "E8B8" },
	])},
	get public() {return this.HTML("section", [
		{ url: "feed.html"                 , title: "Feed view"   , class: "feed"    , iconId: "E8EF" },
		{ url: "map.html"                  , title: "Map view"    , class: "map"     , iconId: "E55B" },
	])},
	get personal() {return this.HTML("section", [
		{ url: "feed.html?context=personal", title: "Your feed"   , class: "feed"    , iconId: "E8EF" },
		{ url: "map.html?context=personal" , title: "Your map"    , class: "map"     , iconId: "E55B" },
		{ url: "friends.html"              , title: "Your friends", class: "friends" , iconId: "E7FB" },
		{ url: "feed.html?context=likes"   , title: "Your likes"  , class: "likes"   , iconId: "E87D" },
	])},
	HTML: function(className, elements) {
		var result = "";
		result += "<nav class='toolbar " + className + "'><ul>";
		elements.forEach(function(elm) {
			result += "<li><a class='icon " + elm.class + "' href='" + elm.url + "'><i class='material-icons' title='" + elm.title + "'>&#x" + elm.iconId + ";</i></a></li>";
		});
		result += "</ul></nav>";
		return result;
	}
};

var
	sticky = false,
	menuPosition = 0;
if (document.querySelector("header.content")) {
	document.querySelector("main").addEventListener("scroll", setSticky);
	setSticky();
}

/**
 * Make the page header sticky when scrolling up.
 */
function setSticky() {
	var scrollTop = document.querySelector("main").scrollTop;
	if ((scrollTop >= menuPosition) && !sticky) {
		// just now the header scrolled out of view
		document.querySelector("header.content").classList.add("sticky");
		sticky = true;
	} else if ((scrollTop < menuPosition) && sticky) {
		// just now the header scrolled back into view
		document.querySelector("header.content").classList.remove("sticky");
		sticky = false;
	}
}

(function() {
	getUserDetails();
	buildPage();
})();
